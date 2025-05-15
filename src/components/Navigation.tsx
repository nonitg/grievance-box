'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from './ui/Button';

export function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'My Grievances', path: '/my-grievances', icon: '📝' },
    { name: 'Send Grievance', path: '/send-grievance', icon: '✉️' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-teal-500 flex items-center gap-2">
                <span className="text-2xl">☕</span>
                <span className="relative">
                  Grievances
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-orange-300"></span>
                </span>
              </Link>
            </div>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.path)
                        ? 'bg-teal-100 text-teal-700 font-semibold shadow-sm'
                        : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1.5">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 hidden sm:inline-block">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    await logout();
                  }}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {user && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="flex justify-between space-x-2 px-3 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`flex-1 text-center px-3 py-2 text-sm font-medium rounded-lg transition-colors flex flex-col items-center ${
                  isActive(link.path)
                    ? 'bg-teal-100 text-teal-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg mb-0.5">{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}