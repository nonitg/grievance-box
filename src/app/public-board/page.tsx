'use client';

import React, { useEffect, useState } from 'react';
import { TeaPost as TeaPostType } from '@/lib/types';
import { getAllTeaPosts } from '@/lib/firestore';
import { TeaPost } from '@/components/ui/TeaPost';
import { TeaPostButton } from '@/components/ui/TeaPostForm';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/AuthLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PublicBoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<TeaPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await getAllTeaPosts(50); // Fetch up to 50 posts
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <AuthLayout>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>Public Tea Board</span>
              <span className="text-2xl">☕</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Share and discover the latest gossip with the community
              {!user && ' — Log in to post and upvote!'}
            </p>
          </div>
          
          {user && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link href="/my-tea">
                <Button variant="outline" className="flex items-center gap-2">
                  <span className="text-lg">🫖</span> 
                  My Tea Posts
                </Button>
              </Link>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              <p className="mt-4 text-gray-500">Brewing the tea...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-10 text-center">
            <div className="text-7xl mb-4">☕</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-1">No tea has been spilled yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Be the first to share some gossip with the community!
            </p>
            {user && (
              <p className="text-sm text-teal-600">
                Use the + button to share some tea
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <TeaPost
                key={post.id}
                post={post}
                onUpdate={fetchPosts}
              />
            ))}
          </div>
        )}
        
        {/* Floating action button to add new tea posts */}
        <TeaPostButton onSuccess={fetchPosts} />
      </div>
    </AuthLayout>
  );
} 