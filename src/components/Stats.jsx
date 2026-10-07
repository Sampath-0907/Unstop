import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { statsData } from '../data/stats';
import { Users, CalendarDays, Award, Flame } from 'lucide-react';

const iconMap = {
  members: Users,
  events: CalendarDays,
  workshops: Award,
  competitions: Flame,
};

const Counter = ({ value, duration = 1.5, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const end = parseInt(value, 10);
    if (start === end) return;

    const totalMilSec = duration * 1000;
    const incrementTime = 30;
    const step = Math.ceil(end / (totalMilSec / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span>{count}</span>;
};

export const Stats = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section 
      ref={ref}
      className="relative z-10 -mt-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12"
    >
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/90 p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {statsData.map((stat, idx) => {
            const Icon = iconMap[stat.id] || Users;
            return (
              <motion.div
                key={stat.id}
                className={`flex flex-col items-start ${idx !== 0 ? 'md:pl-6 lg:pl-10 pt-6 md:pt-0' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-yellow-400/20 px-2.5 py-0.5 rounded-full border border-yellow-400/40">
                    {stat.highlight}
                  </span>
                </div>

                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="font-display text-4xl lg:text-5xl font-extrabold text-blue-600 tracking-tight">
                    <Counter value={stat.value} inView={isInView} />
                  </span>
                  <span className="font-display text-3xl lg:text-4xl font-extrabold text-yellow-500">
                    {stat.suffix}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 mb-1">
                  {stat.label}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {stat.subtext}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
