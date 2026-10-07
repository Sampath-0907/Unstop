import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Code2,
  Trophy,
  Compass,
  Share2,
  CheckCircle2,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const About = () => {
  const { banners } = useData();
  const aboutBannerSrc = banners?.aboutBanner || '/Events/team.png';

  const pillars = [
    {
      title: 'Peer-to-Peer Learning',
      desc: 'Collaborative code sessions and project teardowns where seniors mentor juniors.',
    },
    {
      title: 'Competitive Edge',
      desc: 'Regular campus hackathons and problem-solving contests to foster excellence.',
    },
    {
      title: 'Industry Alignment',
      desc: 'Real tech stacks, guest lectures, and portfolio reviews matching modern industry demands.',
    },
    {
      title: 'Open Collaboration',
      desc: 'Cross-discipline pods blending coding, design, hardware, and product management.',
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-white relative overflow-hidden">
      {/* Decorative background grid and accent */}
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl -z-10 pointer-events-none" />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Mission & Narrative */}
          <motion.div
            className="lg:col-span-6 flex flex-col items-start"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>ABOUT UNSTOP IGNITERS VIIT</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              More than a club.{' '}
              <span className="text-blue-600">A community of builders.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 font-normal">
              The <strong className="text-slate-900 font-bold">Unstop Igniters VIIT</strong> is the premier student-driven technical collective on campus. We unite engineers, designers, creators, and algorithmic problem solvers who refuse to be passive consumers of technology.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 font-normal">
              Whether you are writing your first line of code, designing high-fidelity Figma prototypes, or deploying multi-agent LLM systems, Unstop Igniters VIIT provides the ecosystem, mentorship, and opportunities to turn your curiosity into high-impact products.
            </p>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              {pillars.map((pillar, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{pillar.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-7">{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Activity Tags */}
            <div className="flex flex-wrap gap-2">
              {[
                '⚡ Technical Workshops',
                '🏆 Hackathons',
                '🎯 Coding Arenas',
                '💡 Project Incubation',
                '🤝 Peer Mentorship',
                '🚀 Industry Panels',
              ].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Visual Composition with Editorial Collage */}
          <motion.div
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">

              {/* Primary Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white shadow-blue-900/15">
                <img
                  src={aboutBannerSrc}
                  alt="Unstop Igniters VIIT Team Collaboration"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
                  }}
                  className="w-full h-[420px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Overlay Text Inside Image */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-400 text-slate-950 text-xs font-extrabold uppercase mb-2">
                    <span>Our Philosophy</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">
                    "Learn together,Build together,Grow together."
                  </h3>
                  <p className="text-xs text-slate-200">
                    Active community sessions.
                  </p>
                </div>
              </div>

              {/* Floating Stat Card Overlapping Top Right */}
              <motion.div
                className="absolute -top-6 -right-4 sm:-right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-200/90 max-w-[210px]"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    98%
                  </span>
                  <p className="text-xs font-bold text-slate-800">Placement & Intern Track</p>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Club alumni working at top tech leaders and high-growth startups.
                </p>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
