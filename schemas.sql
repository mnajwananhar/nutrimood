-- NutriMood Database Schema (Final, Clean, Only Used Tables)

-- 1. Profiles (user profile, 1:1 dengan auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    age INTEGER,
    gender TEXT,
    height FLOAT,
    weight FLOAT,
    activity_level TEXT,
    avatar_url TEXT,
    dietary_preferences TEXT[],
    health_conditions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Food Journal
CREATE TABLE IF NOT EXISTS food_journal (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    food_name TEXT NOT NULL,
    mood TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Food Recommendations
CREATE TABLE IF NOT EXISTS food_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    food_name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    mood TEXT NOT NULL,
    calories INTEGER,
    protein INTEGER,
    carbs INTEGER,
    fat INTEGER,
    nutrients TEXT[],
    preparation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. User Favorites (saved food recommendations)
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recommendation_id UUID REFERENCES food_recommendations(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, recommendation_id)
);

-- 5. Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Comments on Posts
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Post Likes
CREATE TABLE IF NOT EXISTS post_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- 8. Education Articles
CREATE TABLE IF NOT EXISTS education_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category TEXT,
    author TEXT,
    read_time INTEGER,
    image_url TEXT,
    related_articles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Mood Entries
CREATE TABLE IF NOT EXISTS mood_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT NOT NULL,
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers (manual, tanpa IF NOT EXISTS)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_food_journal_updated_at ON food_journal;
CREATE TRIGGER update_food_journal_updated_at
    BEFORE UPDATE ON food_journal
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_food_recommendations_updated_at ON food_recommendations;
CREATE TRIGGER update_food_recommendations_updated_at
    BEFORE UPDATE ON food_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_posts_updated_at ON community_posts;
CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON community_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_education_articles_updated_at ON education_articles;
CREATE TRIGGER update_education_articles_updated_at
    BEFORE UPDATE ON education_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at
    BEFORE UPDATE ON mood_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. RLS Policies (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Food Journal
DROP POLICY IF EXISTS "Users can view their own journal entries" ON food_journal;
CREATE POLICY "Users can view their own journal entries" ON food_journal FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON food_journal;
CREATE POLICY "Users can insert their own journal entries" ON food_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own journal entries" ON food_journal;
CREATE POLICY "Users can update their own journal entries" ON food_journal FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON food_journal;
CREATE POLICY "Users can delete their own journal entries" ON food_journal FOR DELETE USING (auth.uid() = user_id);

-- Food Recommendations
DROP POLICY IF EXISTS "Anyone can view food recommendations" ON food_recommendations;
CREATE POLICY "Anyone can view food recommendations" ON food_recommendations FOR SELECT USING (true);

-- User Favorites
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add to their own favorites" ON user_favorites;
CREATE POLICY "Users can add to their own favorites" ON user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove from their own favorites" ON user_favorites;
CREATE POLICY "Users can remove from their own favorites" ON user_favorites FOR DELETE USING (auth.uid() = user_id);

-- Community Posts
DROP POLICY IF EXISTS "Anyone can view posts" ON community_posts;
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create their own posts" ON community_posts;
CREATE POLICY "Users can create their own posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- Comments
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create their own comments" ON comments;
CREATE POLICY "Users can create their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Post Likes
DROP POLICY IF EXISTS "Anyone can view likes" ON post_likes;
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Education Articles
DROP POLICY IF EXISTS "Anyone can view articles" ON education_articles;
CREATE POLICY "Anyone can view articles" ON education_articles FOR SELECT USING (true);

-- Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Mood Entries
DROP POLICY IF EXISTS "Users can view their own mood entries" ON mood_entries;
CREATE POLICY "Users can view their own mood entries" ON mood_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create their own mood entries" ON mood_entries;
CREATE POLICY "Users can create their own mood entries" ON mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own mood entries" ON mood_entries;
CREATE POLICY "Users can update their own mood entries" ON mood_entries FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own mood entries" ON mood_entries;
CREATE POLICY "Users can delete their own mood entries" ON mood_entries FOR DELETE USING (auth.uid() = user_id);

-- END OF SCHEMA