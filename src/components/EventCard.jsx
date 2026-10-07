import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Trophy, ArrowRight, ExternalLink } from 'lucide-react';

export const EventCard = ({ event, onViewDetails }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [event?.image, event?.id]);

  // Fallback pattern if image fails to load
  const fallbackBg = 'bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900';

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-300 transition-all duration-300 flex flex-col h-full group">

      {/* Image Container */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {!imgError ? (
          <img
            src={event.image}
            alt={event.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${fallbackBg} p-6 text-white text-center`}>
            <div>
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-1">{event.category}</p>
              <h4 className="font-bold text-lg">{event.title}</h4>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

        {/* Category Badge Top Left */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-blue-700 backdrop-blur-md shadow-xs border border-white/40">
            {event.category}
          </span>
          {event.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-yellow-400 text-slate-950 shadow-xs">
              ★ Featured
            </span>
          )}
        </div>

        {/* Status Badge Top Right */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${event.status === 'Upcoming'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-200 backdrop-blur-md'
              }`}
          >
            {event.status}
          </span>
        </div>

        {/* Date on bottom left overlay */}
        <div className="absolute bottom-3 left-4 text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow-md">
          <Calendar className="w-3.5 h-3.5 text-yellow-400" />
          <span>{event.date}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Participants Info Bar */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mb-3">
            <span className="flex items-center gap-1 truncate max-w-[150px]">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{event.location}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.participants}</span>
            </span>
          </div>

          {/* Event Title */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
            {event.title}
          </h3>

          {/* Event Description */}
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {event.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {event.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            {event.prizePool && (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60 text-[11px]">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                {event.prizePool}
              </span>
            )}
          </div>

          <button
            onClick={() => onViewDetails(event)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 group-hover:translate-x-0.5 transition-all cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50"
          >
            <span>View Event</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>

      </div>

    </div>
  );
};
