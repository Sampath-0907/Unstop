import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  X, 
  CheckCircle2, 
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Images,
  Maximize2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { EventCard } from './EventCard';

const filterCategories = ['All', 'Upcoming', 'Workshops', 'Competitions', 'Hackathons', 'Seminars'];

// Helper to normalize images array from event object
const getEventImages = (event) => {
  if (!event) return [];
  if (Array.isArray(event.images) && event.images.length > 0) {
    return event.images.map((img) => 
      typeof img === 'string' ? { url: img, caption: event.title } : img
    );
  }
  if (event.image) {
    return [{ url: event.image, caption: event.title }];
  }
  return [];
};

export const Events = () => {
  const { events } = useData();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(null);

  const filteredEvents = events.filter((event) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Upcoming') return event.status === 'Upcoming';
    return (event.category || '').toLowerCase() === activeFilter.toLowerCase();
  });

  const eventImages = getEventImages(selectedEvent);

  // Keyboard navigation for zoom view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (zoomedImageIndex === null) return;
      if (e.key === 'Escape') {
        setZoomedImageIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setZoomedImageIndex((prev) => 
          prev === 0 ? eventImages.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setZoomedImageIndex((prev) => 
          prev === eventImages.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomedImageIndex, eventImages.length]);

  const handlePrevZoom = (e) => {
    e?.stopPropagation();
    setZoomedImageIndex((prev) => (prev === 0 ? eventImages.length - 1 : prev - 1));
  };

  const handleNextZoom = (e) => {
    e?.stopPropagation();
    setZoomedImageIndex((prev) => (prev === eventImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="events" className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>LEARN • COMPETE • WIN</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Our Events
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            From hands-on workshops to high-octane competitions and hackathons, we create opportunities to learn, build and compete.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-0 mb-12 gap-2 scrollbar-none">
          {filterCategories.map((category) => {
            const isActive = activeFilter === category;
            const count = events.filter(e => {
              if (category === 'All') return true;
              if (category === 'Upcoming') return e.status === 'Upcoming';
              return (e.category || '').toLowerCase() === category.toLowerCase();
            }).length;

            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`relative px-4 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-102'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-semibold ${
                    isActive ? 'bg-yellow-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Events Layout: Center-aligned expanding sideways and downwards */}
        <motion.div 
          layout
          className="flex flex-wrap justify-center gap-8 w-full"
        >
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(25%-1.5rem)] max-w-[400px] flex shrink-0"
              >
                <EventCard 
                  event={event} 
                  onViewDetails={(ev) => {
                    setSelectedEvent(ev);
                    setZoomedImageIndex(null);
                  }} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No events found under this category right now.</p>
          </div>
        )}

      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedEvent(null);
                setZoomedImageIndex(null);
              }}
            />

            {/* Modal Dialog */}
            <motion.div 
              className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Modal Cover Image Container with Zoom Trigger */}
              <div 
                className="relative h-60 sm:h-72 w-full bg-slate-900 overflow-hidden shrink-0 group cursor-pointer"
                onClick={() => setZoomedImageIndex(0)}
                title="Click to zoom cover photo"
              >
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                
                {/* Zoom Hint Icon on Hover */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 text-white backdrop-blur-md text-xs font-semibold border border-white/20 group-hover:bg-blue-600 transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Click photo to zoom</span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(null);
                    setZoomedImageIndex(null);
                  }}
                  className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors cursor-pointer border border-white/20 z-10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Bottom Overlay Title & Badges */}
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                      {selectedEvent.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-slate-950">
                      {selectedEvent.status}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
                    {selectedEvent.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                
                {/* Meta details strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                      <p className="text-xs font-semibold text-slate-800">{selectedEvent.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Time</p>
                      <p className="text-xs font-semibold text-slate-800">{selectedEvent.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">About the Event</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Multiple Event Images Gallery Section */}
                {eventImages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Images className="w-4 h-4 text-blue-600" />
                        <span>Event Photos & Moments</span>
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">Click any image to zoom</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {eventImages.map((imgObj, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setZoomedImageIndex(idx)}
                          className="group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-100 border border-slate-200 shadow-xs aspect-4/3 flex flex-col"
                        >
                          <img 
                            src={imgObj.url} 
                            alt={imgObj.caption || `${selectedEvent.title} photo ${idx + 1}`}
                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3" />
                          
                          {/* Hover Zoom Badge */}
                          <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-xs scale-75 group-hover:scale-100">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </div>

                          {/* Hover Caption */}
                          {imgObj.caption && (
                            <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-md">
                              {imgObj.caption}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights / Features */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Highlights:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Hands-on practical challenges</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Official Certificate of Participation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Peer networking & mentorship</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{selectedEvent.prizePool || 'Swag & Goodies'}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedEvent.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                      #{tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <p className="text-xs text-slate-500">
                  {selectedEvent.registrationOpen ? '🟢 Open for campus attendees.' : '⚪ Event edition concluded.'}
                </p>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedEvent(null);
                      setZoomedImageIndex(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enlarged Zoom Lightbox Modal */}
      <AnimatePresence>
        {selectedEvent && zoomedImageIndex !== null && eventImages[zoomedImageIndex] && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6 md:p-10">
            {/* Dark Blur Backdrop */}
            <motion.div
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImageIndex(null)}
            />

            {/* Lightbox Container */}
            <motion.div
              className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10 flex flex-col max-h-[92vh]"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {/* Top Header Bar */}
              <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 text-white bg-slate-900/90 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {selectedEvent.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomedImageIndex(null)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    aria-label="Close zoomed view"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main Zoomed Image Stage */}
              <div className="relative flex-1 flex items-center justify-center bg-black/60 overflow-hidden min-h-[320px] sm:min-h-[460px] max-h-[70vh] p-4">
                <motion.img
                  key={zoomedImageIndex}
                  src={eventImages[zoomedImageIndex].url}
                  alt={eventImages[zoomedImageIndex].caption || selectedEvent.title}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[65vh] max-w-full object-contain mx-auto rounded-xl shadow-2xl select-none"
                />

                {/* Left/Right Navigation Controls (if > 1 image) */}
                {eventImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevZoom}
                      className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-sm transition-all cursor-pointer border border-white/10 shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={handleNextZoom}
                      className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-sm transition-all cursor-pointer border border-white/10 shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Caption & Description Footer */}
              <div className="p-4 px-6 bg-slate-900 border-t border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    {selectedEvent.title}
                  </h4>
                  {eventImages[zoomedImageIndex].caption && (
                    <p className="text-xs text-slate-300 mt-0.5">
                      {eventImages[zoomedImageIndex].caption}
                    </p>
                  )}
                </div>

                {/* Thumbnail Strip (if multiple images) */}
                {eventImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                    {eventImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setZoomedImageIndex(idx)}
                        className={`relative w-12 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          zoomedImageIndex === idx 
                            ? 'border-yellow-400 scale-105 shadow-md shadow-yellow-400/20' 
                            : 'border-white/20 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img.url} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
