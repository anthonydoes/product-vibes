import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];
type UserPreferencesInsert = Database['public']['Tables']['user_preferences']['Insert'];
type UserPreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export class UserPreferencesService {
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
  }

  static async createUserPreferences(preferences: UserPreferencesInsert): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert(preferences)
        .select()
        .single();

      if (error) {
        console.error('Error creating user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createUserPreferences:', error);
      return null;
    }
  }

  static async updateUserPreferences(userId: string, updates: UserPreferencesUpdate): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return null;
    }
  }

  static async upsertUserPreferences(preferences: UserPreferencesInsert): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(preferences)
        .select()
        .single();

      if (error) {
        console.error('Error upserting user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertUserPreferences:', error);
      return null;
    }
  }

  static async deleteUserPreferences(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return false;
    }
  }

  // Helper method to get preferences with defaults
  static async getUserPreferencesWithDefaults(userId: string): Promise<UserPreferences> {
    const preferences = await this.getUserPreferences(userId);
    
    if (preferences) {
      return preferences;
    }

    // Return default preferences if none exist
    const defaultPreferences: UserPreferences = {
      id: '',
      user_id: userId,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      product_updates: true,
      weekly_digest: true,
      profile_visibility: 'public',
      show_email: false,
      show_products: true,
      allow_direct_messages: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Try to create default preferences in database
    const created = await this.createUserPreferences({
      user_id: userId,
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
      product_updates: true,
      weekly_digest: true,
      profile_visibility: 'public',
      show_email: false,
      show_products: true,
      allow_direct_messages: true
    });

    return created || defaultPreferences;
  }
}
