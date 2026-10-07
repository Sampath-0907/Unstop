import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Code2, 
  Trophy, 
  Users, 
  Calendar, 
  ChevronRight,
  Terminal,
  Zap,
  BookOpen
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const Hero = () => {
  const { banners } = useData();
  const heroBannerSrc = banners?.heroBanner || '/hero-banner.jpg';

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-[90vh] pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-white subtle-grid"
    >
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-400/15 to-yellow-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-10 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Text & Actions */}
          <motion.div 
            className="lg:col-span-7 flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Category Tag / Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 shadow-xs mb-5 sm:mb-6 max-w-full">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-900 uppercase truncate">
                UNSTOP IGNITERS VIIT • INNOVATION • COMMUNITY
              </span>
              <span className="text-yellow-500 font-bold shrink-0">★</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-5 sm:mb-6">
              BUILD.{' '}
              <span className="relative text-blue-600 inline-block">
                LEARN.
                <svg
                  className="absolute -bottom-1.5 sm:-bottom-2 left-0 w-full text-yellow-400 -z-10"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C50 3 150 3 197 9"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              COMPETE.
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mb-6 sm:mb-8 font-normal">
              A student-driven community at VIIT where ideas become innovation. We bridge the gap between academic theory and real-world tech mastery through hackathons, hands-on workshops, competitive coding, and peer mentorship.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
              <button
                id="hero-explore-events-btn"
                onClick={() => scrollTo('events')}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-blue-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/25 hover:bg-blue-700 hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                id="hero-view-activities-btn"
                onClick={() => scrollTo('activities')}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold text-sm sm:text-base hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>What We Do</span>
              </button>
            </div>

            {/* Quick Metrics & Trust Badges */}
            <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-3 sm:gap-6 lg:gap-10 w-full max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-600 tracking-tight">500+</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Active Members</p>
              </div>
              <div className="border-l border-slate-200 pl-3 sm:pl-6 lg:pl-10">
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">25+</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Events Hosted</p>
              </div>
              <div className="border-l border-slate-200 pl-3 sm:pl-6 lg:pl-10">
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-blue-600 tracking-tight">100%</p>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5">Student Run</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Official Banner Presentation */}
          <motion.div 
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {/* Outer Container with Glow & Frame */}
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Decorative background glow behind poster */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600/25 via-amber-400/20 to-blue-500/25 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 -z-10" />

              {/* Main Image Frame Container */}
              <div className="relative bg-white rounded-3xl p-2 sm:p-2.5 shadow-2xl shadow-blue-900/15 border border-slate-200/90 overflow-hidden group">
                
                {/* Image Wrapper with rounded corners and hover effect */}
                <div className="relative overflow-hidden rounded-2xl bg-slate-950 aspect-[16/9] sm:aspect-[16/9.5]">
                  <img 
                    src={heroBannerSrc} 
                    alt="Unstop Igniters Club VIIT Official Announcement" 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                    }}
                    className="w-full h-full object-cover sm:object-contain object-center transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Subtle shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Bottom Caption Pill */}
                <div className="flex items-center justify-between px-3 py-2 mt-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Official Campus Launch</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    #IgniteTheFuture
                  </span>
                </div>
              </div>

              {/* Floating Glassmorphism Badge 1: Top Right */}
              <motion.div 
                className="absolute -top-5 -right-4 sm:-right-6 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/90 z-10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">#1 Tech Club</p>
                  <p className="text-[10px] text-slate-500 font-medium">VIIT Campus Chapter</p>
                </div>
              </motion.div>

              {/* Floating Glassmorphism Badge 2: Bottom Left */}
              <motion.div 
                className="absolute -bottom-5 -left-4 sm:-left-6 hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/90 z-10"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">VIIT Community</p>
                  <p className="text-[10px] text-slate-500 font-medium">Ideate • Innovate • Ignite</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
