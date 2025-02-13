import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  error: Error | string | null;
  isLoading: boolean;
  resetUser: () => void;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ data?: { user: User | null; session: any }; error?: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  return {
    user: null,
    error: null,
    isLoading: false,
    initialize: async () => {
      set({ isLoading: true });
      try {
        // Get initial session first
        const { data: { session } } = await supabase.auth.getSession();
        set({ user: session?.user ?? null });

        // Then set up auth state listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user ?? null, error: null });
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        set({ error: 'Failed to initialize auth' });
      } finally {
        set({ isLoading: false });
      }
    },
    
    resetUser: () => {
      set({ user: null, error: null });
    },

    signOut: async () => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        set({ error: 'An unexpected error occurred' });
      } finally {
        set({ isLoading: false });
      }
    },

    signUp: async (email: string, password: string, name: string) => {
      set({ isLoading: true, error: null });
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name }
          }
        });

        if (error) throw error;
        
        // Set the user state if signup was successful
        if (data?.user) {
          set({ user: data.user });
        }
        
        return { data };
      } catch (error) {
        const err = error as AuthError;
        set({ error: err.message });
        return { error: err };
      } finally {
        set({ isLoading: false });
      }
    },

    signIn: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
      } catch (error) {
        const err = error as AuthError;
        set({ error: err.message });
      } finally {
        set({ isLoading: false });
      }
    }
  };
}); 