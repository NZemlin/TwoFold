import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../stores/useTimelineStore';

const CreatePostButton: React.FC = () => {
  const { createPost, uploadImage, isLoading, getTagSuggestions } = useTimelineStore();
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
      setShowSuggestions(suggestions.length > 0);
    } else {
      setTagSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, getTagSuggestions]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTagAdd = (tagToAdd: string) => {
    const trimmedTag = tagToAdd.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
    setShowSuggestions(false);
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
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) {
      setError('Please add some content or an image');
      return;
    }

    try {
      let mediaUrl = '';
      if (selectedFile) {
        mediaUrl = await uploadImage(selectedFile);
      }

      await createPost({
        content: content.trim(),
        type: selectedFile ? 'image' : 'text',
        media_url: mediaUrl || undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      // Reset form
      setContent('');
      setTags([]);
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          setContent('');
          setTags([]);
          setTagInput('');
          setSelectedFile(null);
          setPreviewUrl(null);
          setError(null);
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Post
      </button>

      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="content"
                      rows={3}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="What's on your mind?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <div
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="mx-auto h-32 w-auto object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              <span>Upload a file</span>
                              <input
                                ref={fileInputRef}
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileSelect}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onFocus={() => tagInput.trim() && setShowSuggestions(true)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add tags (press Enter)"
                    />
                    
                    {/* Tag Suggestions Dropdown */}
                    {showSuggestions && tagSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
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
                      </div>
                    )}

                    {/* Display added tags */}
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
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
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostButton; 