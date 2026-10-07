import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Cpu, 
  Trophy, 
  BookOpenCheck, 
  Palette, 
  Rocket, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { activitiesData } from '../data/activities';

const iconComponents = {
  Code2,
  Cpu,
  Trophy,
  BookOpenCheck,
  Palette,
  Rocket,
};

export const Activities = () => {
  return (
    <section id="activities" className="pt-8 sm:pt-10 pb-10 sm:pb-14 bg-slate-50/70 relative">
      {/* Decorative dots background */}
      <div className="absolute inset-0 subtle-dots pointer-events-none opacity-40" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>CORE DOMAINS & TRACKS</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            What We Do
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            We provide hands-on ecosystems across technical, algorithmic, and design disciplines to help you master modern industry skills.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {activitiesData.map((activity, index) => {
            const IconComponent = iconComponents[activity.iconName] || Code2;

            return (
              <motion.div
                key={activity.id}
                className="group relative bg-white rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-default"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -6 }}
              >
                {/* Yellow Accent Corner Glow on Hover */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400/0 group-hover:bg-yellow-400/20 rounded-full blur-xl transition-all duration-300 pointer-events-none" />
                <div className="absolute top-0 right-0 w-1.5 h-0 group-hover:h-full bg-yellow-400 transition-all duration-300" />

                <div>
                  {/* Top Bar: Icon + Category Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                      <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
                    </div>

                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                      {activity.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {activity.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {activity.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-1.5 items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {activity.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-slate-300 group-hover:text-yellow-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
