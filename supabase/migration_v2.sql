-- Add order counter for auto-numbering
create sequence if not exists order_seq start 1;

-- Add customer_id properly to orders
alter table orders add column if not exists customer_id_ref uuid references customers(id) on delete set null;

-- Add total_spent to customers (computed live but store for performance)
alter table customers add column if not exists total_spent_dzd numeric default 0;
alter table customers add column if not exists total_orders integer default 0;
alter table customers add column if not exists last_order_at timestamp with time zone;

-- Function: auto-update customer stats after order status changes
create or replace function update_customer_stats()
returns trigger as $$
begin
  -- Update customer stats based on delivered orders
  if NEW.customer_id_ref is not null then
    update customers set
      total_spent_dzd = (
        select coalesce(sum(total_dzd), 0)
        from orders
        where customer_id_ref = NEW.customer_id_ref
        and status = 'delivered'
      ),
      total_orders = (
        select count(*)
        from orders
        where customer_id_ref = NEW.customer_id_ref
        and status = 'delivered'
        and created_at >= now() - interval '2 months'
      ),
      last_order_at = now(),
      -- Auto upgrade status based on orders in last 2 months
      status = case
        when (
          select count(*) from orders
          where customer_id_ref = NEW.customer_id_ref
          and status = 'delivered'
          and created_at >= now() - interval '2 months'
        ) >= 10 then 'vip'
        when (
          select count(*) from orders
          where customer_id_ref = NEW.customer_id_ref
          and status = 'delivered'
          and created_at >= now() - interval '2 months'
        ) >= 5 then 'active'
        when (
          select count(*) from orders
          where customer_id_ref = NEW.customer_id_ref
          and status = 'delivered'
          and created_at >= now() - interval '2 months'
        ) >= 1 then 'new'
        else 'inactive'
      end
    where id = NEW.customer_id_ref;
  end if;

  -- Auto stock decrease when order marked delivered
  if NEW.status = 'delivered' and (OLD.status is null or OLD.status != 'delivered') then
    update products set
      stock = greatest(0, stock - NEW.qty),
      status = case
        when greatest(0, stock - NEW.qty) = 0 then 'out'
        when greatest(0, stock - NEW.qty) <= 5 then 'critical'
        when greatest(0, stock - NEW.qty) <= 15 then 'low'
        else status
      end
    where name = NEW.product
    or name ilike '%' || split_part(NEW.product, ' ', 1) || '%';
  end if;

  -- Auto stock restore when order cancelled (was delivered before)
  if NEW.status = 'cancelled' and OLD.status = 'delivered' then
    update products set
      stock = stock + NEW.qty,
      status = case
        when stock + NEW.qty > 15 then 'active'
        when stock + NEW.qty > 5 then 'low'
        else 'critical'
      end
    where name = NEW.product
    or name ilike '%' || split_part(NEW.product, ' ', 1) || '%';
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- Attach trigger to orders
drop trigger if exists on_order_update on orders;
create trigger on_order_update
  after insert or update on orders
  for each row execute function update_customer_stats();

-- Policy for the function
grant execute on function update_customer_stats() to authenticated;
