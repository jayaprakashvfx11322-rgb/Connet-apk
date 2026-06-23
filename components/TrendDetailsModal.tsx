/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, TrendingUp, Flame, Globe, Sparkles, MessageCircle, Heart, 
  Share2, Zap, ArrowUpRight, BarChart3, Activity, Orbit
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';

// Generate dynamic trends detail data matching ticker items
interface TrendDetailData {
  title: string;
  category: string;
  volume24h: string;
  growth: string;
  description: string;
  isPink: boolean;
  engagementScore: number;
  sentiment: { label: string; percentage: number; color: string }[];
  history: { hour: string; volume: number; sentimentScore: number }[];
  relatedPosts: {
    id: string;
    author: string;
    username: string;
    avatar: string;
    content: string;
    timestamp: string;
    media?: string;
    likes: number;
    comments: number;
  }[];
}

const TREND_DATABASE: Record<string, TrendDetailData> = {
  '#tokyocyberpunk': {
    title: '#TokyoCyberpunk',
    category: 'Aesthetic & Lifestyle',
    volume24h: '42.8K hits',
    growth: '+142.5%',
    description: 'Neon-infused architectural captures, nighttime drone streams, and futuristic style logs radiating from Neo-Shibuya sectors.',
    isPink: true,
    engagementScore: 94,
    sentiment: [
      { label: 'Hyper-Excited', percentage: 65, color: '#ec4899' },
      { label: 'Neutral-Tech', percentage: 25, color: '#22d3ee' },
      { label: 'Atmospheric', percentage: 10, color: '#8b5cf6' }
    ],
    history: [
      { hour: '00:00', volume: 1200, sentimentScore: 70 },
      { hour: '04:00', volume: 1800, sentimentScore: 74 },
      { hour: '08:00', volume: 4500, sentimentScore: 85 },
      { hour: '12:00', volume: 7200, sentimentScore: 89 },
      { hour: '16:00', volume: 12800, sentimentScore: 94 },
      { hour: '20:00', volume: 15300, sentimentScore: 96 },
    ],
    relatedPosts: [
      {
        id: 'tcp-1',
        author: 'Priya',
        username: 'priya_loops',
        avatar: MOCK_AVATARS.priya,
        content: 'Just captured the neon drizzle reflecting off Shinjuku sub-level 4. The glass structures are purely cinematic tonight. 🌧️✨',
        timestamp: '14m ago',
        media: MOCK_IMAGES.sunsetOcean,
        likes: 1240,
        comments: 256
      },
      {
        id: 'tcp-2',
        author: 'Kavin',
        username: 'kavin_studio',
        avatar: MOCK_AVATARS.kavin,
        content: 'Working on a new synth drone pack designed explicitly for these #TokyoCyberpunk nightscapes. Output pipeline goes live soon.',
        timestamp: '2h ago',
        likes: 840,
        comments: 94
      }
    ]
  },
  '$ctxotoken:+24.8%': {
    title: '$CTXO Token: +24.8%',
    category: 'Crypto Assets & Finance',
    volume24h: '1.24M Vol',
    growth: '+24.8%',
    description: 'ConnectX Native Ecosystem Utility Token pacing new liquidity ceilings due to transaction pipeline accelerations.',
    isPink: false,
    engagementScore: 88,
    sentiment: [
      { label: 'Bullish', percentage: 75, color: '#22d3ee' },
      { label: 'Holder Hype', percentage: 18, color: '#ec4899' },
      { label: 'Short Swing', percentage: 7, color: '#a855f7' }
    ],
    history: [
      { hour: '00:00', volume: 200, sentimentScore: 60 },
      { hour: '04:00', volume: 450, sentimentScore: 65 },
      { hour: '08:00', volume: 920, sentimentScore: 78 },
      { hour: '12:00', volume: 1200, sentimentScore: 81 },
      { hour: '16:00', volume: 2400, sentimentScore: 85 },
      { hour: '20:00', volume: 3800, sentimentScore: 92 },
    ],
    relatedPosts: [
      {
        id: 'ctx-1',
        author: 'Arjun',
        username: 'arjun_ledger',
        avatar: MOCK_AVATARS.arjun,
        content: 'The 30-day accumulation channel for $CTXO has finally broken out to the upside. Volume is backing this run completely! 🚀📈',
        timestamp: '45m ago',
        likes: 512,
        comments: 72
      },
      {
        id: 'ctx-2',
        author: 'Vicky',
        username: 'vicky_sec',
        avatar: MOCK_AVATARS.vicky,
        content: 'Smart contracts audited. Gas optimizations on the layer-2 bridges have cut execution costs by 65%. Bullish sign.',
        timestamp: '5h ago',
        likes: 320,
        comments: 48
      }
    ]
  },
  'activenodes:12,482': {
    title: 'Active Nodes: 12,482',
    category: 'Network Infrastructure',
    volume24h: 'Secure Sync',
    growth: '+8.4%',
    description: 'Decentralized state-relay network coordinates running at optimal synchronization speeds globally across active partitions.',
    isPink: false,
    engagementScore: 82,
    sentiment: [
      { label: 'Highly Stable', percentage: 84, color: '#22d3ee' },
      { label: 'Decongested', percentage: 12, color: '#8b5cf6' },
      { label: 'Pending Sync', percentage: 4, color: '#f43f5e' }
    ],
    history: [
      { hour: '00:00', volume: 11200, sentimentScore: 90 },
      { hour: '04:00', volume: 11450, sentimentScore: 91 },
      { hour: '08:00', volume: 11800, sentimentScore: 93 },
      { hour: '12:00', volume: 12100, sentimentScore: 94 },
      { hour: '16:00', volume: 12340, sentimentScore: 95 },
      { hour: '20:00', volume: 12482, sentimentScore: 97 },
    ],
    relatedPosts: [
      {
        id: 'node-1',
        author: 'Anu',
        username: 'anu_compile',
        avatar: MOCK_AVATARS.anu,
        content: 'Booted up minor validation sub-mesh in the Tokyo region. Handshake confirmed under 8ms. Absolute speed marvel. ⚡🗼',
        timestamp: '1h ago',
        media: MOCK_IMAGES.setup,
        likes: 215,
        comments: 18
      }
    ]
  },
  '#connectxvibe': {
    title: '#ConnectXVibe',
    category: 'Community & Culture',
    volume24h: '31.2K active',
    growth: '+95.4%',
    description: 'Celebrating high-fidelity, futuristic visual mockups, UI showcase boards, and innovative design aesthetics inside ConnectX.',
    isPink: true,
    engagementScore: 96,
    sentiment: [
      { label: 'Optimistic', percentage: 70, color: '#ec4899' },
      { label: 'Vibrant', percentage: 22, color: '#22d3ee' },
      { label: 'Curious', percentage: 8, color: '#f43f5e' }
    ],
    history: [
      { hour: '00:00', volume: 400, sentimentScore: 80 },
      { hour: '04:00', volume: 850, sentimentScore: 82 },
      { hour: '08:00', volume: 1600, sentimentScore: 85 },
      { hour: '12:00', volume: 3400, sentimentScore: 89 },
      { hour: '16:00', volume: 5800, sentimentScore: 92 },
      { hour: '20:00', volume: 8200, sentimentScore: 96 },
    ],
    relatedPosts: [
      {
        id: 'vibe-1',
        author: 'Priya',
        username: 'priya_loops',
        avatar: MOCK_AVATARS.priya,
        content: 'Feeling the absolute high-fidelity design energy. The interactive glassmorphic panels make scrolling feel like a Behance showcase. #ConnectXVibe',
        timestamp: '30m ago',
        media: MOCK_IMAGES.festival,
        likes: 1840,
        comments: 312
      }
    ]
  },
  '@priya_loops:10mviews': {
    title: '@Priya_Loops: 10M Views',
    category: 'Influencer Milestone',
    volume24h: '10.2M Views',
    growth: '+180.2%',
    description: 'Priya hits historic milestone threshold across multi-tiered loop media feeds. Celebrating 10M total cryptographic views!',
    isPink: true,
    engagementScore: 99,
    sentiment: [
      { label: 'Excited Users', percentage: 82, color: '#ec4899' },
      { label: 'Inspired Creators', percentage: 15, color: '#22d3ee' },
      { label: 'Inquisitive Devs', percentage: 3, color: '#e9d5ff' }
    ],
    history: [
      { hour: '00:00', volume: 15000, sentimentScore: 85 },
      { hour: '04:00', volume: 32000, sentimentScore: 88 },
      { hour: '08:00', volume: 74000, sentimentScore: 92 },
      { hour: '12:00', volume: 153000, sentimentScore: 95 },
      { hour: '16:00', volume: 290000, sentimentScore: 98 },
      { hour: '20:00', volume: 450000, sentimentScore: 99 },
    ],
    relatedPosts: [
      {
        id: 'pl-1',
        author: 'Priya',
        username: 'priya_loops',
        avatar: MOCK_AVATARS.priya,
        content: '10 MILLION VIEWS! 😭 I am absolutely speechless. ConnectX has given me a creative home. Cheers to every loop, every sync, and every viewer! 🥂💫',
        timestamp: '1h ago',
        media: MOCK_IMAGES.sunsetOcean,
        likes: 4200,
        comments: 618
      },
      {
        id: 'pl-2',
        author: 'Kavin',
        username: 'kavin_studio',
        avatar: MOCK_AVATARS.kavin,
        content: 'Massive congratulations to Priya! Pure cinematic visual craft always rises to the top. #10M',
        timestamp: '3h ago',
        likes: 1205,
        comments: 88
      }
    ]
  },
  'gas:11gwei': {
    title: 'Gas: 11 Gwei',
    category: 'Core State Parameters',
    volume24h: 'Decongested',
    growth: '-15.4%',
    description: 'Sync transaction ledger processing costs at lowest standard baseline thresholds. Perfect time for smart asset minting.',
    isPink: false,
    engagementScore: 74,
    sentiment: [
      { label: 'Highly Efficient', percentage: 88, color: '#22d3ee' },
      { label: 'Optimal Rate', percentage: 10, color: '#a855f7' },
      { label: 'Unchanged', percentage: 2, color: '#c084fc' }
    ],
    history: [
      { hour: '00:00', volume: 18, sentimentScore: 50 },
      { hour: '04:00', volume: 15, sentimentScore: 55 },
      { hour: '08:00', volume: 14, sentimentScore: 62 },
      { hour: '12:00', volume: 12, sentimentScore: 70 },
      { hour: '16:00', volume: 11, sentimentScore: 82 },
      { hour: '20:00', volume: 11, sentimentScore: 85 },
    ],
    relatedPosts: [
      {
        id: 'gas-1',
        author: 'Vicky',
        username: 'vicky_sec',
        avatar: MOCK_AVATARS.vicky,
        content: 'Gas has cooled down to an optimal 11 Gwei. If you have been waiting to sync your Creator Contract signatures, trigger it now. 🛠️⛽',
        timestamp: '1h ago',
        likes: 198,
        comments: 12
      }
    ]
  },
  '#behanceexclusive': {
    title: '#BehanceExclusive',
    category: 'Design & Visuals',
    volume24h: '15.4K clicks',
    growth: '+110.6%',
    description: 'Discover curated visual mockups, ultra-precise viewport parameters, and layout caseboards highlighting award-winning quality.',
    isPink: true,
    engagementScore: 92,
    sentiment: [
      { label: 'Aesthetic Focus', percentage: 78, color: '#ec4899' },
      { label: 'Creative', percentage: 16, color: '#22d3ee' },
      { label: 'Inspirational', percentage: 6, color: '#e9d5ff' }
    ],
    history: [
      { hour: '00:00', volume: 300, sentimentScore: 75 },
      { hour: '04:00', volume: 540, sentimentScore: 77 },
      { hour: '08:00', volume: 1200, sentimentScore: 80 },
      { hour: '12:00', volume: 2100, sentimentScore: 85 },
      { hour: '16:00', volume: 4300, sentimentScore: 90 },
      { hour: '20:00', volume: 6800, sentimentScore: 94 },
    ],
    relatedPosts: [
      {
        id: 'be-1',
        author: 'Kavin',
        username: 'kavin_studio',
        avatar: MOCK_AVATARS.kavin,
        content: 'Aesthetic breakdown of the main ConnectX viewport. Utilizing precise high contrast light levels, neon gradients, and premium layouts. #BehanceExclusive',
        timestamp: '1h ago',
        media: MOCK_IMAGES.techGadget,
        likes: 1120,
        comments: 114
      }
    ]
  },
  '@kavin_studio:livestudio': {
    title: '@Kavin_Studio: Live Studio',
    category: 'Audio Production',
    volume24h: '4.8K listeners',
    growth: '+68.2%',
    description: 'Kavin is broadcasting live synth design iterations, audio layout parameters, and spatial hardware engineering loops.',
    isPink: false,
    engagementScore: 86,
    sentiment: [
      { label: 'Inspired Audio', percentage: 74, color: '#22d3ee' },
      { label: 'Chill Co-work', percentage: 22, color: '#ec4899' },
      { label: 'Curious Engineers', percentage: 4, color: '#a855f7' }
    ],
    history: [
      { hour: '00:00', volume: 100, sentimentScore: 65 },
      { hour: '04:00', volume: 220, sentimentScore: 68 },
      { hour: '08:00', volume: 550, sentimentScore: 74 },
      { hour: '12:00', volume: 1200, sentimentScore: 79 },
      { hour: '16:00', volume: 2200, sentimentScore: 82 },
      { hour: '20:00', volume: 3100, sentimentScore: 88 },
    ],
    relatedPosts: [
      {
        id: 'ks-1',
        author: 'Kavin',
        username: 'kavin_studio',
        avatar: MOCK_AVATARS.kavin,
        content: 'Active on stream tonight! Mixing modular layers directly inside the cabinet rack. Grab your credentials and listen. 🎹🎧',
        timestamp: '2h ago',
        media: MOCK_IMAGES.setup,
        likes: 935,
        comments: 76
      }
    ]
  }
};

interface TrendDetailsModalProps {
  topicText: string;
  onClose: () => void;
  onHashtagAutoInject?: (hashtag: string) => void;
}

export const TrendDetailsModal: React.FC<TrendDetailsModalProps> = ({ 
  topicText, 
  onClose,
  onHashtagAutoInject 
}) => {
  const normKey = topicText.toLowerCase().replace(/ /g, '');
  const trendData = TREND_DATABASE[normKey] || {
    title: topicText,
    category: 'General Discussion',
    volume24h: '12.4K hits',
    growth: '+15.2%',
    description: 'Active discussion trends surrounding encrypted networks, system logs, and community sharing channels.',
    isPink: true,
    engagementScore: 80,
    sentiment: [
      { label: 'Positive', percentage: 60, color: '#ec4899' },
      { label: 'Neutral', percentage: 30, color: '#22d3ee' },
      { label: 'Curious', percentage: 10, color: '#a855f7' }
    ],
    history: [
      { hour: '00:00', volume: 100, sentimentScore: 50 },
      { hour: '10:00', volume: 450, sentimentScore: 65 },
      { hour: '20:00', volume: 920, sentimentScore: 80 }
    ],
    relatedPosts: []
  };

  const [hasFollowed, setHasFollowed] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto font-sans"
    >
      
      {/* Container Card */}
      <motion.div 
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="w-full max-w-lg bg-[#020510]/85 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.2)] flex flex-col relative my-4 max-h-[90vh]"
      >
        
        {/* Glow Header Accent Line */}
        <div className={`h-[1px] w-full bg-gradient-to-r ${trendData.isPink ? 'from-pink-500 to-transparent' : 'from-cyan-400 to-transparent'}`} />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between p-4 pb-2 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${trendData.isPink ? 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`} />
            <span className="text-[9px] font-mono tracking-widest text-gray-400 font-extrabold uppercase">Decrypted Core Index</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-grow p-4 overflow-y-auto no-scrollbar flex flex-col gap-4 text-left">
          
          {/* Main Title Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2.5">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider block font-bold leading-none mb-1">
                {trendData.category}
              </span>
              <h2 className="text-xl font-display font-black text-white tracking-tight leading-none mb-1 shadow-sm">
                {trendData.title}
              </h2>
              <p className="text-[10px] text-gray-400 mt-1 max-w-sm leading-relaxed font-medium">
                {trendData.description}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-col gap-1 md:items-end self-stretch md:self-auto px-3 py-2 bg-white/5 border border-white/10 rounded-2xl">
              <span className="text-[8px] font-mono text-gray-500 uppercase leading-none font-extrabold">Growth Index</span>
              <span className="text-sm font-mono font-black text-white leading-none mt-1">{trendData.volume24h}</span>
              <span className="text-[9px] font-mono text-[#A6E22E] font-bold mt-0.5">{trendData.growth}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Quick action buttons */}
            <button 
              onClick={() => {
                setHasFollowed(!hasFollowed);
              }}
              className={`py-2 px-3 border rounded-xl text-[9px] font-bold uppercase transition-all tracking-wider cursor-pointer flex items-center justify-center gap-1.5 ${
                hasFollowed 
                  ? 'bg-transparent border-white/15 text-gray-400' 
                  : trendData.isPink
                    ? 'bg-pink-500/10 border-pink-500/25 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)]'
                    : 'bg-cyan-500/10 border-cyan-400/25 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {hasFollowed ? 'Following Index Data' : 'Subscribe to Stream'}
            </button>

            <button 
              onClick={() => {
                if (onHashtagAutoInject) {
                  onHashtagAutoInject(trendData.title);
                  onClose();
                } else {
                  alert(`Copied "${trendData.title}" keyword! Create a post to engage this vector.`);
                }
              }}
              className="py-2 px-3 bg-gradient-to-tr from-cyan-400/20 to-pink-500/10 hover:from-cyan-400/30 hover:to-pink-500/20 border border-white/10 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Orbit className="w-3.5 h-3.5" />
              Inject Trend Anchor
            </button>
          </div>

          {/* RECHARTS AREA GRAPH */}
          <div className="bg-[#050b18]/70 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Search Velocity Graph (24H)
              </span>
              <span className="text-[7.5px] font-mono text-gray-400">INTERVAL: SECURE CLOUD SYNC</span>
            </div>

            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData.history}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={trendData.isPink ? '#ec4899' : '#22d3ee'} 
                        stopOpacity={0.25} 
                      />
                      <stop 
                        offset="95%" 
                        stopColor={trendData.isPink ? '#ec4899' : '#22d3ee'} 
                        stopOpacity={0.0} 
                      />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="hour" 
                    stroke="#4b5563" 
                    fontSize={7.5}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={7.5}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(2, 5, 16, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '8px',
                      color: '#fff',
                      boxShadow: '0 0 15px rgba(34, 211, 238, 0.15)'
                    }}
                    labelStyle={{ color: '#9ca3af', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke={trendData.isPink ? '#ec4899' : '#22d3ee'}
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#trendAreaFill)"
                    className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SENTIMENT ANALYSIS & ENGAGEMENT RATING */}
          <div className="bg-[#050b18]/70 border border-white/5 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-pink-500" /> Topic Sentiment & Node Score
            </span>
            
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Engagement Score Arc Ring */}
              <div className="flex flex-col items-center justify-center p-2 bg-black/45 border border-white/5 rounded-xl text-center">
                <span className="text-[8px] font-mono text-gray-400 uppercase">Engagement Rank</span>
                <span className="text-xl font-mono font-black text-white mt-1">{trendData.engagementScore}%</span>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-pink-500" 
                    style={{ width: `${trendData.engagementScore}%` }}
                  />
                </div>
              </div>

              {/* Segment Breakdowns */}
              <div className="flex flex-col gap-1.5">
                {trendData.sentiment.map((sent, sIdx) => (
                  <div key={sIdx} className="flex flex-col text-left">
                    <div className="flex justify-between items-center text-[8.5px] leading-tight">
                      <span className="text-gray-300 font-bold">{sent.label}</span>
                      <span className="font-mono text-white font-extrabold">{sent.percentage}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ backgroundColor: sent.color, width: `${sent.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RELATED STREAM POSTS */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono font-black text-gray-500 uppercase tracking-widest">
                Linked Network Coordinates
              </span>
              <span className="text-[8px] font-mono text-gray-500 uppercase">
                {trendData.relatedPosts.length} Node matches
              </span>
            </div>

            {trendData.relatedPosts.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-2xl py-8 text-center text-[10px] text-gray-550">
                No active related nodes synced. Be the first to publish a post under this anchor index!
              </div>
            ) : (
              trendData.relatedPosts.map((post) => (
                <div 
                  key={post.id}
                  className="bg-[#050b18]/80 border border-white/5 p-3 rounded-2xl flex flex-col gap-2.5 text-left transition-all hover:border-pink-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={post.avatar} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10" />
                      <div>
                        <span className="text-[9.5px] font-bold text-white block leading-none">{post.author}</span>
                        <span className="text-[7.5px] font-mono text-gray-500 block">@{post.username}</span>
                      </div>
                    </div>
                    <span className="text-[7.5px] font-mono text-gray-500">{post.timestamp}</span>
                  </div>

                  <p className="text-[9.5px] text-gray-300 leading-normal font-medium">
                    {post.content}
                  </p>

                  {post.media && (
                    <img 
                      src={post.media} 
                      className="w-full h-24 rounded-xl object-cover border border-white/10 mt-0.5" 
                    />
                  )}

                  <div className="flex items-center gap-4 text-[8px] font-mono text-gray-400 pt-1 border-t border-white/3">
                    <span className="flex items-center gap-1 hover:text-pink-500 transition-colors cursor-pointer">
                      <Heart className="w-3 h-3 fill-pink-500/10" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-cyan-400 transition-colors cursor-pointer">
                      <MessageCircle className="w-3 h-3" /> {post.comments}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer info banner */}
        <div className="bg-white/[0.01] border-t border-white/5 p-3 text-center text-[8px] text-gray-500 font-mono">
          ConnectX ledger index algorithms calibrate telemetry signals securely. Sync active.
        </div>

      </motion.div>
    </motion.div>
  );
};
