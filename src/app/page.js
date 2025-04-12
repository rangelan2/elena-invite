'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { colors, fonts } from '../theme';
import Image from 'next/image';

const storyMoments = [
  {
    icon: "📚",
    title: "Ohio State: The Friend Zone",
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
    content: `Graduation. She moved East. He stayed Midwest.

For years, they kept the line warm.

The kind of calls that stretch past midnight and make you feel more like yourself when they're done.

Long-distance Doordash orders from Buckeye Donuts.

The spark dimmed.
But it never went out.

Even when the story hit pause -
It was still playing.`
  },
  {
    icon: "🥂",
    title: "New Traditions",
    content: "The night before Stanford decisions were announced (the first time),\nAnthony took Elena to dinner.\n\nNot to toast the outcome—\nBut the effort.\n\nThat night, two traditions were born:\nCelebrate early.\nCelebrate often."
  },
  {
    icon: "🎓",
    title: "Back to School",
    content: "They move cross-country to California. Not the first time they've been students together - but this time, as a couple.\n\nThey built community.\nDinner parties with way too many people crammed around a table.\nWalks through eucalyptus-lined paths.\nTwo-person traditions in a brand-new place.\n\nTheir love aged there.\nReal. Earned. Rooted."
  },
  {
    icon: "💍",
    title: "The Proposal",
    content: "A surprise trip for her birthday.\nDAOU Mountain. Anthony asks. A quiet yes.\n\nA yes built on a decade of maybes and what-ifs and timing and choices and one hell of a solid friendship.\n\nJust us.\nJust right."
  },
  {
    icon: "🎉",
    title: "The Celebration Begins",
    content: "Join us for a night to remember.\nIt's every chapter, all in one room."
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
        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-10 max-w-[90%] sm:max-w-xl w-full shadow-2xl text-center mx-auto relative"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#4A5D4F] hover:text-[#4A5D4F]/70 transition"
          aria-label="Close story modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <h2 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#4A5D4F] mb-2 sm:mb-3 md:mb-4">{story.title}</h2>
        <p className="text-sm sm:text-base md:text-lg text-[#4A5D4F]/80 mb-4 sm:mb-5 md:mb-6 whitespace-pre-line leading-relaxed">{story.content}</p>
        <button 
          onClick={onClose} 
          className="text-xs sm:text-sm text-[#4A5D4F] underline hover:text-[#4A5D4F]/70 transition py-1"
          aria-label="Close story modal"
        >
          Back to Our Story
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Page() {
  const [activeStory, setActiveStory] = useState(null);
  const [visited, setVisited] = useState(new Set());
  const [hasUnlockedGame, setHasUnlockedGame] = useState(false);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [popupDismissed, setPopupDismissed] = useState(false);

  useEffect(() => {
    if (hasUnlockedGame && !showUnlockPopup && !popupDismissed) {
      const timer = setTimeout(() => {
        setShowUnlockPopup(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [hasUnlockedGame, showUnlockPopup, popupDismissed]);

  const handleDismissPopup = () => {
    setShowUnlockPopup(false);
    setPopupDismissed(true);
  };

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
    <main className="bg-white text-[#2e2c2f] font-serif scroll-smooth">
      <header className="absolute top-4 sm:top-6 left-0 w-full flex justify-between items-center z-50 px-4 sm:px-8">
        <div className="flex-1">
          {/* Empty div for centering */}
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-serif text-white max-w-lg sm:max-w-xl md:max-w-2xl mx-auto text-center font-medium tracking-wide bg-black/20 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm">
          We're gathering our dearest friends for the first of many celebrations. And it wouldn't be the same without you.
        </h1>
        <div className="flex-1">
          {/* Empty div for centering */}
        </div>
      </header>
      <section className="relative min-h-screen px-4 sm:px-6 py-32 sm:py-40 text-center flex flex-col justify-center items-center space-y-8 sm:space-y-10 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/winery-hero.jpg"
            alt="Scenic winery view with vineyards and mountains in the background"
            fill
            priority
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRseHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
            className="blur-[4px] object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40"></div>
        </div>
        <div className="relative z-10 bg-black/20 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl mx-4 mt-16 sm:mt-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-bold leading-tight mb-8 sm:mb-10">
            Join Elena & Anthony to celebrate their engagement!
          </h1>
          <div className="text-base sm:text-lg text-white/90 space-y-4">
            <p><strong>Saturday, June 14, 2025</strong></p>
            <p>🕖 7:00 – 11:00 PM</p>
            <p>📍 Saturn Road · 276 Court St, Brooklyn, NY</p>
            <p>🥂 Music, drinks, light noms, backyard dancing, and stories old and new</p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => scrollToSection('our-story')}
              className="w-full sm:w-auto inline-block bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-lg transition text-center"
              aria-label="View our story"
            >
              Let's Start at the Beginning
            </button>
            <button
              onClick={() => scrollToSection('rsvp')}
              className="w-full sm:w-auto inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold px-6 py-3 rounded-lg transition text-center"
              aria-label="Go to RSVP section"
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
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#4A5D4F] mb-3 sm:mb-4 tracking-tight">
          Discover Our Story
        </h2>
        <p className="text-center text-base sm:text-lg text-[#4A5D4F]/80 mb-12 sm:mb-16 max-w-2xl mx-auto px-2 sm:px-4">
          Before there was a proposal, a wedding, or even a kiss... there was trivia night.
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
                onClick={() => {
                  setVisited(prev => {
                    const updated = new Set(prev);
                    updated.add(story.title);
                    if (updated.size === storyMoments.length) {
                      setHasUnlockedGame(true);
                    }
                    return updated;
                  });
                  setActiveStory(story);
                }}
                className="w-full flex items-start sm:items-center space-x-3 sm:space-x-4 text-left"
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl sm:text-3xl bg-white rounded-full p-2 shadow-sm flex-shrink-0 relative">
                  {story.icon}
                  {visited.has(story.title) && (
                    <div className="absolute -top-1 -right-1 bg-[#729b79] text-white rounded-full p-0.5 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`text-lg sm:text-xl font-serif font-bold ${visited.has(story.title) ? 'text-[#729b79]' : 'text-[#4A5D4F]'} mb-1 sm:mb-0`}>
                    {story.title}
                  </h3>
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

        {showUnlockPopup && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleDismissPopup}
          >
            <div 
              className="bg-white rounded-3xl p-10 max-w-lg text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleDismissPopup}
                className="absolute top-4 right-4 text-[#4A5D4F] hover:text-[#4A5D4F]/70 transition"
                aria-label="Close popup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-[#475b63] mb-4">🎉 You've Unlocked a Secret!</h2>
              <p className="text-[#2e2c2f] mb-6">
                By exploring every chapter of our story, you've discovered a mini-game inspired by our favorite memories.
              </p>
              <a
                href="/play"
                className="inline-block bg-[#729b79] text-white px-6 py-3 rounded-full hover:bg-[#5c7f66] transition"
              >
                Click to Play
              </a>
            </div>
          </motion.div>
        )}
        
        <p className="text-center text-base sm:text-lg text-[#4A5D4F]/80 mt-16 max-w-2xl mx-auto px-2 sm:px-4">
          This isn't just a party—it's our way of saying thank you. You've shaped who we are and have always shown up for us. Let's raise a glass to the road behind us and the one ahead.
        </p>
      </section>

      <section id="rsvp" className="py-16 sm:py-20 px-4 sm:px-6 bg-[#F3EFE9] text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 sm:mb-6 text-[#4A5D4F]">Count Me In</h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-[#4A5D4F]/80 max-w-xl mx-auto">
          Leave us a note, a memory, or a wish—your words will help shape this gathering.
        </p>
        <p className="mb-6 sm:mb-8 text-base sm:text-lg text-[#4A5D4F]/80 max-w-xl mx-auto">
          Kindly reply by June 1, 2024.
        </p>
        <div className="w-full max-w-xl mx-auto space-y-4 mb-8">
          <p className="text-base sm:text-lg text-[#4A5D4F]/80">
            <span className="font-semibold">🥂</span> An evening to celebrate our engagement full of joy, stories, and the people we love most.
          </p>
          <p className="text-base sm:text-lg text-[#4A5D4F]/80">
            <span className="font-semibold">📍</span> Saturn Road (276 Court St, Brooklyn, NY 11231)
          </p>
          <p className="text-base sm:text-lg text-[#4A5D4F]/80">
            <span className="font-semibold">🕖</span> Saturday, June 14, 2025 from 7:00 PM – 11:00 PM
          </p>
        </div>
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
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4 sm:mb-6 text-[#4A5D4F]">Our Registry</h2>
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
