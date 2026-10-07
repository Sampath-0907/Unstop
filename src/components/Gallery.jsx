import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Maximize2, Camera, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Lightbox } from './Lightbox';

export const Gallery = () => {
  const { gallery } = useData();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Hackathons', 'Workshops', 'Competitions', 'Team', 'Seminars'];

  const filteredItems = (gallery || []).filter(item => {
    if (filter === 'All') return true;
    return item.category === filter;
  });

  const handlePrev = () => {
    if (selectedIdx === null) return;
    const currentList = filteredItems;
    const newIdx = selectedIdx === 0 ? currentList.length - 1 : selectedIdx - 1;
    setSelectedIdx(newIdx);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    const currentList = filteredItems;
    const newIdx = selectedIdx === currentList.length - 1 ? 0 : selectedIdx + 1;
    setSelectedIdx(newIdx);
  };

  return (
    <section id="gallery" className="pt-4 sm:pt-6 pb-20 sm:pb-28 bg-white relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>COMMUNITY HIGHLIGHTS</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Moments From Our Community
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Snapshots of late-night hackathons, sprint sessions, hardware showcases, and trophy ceremonies.
          </p>
        </div>

        {/* Gallery Filter Categories */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 mb-10 gap-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Uniform Gallery: Center-aligned expanding sideways and downwards */}
        <motion.div 
          layout
          className="flex flex-wrap justify-center gap-6 w-full"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.25rem)] max-w-[380px] shrink-0"
              >
                <div
                  className="group relative rounded-3xl overflow-hidden cursor-pointer bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 aspect-4/3 w-full"
                  onClick={() => setSelectedIdx(index)}
                >
                  {/* Background Image (fills the identical aspect-4/3 container) */}
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Dark Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Top Badge */}
                  <div className="absolute top-3.5 left-3.5 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-900 backdrop-blur-xs shadow-xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Hover Expand Icon */}
                  <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 backdrop-blur-xs">
                    <Maximize2 className="w-4 h-4" />
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-medium mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-blue-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {item.description}
                    </p>
                  </div>

                  {/* Yellow Accent Corner */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 [clip-path:polygon(100%_0,0_100%,100%_100%)]" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIdx !== null && filteredItems[selectedIdx] && (
          <Lightbox
            item={filteredItems[selectedIdx]}
            onClose={() => setSelectedIdx(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
