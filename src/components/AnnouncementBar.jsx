import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, Bell } from 'lucide-react';
import { useData } from '../context/DataContext';

export const AnnouncementBar = () => {
  const { banners } = useData();
  const [isDismissed, setIsDismissed] = useState(false);

  const announcement = banners?.announcement;

  if (!announcement || !announcement.enabled || !announcement.text || isDismissed) {
    return null;
  }

  const handleLinkClick = (e) => {
    if (announcement.link && announcement.link.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(announcement.link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-2 px-3 sm:px-6 shadow-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 flex-wrap text-center">
            {announcement.badge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-xs animate-pulse">
                <Sparkles className="w-3 h-3" />
                <span>{announcement.badge}</span>
              </span>
            )}

            <p className="font-medium text-slate-100 text-xs sm:text-[13px] leading-snug">
              {announcement.text}
            </p>

            {announcement.link && (
              <a
                href={announcement.link}
                onClick={handleLinkClick}
                className="inline-flex items-center gap-1 font-bold text-yellow-300 hover:text-white underline underline-offset-2 transition-colors ml-1"
              >
                <span>{announcement.linkText || 'Learn More'}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
            title="Dismiss Announcement"
            aria-label="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
