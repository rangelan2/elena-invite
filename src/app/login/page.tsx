'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password');
    
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
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/flowery-hero-optimized.jpg"
          alt="Coastal landscape with flowers"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="blur-[4px]"
          style={{
            objectFit: 'cover',
            objectPosition: 'center 40%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40"></div>
      </div>
      <div className="relative z-10 max-w-md w-full space-y-8 bg-black/20 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-white mb-2">
            Welcome to Our Celebration
          </h1>
          <p className="text-sm sm:text-base text-white/90">
            Please enter the password from your invitation to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter password"
              disabled={isLoading}
              autoComplete="current-password"
              className="w-full px-6 py-4 text-base text-white placeholder:text-white/50 bg-white/10 border border-white/20 rounded-full focus:ring-2 focus:ring-white/50 focus:border-transparent focus:outline-none backdrop-blur-sm"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm sm:text-sm text-center font-['Lato'] px-4 py-2 bg-red-900/20 backdrop-blur-sm rounded-lg" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-sm font-['Lato'] text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm transition-colors"
          >
            {isLoading ? 'Checking...' : 'Continue to Site'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm sm:text-sm text-white/70 font-['Lato'] px-4">
          Can't find your password? Check your invitation or contact Elena & Anthony.
        </p>
      </div>
    </main>
  );
} 