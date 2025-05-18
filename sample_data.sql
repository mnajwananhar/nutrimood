-- Insert sample data for food_recommendations

-- Rekomendasi untuk mood 'senang'/'happy'
INSERT INTO food_recommendations (food_name, description, mood, calories, protein, carbs, fat, nutrients, preparation) 
VALUES 
('Salmon Panggang', 'Salmon panggang dengan lemon dan rempah-rempah, kaya akan Omega-3 yang baik untuk otak dan suasana hati', 'senang', 300, 25, 10, 15, ARRAY['Omega-3', 'Protein', 'Vitamin D'], 'Panggang salmon dengan air lemon, garam, dan merica selama 15-20 menit pada suhu 180°C'),
('Oatmeal dengan Buah', 'Sarapan sehat dengan oatmeal dan aneka buah segar untuk memberikan energi sepanjang hari', 'senang', 250, 8, 45, 5, ARRAY['Serat', 'Vitamin C', 'Antioksidan'], 'Masak oatmeal dengan susu, tambahkan madu dan buah-buahan segar seperti pisang, stroberi, atau blueberry'),
('Dark Chocolate', 'Cokelat hitam dengan kandungan kakao tinggi dapat membantu melepaskan endorfin', 'senang', 150, 2, 15, 9, ARRAY['Flavonoid', 'Magnesium', 'Antioksidan'], 'Konsumsi sekitar 30 gram dark chocolate (minimal 70% kakao) sebagai camilan');

-- Rekomendasi untuk mood 'happy' (bahasa Inggris)
INSERT INTO food_recommendations (food_name, description, mood, calories, protein, carbs, fat, nutrients, preparation) 
VALUES 
('Greek Yogurt Bowl', 'A protein-rich Greek yogurt bowl with honey and mixed berries', 'happy', 220, 18, 25, 5, ARRAY['Protein', 'Probiotics', 'Calcium'], 'Mix Greek yogurt with a teaspoon of honey and top with mixed berries and a sprinkle of granola'),
('Walnut and Spinach Salad', 'Fresh spinach salad with walnuts and balsamic vinaigrette', 'happy', 180, 5, 10, 12, ARRAY['Omega-3', 'Folate', 'Vitamin E'], 'Toss fresh spinach with walnuts, sliced apple, and dress with balsamic vinaigrette');

-- Rekomendasi untuk mood 'netral'/'neutral'
INSERT INTO food_recommendations (food_name, description, mood, calories, protein, carbs, fat, nutrients, preparation) 
VALUES 
('Omelet Sayur', 'Omelet telur dengan berbagai sayuran untuk sarapan yang seimbang nutrisi', 'netral', 280, 20, 8, 18, ARRAY['Protein', 'Vitamin A', 'Folat'], 'Kocok 2 telur, tambahkan sayuran cincang seperti paprika, bayam, dan jamur. Masak dengan api sedang hingga matang'),
('Smoothie Buah', 'Smoothie dengan campuran buah-buahan dan yogurt untuk energi yang stabil', 'netral', 200, 10, 30, 5, ARRAY['Vitamin C', 'Potasium', 'Probiotik'], 'Blend pisang, stroberi, blueberry dengan yogurt dan sedikit madu hingga halus'),
('Sup Ayam', 'Sup ayam hangat dengan sayuran dan rempah untuk makan siang yang menenangkan', 'neutral', 220, 18, 15, 8, ARRAY['Protein', 'Vitamin A', 'Seng'], 'Rebus ayam dengan berbagai sayuran seperti wortel, seledri, dan bawang. Tambahkan garam, merica, dan rempah sesuai selera');

-- Rekomendasi untuk mood 'sedih'/'sad'
INSERT INTO food_recommendations (food_name, description, mood, calories, protein, carbs, fat, nutrients, preparation) 
VALUES 
('Banana Oatmeal', 'Oatmeal dengan pisang dan kayu manis untuk meningkatkan kadar serotonin', 'sedih', 240, 6, 40, 4, ARRAY['Triptofan', 'Vitamin B6', 'Serat'], 'Masak oatmeal dengan susu, tambahkan pisang matang yang dihancurkan dan taburkan kayu manis'),
('Salmon dengan Quinoa', 'Kombinasi salmon dan quinoa yang kaya akan asam lemak omega-3 dan protein', 'sad', 350, 30, 25, 15, ARRAY['Omega-3', 'Protein', 'Vitamin D'], 'Panggang salmon dengan bumbu dan sajikan dengan quinoa yang dimasak dengan kaldu sayuran'),
('Turkey Sandwich', 'Sandwich daging kalkun yang kaya akan triptofan untuk meningkatkan mood', 'sedih', 320, 22, 35, 8, ARRAY['Triptofan', 'Protein', 'Vitamin B'], 'Susun sandwich dengan roti gandum utuh, irisan kalkun, selada, tomat, dan sedikit mayonnaise rendah lemak');
