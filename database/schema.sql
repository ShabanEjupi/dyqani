-- =============================================
-- Supabase Database Schema for E-commerce
-- Free hosting with real-time sync capability
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    category TEXT,
    instagram_link TEXT,
    pos_sync_id TEXT UNIQUE, -- ID from ASP.NET POS system
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_products_pos_sync_id ON products(pos_sync_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    customer_address JSONB, -- {street, city, postalCode, country}
    items JSONB NOT NULL, -- [{productId, name, price, quantity}]
    subtotal NUMERIC(10, 2) NOT NULL,
    shipping_cost NUMERIC(10, 2) DEFAULT 0,
    discount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, cancelled
    payment_method TEXT, -- cash_on_delivery, paypal, card
    delivery_method TEXT, -- standard, express
    notes TEXT,
    pos_synced BOOLEAN DEFAULT false,
    pos_sync_id TEXT,
    pos_sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_pos_synced ON orders(pos_synced);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- =============================================
-- INVENTORY SYNC TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS inventory_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    pos_product_id TEXT NOT NULL,
    stock_level INTEGER NOT NULL,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status TEXT DEFAULT 'synced', -- synced, pending, error
    sync_error TEXT,
    UNIQUE(product_id, pos_product_id)
);

-- Index
CREATE INDEX idx_inventory_sync_product ON inventory_sync(product_id);
CREATE INDEX idx_inventory_sync_pos_product ON inventory_sync(pos_product_id);

-- =============================================
-- POS WEBHOOK LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS pos_webhook_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- product_updated, order_created, inventory_changed
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Index
CREATE INDEX idx_webhook_log_processed ON pos_webhook_log(processed);
CREATE INDEX idx_webhook_log_created_at ON pos_webhook_log(created_at DESC);

-- =============================================
-- CUSTOMERS TABLE (Optional)
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL,
    address JSONB,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable for public access with appropriate policies
-- =============================================

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_webhook_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Products: Public read, authenticated write
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage products" ON products
    FOR ALL USING (auth.role() = 'service_role');

-- Orders: Anyone can insert, only service role can update
CREATE POLICY "Anyone can create orders" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- Inventory: Service role only
CREATE POLICY "Service role can manage inventory" ON inventory_sync
    FOR ALL USING (auth.role() = 'service_role');

-- Webhook log: Service role only
CREATE POLICY "Service role can manage webhooks" ON pos_webhook_log
    FOR ALL USING (auth.role() = 'service_role');

-- Customers: Service role only
CREATE POLICY "Service role can manage customers" ON customers
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
INSERT INTO products (name, description, price, image_url, stock_quantity, category, instagram_link) VALUES
('Trenerka termo për vajza', 'Mosha: 6 - 12 vjeç', 12.00, '../assets/icons/product1.png', 50, 'Vajza', 'https://www.instagram.com/p/DC9njmdIeNT/'),
('Fustana për vajza', 'Mosha: 6 - 24 muaj', 8.00, '../assets/icons/product2.png', 30, 'Vajza', 'https://www.instagram.com/p/DC9oeeXsIxD/'),
('Fustana për vajza', 'Mosha: 7 - 11 vjeç', 12.00, '../assets/icons/product3.png', 25, 'Vajza', 'https://www.instagram.com/p/DDrbMUTohRm/'),
('Bluza për vajza', 'Mosha: 9 - 12 vjeç', 5.00, '../assets/icons/product4.png', 40, 'Vajza', 'https://www.instagram.com/p/DE2H4BGqEy9/'),
('Bluza për djem', 'Mosha: 9 - 12 vjeç', 5.00, '../assets/icons/product5.png', 40, 'Djem', 'https://www.instagram.com/p/DE2IdJ5qub5/'),
('Trenerka të poshtme për djem', 'Mosha: 8 - 16 vjeç', 5.00, '../assets/icons/product6.png', 35, 'Djem', 'https://www.instagram.com/p/DE2Jy0NKbLi/'),
('Trenerka set për djem', 'Mosha: 8 - 16 vjeç', 12.00, '../assets/icons/product7.png', 20, 'Djem', 'https://www.instagram.com/p/DE2KF1RK7yK/'),
('Set 3-pjesësh për vajza', 'Mosha: 6 - 24 muaj', 10.00, '../assets/icons/product8.png', 15, 'Vajza', 'https://www.instagram.com/p/DC9khPuIaql/');
