'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { colors, fonts } from '../theme';
import Image from 'next/image';

const storyMoments = [
  {
    icon: "🎓",
    title: "The First Almost-Meeting",
    content: "Accepted Students Day, 2014.\nThey sat at the same table.\n\nElena remembered his name, his face, and that he was cute.\nShe even told him she was from Jersey.\n\nAnthony?\nNothing. Total wipe.\n\nMonths later—same dorm, same floor.\nHe says, \"Nice to meet you.\"\nShe smiles. She knew they had already met but didn't say a word."
  },
  {
    icon: "📚",
    title: "The Friend Years",
    content: "Same floor, same major, same hustle.\nDorm hangs, club meetings, building Pass Go.\n\nThey did everything together—classes, career fairs, late-night talks.\nElena called Anthony her intellectual soulmate.\n\nSweet.\nAlso: firmly friend-zoned.\n\nThey were inseparable.\nJust not a couple.\n\nYet."
  },
  {
    icon: "❓",
    title: "The Trivia Spark",
    content: "Senior year.\nWeekly trivia nights. Prize? A freshly brewed six-pack.\nThe problem? Elena hated beer. Still never missed a round.\n\nSomewhere between the questions and the banter,\nSomething shifted.\n\nThey stopped looking at the scoreboard.\nStarted noticing each other."
  },
  {
    icon: "✈️",
    title: "Donuts & Distance",
    content: "Graduation hit.\nShe moved East. He stayed Midwest.\n\nThere were calls from the Singapore Zoo.\nTrain rides to Philly.\nLate-night talks and mozzarella stick memories.\n\nThe spark dimmed.\nBut it never went out.\n\nEven when the story hit pause—\nIt was still playing."
  },
  {
    icon: "🥂",
    title: "The First Celebration",
    content: "The night before Stanford decisions dropped,\nAnthony took Elena to dinner.\n\nNot to toast the outcome—\nBut the effort.\n\nThat night, two traditions were born:\nCelebrate early.\nCelebrate often."
  },
  {
    icon: "💍",
    title: "The Proposal",
    content: "A surprise trip for her birthday.\nDAOU Mountain. A quiet yes.\n\nThen came the stillness—\nSheep in the pasture,\nWine on the patio,\nCarmel by the sea.\n\nJust us.\nJust right."
  },
  {
    icon: "🎉",
    title: "The People In the Story",
    content: "This isn't just a party.\nIt's every chapter, all in one room.\n\nThe memories, the milestones—sure.\nBut you—our people—\nYou're what makes the story matter."
  }
];

function StoryModal({ story, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 max-w-[90%] sm:max-w-xl w-full shadow-2xl text-center mx-auto"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-[fonts.heading] font-bold text-[#4A5D4F] mb-2 sm:mb-3 md:mb-4">{story.title}</h2>
        <p className="text-sm sm:text-base md:text-lg text-[#4A5D4F]/80 mb-4 sm:mb-5 md:mb-6 whitespace-pre-line leading-relaxed">{story.content}</p>
        <button 
          onClick={onClose} 
          className="text-xs sm:text-sm text-[#4A5D4F] underline hover:text-[#4A5D4F]/70 transition py-1"
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
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#4A5D4F] max-w-2xl text-center font-medium tracking-wide">
          An invitation to gather in celebration of<br className="hidden sm:block" />Elena & Anthony's engagement
        </h1>
        <div className="flex-1">
          {/* Empty div for centering */}
        </div>
      </header>
      <section className="relative min-h-screen px-4 sm:px-6 py-32 sm:py-40 text-center flex flex-col justify-center items-center space-y-6 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/hero-background.png')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-transparent h-1/3"></div>
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
        <div className="w-full max-w-xl mx-auto">
          <a
            href="https://forms.gle/v51WCerpvKfHaCZ69"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#729b79] hover:bg-[#5c7f66] text-white font-semibold px-8 py-4 rounded-lg transition text-lg"
          >
            RSVP Now
          </a>
        </div>
        <div className="my-16 flex items-center justify-center">
          <div className="w-24 h-px bg-[#4A5D4F]/20"></div>
          <div className="mx-4 text-[#4A5D4F]/40">❦</div>
          <div className="w-24 h-px bg-[#4A5D4F]/20"></div>
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
