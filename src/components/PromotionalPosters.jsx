import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, ExternalLink, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';
import { useData } from '../context/DataContext';

export const PromotionalPosters = () => {
  const { banners } = useData();
  const [selectedPoster, setSelectedPoster] = useState(null);

  const rawPosters = banners?.campaignPosters || [];
  const activePosters = rawPosters.filter((p) => p && p.isActive !== false && p.image);

  if (activePosters.length === 0) {
    return null;
  }

  const handleLinkClick = (e, link) => {
    if (link && link.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(link);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="pt-4 pb-12 sm:pb-16 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>SPECIAL ANNOUNCEMENTS & FLYERS</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Featured Posters & Campaigns
          </h2>

          <p className="text-sm sm:text-base text-slate-600">
            Latest flyers, official event announcements, and registration posters.
          </p>
        </div>

        {/* Posters Grid */}
        <div className={`grid gap-6 ${
          activePosters.length === 1 
            ? 'max-w-2xl mx-auto' 
            : activePosters.length === 2 
              ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {activePosters.map((poster, index) => (
            <motion.div
              key={poster.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-900/10 transition-all group flex flex-col justify-between"
            >
              {/* Poster Image Container */}
              <div 
                className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] cursor-pointer"
                onClick={() => setSelectedPoster(poster)}
              >
                <img
                  src={poster.image}
                  alt={poster.title || 'Campaign Poster'}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Badge */}
                {poster.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      {poster.tag}
                    </span>
                  </div>
                )}

                {/* Zoom Hint Icon */}
                <div className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                  <Maximize2 className="w-4 h-4" />
                </div>

                {/* Caption on image */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm sm:text-base leading-snug drop-shadow-md">
                    {poster.title}
                  </h3>
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="pt-3 px-1 flex flex-col justify-between gap-2">
                {poster.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {poster.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPoster(poster)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Full Poster</span>
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  {poster.link && (
                    <a
                      href={poster.link}
                      onClick={(e) => handleLinkClick(e, poster.link)}
                      target={poster.link.startsWith('http') ? '_blank' : '_self'}
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Join / Register</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* LIGHTBOX MODAL FOR FULL-RESOLUTION POSTER ZOOM */}
      <AnimatePresence>
        {selectedPoster && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPoster(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl max-h-[92vh] w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white z-10 my-auto"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  {selectedPoster.tag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-extrabold uppercase">
                      {selectedPoster.tag}
                    </span>
                  )}
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {selectedPoster.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedPoster(null)}
                  className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className="relative flex-1 overflow-auto bg-black flex items-center justify-center p-2 min-h-[300px] max-h-[70vh]">
                <img
                  src={selectedPoster.image}
                  alt={selectedPoster.title}
                  className="max-w-full max-h-[68vh] object-contain rounded-xl"
                />
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 border-t border-slate-800">
                <p className="text-xs text-slate-300">
                  {selectedPoster.description || selectedPoster.title}
                </p>

                {selectedPoster.link && (
                  <a
                    href={selectedPoster.link}
                    target={selectedPoster.link.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Visit Link / Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
