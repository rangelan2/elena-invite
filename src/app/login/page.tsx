'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [visiblePassword, setVisiblePassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle showing the last character briefly
  useEffect(() => {
    if (password) {
      // Show the last character
      const lastChar = password[password.length - 1];
      const maskedChars = '•'.repeat(password.length - 1);
      setVisiblePassword(maskedChars + lastChar);

      // Mask the last character after a delay
      const timer = setTimeout(() => {
        setVisiblePassword('•'.repeat(password.length));
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setVisiblePassword('');
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = '/'; // Force a full page reload
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#4A5D4F] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#4A5D4F] mb-2">
            Welcome to Our Celebration
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D4F]/80">
            Please enter the password from your invitation to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              className="absolute inset-0 w-full h-full opacity-0 z-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <div 
              className="appearance-none relative block w-full px-4 py-3 sm:px-3 sm:py-2 border border-[#4A5D4F]/20 placeholder-[#4A5D4F]/40 text-[#4A5D4F] rounded-lg focus-within:ring-2 focus-within:ring-[#4A5D4F] focus-within:border-transparent cursor-text bg-white/80"
              onClick={() => document.getElementById('password')?.focus()}
            >
              <span className="font-['Lato'] inline-flex items-center text-base sm:text-sm">
                {visiblePassword || 'Enter password'}
                <span className="ml-[1px] text-[#4A5D4F] animate-[cursor-blink_1s_steps(1)_infinite]">|</span>
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm sm:text-sm text-center font-['Lato'] px-4 py-2 bg-red-50 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-sm font-['Lato'] text-white bg-[#4A5D4F] hover:bg-[#3d4d41] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A5D4F] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Checking...' : 'Continue to Site'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm sm:text-sm text-[#4A5D4F]/70 font-['Lato'] px-4">
          Can't find your password? Check your invitation or contact Elena & Anthony.
        </p>
      </div>
    </main>
  );
} 