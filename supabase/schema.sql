-- Products table
create table products (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  name text not null,
  category text not null,
  price_dzd numeric not null default 0,
  stock integer not null default 0,
  status text not null default 'active',
  created_at timestamp with time zone default now()
);

-- Customers table
create table customers (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  name text not null,
  email text not null,
  phone text,
  status text not null default 'active',
  created_at timestamp with time zone default now()
);

-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  code text not null,
  customer_id uuid references customers(id),
  customer_name text not null,
  product text not null,
  qty integer not null default 1,
  total_dzd numeric not null default 0,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;

-- Policies (authenticated users can do everything)
create policy "Allow all for authenticated" on products for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on customers for all using (auth.role() = 'authenticated');
create policy "Allow all for authenticated" on orders for all using (auth.role() = 'authenticated');

-- Seed products
insert into products (code, name, category, price_dzd, stock, status) values
('PRD-001', 'ASUS ROG Strix G15 Laptop', 'Laptops', 175365, 225, 'active'),
('PRD-002', 'Logitech MX Keys Keyboard', 'Accessories', 14715, 12, 'low'),
('PRD-003', 'Samsung 27" 4K Monitor', 'Monitors', 60615, 48, 'active'),
('PRD-004', 'TP-Link Archer AX3000', 'Networking', 12015, 5, 'critical'),
('PRD-005', 'Dell XPS 15 Laptop', 'Laptops', 242865, 31, 'active'),
('PRD-006', 'Razer DeathAdder V3 Mouse', 'Accessories', 9315, 74, 'active'),
('PRD-007', 'SteelSeries Arctis 7 Headset', 'Audio', 20115, 0, 'out'),
('PRD-008', 'Crucial 16GB DDR5 RAM', 'Components', 10665, 110, 'active');

-- Seed customers
insert into customers (code, name, email, phone, status) values
('C-001', 'Mourad Benali', 'm.benali@email.dz', '+213 555 0101', 'active'),
('C-002', 'Yasmine Khelifi', 'y.khelifi@email.dz', '+213 555 0202', 'active'),
('C-003', 'Karim Amrani', 'k.amrani@email.dz', '+213 555 0303', 'vip'),
('C-004', 'Salim Taleb', 's.taleb@email.dz', '+213 555 0404', 'new'),
('C-005', 'Nadia Hamidi', 'n.hamidi@email.dz', '+213 555 0505', 'inactive'),
('C-006', 'Amine Zaimi', 'a.zaimi@email.dz', '+213 555 0606', 'active');

-- Seed orders
insert into orders (code, customer_name, product, qty, total_dzd, status) values
('#ORD-4821', 'Mourad B.', 'ASUS ROG Laptop', 1, 175365, 'delivered'),
('#ORD-4820', 'Yasmine K.', 'Samsung Monitor x2', 2, 121230, 'processing'),
('#ORD-4819', 'Karim A.', 'TP-Link Router', 5, 60075, 'pending'),
('#ORD-4818', 'Salim T.', 'Logitech MX Keys', 3, 44145, 'delivered'),
('#ORD-4817', 'Nadia H.', 'Dell XPS 15', 1, 242865, 'cancelled'),
('#ORD-4816', 'Amine Z.', 'Razer Mouse', 2, 18630, 'processing');
