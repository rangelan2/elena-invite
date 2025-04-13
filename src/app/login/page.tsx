'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the login API endpoint
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Use window.location.href for a complete page refresh to reload middleware
        window.location.href = '/';
      } else {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col justify-center items-center text-center px-6 py-20 font-serif text-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/winery-hero.jpg"
          alt="Scenic winery view with vineyards and mountains in the background"
          fill
          priority
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVigAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
          className="blur-[4px] object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40"></div>
      </div>

      <div className="relative z-10 max-w-md w-full space-y-8 bg-black/20 backdrop-blur-md p-8 rounded-xl">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Welcome to Our Celebration</h1>
          <p className="text-lg text-white/90">
            Please enter the password from your invitation to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="login-form-heading">
          <div className="space-y-2">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              placeholder="Enter password"
              autoFocus
              disabled={isSubmitting}
              aria-required="true"
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "password-error" : undefined}
            />
          </div>
          {error && (
            <p className="text-red-300 text-sm" id="password-error" role="alert">{error}</p>
          )}
          <button
            type="submit"
            className={`w-full px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold rounded-lg transition ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Checking...' : 'Continue to Site'}
          </button>
          <p className="text-sm text-white/70">
            Can&apos;t find your password? Check your invitation or contact Elena & Anthony.
          </p>
        </form>
      </div>
    </main>
  );
}