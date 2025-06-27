-- Migration to add missing profile fields and user preferences table
-- This ensures our database supports all the features in Settings and Profile pages

-- Add missing columns to profiles table
DO $$ 
BEGIN
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
    
    -- Add products_count column for caching
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'products_count') THEN
        ALTER TABLE public.profiles ADD COLUMN products_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add total_upvotes column for caching
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_upvotes') THEN
        ALTER TABLE public.profiles ADD COLUMN total_upvotes INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create user_preferences table for storing user settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Appearance settings
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    product_updates BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT true,
    
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private')),
    show_email BOOLEAN DEFAULT false,
    show_products BOOLEAN DEFAULT true,
    allow_direct_messages BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_preferences(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to create default preferences
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    -- Insert profile
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default preferences
    PERFORM create_default_preferences(NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update products count for a user
CREATE OR REPLACE FUNCTION update_user_products_count(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET products_count = (
        SELECT COUNT(*) 
        FROM public.products 
        WHERE creator_id = user_uuid
    )
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update total upvotes for a user
CREATE OR REPLACE FUNCTION update_user_total_upvotes(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET total_upvotes = (
        SELECT COALESCE(SUM(upvotes), 0)
        FROM public.products 
        WHERE creator_id = user_uuid
    )
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update products count when products are added/removed
CREATE OR REPLACE FUNCTION trigger_update_products_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_user_products_count(NEW.creator_id);
        PERFORM update_user_total_upvotes(NEW.creator_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_products_count(OLD.creator_id);
        PERFORM update_user_total_upvotes(OLD.creator_id);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If creator changed (unlikely but possible)
        IF OLD.creator_id != NEW.creator_id THEN
            PERFORM update_user_products_count(OLD.creator_id);
            PERFORM update_user_products_count(NEW.creator_id);
        END IF;
        -- Update upvotes if they changed
        IF OLD.upvotes != NEW.upvotes THEN
            PERFORM update_user_total_upvotes(NEW.creator_id);
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for products count updates
DROP TRIGGER IF EXISTS trigger_products_count_update ON public.products;
CREATE TRIGGER trigger_products_count_update
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION trigger_update_products_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initialize products count and total upvotes for existing users
DO $$
DECLARE
    profile_record RECORD;
BEGIN
    FOR profile_record IN SELECT id FROM public.profiles LOOP
        PERFORM update_user_products_count(profile_record.id);
        PERFORM update_user_total_upvotes(profile_record.id);
        PERFORM create_default_preferences(profile_record.id);
    END LOOP;
END $$;

-- Create view for profile stats
CREATE OR REPLACE VIEW profile_stats AS
SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.website,
    p.bio,
    p.location,
    p.products_count,
    p.total_upvotes,
    p.created_at,
    p.updated_at,
    -- Recent products
    (
        SELECT json_agg(
            json_build_object(
                'id', pr.id,
                'name', pr.name,
                'description', pr.description,
                'logo_url', pr.logo_url,
                'website_url', pr.website_url,
                'category', pr.category,
                'upvotes', pr.upvotes,
                'created_at', pr.created_at
            ) ORDER BY pr.created_at DESC
        )
        FROM public.products pr 
        WHERE pr.creator_id = p.id 
        LIMIT 10
    ) as recent_products
FROM public.profiles p;

-- Grant permissions
GRANT SELECT ON profile_stats TO authenticated, anon;
GRANT ALL ON public.user_preferences TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences and settings';
COMMENT ON COLUMN public.profiles.bio IS 'User bio/description (max 500 characters)';
COMMENT ON COLUMN public.profiles.location IS 'User location (city, country)';
COMMENT ON COLUMN public.profiles.products_count IS 'Cached count of products created by user';
COMMENT ON COLUMN public.profiles.total_upvotes IS 'Cached total upvotes across all user products';
