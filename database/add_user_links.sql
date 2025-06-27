-- Migration to add support for multiple user links/websites
-- This allows builders to add multiple websites, social links, portfolios, etc.

-- Create user_links table for multiple links per user
CREATE TABLE IF NOT EXISTS public.user_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL, -- e.g., "Portfolio", "GitHub", "LinkedIn", "Personal Site"
    url TEXT NOT NULL,
    type TEXT DEFAULT 'website', -- 'website', 'github', 'linkedin', 'twitter', 'portfolio', 'demo', 'custom'
    is_primary BOOLEAN DEFAULT FALSE, -- Mark one as the primary/main link
    display_order INTEGER DEFAULT 0, -- Order for displaying links
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure valid URL format
    CONSTRAINT valid_url CHECK (url ~* '^https?://.*'),
    -- Ensure reasonable label length
    CONSTRAINT valid_label_length CHECK (length(label) <= 50),
    -- Only one primary link per user
    CONSTRAINT unique_primary_per_user UNIQUE (user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Create partial unique index to allow only one primary link per user
-- This replaces the constraint above which doesn't work well with multiple non-primary links
DROP CONSTRAINT IF EXISTS unique_primary_per_user;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_links_primary 
ON public.user_links (user_id) 
WHERE is_primary = true;

-- Enable RLS
ALTER TABLE public.user_links ENABLE ROW LEVEL SECURITY;

-- Create policies for user_links
CREATE POLICY "User links are viewable by everyone" ON public.user_links
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own links" ON public.user_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" ON public.user_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" ON public.user_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_links_user_id ON public.user_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_links_type ON public.user_links(type);
CREATE INDEX IF NOT EXISTS idx_user_links_display_order ON public.user_links(user_id, display_order);

-- Function to automatically set display_order for new links
CREATE OR REPLACE FUNCTION set_user_link_display_order()
RETURNS TRIGGER AS $$
BEGIN
    -- If no display_order is set, set it to the next available number
    IF NEW.display_order = 0 OR NEW.display_order IS NULL THEN
        SELECT COALESCE(MAX(display_order), 0) + 1 
        INTO NEW.display_order 
        FROM public.user_links 
        WHERE user_id = NEW.user_id;
    END IF;
    
    -- Update timestamp
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-setting display order
DROP TRIGGER IF EXISTS trigger_set_user_link_display_order ON public.user_links;
CREATE TRIGGER trigger_set_user_link_display_order
    BEFORE INSERT ON public.user_links
    FOR EACH ROW EXECUTE FUNCTION set_user_link_display_order();

-- Function to migrate existing website data to user_links table
CREATE OR REPLACE FUNCTION migrate_existing_websites()
RETURNS VOID AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Loop through all profiles that have a website
    FOR profile_record IN 
        SELECT id, website FROM public.profiles 
        WHERE website IS NOT NULL AND website != ''
    LOOP
        -- Insert the existing website as a primary link
        INSERT INTO public.user_links (user_id, label, url, type, is_primary)
        VALUES (
            profile_record.id,
            'Website',
            profile_record.website,
            'website',
            true
        )
        ON CONFLICT DO NOTHING; -- Skip if already exists
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the migration
SELECT migrate_existing_websites();

-- Add helpful comments
COMMENT ON TABLE public.user_links IS 'Stores multiple links/websites for each user profile';
COMMENT ON COLUMN public.user_links.type IS 'Type of link: website, github, linkedin, twitter, portfolio, demo, custom';
COMMENT ON COLUMN public.user_links.is_primary IS 'Whether this is the primary/main link for the user';
COMMENT ON COLUMN public.user_links.display_order IS 'Order for displaying links in the UI';

-- Create view for easy querying of user links
CREATE OR REPLACE VIEW user_links_view AS
SELECT 
    ul.*,
    p.username,
    p.full_name
FROM public.user_links ul
JOIN public.profiles p ON ul.user_id = p.id
ORDER BY ul.user_id, ul.display_order;

-- Grant necessary permissions
GRANT SELECT ON user_links_view TO authenticated, anon;
