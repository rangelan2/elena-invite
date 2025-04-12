'use client';

import React, { useState, useEffect } from 'react';
import { addHighScore } from './ScoreService';

const HighScoreForm = ({ show, onClose, score, onSubmitted }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form state when showing the form
  useEffect(() => {
    console.log("HighScoreForm show state changed:", show);
    if (show) {
      setName('');
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [show]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && show && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [show, isSubmitting, onClose]);

  // Handle submission of the high score form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const scoreId = await addHighScore(name.trim(), score);
      
      if (scoreId) {
        setSuccess(true);
        
        // Close the form after a short delay
        setTimeout(() => {
          if (onSubmitted) {
            onSubmitted();
          }
          onClose();
        }, 1500);
      } else {
        setError('Failed to save your score. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting score:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4 pointer-events-auto">
      <div className="bg-[#4EC0CA] border-4 border-black rounded-xl w-full max-w-sm p-6 text-center shadow-lg">
        <div className="bg-[#DEA430] py-3 px-4 -mt-10 mb-4 rounded-lg border-4 border-black shadow-md inline-block">
          <h2 className="text-2xl font-bold text-white" style={{ textShadow: '2px 2px 0 #000' }}>
            NEW HIGH SCORE!
          </h2>
        </div>

        <h3 className="text-xl font-bold text-white mb-4">You Scored {score} Points!</h3>
        
        {success ? (
          <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded mb-2">
            <p className="font-bold">Your score has been saved!</p>
            <p className="text-sm">Opening leaderboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-white mb-4">Add your name to the leaderboard:</p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-md border-2 border-black text-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                maxLength={20}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-yellow-500 text-white rounded-md font-bold border-b-4 border-yellow-700 text-lg
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-yellow-600 transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-2'}`}
              >
                {isSubmitting ? 'Saving...' : 'Submit Score'}
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={`px-6 py-3 bg-gray-500 text-white rounded-md font-bold border-b-4 border-gray-700 text-lg
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-600 transform hover:-translate-y-0.5 active:translate-y-0 active:border-b-2'}`}
              >
                Skip
              </button>
            </div>
            
            <p className="text-white text-xs mt-4">
              Press Enter to submit or Escape to skip
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default HighScoreForm; 