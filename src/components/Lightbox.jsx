import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar, Tag, Images } from 'lucide-react';

export const Lightbox = ({ item, onClose, onPrev, onNext }) => {
  const [photoIdx, setPhotoIdx] = useState(0);

  // Normalize images array for the active gallery event
  const photos = Array.isArray(item?.images) && item.images.length > 0
    ? item.images
    : (item?.image ? [item.image] : []);

  // Reset photo index when item changes
  useEffect(() => {
    setPhotoIdx(0);
  }, [item?.id]);

  const handlePrevPhoto = (e) => {
    e?.stopPropagation();
    if (photos.length > 1) {
      setPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    } else if (onPrev) {
      onPrev();
    }
  };

  const handleNextPhoto = (e) => {
    e?.stopPropagation();
    if (photos.length > 1) {
      setPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    } else if (onNext) {
      onNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, photos.length]);

  if (!item) return null;

  const currentImage = photos[photoIdx] || item.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10">
      {/* Dark Blur Backdrop */}
      <motion.div
        className="fixed inset-0 bg-slate-950/92 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Lightbox Container */}
      <motion.div
        className="relative max-w-5xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 z-10 flex flex-col max-h-[92vh]"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.2 }}
      >
        {/* Top Header Actions */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-white/10 text-white bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
              {item.category}
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {item.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Preview Stage */}
        <div className="relative flex-1 flex items-center justify-center bg-black/60 overflow-hidden min-h-[300px] sm:min-h-[440px] max-h-[66vh] p-3 sm:p-4">
          <AnimatePresence mode="wait">
            <motion.img
              key={`${item.id}-${photoIdx}`}
              src={currentImage}
              alt={item.title}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="max-h-[62vh] max-w-full object-contain mx-auto rounded-xl shadow-2xl select-none"
            />
          </AnimatePresence>

          {/* Navigation Controls (when multiple photos exist) */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/10 shadow-lg"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNextPhoto}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-blue-600 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/10 shadow-lg"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Caption & Description Footer with Filmstrip */}
        <div className="p-4 px-6 bg-slate-900 border-t border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="max-w-xl">
            <h4 className="font-bold text-base sm:text-lg text-white mb-0.5">
              {item.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2">
              {item.description}
            </p>
          </div>

          {/* Photos Thumbnail Strip */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 shrink-0">
              {photos.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setPhotoIdx(idx)}
                  className={`relative w-12 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    photoIdx === idx 
                      ? 'border-yellow-400 scale-105 shadow-md shadow-yellow-400/20' 
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                >
                  <img 
                    src={url} 
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
  );
};
