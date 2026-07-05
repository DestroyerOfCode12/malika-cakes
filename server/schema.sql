-- Malika's Cake Boutique Database Schema
-- PostgreSQL

-- Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catalog: Sizes
CREATE TABLE catalog_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  base_price DECIMAL(8,2) NOT NULL,
  servings_min INT,
  servings_max INT,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Catalog: Flavors
CREATE TABLE catalog_flavors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Catalog: Fillings
CREATE TABLE catalog_fillings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  price_addon DECIMAL(8,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Catalog: Toppers
CREATE TABLE catalog_toppers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  price_addon DECIMAL(8,2) NOT NULL,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  size_id UUID NOT NULL REFERENCES catalog_sizes(id),
  flavor_id UUID NOT NULL REFERENCES catalog_flavors(id),
  filling_id UUID NOT NULL REFERENCES catalog_fillings(id),

  -- Pricing & Totals
  base_price DECIMAL(8,2) NOT NULL,
  customization_total DECIMAL(8,2) DEFAULT 0.00,
  tax DECIMAL(8,2) DEFAULT 0.00,
  total_price DECIMAL(8,2) NOT NULL,

  -- Dates & Times
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL DEFAULT '12:00:00',
  payment_due_date DATE NOT NULL,

  -- Status Tracking
  status VARCHAR(50) DEFAULT 'draft',
  payment_status VARCHAR(50) DEFAULT 'unpaid',

  -- Special Requests
  allergies_restrictions TEXT,
  special_requests TEXT,
  recipient_phone VARCHAR(20),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_lead_time CHECK (pickup_date >= CURRENT_DATE + INTERVAL '14 days'),
  CONSTRAINT valid_payment_deadline CHECK (payment_due_date = pickup_date - INTERVAL '7 days')
);

-- Order Customizations (Toppers – many-to-many)
CREATE TABLE order_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  topper_id UUID NOT NULL REFERENCES catalog_toppers(id),
  quantity INT DEFAULT 1,
  price_at_time DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50),
  entity_id UUID,
  action VARCHAR(50),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_pickup_date ON orders(pickup_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_order_customizations_order_id ON order_customizations(order_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_admin_users_email ON admin_users(email);
