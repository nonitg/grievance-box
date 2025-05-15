'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <Navigation />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800 tracking-tight mb-4">
              Air Your <span className="text-teal-500 relative">
                Grievances
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-orange-300" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,0 Q50,12 100,0" fill="currentColor" />
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
              A fun and casual way to tell your friends what&apos;s bothering you, anonymously or not.
            </p>
            
            {!loading && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signup">
                      <Button size="lg">
                        Sign Up
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" size="lg">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-20 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 border-t-4 border-teal-400 group">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-teal-200 transition-colors">
                <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Send Grievances</h3>
              <p className="text-gray-600">
                Let your friends know what&apos;s bothering you in a fun, casual way without the awkward face-to-face conversation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 border-t-4 border-orange-400 group">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Stay Anonymous</h3>
              <p className="text-gray-600">
                Choose to reveal your identity or stay completely anonymous when sending those spicy grievances.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105 border-t-4 border-cyan-400 group">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors">
                <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Receive Feedback</h3>
              <p className="text-gray-600">
                Find out what your friends really think about you in a safe, controlled environment with just the right amount of sass.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()}Nonit Gupt the very cool kid</p>
      </footer>
    </div>
  );
}