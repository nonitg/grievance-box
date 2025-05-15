'use client';

import React from 'react';
import { TeaPost as TeaPostType } from '@/lib/types';
import { upvoteTeaPost, deleteTeaPost } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Button } from './Button';
import { formatDistanceToNow } from 'date-fns';

interface TeaPostProps {
  post: TeaPostType;
  onUpdate: () => void;
}

export const TeaPost: React.FC<TeaPostProps> = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const isAuthor = user?.uid === post.authorUid;
  const hasUpvoted = post.upvotedBy?.includes(user?.uid || '');

  const handleUpvote = async () => {
    if (!user) return;
    
    try {
      await upvoteTeaPost(post.id!, user.uid);
      onUpdate();
    } catch (error) {
      console.error('Error upvoting post:', error);
    }
  };

  const handleDelete = async () => {
    if (!user || !isAuthor) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteTeaPost(post.id!);
        onUpdate();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <div className="p-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 text-sm font-bold">
              {post.isAnonymous ? '?' : (post.authorName?.[0] || 'U').toUpperCase()}
            </div>
            <div className="ml-2">
              <p className="font-medium text-sm text-gray-900 line-clamp-1">
                {post.isAnonymous ? 'Anonymous' : post.authorName || 'Unknown'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {isAuthor && (
            <button 
              onClick={handleDelete}
              className="text-rose-500 hover:text-rose-700 p-1 rounded-full hover:bg-rose-50"
              aria-label="Delete post"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-gray-700 text-sm mb-2 bg-gray-50 p-2 rounded-lg border border-gray-100 whitespace-pre-wrap">
          {post.content}
        </div>
      </div>
      
      <div className="px-3 py-2 mt-auto border-t border-gray-100 flex justify-between items-center">
        <button
          onClick={handleUpvote}
          disabled={!user}
          className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
            hasUpvoted 
              ? 'text-teal-600 bg-teal-50 hover:bg-teal-100' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span className="font-medium">{post.upvotes || 0}</span>
        </button>
        
        <div className="text-xs text-gray-500">
          {post.upvotes === 1 ? '1 like' : `${post.upvotes || 0} likes`}
        </div>
      </div>
    </div>
  );
};