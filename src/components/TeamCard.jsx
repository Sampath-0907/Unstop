import React, { useState } from 'react';
import { LinkedInIcon } from './Icons';

export const TeamCard = ({ member }) => {
  const [imgError, setImgError] = useState(false);

  // Generate initials for avatar fallback
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2);

  return (
    <div className="group relative bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-blue-600/10 hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-between text-center overflow-hidden">
      
      {/* Top Subtle Yellow Accent Ribbon on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-yellow-400 group-hover:to-blue-600 transition-all duration-300" />

      <div className="flex flex-col items-center w-full">
        {/* Photo Container */}
        <div className="relative mb-4 w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
          {!imgError ? (
            <img
              src={member.image}
              alt={member.name}
              onError={() => setImgError(true)}
              style={{ objectPosition: member.objectPosition || 'center' }}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-700 to-indigo-900 flex flex-col items-center justify-center text-white p-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-display font-extrabold text-xl text-yellow-300 border border-white/30">
                {initials}
              </div>
            </div>
          )}

          {/* Social Hover Quick Bar over Image */}
          <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center hover:bg-yellow-400 hover:text-slate-950 transition-colors shadow-md"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Member Name */}
        <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight line-clamp-1 text-center">
          {member.name}
        </h3>

        {/* Member Position */}
        <p className="text-xs font-semibold text-blue-600 mb-2 line-clamp-1 text-center">
          {member.position}
        </p>
      </div>

      {/* Social Bottom Strip */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-center w-full text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
              aria-label={`${member.name} LinkedIn link`}
            >
              <LinkedInIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

    </div>
  );
};
