import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Mail } from 'lucide-react';
import { useData } from '../context/DataContext';
import { TeamCard } from './TeamCard';

export const Team = () => {
  const { team } = useData();

  return (
    <section id="team" className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-slate-50/70 relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>CORE LEADERSHIP TEAM</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Meet the Team
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            The people who turn ideas into experiences. A dedicated executive team driving technology tracks, hackathons, and student growth.
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6">
          {(team || []).map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <TeamCard member={member} />
            </motion.div>
          ))}
        </div>

        {/* Bottom Team Showcase Card */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">
                Collaborating Across VIIT Campus
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Our team organizes technical hackathons, guest lectures, and design sprints throughout the academic year.
              </p>
            </div>
          </div>

          <a
            href="#contact-form"
            className="whitespace-nowrap px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Committee</span>
          </a>
        </div>

      </div>
    </section>
  );
};
