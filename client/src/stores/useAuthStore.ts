import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

interface AuthStore {
  user: User | null;
  error: Error | string | null;
  isLoading: boolean;
  hasPartner: boolean;
  resetUser: () => void;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ data?: { user: User | null; session: any }; error?: any }>;
  signIn: (email: string, password: string) => Promise<void>;
  initialize: () => Promise<void>;
  checkPartnerStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => {
  // Create a single auth state change listener
  let authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null;

  return {
    user: null,
    error: null,
    isLoading: true, // Start with true since we'll check the session immediately
    hasPartner: false,

    initialize: async () => {
      // Don't set loading if we're already initialized
      if (get().user !== null) {
        return;
      }

      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set initial user state
        const currentUser = session?.user ?? null;
        set({ user: currentUser });

        // Check partner status before completing initialization if we have a user
        if (currentUser) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('partner_id')
            .eq('id', currentUser.id)
            .maybeSingle();

          set({ hasPartner: !!userProfile?.partner_id });
        }

        // Remove existing listener if any
        if (authSubscription?.data?.subscription) {
          authSubscription.data.subscription.unsubscribe();
        }

        // Set up auth state listener
        authSubscription = await supabase.auth.onAuthStateChange((_event, session) => {
          const newUser = session?.user ?? null;
          set({ user: newUser, error: null });
          
          // Check partner status whenever auth state changes
          if (newUser) {
            get().checkPartnerStatus();
          } else {
            set({ hasPartner: false });
          }
        });

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
        set({ user: null, hasPartner: false });
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        // Wait for session to be fully established
        const { data: { session } } = await supabase.auth.getSession();
        
        if (data?.user && session) {
          set({ user: data.user });
          // Check partner status immediately after successful sign in
          await get().checkPartnerStatus();
        } else {
          throw new Error('Failed to establish session');
        }
      } catch (error) {
        const err = error as AuthError;
        set({ error: err.message, user: null });
      } finally {
        set({ isLoading: false });
      }
    },

    checkPartnerStatus: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          set({ hasPartner: false });
          return;
        }

        const { data: userProfile } = await supabase
          .from('users')
          .select('partner_id')
          .eq('id', user.id)
          .maybeSingle();

        set({ hasPartner: !!userProfile?.partner_id });
      } catch (error) {
        console.error('Error checking partner status:', error);
        set({ hasPartner: false });
      }
    }
  };
}); 