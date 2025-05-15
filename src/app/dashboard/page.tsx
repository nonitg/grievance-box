'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/AuthLayout';
import { getReceivedGrievances, markGrievanceAsRead, getUserProfile } from '@/lib/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        setLoading(true);
        const [receivedGrievances, profile] = await Promise.all([
          getReceivedGrievances(user.uid),
          getUserProfile(user.uid)
        ]);
        
        setGrievances(receivedGrievances);
        if (profile) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleMarkAsRead = async (grievanceId: string) => {
    try {
      await markGrievanceAsRead(grievanceId);
      setGrievances((prev) =>
        prev.map((g) => (g.id === grievanceId ? { ...g, read: true } : g))
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking grievance as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const unreadCount = grievances.filter((g) => !g.read).length;
  
  // Get the user's display name from profile or user object
  const displayName = userProfile?.displayName || user?.displayName || (user?.email?.split('@')[0] || 'Anonymous User');

  return (
    <AuthLayout>
      <div className="py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span>Dashboard</span>
              <span className="text-2xl">👀</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back, <span className="font-semibold text-teal-600">{displayName}</span>! Ready to spill some tea?
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link href="/send-grievance">
              <Button className="flex items-center gap-2">
                <span className="text-lg">✍️</span> 
                Send a Grievance
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-teal-400 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unread Grievances
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : unreadCount}
                    </div>
                    <span className="ml-2 text-lg">
                      {unreadCount > 0 ? '📬' : '📭'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-orange-400 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Grievances
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : grievances.length}
                    </div>
                    <span className="ml-2 text-lg">
                      {grievances.length > 0 ? '📝' : '📝'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border-l-4 border-cyan-400 hover:shadow-xl transition-all transform hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-cyan-100 rounded-full p-3">
                  <svg className="h-8 w-8 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Anonymous Gossip
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : grievances.filter(g => g.isAnonymous).length}
                    </div>
                    <span className="ml-2 text-lg">
                      {grievances.filter(g => g.isAnonymous).length > 0 ? '🕵️' : '🕵️'}
                    </span>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg overflow-hidden rounded-xl border-t-4 border-teal-400">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>Recent Tea</span>
              <span className="text-xl">☕</span>
            </h2>
            <p className="mt-1 text-gray-600">
              Check out what your friends <em>really</em> think about you
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Brewing the tea...</p>
            </div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="text-7xl mb-4">😴</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-1">No tea to spill yet!</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Your inbox is empty. Wait for your friends to send you some juicy grievances!
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {grievances.slice(0, 5).map((grievance) => (
                <li key={grievance.id} className={`px-6 py-5 ${!grievance.read ? 'bg-teal-50 border-l-4 border-teal-400' : ''} hover:bg-gray-50 transition-colors`}>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                      {grievance.isAnonymous ? (
                        <>
                          <span>Anonymous</span>
                          <span className="text-lg">🕵️</span>
                        </>
                      ) : (
                        grievance.senderName
                      )}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                        {new Date(grievance.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {grievance.content}
                      </p>
                    </div>
                    {!grievance.read && (
                      <div className="mt-3 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-3">
                        <button
                          onClick={() => grievance.id && handleMarkAsRead(grievance.id)}
                          className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {grievances.length > 5 && (
            <div className="px-6 py-4 bg-gray-50 text-right">
              <Link href="/my-grievances" className="text-teal-600 hover:text-teal-800 text-sm font-medium inline-flex items-center gap-1 transition-colors hover:bg-teal-50 px-3 py-1 rounded">
                <span>View all the tea</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}