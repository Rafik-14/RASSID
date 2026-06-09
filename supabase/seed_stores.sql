INSERT INTO stores (store_id, rep_id, name, neighborhood, contact_person, phone, address, current_balance, total_delivered, total_collected, last_delivery_date, last_payment_date, sync_status, is_deleted)
VALUES 
('11111111-1111-1111-1111-111111111111', auth.uid()::TEXT, 'Épicerie du Port', 'Bab El Oued', 'Rachid Benali', '+213 555 12 34', '12 Rue du Port, Bab El Oued', 12400, 84500, 72100, '2026-05-20T10:00:00.000Z', '2026-05-12T14:00:00.000Z', 'synced', false),
('22222222-2222-2222-2222-222222222222', auth.uid()::TEXT, 'Superette Meriem', 'Hussein Dey', 'Meriem Haddad', '+213 555 98 76', '45 Bd Colonel Amirouche', 7800, 52000, 44200, '2026-05-18T09:00:00.000Z', '2026-05-14T11:00:00.000Z', 'synced', false),
('33333333-3333-3333-3333-333333333333', auth.uid()::TEXT, 'Mini Marché Boualem', 'Kouba', 'Boualem Kaci', '+213 555 44 22', '8 Cité Kouba', 0, 31000, 31000, '2026-05-21T08:00:00.000Z', '2026-05-21T16:00:00.000Z', 'synced', false),
('44444444-4444-4444-4444-444444444444', auth.uid()::TEXT, 'Grocerie Haddad', 'El Harrach', 'Karim Haddad', '+213 555 33 11', '22 Rue des Frères', 3200, 28000, 24800, '2026-05-19T10:00:00.000Z', '2026-05-08T12:00:00.000Z', 'synced', false),
('55555555-5555-5555-5555-555555555555', auth.uid()::TEXT, 'Boulangerie Kamel', 'Bir Mourad Raïs', 'Kamel Boudiaf', '+213 555 66 55', '5 Rue Didouche Mourad', 5600, 41000, 35400, '2026-05-17T07:00:00.000Z', '2026-05-16T15:00:00.000Z', 'synced', false)
ON CONFLICT (store_id) DO NOTHING;
