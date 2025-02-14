import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

interface Invitation {
  id: string;
  sender_id: string;
  senderEmail?: string;
  recipient_email: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string;
  sender?: {
    email: string;
  };
}

interface InvitationStore {
  sentInvitations: Invitation[];
  receivedInvitations: Invitation[];
  isLoading: boolean;
  error: Error | string | null;
  
  // Actions
  sendInvitation: (recipientEmail: string) => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<void>;
  rejectInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  fetchSentInvitations: () => Promise<void>;
  fetchReceivedInvitations: () => Promise<void>;
  reset: () => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  sentInvitations: [],
  receivedInvitations: [],
  isLoading: false,
  error: null,

  sendInvitation: async (recipientEmail: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      // First check if user already has a partner
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('partner_id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (userProfile?.partner_id) {
        throw new Error('You already have a partner connected');
      }

      // Check if user has any received pending invitations
      const { data: receivedInvitations, error: receivedError } = await supabase
        .from('partner_invitations')
        .select('id')
        .eq('recipient_email', userData.user.email)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      if (receivedInvitations && receivedInvitations.length > 0) {
        throw new Error('You have pending invitations to respond to. Please accept or decline them before sending a new invitation.');
      }

      // Check if recipient already has a partner
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('users')
        .select('partner_id')
        .eq('email', recipientEmail)
        .maybeSingle();

      if (recipientError && recipientError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine (user might not exist yet)
        throw recipientError;
      }

      if (recipientProfile?.partner_id) {
        throw new Error('This user already has a partner connected');
      }

      // Check if recipient has any pending invitations
      const { data: recipientInvitations, error: recipientInvError } = await supabase
        .from('partner_invitations')
        .select('id')
        .eq('recipient_email', recipientEmail)
        .eq('status', 'pending');

      if (recipientInvError) throw recipientInvError;

      if (recipientInvitations && recipientInvitations.length > 0) {
        throw new Error('This user already has a pending invitation from someone else');
      }

      const { data, error } = await supabase
        .from('partner_invitations')
        .insert([{ 
          recipient_email: recipientEmail,
          sender_id: userData.user.id,
          status: 'pending'
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already sent an invitation to this email');
        }
        if (error.code === '42501') {
          throw new Error('You are not allowed to send invitations at this time');
        }
        throw error;
      }

      if (!data?.[0]) {
        throw new Error('Failed to create invitation');
      }

      set(state => ({
        sentInvitations: [...state.sentInvitations, data[0]]
      }));
    } catch (error) {
      console.error('Invitation error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to send invitation' });
    } finally {
      set({ isLoading: false });
    }
  },

  acceptInvitation: async (invitationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('No authenticated user found');

      // Start a transaction by first updating the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('partner_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId)
        .select('sender_id')
        .single();

      if (invitationError) throw invitationError;
      if (!invitation) throw new Error('Invitation not found');

      // Create the couple relationship
      const { data: _couple, error: coupleError } = await supabase
        .from('couples')
        .insert([{
          user1_id: invitation.sender_id,
          user2_id: user.id
        }])
        .select()
        .single();

      if (coupleError) throw coupleError;

      // Update both users with their partner_id
      const updatePromises = [
        supabase
          .from('users')
          .update({ partner_id: user.id })
          .eq('id', invitation.sender_id),
        supabase
          .from('users')
          .update({ partner_id: invitation.sender_id })
          .eq('id', user.id)
      ];

      const results = await Promise.all(updatePromises);
      const updateError = results.find(r => r.error);
      if (updateError) throw updateError.error;

      // Update local state
      set(state => ({
        receivedInvitations: state.receivedInvitations.map(inv =>
          inv.id === invitationId ? { ...inv, status: 'accepted' } : inv
        )
      }));

      // Refresh partner status in auth store
      await useAuthStore.getState().checkPartnerStatus();

    } catch (error) {
      console.error('Accept invitation error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to accept invitation' });
    } finally {
      set({ isLoading: false });
    }
  },

  rejectInvitation: async (invitationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: _data, error } = await supabase
        .from('partner_invitations')
        .update({ status: 'rejected' })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      set(state => ({
        receivedInvitations: state.receivedInvitations.map(inv =>
          inv.id === invitationId ? { ...inv, status: 'rejected' } : inv
        )
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to reject invitation' });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelInvitation: async (invitationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('partner_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('sender_id', userData.user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Delete error:', error);
        if (error.code === '42501') {
          throw new Error('You are not allowed to cancel this invitation');
        }
        throw error;
      }

      // Update local state to remove the canceled invitation
      set(state => ({
        sentInvitations: state.sentInvitations.filter(inv => inv.id !== invitationId)
      }));
    } catch (error) {
      console.error('Cancel invitation error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to cancel invitation' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSentInvitations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.log('User auth error:', userError);
        set({ sentInvitations: [], error: null });
        return;
      }

      if (!user) {
        console.log('No authenticated user');
        set({ sentInvitations: [], error: null });
        return;
      }

      // First check if user has a partner
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('partner_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.log('Profile fetch error:', profileError);
        set({ sentInvitations: [], error: null });
        return;
      }

      // If user has a partner, they shouldn't have any pending invitations
      if (userProfile?.partner_id) {
        set({ sentInvitations: [], error: null });
        return;
      }

      const { data: invitations, error: invitationsError } = await supabase
        .from('partner_invitations')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.log('Invitations fetch error:', invitationsError);
        if (invitationsError.code === '42501' || invitationsError.message?.includes('JSON object requested')) {
          set({ sentInvitations: [], error: null });
          return;
        }
        throw invitationsError;
      }

      const formattedInvitations = (invitations || []).map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        recipient_email: inv.recipient_email,
        status: inv.status,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        expires_at: inv.expires_at
      }));

      set({ sentInvitations: formattedInvitations });
    } catch (error) {
      console.error('Fetch invitations error:', error);
      // Don't show errors to the user during initial load
      set({ sentInvitations: [], error: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchReceivedInvitations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        set({ receivedInvitations: [], error: null });
        return;
      }

      // First get the invitations with a simpler query
      const { data: invitations, error: invitationsError } = await supabase
        .from('partner_invitations')
        .select(`
          id,
          sender_id,
          recipient_email,
          status,
          created_at,
          updated_at,
          expires_at
        `)
        .eq('recipient_email', user.email)
        .order('created_at', { ascending: false });

      if (invitationsError) {
        console.log('Received invitations fetch error:', invitationsError);
        set({ receivedInvitations: [], error: null });
        return;
      }

      // Then get the sender emails in a separate query
      const senderIds = [...new Set((invitations || []).map(inv => inv.sender_id))];
      const { data: senderProfiles, error: profilesError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', senderIds);

      if (profilesError) {
        console.log('Sender profiles fetch error:', profilesError);
      }

      // Create a map of sender IDs to emails
      const senderEmailMap = new Map(
        (senderProfiles || []).map(profile => [profile.id, profile.email])
      );

      const formattedInvitations = (invitations || []).map(inv => ({
        id: inv.id,
        sender_id: inv.sender_id,
        recipient_email: inv.recipient_email,
        status: inv.status,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
        expires_at: inv.expires_at,
        senderEmail: senderEmailMap.get(inv.sender_id),
        sender: senderEmailMap.has(inv.sender_id) 
          ? { email: senderEmailMap.get(inv.sender_id)! }
          : undefined
      }));

      set({ receivedInvitations: formattedInvitations });
    } catch (error) {
      console.error('Fetch received invitations error:', error);
      // Don't show errors to the user during initial load
      set({ receivedInvitations: [], error: null });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      sentInvitations: [],
      receivedInvitations: [],
      isLoading: false,
      error: null
    });
  }
})); 