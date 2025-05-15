'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { addTeaPost } from '@/lib/firestore';
import { Button } from './Button';
import { Modal } from './Modal';

interface TeaPostFormProps {
  onSuccess: () => void;
  isModal?: boolean;
}

export const TeaPostForm: React.FC<TeaPostFormProps> = ({ onSuccess, isModal = false }) => {
  const { user } = useAuth();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const teaPost = {
        content: content.trim(),
        authorUid: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        isAnonymous,
        createdAt: Date.now()
      };
      
      await addTeaPost(teaPost);
      setContent('');
      setIsAnonymous(false);
      onSuccess();
    } catch (error) {
      console.error('Error posting tea:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formContent = (
    <div className="p-6">
      <div className="mb-4">
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none transition-all text-gray-800"
          placeholder="What&apos;s the tea today? Spill it here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          maxLength={500}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <div>Max 500 characters</div>
          <div className={content.length > 400 ? (content.length > 450 ? 'text-red-500' : 'text-amber-500') : 'text-gray-500'}>
            {content.length}/500
          </div>
        </div>
      </div>
      
      <div className="flex items-center mt-4 mb-5">
        <div className="relative inline-block w-12 mr-2 align-middle select-none">
          <input 
            type="checkbox" 
            id="anonymous"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 ease-in-out"
          />
          <label 
            htmlFor="anonymous" 
            className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out"
          ></label>
        </div>
        <label htmlFor="anonymous" className="text-gray-700 cursor-pointer flex items-center gap-1.5">
          <span>Post anonymously</span>
          <span className="text-lg">🕵️</span>
        </label>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={!content.trim() || isSubmitting}
          className="px-6 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
          Spill the Tea
        </Button>
      </div>
    </div>
  );
  
  if (!user) {
    return isModal ? null : (
      <div className="bg-amber-50 rounded-xl p-5 text-amber-800 border border-amber-200 mb-6 shadow-md">
        <div className="flex items-center gap-3 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Please log in to post tea.</span>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className={isModal ? '' : "bg-white rounded-xl shadow-md mb-6 border border-gray-100 overflow-hidden"}>
      {!isModal && (
        <div className="px-6 pt-5 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-teal-600 flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span>Share Some Tea</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            What&apos;s the gossip? Share it with the community.
          </p>
        </div>
      )}
      
      {formContent}
      
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #10B981;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #10B981;
        }
      `}</style>
    </form>
  );
};

// Component for the modal button
export const TeaPostButton: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess();
  };
  
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!user}
        className="fixed bottom-6 right-6 bg-teal-500 hover:bg-teal-600 text-white rounded-full p-4 shadow-lg z-10 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
        title={user ? "Share some tea" : "Log in to share tea"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Share Some Tea ☕"
      >
        <TeaPostForm onSuccess={handleSuccess} isModal={true} />
      </Modal>
    </>
  );
};