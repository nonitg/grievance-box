'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TeaPost as TeaPostType } from '@/lib/types';
import { getUserTeaPosts } from '@/lib/firestore';
import { TeaPost } from '@/components/ui/TeaPost';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TeaPostButton } from '@/components/ui/TeaPostForm';

export default function MyTeaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<TeaPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fetchedPosts = await getUserTeaPosts(user.uid);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts();
    } else {
      router.push('/login');
    }
  }, [user, router, fetchPosts]);

  if (!user) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>My Tea Posts</span>
              <span className="text-2xl">🫖</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage all the tea you've shared on the public board
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/public-board">
              <Button variant="outline" className="flex items-center gap-2">
                <span className="text-lg">☕</span> 
                Public Board
              </Button>
            </Link>
          </div>
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
            <div className="text-7xl mb-4">🫖</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-1">You haven&apos;t shared any tea yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Use the + button to start sharing tea with the community!
            </p>
            <Link href="/public-board">
              <Button className="flex items-center gap-2">
                <span className="text-lg">☕</span>
                Go to Public Board
              </Button>
            </Link>
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