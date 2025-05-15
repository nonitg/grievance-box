'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/AuthLayout';
import { getReceivedGrievances, getSentGrievances, markGrievanceAsRead, deleteGrievance, getAllUsers } from '@/lib/firestore';
import { Grievance, UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function MyGrievancesPage() {
  const { user } = useAuth();
  const [receivedGrievances, setReceivedGrievances] = useState<Grievance[]>([]);
  const [sentGrievances, setSentGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    async function fetchGrievances() {
      if (!user) return;
      
      try {
        setLoading(true);
        const [received, sent, allUsers] = await Promise.all([
          getReceivedGrievances(user.uid),
          getSentGrievances(user.uid),
          getAllUsers(),
        ]);
        
        // Create a lookup object for user profiles
        const profilesMap: Record<string, UserProfile> = {};
        allUsers.forEach(userProfile => {
          profilesMap[userProfile.uid] = userProfile;
        });
        
        setUserProfiles(profilesMap);
        setReceivedGrievances(received);
        setSentGrievances(sent);
      } catch (error) {
        console.error('Error fetching grievances:', error);
        toast.error('Failed to load grievances');
      } finally {
        setLoading(false);
      }
    }

    fetchGrievances();
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

  return (
    <AuthLayout>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>My Grievances</span>
            <span className="text-2xl">🍵</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            View and manage all your tea
          </p>
        </div>
        
        <div className="bg-white shadow-lg overflow-hidden rounded-xl border-t-4 border-teal-400">
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
                    You haven't received any grievances yet. Wait for your friends to spill some tea!
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
                  <h3 className="text-xl font-semibold text-gray-700 mb-1">You haven't spilled any tea yet!</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Time to let your friends know what's on your mind.
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