'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createUserProfile } from '@/lib/firestore';

interface SignupFormData {
  email: string;
  password: string;
  displayName: string;
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>();
  
  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      const credentials = await signUp(data.email, data.password);
      
      // Create user profile in Firestore
      if (credentials?.user) {
        await createUserProfile({
          uid: credentials.user.uid,
          email: data.email,
          displayName: data.displayName,
        });
      }
      
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Signup error:', error);
      // Type guard to safely access error.message
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error.message as string) 
        : 'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-t-4 border-teal-400">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-gray-800">Join the Fun!</h1>
          <p className="text-gray-600 mt-2">Create an account to spill some tea</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <Input
              label="Display Name"
              type="text"
              className="py-3 text-base text-gray-900 bg-white"
              error={errors.displayName?.message}
              {...register('displayName', { 
                required: 'Display name is required',
              })}
            />
            
            <Input
              label="Email"
              type="email"
              className="py-3 text-base text-gray-900 bg-white"
              error={errors.email?.message}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Please enter a valid email',
                },
              })}
            />
            
            <Input
              label="Password"
              type="password"
              className="py-3 text-base text-gray-900 bg-white"
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6 py-3 text-base"
            isLoading={isLoading}
          >
            <span className="mr-2">✨</span>
            Sign Up
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-base text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 hover:text-teal-800 font-medium inline-flex items-center">
              <span>Log in</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}