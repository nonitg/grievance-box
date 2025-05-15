'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border-t-4 border-teal-400">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">☕</div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Log in to spill some tea</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
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
            <span className="mr-2">🔓</span>
            Log In
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-base text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-teal-600 hover:text-teal-800 font-medium inline-flex items-center">
              <span>Sign up</span>
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