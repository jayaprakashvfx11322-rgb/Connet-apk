/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, MessageSquare, Users, Video, DollarSign, 
  MoreVertical, CheckCircle2, SlidersHorizontal 
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';

interface NotificationsPageProps {
  onBack: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onBack }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Likes' | 'Comments' | 'Mentions' | 'Earnings'>('All');

  const notifications = [
    {
      id: 'n1',
      type: 'like',
      user: {
        displayName: 'Priya',
        profilePic: MOCK_AVATARS.priya,
      },
      text: 'liked your post.',
      timestamp: '2m ago',
      mediaPreview: MOCK_IMAGES.sunsetOcean,
    },
    {
      id: 'n2',
      type: 'comment',
      user: {
        displayName: 'Kavin',
        profilePic: MOCK_AVATARS.kavin,
      },
      text: 'commented on your post: "Amazing! 🔥"',
      timestamp: '11m ago',
      mediaPreview: MOCK_IMAGES.neonCyber,
    },
    {
      id: 'n3',
      type: 'connect',
      user: {
        displayName: 'Anu',
        profilePic: MOCK_AVATARS.anu,
      },
      text: 'connected with you.',
      timestamp: '10m ago',
      mediaPreview: null,
      isConnected: true,
    },
    {
      id: 'n4',
      type: 'views',
      user: {
        displayName: 'ConnectX System',
        profilePic: MOCK_AVATARS.vicky,
      },
      text: 'Your video reached 10K views!',
      timestamp: '1d ago',
      mediaPreview: MOCK_IMAGES.setup,
    },
    {
      id: 'n5',
      type: 'earning',
      user: {
        displayName: 'Creator Fund',
        profilePic: MOCK_AVATARS.vicky,
      },
      text: 'You earned $12.45 from your video.',
      timestamp: '1d ago',
      mediaPreview: MOCK_IMAGES.setup,
    }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Likes') return notif.type === 'like';
    if (activeFilter === 'Comments') return notif.type === 'comment';
    if (activeFilter === 'Mentions') return notif.type === 'connect'; // fallback or similar mock group
    if (activeFilter === 'Earnings') return notif.type === 'earning';
    return true;
  });

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-full bg-[#020510] text-white select-none animate-in fade-in duration-200">
      
      {/* HEADER SECTION (Matches Screen 8) */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4 px-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-white uppercase tracking-tight">Notifications</span>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* HORIZONTAL FILTERS SCROLL (Exactly matching the reference image) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3.5 px-2">
        {(['All', 'Likes', 'Comments', 'Mentions', 'Earnings'] as const).map(filter => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`py-1.5 px-4 rounded-full text-xs font-semibold whitespace-nowrap tracking-wide leading-none transition-all cursor-pointer border ${
                isActive 
                  ? 'bg-gradient-to-tr from-cyan-400/20 to-pink-500/10 border-white/25 text-white shadow-[0_0_12px_rgba(34,211,238,0.15)] font-extrabold' 
                  : 'bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto no-scrollbar pb-24 px-2">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-xs font-medium">
            No updates in this cryptographic filter feed yet.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              className="bg-[#050b18]/80 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3 scale-100 hover:border-pink-500/20 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                {/* Avatar with dynamic mini icon overlay matching notification type */}
                <div className="relative shrink-0">
                  <img src={notif.user.profilePic} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" />
                  <div className={`absolute -right-1 -bottom-1 w-4 h-4 rounded-full flex items-center justify-center p-0.5 border border-black ${
                    notif.type === 'like' ? 'bg-pink-500 text-white' :
                    notif.type === 'comment' ? 'bg-cyan-400 text-black' :
                    notif.type === 'connect' ? 'bg-indigo-500 text-white' :
                    notif.type === 'views' ? 'bg-purple-500 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                    {notif.type === 'like' && <Heart className="w-2.5 h-2.5 fill-current text-white stroke-[2.5]" />}
                    {notif.type === 'comment' && <MessageSquare className="w-2.5 h-2.5 text-black stroke-[3]" />}
                    {notif.type === 'connect' && <Users className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    {notif.type === 'views' && <Video className="w-2.5 h-2.5 text-white stroke-[2.5]" />}
                    {notif.type === 'earning' && <DollarSign className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-left">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{notif.user.displayName}</span>
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 fill-cyan-400/10 stroke-[2.5]" />
                  </div>
                  <p className="text-[10px] text-gray-300 leading-tight mt-0.5 max-w-[190px]">
                    {notif.text}
                  </p>
                  <span className="text-[8px] text-gray-500 font-mono block mt-1">{notif.timestamp}</span>
                </div>
              </div>

              {/* Action column on the right (Thumb/Connect-Back/Empty) */}
              <div className="shrink-0 flex items-center">
                {notif.mediaPreview && (
                  <img 
                    src={notif.mediaPreview} 
                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg" 
                  />
                )}
                {notif.type === 'connect' && (
                  <button className="py-1 px-3 bg-cyan-400 text-black text-[9px] font-black rounded-lg leading-tight uppercase cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-[0_0_5px_rgba(34,211,238,0.2)]">
                    Connect Back
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
