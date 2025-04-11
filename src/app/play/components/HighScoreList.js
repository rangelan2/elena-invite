'use client';

import { useState, useEffect } from 'react';
import { getHighScores, getPersonalHighScores } from './ScoreService';

const HighScoreList = ({ show, onClose }) => {
  const [highScores, setHighScores] = useState([]);
  const [personalScores, setPersonalScores] = useState([]);
  const [activeTab, setActiveTab] = useState('global');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (show) {
      fetchHighScores();
    }
  }, [show, activeTab]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && show) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [show, onClose]);

  const fetchHighScores = async () => {
    setLoading(true);
    try {
      // Fetch global high scores
      if (activeTab === 'global') {
        const scores = await getHighScores(10);
        setHighScores(scores);
      } 
      // Fetch personal scores
      else if (activeTab === 'personal') {
        const scores = await getPersonalHighScores(10);
        setPersonalScores(scores);
      }
    } catch (error) {
      console.error("Error fetching high scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#4EC0CA] border-4 border-black rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between bg-[#DEA430] border-b-4 border-black p-3">
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold px-3"
            aria-label="Close leaderboard"
          >
            X
          </button>
        </div>
        
        <div className="flex border-b-4 border-black">
          <button 
            className={`flex-1 py-2 font-bold ${activeTab === 'global' ? 'bg-yellow-400 text-black' : 'bg-[#4EC0CA] text-white'}`}
            onClick={() => setActiveTab('global')}
          >
            Global
          </button>
          <button 
            className={`flex-1 py-2 font-bold ${activeTab === 'personal' ? 'bg-yellow-400 text-black' : 'bg-[#4EC0CA] text-white'}`}
            onClick={() => setActiveTab('personal')}
          >
            My Scores
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="py-2 px-3 text-left">Rank</th>
                  <th className="py-2 px-3 text-left">Name</th>
                  <th className="py-2 px-3 text-right">Score</th>
                  <th className="py-2 px-3 text-right hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'global' ? highScores : personalScores).length > 0 ? (
                  (activeTab === 'global' ? highScores : personalScores).map((score, index) => (
                    <tr 
                      key={score.id} 
                      className={index % 2 === 0 ? 'bg-[#A8DADC]/20' : 'bg-white/10'}
                    >
                      <td className="py-2 px-3">{index + 1}</td>
                      <td className="py-2 px-3 truncate max-w-[120px]">
                        {score.name || 'Anonymous'}
                      </td>
                      <td className="py-2 px-3 text-right">{score.score}</td>
                      <td className="py-2 px-3 text-right hidden sm:table-cell">
                        {formatTimestamp(score.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 px-3 text-center">
                      {activeTab === 'global' ? 'No scores available yet.' : 'You haven\'t set any scores yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-3 bg-[#DEA430] border-t-4 border-black text-center text-xs text-white">
          Can you make it to the top of the leaderboard?
        </div>
      </div>
    </div>
  );
};

export default HighScoreList; 