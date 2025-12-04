-- Sample daily challenges
INSERT INTO challenges (title, description, target_word, reward_points, is_active, daily_date, expires_at)
VALUES
  ('Scan a Phone', 'Find and scan any mobile device', 'phone,mobile,smartphone', 50, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Find Metal', 'Scan an object made primarily of metal', 'metal,steel,aluminum', 75, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Rare or Better', 'Scan an artifact with RARE tier or higher', 'rare,epic,legendary,mythic', 100, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Ancient Tech', 'Find something with ANCIENT_TECH element', 'ancient_tech', 150, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
  ('Cursed Discovery', 'Scan an artifact with CURSED_DATA element', 'cursed_data', 200, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');
