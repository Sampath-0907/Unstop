import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Mail,
  Users,
  Trophy,
  Zap,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';
import { LinkedInIcon, WhatsAppIcon, InstagramIcon } from './Icons';

// ============================================================================
// 📩 DESTINATION EMAIL: Change this to your desired committee recipient email
// ============================================================================
const COMMITTEE_EMAIL = 'igniters.viit@gmail.com';

const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/unstop-igniters-club-viit/posts/?feedView=all',
  instagram: 'https://www.instagram.com/unstop_viit?stkn=NjA1NHN5dHN5ZXJl',
  whatsapp: 'https://chat.whatsapp.com/Drmo5Y7qSZ5K592uM26bxu?s=sh&p=a&mlu=4&ilr=4',
};

export const CTA = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = (e) => {
    e?.preventDefault();
    const el = document.getElementById('contact-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const nameInput = document.getElementById('contact-name');
      if (nameInput) nameInput.focus();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);

    // 1. Prepare email subject and body
    const subject = encodeURIComponent(`Query from ${formData.name} - Unstop Igniters VIIT`);
    const body = encodeURIComponent(
      `Sender Name: ${formData.name}\n` +
      `Sender Email: ${formData.email}\n\n` +
      `Message / Query:\n${formData.message}\n`
    );

    // 2. Open default mail client (Gmail, Outlook, etc.) addressed to COMMITTEE_EMAIL
    window.location.href = `mailto:${COMMITTEE_EMAIL}?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <section id="contact" className="py-20 sm:py-28 bg-slate-50/60 relative">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">

        {/* Main Banner Container */}
        <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-blue-600/30 overflow-hidden mb-16">

          {/* Abstract Geometric & Glow Shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          {/* Decorative Grid Lines */}
          <div className="absolute inset-0 subtle-grid opacity-15 pointer-events-none" />

          {/* Floating Decorative Yellow Stars */}
          <span className="absolute top-10 right-16 text-yellow-300 text-3xl font-black animate-pulse select-none hidden md:block">
            ★
          </span>
          <span className="absolute bottom-12 left-1/3 text-yellow-400 text-2xl font-black opacity-80 select-none hidden md:block">
            ✦
          </span>

          <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">

            {/* Top Pill */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs font-extrabold uppercase tracking-wider mb-6 shadow-xs"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>UNSTOP IGNITERS VIIT • CODE • COMMUNITY</span>
            </motion.div>

            {/* Headline */}
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Building the future of tech, <span className="text-yellow-300 underline decoration-yellow-400/60 decoration-wavy decoration-2">together.</span>
            </h2>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-blue-100 leading-relaxed mb-10 max-w-2xl font-normal">
              Stay updated with our campus hackathons, technical workshops, and competitive coding arenas at VIIT throughout the semester.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-8">
              <button
                id="cta-explore-events-btn"
                onClick={() => scrollTo('events')}
                className="w-full sm:w-auto px-9 py-4.5 rounded-2xl bg-yellow-400 text-slate-950 font-extrabold text-base shadow-xl shadow-yellow-500/25 hover:bg-yellow-300 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Explore Events</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </button>

              <button
                onClick={scrollToContact}
                className="w-full sm:w-auto px-8 py-4.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-md border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-5 h-5 text-yellow-300" />
                <span>Contact Committee</span>
              </button>
            </div>

            {/* Social Connect Options */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full mb-10">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-100/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Connect With Us:</span>
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-[#0A66C2] text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-900/30"
                  aria-label="Connect on LinkedIn"
                >
                  <LinkedInIcon className="w-4 h-4 text-white" />
                  <span>LinkedIn</span>
                </a>

                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-gradient-to-r hover:from-purple-600 hover:via-pink-600 hover:to-amber-500 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-900/30"
                  aria-label="Follow on Instagram"
                >
                  <InstagramIcon className="w-4 h-4 text-white" />
                  <span>Instagram</span>
                </a>

                <a
                  href={SOCIAL_LINKS.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-[#25D366] text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/25 hover:border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/30"
                  aria-label="Join WhatsApp Community"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/20 text-xs text-blue-100 w-full">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-300" />
                <span>Premier Technical Chapter @ VIIT</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-yellow-300" />
                <span>10 Dedicated Core Leads</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Hands-on Event Execution</span>
              </div>
            </div>

          </div>

        </div>

        {/* Send a Message Form Card */}
        <motion.div
          id="contact-form"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-blue-900/5 scroll-mt-24"
        >
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-display">
              Send a message
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Have a question, collaboration idea, or want to connect with our committee? Fill out the form below.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="contact-form-inputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* 2-Column Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-bold text-slate-700 mb-2"
                    >
                      Your Name <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Unstop"
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-bold text-slate-700 mb-2"
                    >
                      Email Address <span className="text-blue-600">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="unstopingniters@ex.com"
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-bold text-slate-700 mb-2"
                  >
                    How can we help? <span className="text-blue-600">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your query..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="contact-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-6">
                  Thank you, <span className="font-semibold text-slate-900">{formData.name}</span>. Our core committee at VIIT has received your query and will get back to <span className="font-semibold text-slate-900">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  Send another message
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

      </div>
    </section>
  );
};
