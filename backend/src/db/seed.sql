-- WARNING: This seed truncates tables to reinsert clean data (dev only)
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE products RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Categories
INSERT INTO categories (name) VALUES
                                  ('Electronics'),
                                  ('Fashion'),
                                  ('Home'),
                                  ('Sports');

-- Products (price_cents, image_url, rating, stock_qty)
INSERT INTO products (title, description, price_cents, image_url, category_id, rating, stock_qty) VALUES
                                                                                                      ('Wireless Headphones', 'Noise-cancelling over-ear headphones with great bass.', 8999, 'https://picsum.photos/seed/headphones/600/400', 1, 4.6, 12),
                                                                                                      ('Smart Watch', 'Fitness tracking, heart rate monitor, and notifications.', 12999, 'https://picsum.photos/seed/watch/600/400', 1, 4.3, 8),
                                                                                                      ('Bluetooth Speaker', 'Portable speaker with deep sound and long battery life.', 4999, 'https://picsum.photos/seed/speaker/600/400', 1, 4.1, 0),

                                                                                                      ('Men T-Shirt', 'Comfortable cotton t-shirt for everyday wear.', 1999, 'https://picsum.photos/seed/tshirt/600/400', 2, 4.0, 30),
                                                                                                      ('Running Shoes', 'Lightweight running shoes for daily training.', 7499, 'https://picsum.photos/seed/shoes/600/400', 2, 4.5, 6),
                                                                                                      ('Women Jacket', 'Stylish jacket suitable for all seasons.', 9999, 'https://picsum.photos/seed/jacket/600/400', 2, 4.2, 4),

                                                                                                      ('Coffee Maker', 'Brew rich coffee quickly with reusable filter.', 5999, 'https://picsum.photos/seed/coffee/600/400', 3, 4.4, 10),
                                                                                                      ('Desk Lamp', 'LED desk lamp with adjustable brightness.', 2499, 'https://picsum.photos/seed/lamp/600/400', 3, 4.1, 15),
                                                                                                      ('Comfort Pillow', 'Soft pillow for better sleep posture.', 1599, 'https://picsum.photos/seed/pillow/600/400', 3, 3.9, 0),

                                                                                                      ('Yoga Mat', 'Non-slip yoga mat for home workouts.', 1799, 'https://picsum.photos/seed/yogamat/600/400', 4, 4.3, 22),
                                                                                                      ('Dumbbell Set', 'Adjustable dumbbell set for strength training.', 14999, 'https://picsum.photos/seed/dumbbells/600/400', 4, 4.6, 5),
                                                                                                      ('Football', 'Durable ball for outdoor games.', 1299, 'https://picsum.photos/seed/football/600/400', 4, 4.0, 18);