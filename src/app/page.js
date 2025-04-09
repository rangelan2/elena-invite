'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { colors, fonts } from '../theme';
import Image from 'next/image';

const storyMoments = [
  {
    icon: "🎓",
    title: "The First Almost-Meeting",
    content: "We sat at the same table at Ohio State's Accepted Students Day. Elena noticed Anthony—but didn't say a word. With 12,000 other students around, she thought she'd never see him again."
  },
  {
    icon: "📚",
    title: "The Friend Years",
    content: "We became fast friends. Dorm room hangs, club meetings, founding Pass Go. Elena called Anthony her 'intellectual soulmate.' We did everything together—except date."
  },
  {
    icon: "❓",
    title: "The Trivia Spark",
    content: "Senior year. Weekly trivia nights. A shitty six-pack prize. Elena didn't like beer, but we never missed a round. Somewhere between the questions, we started seeing each other differently."
  },
  {
    icon: "✈️",
    title: "Donuts & Distance",
    content: "We parted after graduation. Calls from the Singapore Zoo. Weekend trips to Philly. Mozzarella stick memories. The spark didn't die—even when we thought the story had paused."
  },
  {
    icon: "🥂",
    title: "The First Celebration",
    content: "The night before Elena found out about Stanford, Anthony took her to dinner. Not to celebrate results—but the effort. That night, two traditions began: celebrate early, and celebrate often."
  },
  {
    icon: "💍",
    title: "The Proposal",
    content: "A surprise birthday trip. DAOU Mountain. A quiet 'yes.' Then days of stillness in Carmel—sheep in the pasture, wine on the patio, and our favorite town by the sea."
  },
  {
    icon: "🎉",
    title: "The Party That Gathers Us",
    content: "This isn't just a party. It's every chapter of our story in one room. And you—our people—are what makes the story matter."
  }
];

function StoryModal({ story, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-xl w-full shadow-2xl text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h2 className="text-xl sm:text-2xl font-[fonts.heading] font-bold text-[#4A5D4F] mb-3 sm:mb-4">{story.title}</h2>
        <p className="text-base sm:text-lg text-[#4A5D4F]/80 mb-5 sm:mb-6">{story.content}</p>
        <button 
          onClick={onClose} 
          className="text-sm text-[#4A5D4F] underline hover:text-[#4A5D4F]/70 transition py-1"
        >
          Back to the garden
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Page() {
  const [activeStory, setActiveStory] = useState(null);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <main className="bg-white text-[colors.text.primary] font-serif scroll-smooth">
      <header className="absolute top-4 sm:top-6 left-0 w-full flex justify-between items-center z-50 px-4 sm:px-8">
        <div className="flex-1">
          {/* Empty div for centering */}
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-serif text-[#4A5D4F] max-w-2xl text-center">
          An invitation to gather in celebration of Elena & Anthony's engagement
        </h1>
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => scrollToSection('registry')}
            className="text-base sm:text-lg text-[#4A5D4F] hover:text-[#4A5D4F]/70 transition"
          >
            Registry
          </button>
        </div>
      </header>
      <section className="relative min-h-screen px-4 sm:px-6 py-32 sm:py-40 text-center flex flex-col justify-center items-center space-y-6 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-90"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1522093537031-3ee69e6b1746?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')`
          }}
        />
        <div className="relative z-10 bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-md max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-[fonts.heading] text-[#4A5D4F] font-bold leading-tight mb-6">
            You're not just invited to the party,<br className="hidden sm:block" />you're part of our story.
          </h1>
          <div className="text-base sm:text-lg text-[#4A5D4F]/80 space-y-3">
            <p><strong>Saturday, June 14, 2025</strong></p>
            <p>7:00 – 11:00 PM</p>
            <p>Saturn Road · 276 Court St, Brooklyn, NY</p>
            <p>Light bites, music, and cold drinks for this elevated garden outdoor gathering.</p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => scrollToSection('our-story')}
              className="w-full sm:w-auto inline-block bg-[#729b79] hover:bg-[#5c7f66] text-white font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              Begin Our Journey
            </button>
            <button
              onClick={() => scrollToSection('rsvp')}
              className="w-full sm:w-auto inline-block bg-white border border-[#729b79] text-[#729b79] hover:bg-[#f9f9f9] font-semibold px-6 py-3 rounded-lg transition text-center"
            >
              RSVP
            </button>
          </div>
          <motion.div
            className="mt-8 flex justify-center"
            initial={{ y: 0 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-[#4A5D4F]/60"
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M7 13L12 18L17 13" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7L12 12L17 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      </section>
      <section id="our-story" className="relative min-h-screen px-4 sm:px-6 py-24 sm:py-32 bg-gradient-to-b from-[#F3EFE9] to-white overflow-hidden">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-[fonts.heading] font-bold text-[#4A5D4F] mb-3 sm:mb-4 tracking-tight">
          Discover Our Story
        </h2>
        <p className="text-center text-base sm:text-lg text-[#4A5D4F]/80 mb-12 sm:mb-16 max-w-2xl mx-auto px-2 sm:px-4">
          We've put together a digital garden of the moments that made us. Each step holds a memory and a question just for you.
        </p>
        <div className="flex flex-col items-center space-y-8 sm:space-y-10 max-w-2xl mx-auto px-2 sm:px-0">
          {storyMoments.map((story, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative w-full bg-white/60 backdrop-blur-md border border-[#4A5D4F]/10 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg hover:bg-white/80 transition"
            >
              <motion.button
                onClick={() => setActiveStory(story)}
                className="w-full flex items-start sm:items-center space-x-3 sm:space-x-4 text-left"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl sm:text-3xl bg-white rounded-full p-2 shadow-sm flex-shrink-0">{story.icon}</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-[fonts.heading] font-bold text-[#4A5D4F] mb-1 sm:mb-0">{story.title}</h3>
                  <p className="text-sm sm:text-base text-[#4A5D4F]/80">{story.content.slice(0, 100)}...</p>
                </div>
              </motion.button>

              {index < storyMoments.length - 1 && (
                <div className="absolute left-1/2 -bottom-4 sm:-bottom-5 transform -translate-x-1/2 w-0.5 h-8 sm:h-10 bg-gradient-to-b from-[#4A5D4F]/30 to-transparent"></div>
              )}
            </motion.div>
          ))}
        </div>
        {activeStory && (
          <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
        )}
      </section>

      <section id="rsvp" className="py-16 sm:py-20 px-4 sm:px-6 bg-[#F3EFE9] text-center">
        <h2 className="text-3xl sm:text-4xl font-[fonts.heading] font-bold mb-4 sm:mb-6 text-[#4A5D4F]">Count Me In</h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-[#4A5D4F]/80 max-w-xl mx-auto">
          Leave us a note, a memory, or a wish—your words will help shape this gathering.
        </p>
        <div className="w-full max-w-full overflow-hidden bg-white/80 rounded-xl shadow-sm">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSennP8rVv4z7UrbsG1O4u7ruSm4DYjweiQGeP83m_Wx2NtaRg/viewform?embedded=true"
            className="w-full"
            height="1984"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
          >
            Loading…
          </iframe>
        </div>
        <div className="mt-10" id="registry">
          <h2 className="text-3xl sm:text-4xl font-[fonts.heading] font-bold mb-4 sm:mb-6 text-[#4A5D4F]">Our Registry</h2>
          <p className="text-base sm:text-lg text-[#4A5D4F]/80 mb-2">
            Your presence at this gathering is the greatest gift we could ask for. But if you're still looking for something, you'll find our registry below.
          </p>
          <a
            href="https://registry.theknot.com/elena-arida-anthony-rangel-may-2026-ny/71770067"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[#729b79] hover:text-[#5c7f66] underline text-lg font-medium"
          >
            View Our Registry
          </a>
        </div>
      </section>

      <footer className="bg-white py-8 sm:py-10 text-center text-sm sm:text-base text-[#4A5D4F]/70 px-4">
        <p>
          We can't wait to share this chapter—and the next—with you. <br className="hidden sm:block" />Love, Elena & Anthony
        </p>
      </footer>
    </main>
  );
}
