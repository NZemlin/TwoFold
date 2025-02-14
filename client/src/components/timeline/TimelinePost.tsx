import React, { useState, useRef, useEffect } from 'react';
import { TimelinePost as TimelinePostType } from '../../stores/useTimelineStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelinePostProps {
  post: TimelinePostType;
}

const TimelinePost: React.FC<TimelinePostProps> = ({ post }) => {
  const { deletePost, editPost, getTagSuggestions } = useTimelineStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [editedTags, setEditedTags] = useState<string[]>(post.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when typing
  useEffect(() => {
    if (tagInput.trim()) {
      const suggestions = getTagSuggestions(tagInput);
      setTagSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setTagSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, getTagSuggestions]);

  // Add click outside handler for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  const handleEdit = async () => {
    setIsSubmitting(true);
    try {
      await editPost(post.id, {
        content: editedContent.trim(),
        tags: editedTags
      });
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Failed to edit post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !editedTags.includes(tag.trim())) {
      setEditedTags([...editedTags, tag.trim()]);
    }
    setTagInput('');
    setShowSuggestions(false);
    tagInputRef.current?.focus();
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleTagAdd(tagInput);
      }
    } else if (e.key === 'Tab' && showSuggestions && tagSuggestions.length > 0) {
      e.preventDefault();
      handleTagAdd(tagSuggestions[0]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <motion.div 
      className="bg-white rounded-lg shadow overflow-visible group relative"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Action Menu Button - Only visible on hover */}
      <motion.div 
        ref={menuRef}
        className="absolute top-2 right-2 z-30 invisible group-hover:visible"
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.05 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1.5 hover:bg-gray-100 rounded-full bg-white shadow-sm"
          aria-label="Post options"
        >
          <svg
            className="w-5 h-5 text-gray-500 hover:text-gray-700"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {showMenu && !isEditing && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  setShowDeleteConfirm(false);
                }}
              />
              
              {/* Menu Items - Position relative to the button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-md shadow-lg z-[100] py-1 ring-1 ring-black ring-opacity-5"
                style={{ minWidth: '12rem' }}
              >
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Edit post
                </button>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete post
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-2"
                  >
                    <p className="text-xs text-gray-500 mb-2">Are you sure?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setShowMenu(false);
                        }}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                        disabled={isDeleting}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {post.type === 'image' && post.media_url && (
        <div className="aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden">
          <img
            src={post.media_url}
            alt={post.content || 'Timeline post'}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      
      <div className="p-4">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={3}
              placeholder="What's on your mind?"
            />
            
            <div className="relative">
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onFocus={() => tagInput.trim() && setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Add tags (press Enter)"
              />
              
              {/* Tag Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && tagSuggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-auto"
                  >
                    {tagSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleTagAdd(suggestion)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {editedTags.length > 0 && (
                <motion.div 
                  layout
                  className="mt-2 flex flex-wrap gap-2"
                >
                  <AnimatePresence>
                    {editedTags.map(tag => (
                      <motion.span
                        key={tag}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(post.content);
                  setEditedTags(post.tags || []);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="px-3 py-1.5 border border-transparent rounded-md text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div layout className="flex flex-col min-h-[60px]">
            {post.content && (
              <p className="text-gray-800 text-sm mb-2">{post.content}</p>
            )}
            
            <div className="mt-auto pt-2 flex items-center justify-between gap-4">
              <div className="flex-1 flex flex-wrap gap-2">
                {post.tags && post.tags.length > 0 && (
                  <AnimatePresence>
                    {post.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              <span className="text-xs text-gray-500 shrink-0">{formattedDate}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TimelinePost; 