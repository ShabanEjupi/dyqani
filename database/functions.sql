-- Stock Decrement Function for Order Processing
-- This function safely decrements product stock when orders are placed

CREATE OR REPLACE FUNCTION decrement_stock(
    product_id UUID,
    quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = GREATEST(stock_quantity - quantity, 0),
        updated_at = NOW()
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decrement_stock(UUID, INTEGER) TO anon, authenticated;
