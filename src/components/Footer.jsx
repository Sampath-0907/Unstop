import React from 'react';
import {
  Mail,
  ArrowUp,
  Heart,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LinkedInIcon, WhatsAppIcon, InstagramIcon } from './Icons';

// 📱 WhatsApp Community Link (Paste your invite link here):
const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/Drmo5Y7qSZ5K592uM26bxu?s=sh&p=a&mlu=4&ilr=4';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { name: 'About the Club', href: '#about' },
    { name: 'What We Do', href: '#activities' },
    { name: 'Featured Events', href: '#events' },
    { name: 'Leadership Team', href: '#team' },
    { name: 'Community Gallery', href: '#gallery' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const tracks = [
    'Web Engineering',
    'AI & Machine Learning',
    'Competitive Programming',
    'UI/UX & Product Design',
    'Hackathon Sprints',
    'Open Source Initiatives',
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">

          {/* Col 1: Club Brand Info (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-700 shadow-md shadow-blue-500/20 relative">
                <img
                  src="/logo.png"
                  alt="Unstop Igniters VIIT Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Unstop <span className="text-blue-400">Igniters</span> <span className="text-amber-400">VIIT</span>
                </span>
                <span className="block text-[11px] text-slate-400 font-medium">
                  Official Campus Technical Community • VIIT Chapter
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
              A student-driven collective dedicated to learning cutting-edge technology, building production-ready projects, and dominating national hackathons at VIIT.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.linkedin.com/company/unstop-igniters-club-viit/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_COMMUNITY_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                aria-label="WhatsApp Community"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/unstop_viit?stkn=NjA1NHN5dHN5ZXJl"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=igniters.viit@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-yellow-500 hover:text-slate-950 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Tracks & Domains (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Tech Tracks
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {tracks.map((track, i) => (
                <span key={i} className="py-1">
                  • {track}
                </span>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <p className="text-xs text-slate-300 font-semibold mb-1">
                Have questions or sponsor inquiry?
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=igniters.viit@gmail.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-yellow-400 font-bold inline-flex items-center gap-1 transition-colors"
              >
                <span>igniters.viit@gmail.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back-to-Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Unstop Igniters VIIT. All rights reserved.</p>

          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> by student developers for student developers.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
