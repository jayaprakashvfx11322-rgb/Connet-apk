/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, BarChart2, TrendingUp, Users, DollarSign, Award, Clock, Target, 
  MapPin, Globe, Languages, Shield, Smartphone, Heart, MessageCircle, 
  Share2, ArrowUpRight, Zap, Play, PlayCircle, Eye, Download, Users2
} from 'lucide-react';
import { FeedPost, Reel, YouTubeVideo, Story } from '../types';

interface PostInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItem: FeedPost | Reel | YouTubeVideo | Story | null;
  contentType: 'writeup' | 'post' | 'clip' | 'video' | 'story';
}

export const PostInsightsModal: React.FC<PostInsightsModalProps> = ({
  isOpen,
  onClose,
  contentItem,
  contentType,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'audience' | 'earnings'>('overview');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [ticker, setTicker] = useState<number>(0);

  // Real-time counter trickling for high-fidelity interactive updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTicker(prev => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !contentItem) return null;

  // Derive initial values based on item metrics
  let initialLikes = 0;
  let initialComments = 0;
  let initialShares = 0;
  let initialViews = 5000;

  if (contentType === 'writeup' || contentType === 'post') {
    const post = contentItem as FeedPost;
    initialLikes = Object.keys(post.reactions || {}).length || 124;
    initialComments = post.comments?.length || 31;
    initialShares = post.shares || 45;
    initialViews = (initialLikes * 12) + (initialComments * 18) + (initialShares * 25) + 3820;
  } else if (contentType === 'clip') {
    const reel = contentItem as Reel;
    initialLikes = reel.likes?.length || 2400;
    initialComments = reel.comments?.length || 342;
    initialShares = reel.shares || 1205;
    initialViews = reel.views || 18400;
  } else if (contentType === 'video') {
    const vid = contentItem as YouTubeVideo;
    initialLikes = vid.likes?.length || 4500;
    initialComments = vid.comments?.length || 531;
    initialShares = vid.sharesCount || 612;
    initialViews = vid.views || 32000;
  } else if (contentType === 'story') {
    const story = contentItem as Story;
    initialLikes = story.likesCount || 142;
    initialComments = story.commentsCount || 12;
    initialShares = story.sharesCount || 48;
    initialViews = story.viewers?.length || 420;
  }

  // Base metrics dynamically incremented slightly via the ticker
  const likes = initialLikes + Math.floor(ticker * 0.15);
  const comments = initialComments + Math.floor(ticker * 0.05);
  const shares = initialShares + Math.floor(ticker * 0.08);
  const views = initialViews + Math.floor(ticker * 1.8);
  const uniqueReach = Math.floor(views * 0.85);

  const replies = Math.floor(comments * 0.8) + Math.floor(ticker * 0.03);
  const reposts = Math.floor(shares * 0.4) + Math.floor(ticker * 0.02);
  const downloads = contentItem.downloadsCount || Math.floor(views * 0.03) + Math.floor(ticker * 0.01);
  const profileVisits = Math.floor(views * 0.09) + Math.floor(ticker * 0.12);
  const connectRequests = Math.floor(profileVisits * 0.15) + Math.floor(ticker * 0.02);

  // Watch metrics (for clips & videos)
  const isVideoOrClip = contentType === 'clip' || contentType === 'video';
  const watchTimeHours = isVideoOrClip 
    ? Math.floor(views * (contentType === 'clip' ? 0.008 : 0.15)) 
    : 0;
  const completionRate = contentType === 'clip' ? 78.4 : 52.8;
  const avgWatchDuration = contentType === 'clip' ? '0:14s' : '6:42m';
  const audienceRetention = [
    { percent: 100, sec: '0%' },
    { percent: 85, sec: '25%' },
    { percent: 72, sec: '50%' },
    { percent: 64, sec: '75%' },
    { percent: completionRate, sec: '100%' }
  ];

  // Audience statistics (stable per post)
  const ageGroups = [
    { label: '18-24 years', percent: 42, color: 'bg-cyan-500 shadow-cyan-500/20' },
    { label: '25-34 years', percent: 35, color: 'bg-pink-500 shadow-pink-500/20' },
    { label: '35-44 years', percent: 15, color: 'bg-indigo-500 shadow-indigo-500/20' },
    { label: '45+ years', percent: 8, color: 'bg-gray-600' }
  ];
  const genderDistribution = [
    { label: 'Male', percent: 52, color: 'bg-cyan-400' },
    { label: 'Female', percent: 45, color: 'bg-pink-500' },
    { label: 'Non-Binary', percent: 3, color: 'bg-indigo-400' }
  ];
  const countries = [
    { name: 'India', percent: 38 },
    { name: 'United States', percent: 27 },
    { name: 'United Kingdom', percent: 12 },
    { name: 'Germany', percent: 8 },
    { name: 'Singapore', percent: 5 }
  ];
  const cities = [
    { name: 'Mumbai', percent: 18 },
    { name: 'San Francisco', percent: 15 },
    { name: 'Bangalore', percent: 14 },
    { name: 'London', percent: 10 },
    { name: 'Berlin', percent: 7 }
  ];
  const languages = [
    { name: 'English', percent: 68 },
    { name: 'Hindi', percent: 22 },
    { name: 'German', percent: 5 },
    { name: 'Spanish', percent: 3 },
    { name: 'Others', percent: 2 }
  ];

  // Performance parameters
  const bestPerformingTime = "06:30 PM (UTC)";
  const engagementRate = (((likes + comments + shares + replies) / views) * 100).toFixed(1);
  const reachRate = ((uniqueReach / (views || 1)) * 100).toFixed(1);
  const viralityScore = ((shares / (views || 1)) * 1000).toFixed(1); // multiplier style
  const growthTrend = "+18.4% WoW";

  // Earnings section (realistic values based on views and CPM)
  // Average CPM range $2.50 to $4.00
  const cpm = 3.25;
  const baseAdRevenue = (views / 1000) * cpm;
  const estimatedEarnings = Number((baseAdRevenue * 1.4 + ticker * 0.05).toFixed(2));
  
  // Custom Earnings segments
  const adRevenue = Number((estimatedEarnings * 0.48).toFixed(2));
  const creatorBonus = Number((estimatedEarnings * 0.22).toFixed(2));
  const gifts = Number((estimatedEarnings * 0.10).toFixed(2));
  const premiumSubscribers = Number((estimatedEarnings * 0.12).toFixed(2));
  const affiliateRevenue = Number((estimatedEarnings * 0.05).toFixed(2));
  const brandCollaborations = Number((estimatedEarnings * 0.03).toFixed(2));

  // Multi-tier timeline earnings
  const todayEarnings = Number((estimatedEarnings * 0.15).toFixed(2));
  const thisMonthEarnings = Number((estimatedEarnings * 0.85).toFixed(2));
  const totalEarnings = Number((estimatedEarnings * 3.4).toFixed(2));
  const lifetimeEarnings = Number((estimatedEarnings * 7.2).toFixed(2));

  // Generate data points for SVG line chart based on timeframe
  const generateGraphPoints = () => {
    let points: number[] = [];
    if (timeframe === 'daily') {
      points = [5, 12, 18, 15, 30, 45, 62, 55, 70, 85, 95, 120];
    } else if (timeframe === 'weekly') {
      points = [120, 240, 190, 310, 420, 380, 560, 680, 610, 740, 890, 1020];
    } else {
      points = [1020, 2140, 1850, 2900, 3840, 3120, 4850, 5200, 4900, 6200, 7100, 8400];
    }
    // Boost heights based on views
    const scaleFactor = views / 10000;
    return points.map(value => Math.round(value * (0.8 + scaleFactor)));
  };

  const graphValues = generateGraphPoints();
  const maxGrad = Math.max(...graphValues);
  const minGrad = Math.min(...graphValues);
  
  // Compose SVG coordinates
  const svgWidth = 500;
  const svgHeight = 150;
  const paddingX = 25;
  const paddingY = 20;
  
  const pointsString = graphValues.map((val, idx) => {
    const x = paddingX + (idx / (graphValues.length - 1)) * (svgWidth - paddingX * 2);
    const ratio = maxGrad === minGrad ? 0.5 : (val - minGrad) / (maxGrad - minGrad);
    const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPointsString = `${paddingX},${svgHeight - paddingY} ${pointsString} ${svgWidth - paddingX},${svgHeight - paddingY}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="insights-dashboard-root"
        className="relative bg-[#020617]/95 border border-cyan-500/25 rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col"
      >
        {/* Floating Apple Liquid Header */}
        <header className="sticky top-0 bg-[#020617]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <BarChart2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold bg-cyan-400/10 py-0.5 px-2 rounded border border-cyan-400/10">
                  {contentType.toUpperCase()} INSIGHTS
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-mono text-gray-500">LIVE SYNCING</span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-sm mt-0.5">
                {contentType === 'writeup' || contentType === 'post' 
                  ? (contentItem as FeedPost).content?.substring(0, 45) + '...'
                  : contentType === 'clip'
                  ? (contentItem as Reel).caption?.substring(0, 45) + '...'
                  : contentType === 'video'
                  ? (contentItem as YouTubeVideo).title
                  : 'Ephemeral Story Snippet'
                }
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Categories Tab Navigation */}
        <div className="px-6 pt-4 border-b border-white/5 flex gap-1.5 overflow-x-auto bg-[#020617]/50 scrollbar-none">
          {(['overview', 'performance', 'audience', 'earnings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab 
                  ? 'bg-cyan-500/10 text-cyan-400 border-t border-cyan-500/30 font-extrabold shadow-[inset_0_-2px_0_#22d3ee]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' && <Eye className="w-3.5 h-3.5" />}
              {tab === 'performance' && <TrendingUp className="w-3.5 h-3.5" />}
              {tab === 'audience' && <Users className="w-3.5 h-3.5" />}
              {tab === 'earnings' && <DollarSign className="w-3.5 h-3.5" />}
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Modal Main Content Box */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              
              {/* Primary Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-cyan-500/20 transition-all">
                  <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wider uppercase">Total Views</span>
                  <p className="text-xl font-black text-white mt-2 font-mono">{views.toLocaleString()}</p>
                  <span className="text-[8px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +14.2% live
                  </span>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-cyan-500/20 transition-all">
                  <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wider uppercase">Unique Reach</span>
                  <p className="text-xl font-black text-white mt-2 font-mono">{uniqueReach.toLocaleString()}</p>
                  <span className="text-[8px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +12.8% live
                  </span>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-cyan-500/20 transition-all">
                  <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wider uppercase">Likes</span>
                  <p className="text-xl font-black text-pink-400 mt-2 font-mono">❤️ {likes.toLocaleString()}</p>
                  <span className="text-[8px] text-pink-400/80 font-mono mt-1">Live active user reactions</span>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/5 hover:border-cyan-500/20 transition-all">
                  <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wider uppercase">Comments</span>
                  <p className="text-xl font-black text-cyan-400 mt-2 font-mono">💬 {comments.toLocaleString()}</p>
                  <span className="text-[8px] text-cyan-300 font-mono mt-1">Interactive threads</span>
                </div>

                <div className="bg-white/3 border border-white/8 rounded-2xl p-4 col-span-2 md:col-span-1 flex flex-col justify-between hover:bg-white/5 hover:border-cyan-500/20 transition-all">
                  <span className="text-[10px] text-gray-400 font-bold font-mono tracking-wider uppercase flex items-center gap-1">💰 Earnings</span>
                  <p className="text-xl font-black text-emerald-400 mt-2 font-mono">${estimatedEarnings.toLocaleString()}</p>
                  <span className="text-[8px] text-emerald-400 font-mono mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> CPM active
                  </span>
                </div>
              </div>

              {/* Engagement Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Custom Engagement Bars */}
                <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap className="text-cyan-400 w-4 h-4" /> Sharing & Response Loop
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-400">Reposts Count</span>
                        <span className="text-white font-mono font-bold">🔁 {reposts.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, (reposts/views)*100*12)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-400">Replies Count</span>
                        <span className="text-white font-mono font-bold">↩ {replies.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(100, (replies/comments || 1)*100)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-400">Shares Count</span>
                        <span className="text-white font-mono font-bold">📤 {shares.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-400 h-full rounded-full" style={{ width: `${Math.min(100, (shares/views)*100*15)}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-gray-400 mr-2">Downloads Count</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold font-mono tracking-wider py-0.5 px-1.5 bg-pink-500/10 text-pink-400 border border-pink-400/20 rounded">
                            {contentItem.allowDownloads !== false ? "ENABLED" : "DISABLED"}
                          </span>
                          <span className="text-white font-mono font-bold">⬇ {downloads.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full rounded-full animate-pulse" style={{ width: `${contentItem.allowDownloads !== false ? Math.min(100, (downloads/views)*100*20) : 0}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl text-center">
                        <span className="block text-[9px] text-gray-500 uppercase font-bold font-mono">Profile Visits</span>
                        <span className="text-sm font-extrabold text-white font-mono mt-1 block">{profileVisits.toLocaleString()}</span>
                      </div>
                      <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl text-center">
                        <span className="block text-[9px] text-gray-500 uppercase font-bold font-mono">Connects Triggered</span>
                        <span className="text-sm font-extrabold text-[#22d3ee] font-mono mt-1 block">{connectRequests.toLocaleString()}</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Video Playback Metrics (Conditioned for Clips/Videos) */}
                <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock className="text-pink-400 w-4 h-4" /> Live Video Retention
                    </h3>

                    {isVideoOrClip ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-mono uppercase">Watch Time</span>
                            <span className="text-xs font-extrabold text-cyan-400 font-mono block mt-1">{watchTimeHours.toLocaleString()} Hrs</span>
                          </div>
                          <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-mono uppercase">Completion Rate</span>
                            <span className="text-xs font-extrabold text-pink-400 font-mono block mt-1">{completionRate}%</span>
                          </div>
                          <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl">
                            <span className="block text-[8px] text-gray-400 font-mono uppercase">Avg Watch Duration</span>
                            <span className="text-xs font-extrabold text-white font-mono block mt-1">{avgWatchDuration}</span>
                          </div>
                        </div>

                        {/* Audience retention timeline list */}
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Audience Drop-Off Curve</span>
                          <div className="flex items-end justify-between h-20 px-2 bg-black/45 rounded-xl border border-white/10 py-2.5">
                            {audienceRetention.map((pt, i) => (
                              <div key={i} className="flex flex-col items-center justify-end h-full w-10 gap-1.5 group">
                                <div 
                                  className="w-4 bg-gradient-to-t from-cyan-600 to-cyan-400 hover:from-pink-500 hover:to-pink-400 rounded-t-sm transition-all duration-300 relative"
                                  style={{ height: `${pt.percent}%` }}
                                >
                                  {/* Floating percentage tooltip on hover */}
                                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0c1226] text-white border border-cyan-400/35 text-[8px] font-mono py-0.5 px-1.2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-30">
                                    {pt.percent}%
                                  </div>
                                </div>
                                <span className="text-[8px] font-mono text-gray-500 font-black">{pt.sec}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="py-8 text-center flex flex-col items-center justify-center h-full">
                        <Smartphone className="w-10 h-10 text-gray-600 mb-2 animate-bounce" />
                        <span className="text-xs font-mono text-gray-400 font-extrabold uppercase">Standard Media Analytics</span>
                        <p className="text-[10px] text-gray-550 max-w-[250px] mt-2 leading-relaxed">
                          Watch time and completion indexes are uniquely unlocked for horizontal high-fidelity Videos and vertical short Clips.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/8 p-4 rounded-2xl">
                <div>
                  <h3 className="text-xs font-extrabold text-white font-mono uppercase tracking-widest">Growth Curve Analytics</h3>
                  <p className="text-[10px] text-gray-400 leading-normal mt-1">
                    Visual scale of interactive impressions indexed by timeframe. Toggles update metrics in real-time.
                  </p>
                </div>
                
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 self-start">
                  {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTimeframe(mode)}
                      className={`py-1 px-3 text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        timeframe === mode 
                          ? 'bg-cyan-500 text-black font-black shadow shadow-cyan-400/20' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="bg-black/50 border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-4 left-6 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-black tracking-widest uppercase">Engagement Velocity</span>
                  <div className="px-2 py-0.5 bg-[#22d3ee]/10 text-[#22d3ee] font-mono text-[9px] rounded font-bold border border-cyan-400/15">
                    {growthTrend}
                  </div>
                </div>

                <div className="absolute top-4 right-6 text-[10px] font-mono text-gray-400">
                  Apex Index: <span className="text-white font-extrabold">{maxGrad.toLocaleString()}</span>
                </div>

                {/* SVG Visual Body */}
                <div className="w-full mt-8 overflow-hidden">
                  <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>

                    {/* Background Grid Lines */}
                    <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                    <line x1={paddingX} y1={svgHeight/2} x2={svgWidth - paddingX} y2={svgHeight/2} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                    <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />

                    {/* Area fill */}
                    <polygon points={areaPointsString} fill="url(#areaGrad)" />

                    {/* Glowing background line with stroke width */}
                    <polyline points={pointsString} fill="none" stroke="url(#lineGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 blur-sm" />

                    {/* Primary Line */}
                    <polyline points={pointsString} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data coordinate circles */}
                    {graphValues.map((val, idx) => {
                      const x = paddingX + (idx / (graphValues.length - 1)) * (svgWidth - paddingX * 2);
                      const ratio = maxGrad === minGrad ? 0.5 : (val - minGrad) / (maxGrad - minGrad);
                      const y = svgHeight - paddingY - ratio * (svgHeight - paddingY * 2);
                      const isLast = idx === graphValues.length - 1;

                      return (
                        <g key={idx} className="group cursor-pointer">
                          <circle 
                            cx={x} 
                            cy={y} 
                            r={isLast ? "5" : "3.5"} 
                            fill={isLast ? "#ec4899" : "#22d3ee"} 
                            stroke="#020617" 
                            strokeWidth="1.5" 
                            className="transition-all duration-200 group-hover:r-[7px]" 
                          />
                          {/* Hover Tooltip inside SVG */}
                          <title>Point {idx + 1}: {val.toLocaleString()}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X-axis custom labels */}
                <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 px-3 mt-3 select-none">
                  <span>{timeframe === 'daily' ? '00:00' : timeframe === 'weekly' ? 'Mon' : 'Jan'}</span>
                  <span>{timeframe === 'daily' ? '06:00' : timeframe === 'weekly' ? 'Wed' : 'Apr'}</span>
                  <span>{timeframe === 'daily' ? '12:00' : timeframe === 'weekly' ? 'Fri' : 'Jul'}</span>
                  <span>{timeframe === 'daily' ? '18:00' : timeframe === 'weekly' ? 'Sun' : 'Oct'}</span>
                  <span>{timeframe === 'daily' ? '24:00' : timeframe === 'weekly' ? 'Today' : 'Dec'}</span>
                </div>
              </div>

              {/* Performance Scores Block */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Best Post Hour</span>
                  <span className="text-xs font-bold text-white block mt-1.5">{bestPerformingTime}</span>
                  <p className="text-[8px] text-gray-500 leading-normal mt-1">High-density audience response spike timezone</p>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Engagement Rate</span>
                  <span className="text-sm font-black text-cyan-400 font-mono block mt-1">{engagementRate}%</span>
                  <p className="text-[8px] text-gray-500 leading-normal mt-1">Active response divided by total views</p>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Reach Frequency Rate</span>
                  <span className="text-sm font-black text-pink-400 font-mono block mt-1">{reachRate}%</span>
                  <p className="text-[8px] text-gray-500 leading-normal mt-1">Ratio of non-followers reached cleanly</p>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase font-mono tracking-wider">Virality Factor</span>
                  <span className="text-sm font-black text-emerald-400 font-mono block mt-1">{viralityScore} / 100</span>
                  <p className="text-[8px] text-gray-500 leading-normal mt-1">Exponential share index modeling velocity</p>
                </div>
              </div>

            </div>
          )}

          {/* AUDIENCE TAB */}
          {activeTab === 'audience' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Age & Gender Demographics */}
                <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Users className="text-pink-400 w-4.5 h-4.5" /> Age Segments Distribution
                    </h3>
                    <div className="space-y-3">
                      {ageGroups.map((group, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between items-center text-xs text-gray-300 mb-1">
                            <span className="font-medium">{group.label}</span>
                            <span className="font-mono font-bold">{group.percent}%</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${group.color}`} style={{ width: `${group.percent}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target className="text-cyan-400 w-4.5 h-4.5" /> Gender Split Ratio
                    </h3>
                    <div className="flex items-center h-4 w-full rounded-full overflow-hidden bg-white/5">
                      {genderDistribution.map((group, idx) => (
                        <div 
                          key={idx}
                          className={`${group.color} h-full relative group`}
                          style={{ width: `${group.percent}%` }}
                        >
                          <title>{group.label}: {group.percent}%</title>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-2">
                      {genderDistribution.map((group, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${group.color}`} />
                          <span>{group.label} ({group.percent}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Geo-location & Language breakdown */}
                <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5 space-y-5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe className="text-indigo-400 w-4.5 h-4.5" /> Geographic Sourcing
                  </h3>

                  <div className="grid grid-cols-2 gap-5">
                    
                    {/* Countries */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 tracking-wider">Top Countries</span>
                      <div className="space-y-2 text-xs">
                        {countries.map((c, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/35 py-1 px-2.5 rounded-lg border border-white/4">
                            <span className="text-gray-300 font-medium">{c.name}</span>
                            <span className="text-white font-mono font-bold">{c.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cities */}
                    <div className="space-y-2.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-pink-400 tracking-wider">Top Cities</span>
                      <div className="space-y-2 text-xs">
                        {cities.map((ct, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/35 py-1 px-2.5 rounded-lg border border-white/4">
                            <span className="text-gray-300 font-medium">{ct.name}</span>
                            <span className="text-white font-mono font-bold">{ct.percent}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Languages section */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 tracking-wider block mb-2">Primary Audio/Text Speech Settings</span>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((lng, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300">
                          {lng.name} <span className="text-[#22d3ee] font-black">{lng.percent}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* EARNINGS TAB */}
          {activeTab === 'earnings' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              
              {/* Estimated earnings display cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                
                <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between shadow-[0_4px_15px_rgba(16,185,129,0.05)] col-span-1 sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-black uppercase">Estimated Post Earnings</span>
                    <DollarSign className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black text-white font-mono">${estimatedEarnings.toLocaleString()}</span>
                    <div className="text-[8px] text-gray-400 mt-1 leading-normal font-medium">Auto-compiled with smart impression indexing rate</div>
                  </div>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-xl">
                  <span className="text-[8px] uppercase font-mono font-bold text-gray-400">Total Account Earnings</span>
                  <p className="text-lg font-black text-white mt-1.5 font-mono">${totalEarnings.toLocaleString()}</p>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-xl">
                  <span className="text-[8px] uppercase font-mono font-bold text-gray-400">Today's Earnings</span>
                  <p className="text-lg font-black text-white mt-1.5 font-mono">${todayEarnings.toLocaleString()}</p>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-xl">
                  <span className="text-[8px] uppercase font-mono font-bold text-gray-400">This Month Earnings</span>
                  <p className="text-lg font-black text-white mt-1.5 font-mono">${thisMonthEarnings.toLocaleString()}</p>
                </div>
              </div>

              {/* Revenue split layout */}
              <div className="bg-[#0b1227]/55 border border-white/10 rounded-[32px] p-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="text-cyan-400 w-4.5 h-4.5" /> Revenue Split Breakdown
                  </h3>
                  <span className="text-[8px] font-mono text-gray-500">Node: NET CLEARING UNIT</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Revenue segments stats list */}
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Ad Revenue (Google AdSense Prox)</span>
                      <span className="text-white font-mono font-black">${adRevenue.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Creator Bonus (Pool allocation)</span>
                      <span className="text-white font-mono font-black">${creatorBonus.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Gifts Received (Direct Tip Coins)</span>
                      <span className="text-white font-mono font-black">${gifts.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Premium Subscribers surcharge</span>
                      <span className="text-white font-mono font-black">${premiumSubscribers.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Affiliate Referral program</span>
                      <span className="text-white font-mono font-black">${affiliateRevenue.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-white/5 hover:bg-white/3 px-2 rounded-lg transition-all">
                      <span className="text-gray-400">Brand Collaborations (Sponsors)</span>
                      <span className="text-white font-mono font-black">${brandCollaborations.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Horizontal visual block layout */}
                  <div className="space-y-4">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase font-bold">Consolidated Lifetime Share</span>
                      <div className="text-2xl font-black text-indigo-400 font-mono">${lifetimeEarnings.toLocaleString()}</div>
                      <p className="text-[9px] text-gray-500 leading-relaxed font-mono">
                        Consolidated lifetime digital content monetization output securely verified.
                      </p>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="flex-1 bg-white/3 border border-white/5 p-3 rounded-xl text-center">
                        <span className="block text-[8px] text-gray-500 font-mono font-bold uppercase">CPM Yield</span>
                        <span className="text-xs font-black text-emerald-400 font-mono block mt-1">${cpm}</span>
                      </div>
                      <div className="flex-1 bg-white/3 border border-white/5 p-3 rounded-xl text-center">
                        <span className="block text-[8px] text-gray-500 font-mono font-bold uppercase">Payout Status</span>
                        <span className="text-xs font-bold text-cyan-300 block mt-1">Pending</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer info lock block */}
        <footer className="bg-[#020512] px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-gray-550">
          <div className="flex items-center gap-1.5 font-mono">
            <LockIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Encrypted Ledger Clearance Node • ISO 27001 Certified Access control</span>
          </div>
          <span>Total calculated dynamically based on real impressions</span>
        </footer>
      </div>
    </div>
  );
};

const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);
