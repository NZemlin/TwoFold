import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface TimelinePost {
  id: string;
  couple_id: string;
  content: string;
  media_url?: string;
  type: 'image' | 'text' | 'hint';
  created_at: string;
  tags?: string[];
}

// Separate type for creating posts where couple_id is handled by the store
export type CreateTimelinePost = Omit<TimelinePost, 'id' | 'created_at' | 'couple_id'>;

interface TimelineStore {
  posts: TimelinePost[];
  isLoading: boolean;
  error: Error | string | null;
  uniqueTags: Set<string>;  // Track all unique tags
  
  // Actions
  fetchPosts: () => Promise<void>;
  createPost: (post: CreateTimelinePost) => Promise<void>;
  editPost: (id: string, updates: Partial<TimelinePost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  reset: () => void;
  getTagSuggestions: (query: string) => string[];
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  uniqueTags: new Set<string>(),

  getTagSuggestions: (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    return Array.from(get().uniqueTags)
      .filter(tag => tag.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => {
        // Prioritize tags that start with the query
        const aStartsWith = a.toLowerCase().startsWith(normalizedQuery);
        const bStartsWith = b.toLowerCase().startsWith(normalizedQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      });
  },

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      // First get the user's couple_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Get the couple_id from the users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('partner_id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!userProfile.partner_id) {
        set({ posts: [] });
        return;
      }

      // Get the couple record
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (coupleError) throw coupleError;

      // Fetch timeline posts for the couple
      const { data: posts, error: postsError } = await supabase
        .from('timeline_posts')
        .select('*')
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Update unique tags when fetching posts
      const allTags = new Set<string>();
      posts?.forEach(post => {
        post.tags?.forEach((tag: string) => allTags.add(tag));
      });

      set({ posts: posts || [], uniqueTags: allTags });
    } catch (error) {
      console.error('Fetch posts error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch posts' });
    } finally {
      set({ isLoading: false });
    }
  },

  createPost: async (post) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // Get the couple_id for the current user
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();

      if (coupleError) throw coupleError;
      if (!couple) throw new Error('No couple found');

      // Create the post with the correct couple_id
      const { data, error } = await supabase
        .from('timeline_posts')
        .insert([{
          ...post,
          couple_id: couple.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Update unique tags when creating a post
      const newTags = new Set(get().uniqueTags);
      post.tags?.forEach(tag => newTags.add(tag));

      set(state => ({
        posts: [data, ...state.posts],
        uniqueTags: newTags
      }));
    } catch (error) {
      console.error('Create post error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to create post' });
    } finally {
      set({ isLoading: false });
    }
  },

  editPost: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('timeline_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update unique tags when editing a post
      const allTags = new Set<string>();
      get().posts.forEach(post => {
        if (post.id === id) {
          updates.tags?.forEach(tag => allTags.add(tag));
        } else {
          post.tags?.forEach(tag => allTags.add(tag));
        }
      });

      set(state => ({
        posts: state.posts.map(post =>
          post.id === id ? { ...post, ...data } : post
        ),
        uniqueTags: allTags
      }));
    } catch (error) {
      console.error('Edit post error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to edit post' });
    } finally {
      set({ isLoading: false });
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // First get the post to check if it has an image
      const { data: post, error: fetchError } = await supabase
        .from('timeline_posts')
        .select('media_url')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // If post has an image, delete it from storage
      if (post?.media_url) {
        const fileName = post.media_url.split('/').pop(); // Get filename from URL
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('timeline-media')
            .remove([fileName]);

          if (storageError) {
            console.error('Failed to delete image:', storageError);
            // Continue with post deletion even if image deletion fails
          }
        }
      }

      // Delete the post
      const { error } = await supabase
        .from('timeline_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        posts: state.posts.filter(post => post.id !== id)
      }));
    } catch (error) {
      console.error('Delete post error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to delete post' });
    } finally {
      set({ isLoading: false });
    }
  },

  uploadImage: async (file) => {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`; // Add user ID and timestamp to filename
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('timeline-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('timeline-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  },

  reset: () => {
    set({
      posts: [],
      isLoading: false,
      error: null
    });
  }
})); 