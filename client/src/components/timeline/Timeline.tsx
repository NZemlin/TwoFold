import React, { useEffect } from 'react';
import { useTimelineStore } from '../../stores/useTimelineStore';
import TimelinePost from './TimelinePost.tsx';
import CreatePostButton from './CreatePostButton.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const Timeline: React.FC = () => {
  const { posts, fetchPosts, isLoading, error } = useTimelineStore();

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading && !posts.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Timeline</h1>
        <CreatePostButton />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error instanceof Error ? error.message : error}</span>
        </div>
      )}

      {!posts.length ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="mb-6 break-inside-avoid"
                style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid'
                }}
              >
                <TimelinePost post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Timeline; 