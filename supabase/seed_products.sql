INSERT INTO products (product_id, barcode, name, unit_price, category_id) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '6130001001001', 'Huile 1L', 450, 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '6130001001002', 'Farine 1kg', 120, 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '6130001001003', 'Sucre 1kg', 180, 1),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '6130001001004', 'Lait 1L', 150, 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '6130001001005', 'Pâtes 500g', 95, 1)
ON CONFLICT (product_id) DO NOTHING;
