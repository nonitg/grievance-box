'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/AuthLayout';
import { getReceivedGrievances, getSentGrievances, markGrievanceAsRead, deleteGrievance, getUserProfile, getAllUsers } from '@/lib/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const [receivedGrievances, setReceivedGrievances] = useState<Grievance[]>([]);
  const [sentGrievances, setSentGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        setLoading(true);
        const [received, sent, profile, allUsers] = await Promise.all([
          getReceivedGrievances(user.uid),
          getSentGrievances(user.uid),
          getUserProfile(user.uid),
          getAllUsers()
        ]);
        
        // Create a lookup object for user profiles
        const profilesMap: Record<string, UserProfile> = {};
        allUsers.forEach(userProfile => {
          profilesMap[userProfile.uid] = userProfile;
        });
        
        setUserProfiles(profilesMap);
        setReceivedGrievances(received);
        setSentGrievances(sent);
        
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
      setReceivedGrievances((prev) =>
        prev.map((g) => (g.id === grievanceId ? { ...g, read: true } : g))
      );
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking grievance as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (grievanceId: string) => {
    if (!confirm('Are you sure you want to delete this grievance?')) return;
    
    try {
      await deleteGrievance(grievanceId);
      
      setReceivedGrievances((prev) => 
        prev.filter((g) => g.id !== grievanceId)
      );
      
      setSentGrievances((prev) => 
        prev.filter((g) => g.id !== grievanceId)
      );
      
      toast.success('Grievance deleted');
    } catch (error) {
      console.error('Error deleting grievance:', error);
      toast.error('Failed to delete grievance');
    }
  };

  // Get recipient display name
  const getRecipientName = (recipientUid: string) => {
    return userProfiles[recipientUid]?.displayName || userProfiles[recipientUid]?.email || 'Unknown User';
  };
  
  const unreadCount = receivedGrievances.filter((g) => !g.read).length;
  
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
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href="/send-grievance">
              <Button className="flex items-center gap-2">
                <span className="text-lg">✍️</span> 
                Send a Grievance
              </Button>
            </Link>
            <Link href="/public-board">
              <Button variant="secondary" className="flex items-center gap-2">
                <span className="text-lg">☕</span> 
                Public Board
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
                    Received
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : receivedGrievances.length}
                    </div>
                    <span className="ml-2 text-lg">
                      {receivedGrievances.length > 0 ? '📝' : '📝'}
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
                    Sent Grievances
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-3xl font-bold text-gray-800">
                      {loading ? '...' : sentGrievances.length}
                    </div>
                    <span className="ml-2 text-lg">
                      {sentGrievances.length > 0 ? '✉️' : '✉️'}
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
              <span>My Grievances</span>
              <span className="text-xl">🍵</span>
            </h2>
            <p className="mt-1 text-gray-600">
              View and manage all your private tea
            </p>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('received')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-base transition-colors ${
                  activeTab === 'received'
                    ? 'border-teal-500 text-teal-600 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Received</span>
                  <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {receivedGrievances.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-base transition-colors ${
                  activeTab === 'sent'
                    ? 'border-teal-500 text-teal-600 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-teal-600 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Sent</span>
                  <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {sentGrievances.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-teal-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Brewing the tea...</p>
            </div>
          ) : activeTab === 'received' ? (
            <div>
              {receivedGrievances.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="text-7xl mb-4">😴</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">No tea to sip on!</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You haven&apos;t received any grievances yet. Wait for your friends to spill some tea!
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {receivedGrievances.map((grievance) => (
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
                        <div className="mt-3 flex items-center space-x-3 text-sm text-gray-500 sm:mt-0 sm:ml-3">
                          {!grievance.read && (
                            <button
                              onClick={() => grievance.id && handleMarkAsRead(grievance.id)}
                              className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => grievance.id && handleDelete(grievance.id)}
                            className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div>
              {sentGrievances.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="text-7xl mb-4">🤐</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">You haven&apos;t spilled any tea yet!</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Time to let your friends know what&apos;s on your mind.
                  </p>
                  <Link href="/send-grievance">
                    <Button>
                      <span className="mr-2 text-lg">✍️</span>
                      Send Your First Grievance
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {sentGrievances.map((grievance) => (
                    <li key={grievance.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                          To: {getRecipientName(grievance.recipientUid)}
                          {grievance.isAnonymous && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-medium">Anonymous</span>}
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
                        <div className="mt-3 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-3">
                          <button
                            onClick={() => grievance.id && handleDelete(grievance.id)}
                            className="text-rose-600 hover:text-rose-800 text-sm font-medium flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}