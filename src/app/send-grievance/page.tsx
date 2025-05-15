'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/lib/auth-context';
import { AuthLayout } from '@/components/AuthLayout';
import { addGrievance, getAllUsers, getUserProfile, createUserProfile } from '@/lib/firestore';
import { GrievanceFormData, UserProfile } from '@/lib/types';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

export default function SendGrievancePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GrievanceFormData>();
  
  useEffect(() => {
    async function fetchUsers() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Get all users for the recipient dropdown
        const allUsers = await getAllUsers();
        
        // Filter out current user and log for debugging
        const filteredUsers = allUsers.filter(u => u.uid !== user.uid);
        console.log("Available recipients:", filteredUsers);
        setUsers(filteredUsers);
        
        // Get current user profile
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          // Create profile if it doesn't exist yet
          console.log("Creating new user profile");
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (user.email?.split('@')[0] || 'Anonymous User')
          };
          
          try {
            await createUserProfile(newProfile);
            setUserProfile(newProfile);
            console.log("User profile created successfully:", newProfile);
          } catch (err) {
            console.error("Error creating user profile:", err);
            toast.error("Error setting up your profile");
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, [user]);
  
  const onSubmit = async (data: GrievanceFormData) => {
    if (!user) {
      toast.error('You must be logged in to send a grievance');
      return;
    }
    
    if (!data.recipientUid) {
      toast.error('Please select a recipient');
      return;
    }
    
    // Use either the profile or create a basic sender info
    const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Anonymous User';
    
    try {
      setSubmitting(true);
      
      // Find the recipient's display name for better logging
      const recipient = users.find(u => u.uid === data.recipientUid);
      console.log(`Sending grievance to ${recipient?.displayName || data.recipientUid}`);
      
      await addGrievance({
        content: data.content,
        recipientUid: data.recipientUid,
        senderUid: user.uid,
        senderName: displayName,
        isAnonymous: data.isAnonymous,
        createdAt: Date.now(),
        read: false
      });
      
      toast.success('Tea has been spilled! 🍵');
      reset();
    } catch (error) {
      console.error('Error sending grievance:', error);
      toast.error('Failed to send grievance');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <AuthLayout>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span>Spill the Tea</span>
            <span className="text-2xl">☕</span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Let your friends know what's <em>really</em> bothering you
          </p>
        </div>
        
        <div className="bg-white shadow-lg overflow-hidden rounded-xl border-t-4 border-teal-400">
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-teal-500 mx-auto"></div>
                <p className="mt-4 text-gray-500">Finding your friends...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 px-6">
                <div className="text-7xl mb-4">😢</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-1">No friends found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Invite your friends to join so you can send them grievances!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <Controller
                    name="recipientUid"
                    control={control}
                    rules={{ required: 'You need to pick someone!' }}
                    render={({ field }) => (
                      <SearchableSelect
                        label="Who deserves this tea? 🎯"
                        options={users.map(user => ({
                          value: user.uid,
                          label: user.displayName || user.email || 'Unknown User'
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choose a friend..."
                        error={errors.recipientUid?.message}
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-base font-semibold text-gray-700 mb-2">
                    Spill it... what's bothering you? 💭
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    className={`block w-full rounded-lg shadow-sm p-4 focus:ring-teal-400 focus:ring-opacity-50 text-gray-900 bg-white ${
                      errors.content ? 'border-2 border-rose-400' : 'border-2 border-teal-200 focus:border-teal-400'
                    }`}
                    placeholder="Go ahead, let it all out... what did they do this time?"
                    {...register('content', { 
                      required: 'You need to write something!',
                      minLength: {
                        value: 10,
                        message: 'Come on, give us at least 10 characters of tea!',
                      },
                    })}
                  ></textarea>
                  {errors.content && (
                    <p className="mt-2 text-sm text-rose-500 font-medium flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      {errors.content.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center bg-orange-50 p-4 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
                  <input
                    id="anonymous"
                    type="checkbox"
                    className="h-5 w-5 text-orange-500 focus:ring-orange-400 border-orange-300 rounded"
                    {...register('isAnonymous')}
                  />
                  <label htmlFor="anonymous" className="ml-3 block text-base text-gray-700 flex items-center gap-2 cursor-pointer">
                    <span>Keep me anonymous</span>
                    <span className="text-lg">🕵️</span>
                  </label>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    isLoading={submitting}
                  >
                    <span className="mr-2 text-lg">☕</span>
                    Spill the Tea
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}