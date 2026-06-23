/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Rocket, Target, DollarSign, Users, Award, TrendingUp, CheckCircle, 
  MapPin, HelpCircle, Activity, Sparkles, Zap, ChevronRight, Plus
} from 'lucide-react';
import { FeedPost, Reel, YouTubeVideo, Story } from '../types';

interface PostPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItem: FeedPost | Reel | YouTubeVideo | Story | null;
  contentType: 'writeup' | 'post' | 'clip' | 'video' | 'story';
  onBoostComplete?: (postId: string, boostState: any) => void;
}

export const PostPromotionModal: React.FC<PostPromotionModalProps> = ({
  isOpen,
  onClose,
  contentItem,
  contentType,
  onBoostComplete,
}) => {
  const [isPromoting, setIsPromoting] = useState<boolean>(false);
  const [step, setStep] = useState<'setup' | 'tracking'>('setup');

  // Promotion Settings Configuration
  const [objective, setObjective] = useState<'reach' | 'views' | 'connects' | 'visits'>('reach');
  const [dailyBudget, setDailyBudget] = useState<number>(15);
  const [totalBudget, setTotalBudget] = useState<number>(105);
  const [location, setLocation] = useState<string>('San Francisco, New York, London');
  const [ageMin, setAgeMin] = useState<number>(18);
  const [ageMax, setAgeMax] = useState<number>(35);
  const [gender, setGender] = useState<'All' | 'Male' | 'Female'>('All');
  
  // Custom interactive interests selector
  const [availableInterests, setAvailableInterests] = useState<string[]>([
    'Cyberpunk', 'High-Fidelity Audio', 'Design Systems', 'AI Innovation', 
    'Cinematography', 'Mechanical Keyboards', 'Monetization Protocols', 'Indie-Hacker'
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Cyberpunk', 'AI Innovation']);
  const [customInterest, setCustomInterest] = useState<string>('');

  // Live Performance Tracking States
  const [impressions, setImpressions] = useState<number>(0);
  const [clicks, setClicks] = useState<number>(0);
  const [reach, setReach] = useState<number>(0);
  const [costPerClick, setCostPerClick] = useState<number>(0.24);

  // Check if this post is already boosted (restore state)
  useEffect(() => {
    if (isOpen && contentItem && contentItem.boosts) {
      const b = contentItem.boosts;
      if (b.active) {
        setObjective(b.targetObjective || 'reach');
        setDailyBudget(b.budgetDaily || 15);
        setTotalBudget(b.budgetTotal || 105);
        setStep('tracking');
        setImpressions(b.impressions || 1205);
        setClicks(b.clicks || 242);
        setReach(b.reach || 945);
        setCostPerClick(0.18 + Math.random() * 0.15);
      } else {
        setStep('setup');
      }
    } else {
      setStep('setup');
    }
  }, [isOpen, contentItem]);

  // Trickle performance counters in real-time when tracking is active
  useEffect(() => {
    if (step !== 'tracking' || !isOpen) return;

    const interval = setInterval(() => {
      // Rates based on target objective
      const clickRate = objective === 'connects' || objective === 'visits' ? 0.18 : 0.08;
      const progressFactor = Math.floor(Math.random() * 5) + 3;

      setImpressions(prev => prev + progressFactor);
      setReach(prev => prev + Math.floor(progressFactor * 0.85));
      setClicks(prev => prev + (Math.random() < clickRate ? 1 : 0));
    }, 2000);

    return () => clearInterval(interval);
  }, [step, objective, isOpen]);

  if (!isOpen || !contentItem) return null;

  // Add customized interest Tag handler
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleAddCustomInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInterest.trim()) return;
    const item = customInterest.trim();
    if (!availableInterests.includes(item)) {
      setAvailableInterests(prev => [...prev, item]);
    }
    if (!selectedInterests.includes(item)) {
      setSelectedInterests(prev => [...prev, item]);
    }
    setCustomInterest('');
  };

  // Launch Boost Simulation Handler
  const handleLaunchBoost = () => {
    setIsPromoting(true);
    
    // Smooth delay before launching Campaign
    setTimeout(() => {
      setIsPromoting(false);
      setStep('tracking');
      
      const initialImp = Math.floor(Math.random() * 300) + 150;
      const initialReach = Math.floor(initialImp * 0.85);
      const initialClicks = Math.floor(initialImp * 0.06);
      const computedCpc = 0.12 + (selectedInterests.length * 0.03) + (dailyBudget > 50 ? -0.02 : 0.05);

      setImpressions(initialImp);
      setReach(initialReach);
      setClicks(initialClicks);
      setCostPerClick(Number(computedCpc.toFixed(2)));

      if (onBoostComplete) {
        onBoostComplete(contentItem.id, {
          active: true,
          targetObjective: objective,
          budgetDaily: dailyBudget,
          budgetTotal: totalBudget,
          audience: { location, ageMin, ageMax, gender, selectedInterests },
          impressions: initialImp,
          clicks: initialClicks,
          reach: initialReach
        });
      }
    }, 1500);
  };

  // Terminate Active boost
  const handleStopBoost = () => {
    if (confirm("Are you sure you want to pause this active visual campaign allocation?")) {
      setStep('setup');
      if (onBoostComplete) {
        onBoostComplete(contentItem.id, {
          active: false
        });
      }
    }
  };

  // Live estimated reach formula based on daily budget
  const estimatedDailyReach = Math.floor(dailyBudget * 1450);
  const estimatedDailyConversiones = Math.floor(dailyBudget * 82);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="promotion-dashboard-root"
        className="relative bg-[#020512]/95 border border-pink-500/25 rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col"
      >
        {/* Apple liquid header */}
        <header className="sticky top-0 bg-[#020512]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400">
              <Rocket className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-pink-400 uppercase font-bold bg-pink-400/10 py-0.5 px-2 rounded border border-pink-400/10">
                  PROMOTION PROTOCOL
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                <span className="text-[8px] font-mono text-gray-500">ACTIVE INTEGRATION</span>
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-sm mt-0.5">
                Boost Content Hub System
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

        {/* Dynamic setup vs tracking screens */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {step === 'setup' ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="text-center max-w-md mx-auto mb-2">
                <h3 className="text-base font-extrabold text-white">Fuel Your Creative Node Reach</h3>
                <p className="text-[11px] text-gray-400 leading-normal mt-1">
                  Target precise age groups, locales, and interests with the unified cross-network liquid promotional layer.
                </p>
              </div>

              {/* SECTION A: Objective Selection */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-pink-400" /> Selected Campaign Objective
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  <button
                    type="button"
                    onClick={() => setObjective('reach')}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      objective === 'reach' 
                        ? 'bg-pink-500/10 border-pink-400 text-white shadow-lg' 
                        : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="block text-[8px] font-mono tracking-wider text-pink-400 font-extrabold uppercase text-left">VELOCITY</span>
                    <span className="text-xs font-bold text-white block mt-1.5 text-left">Increase Reach</span>
                    <span className="text-[8px] text-gray-500 text-left mt-1 block">Maximize broad view counts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('views')}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      objective === 'views' 
                        ? 'bg-pink-500/10 border-pink-400 text-white shadow-lg' 
                        : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="block text-[8px] font-mono tracking-wider text-pink-400 font-extrabold uppercase text-left">RETENTION</span>
                    <span className="text-xs font-bold text-white block mt-1.5 text-left">Increase Views</span>
                    <span className="text-[8px] text-gray-500 text-left mt-1 block">Boost watch index duration</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('connects')}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      objective === 'connects' 
                        ? 'bg-pink-500/10 border-pink-400 text-white shadow-lg' 
                        : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="block text-[8px] font-mono tracking-wider text-pink-400 font-extrabold uppercase text-left">NETWORK</span>
                    <span className="text-xs font-bold text-white block mt-1.5 text-left">Connect Leads</span>
                    <span className="text-[8px] text-gray-500 text-left mt-1 block">Drive connect action requests</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setObjective('visits')}
                    className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      objective === 'visits' 
                        ? 'bg-pink-500/10 border-pink-400 text-white shadow-lg' 
                        : 'bg-white/3 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="block text-[8px] font-mono tracking-wider text-pink-400 font-extrabold uppercase text-left">TRAFFIC</span>
                    <span className="text-xs font-bold text-white block mt-1.5 text-left">Profile Visits</span>
                    <span className="text-[8px] text-gray-500 text-left mt-1 block">Snoop traffic on your workspace</span>
                  </button>

                </div>
              </div>

              {/* SECTION B: Budgets & Conversions Estimates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Budget Selectors */}
                <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5 space-y-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-pink-400" /> Budget Allocation Rules
                  </span>

                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-1.5">
                      <span>Daily Budget</span>
                      <span className="text-white font-mono font-extrabold">${dailyBudget} / day</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="250" 
                      value={dailyBudget}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDailyBudget(val);
                        setTotalBudget(val * 7); // automatic estimate matching
                      }}
                      className="w-full accent-pink-500" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-300 mb-1.5">
                      <span>Total Budget Limit</span>
                      <span className="text-white font-mono font-extrabold">${totalBudget} total</span>
                    </div>
                    <input 
                      type="number" 
                      min={dailyBudget}
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(Number(e.target.value))}
                      className="w-full bg-black/45 border border-white/10 rounded-lg p-2 text-xs font-mono text-white mt-1" 
                    />
                  </div>

                </div>

                {/* Simulated Growth Estimations */}
                <div className="bg-[#ec4899]/5 border border-pink-500/20 rounded-[24px] p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-pink-400 tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Estimated Yield Projections
                    </span>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="block text-[8px] text-gray-400 font-mono uppercase">Daily Impressions</span>
                        <span className="text-lg font-black font-mono text-white mt-1 block">~{estimatedDailyReach.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-gray-400 font-mono uppercase">Estimated Actions</span>
                        <span className="text-lg font-black font-mono text-pink-400 mt-1 block">~{estimatedDailyConversiones.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[8.5px] text-gray-500 leading-normal font-medium mt-3">
                    Calculated in real-time based on your target profiles density indices. Actual results may shift due to viewer actions.
                  </p>
                </div>

              </div>

              {/* SECTION C: Target Audience Profile */}
              <div className="bg-white/[0.02] border border-white/8 rounded-[24px] p-5 space-y-4">
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pink-400" /> Target Audience Settings
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Location and Locale inputs */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Locations</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="USA, India, Berlin..." 
                        className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs text-white" 
                      />
                    </div>
                  </div>

                  {/* Range select for age */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Age Min & Max</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={ageMin} 
                        onChange={(e) => setAgeMin(Number(e.target.value))}
                        className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white text-center" 
                      />
                      <span className="text-gray-500 self-center">-</span>
                      <input 
                        type="number" 
                        value={ageMax} 
                        onChange={(e) => setAgeMax(Number(e.target.value))}
                        className="w-full bg-black/45 border border-white/10 rounded-xl p-2.5 text-xs font-mono text-white text-center" 
                      />
                    </div>
                  </div>

                  {/* Gender Selector tag */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 font-bold uppercase">Gender Selection</label>
                    <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/10">
                      {(['All', 'Male', 'Female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-1.5 text-[9px] font-bold rounded-lg ${
                            gender === g ? 'bg-pink-500 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Audience Interests Checklist Grid */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] text-gray-400 font-bold uppercase block">Target Audience Interests</label>
                  <div className="flex flex-wrap gap-1.5 bg-black/25 p-3 rounded-2xl border border-white/5 min-h-12">
                    {availableInterests.map((interest) => {
                      const selected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`text-[9px] font-mono py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                            selected 
                              ? 'bg-pink-500/15 border-pink-400/40 text-pink-300' 
                              : 'bg-white/3 border-white/5 text-gray-450 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {interest} {selected ? '✓' : '+'}
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleAddCustomInterest} className="flex gap-2">
                    <input 
                      type="text" 
                      value={customInterest}
                      onChange={(e) => setCustomInterest(e.target.value)}
                      placeholder="Add tag interest... (e.g. Design Systems)" 
                      className="grow bg-black/45 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" 
                    />
                    <button
                      type="submit"
                      className="py-2 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white rounded-xl active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-pink-400" /> Add
                    </button>
                  </form>
                </div>

              </div>

              {/* ACTION BUTTON */}
              <button
                type="button"
                onClick={handleLaunchBoost}
                disabled={isPromoting}
                className="w-full bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold p-4 rounded-2xl text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] duration-200 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isPromoting ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-white" />
                    <span>Allocating Nodes & Dispatching Ads Campaign...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 text-white" />
                    <span>Deploy Promotional Campaign • Total Limit: ${totalBudget}</span>
                  </>
                )}
              </button>

            </div>
          ) : (
            
            /* ACTIVE PROMOTION DASHBOARD TRACKER */
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              
              <div className="relative p-6 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 rounded-[32px] border border-pink-500/30 overflow-hidden shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] pointer-events-none" />
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                    <span className="text-[10px] font-mono tracking-widest text-pink-400 font-extrabold uppercase bg-pink-500/10 py-0.5 px-2.5 rounded border border-pink-400/20">
                      LEADER BOARD LIVE
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white mt-1.5 flex items-center gap-1.5">
                    Liquid Campaign Allocation is Active <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 leading-normal max-w-sm">
                    Targeted profile nodes are feeding real-time response impressions back into the core database.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleStopBoost}
                    className="py-2.5 px-4 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl text-2xs font-extrabold cursor-pointer active:scale-95 transition-all text-center"
                  >
                    Terminate Ad
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-2xs font-extrabold cursor-pointer active:scale-95 transition-all"
                  >
                    Keep Running
                  </button>
                </div>
              </div>

              {/* TRACKING PERFORMANCE CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[8px] uppercase font-mono font-bold text-gray-400 tracking-wider">Impressions Sinks</span>
                  <span className="text-xl font-black font-mono text-white block mt-2 animate-pulse">{impressions.toLocaleString()}</span>
                  <span className="text-[7.5px] text-gray-500 block mt-1.5 leading-normal">Interactive screen placements</span>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[8px] uppercase font-mono font-bold text-gray-400 tracking-wider">Engaged Clicks</span>
                  <span className="text-xl font-black font-mono text-pink-400 block mt-2">{clicks.toLocaleString()}</span>
                  <span className="text-[7.5px] text-pink-400/70 block mt-1.5 leading-normal">CTR: {((clicks / (impressions || 1)) * 100).toFixed(2)}%</span>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[8px] uppercase font-mono font-bold text-gray-400 tracking-wider">Cost Per Click (CPC)</span>
                  <span className="text-xl font-black font-mono text-[#a855f7] block mt-2">${costPerClick}</span>
                  <span className="text-[7.5px] text-purple-400/70 block mt-1.5 leading-normal">Indexed on interests weight</span>
                </div>

                <div className="bg-white/3 border border-white/8 p-4 rounded-2xl">
                  <span className="block text-[8px] uppercase font-mono font-bold text-gray-400 tracking-wider">Direct Reach Reach</span>
                  <span className="text-xl font-black font-mono text-cyan-400 block mt-2">{reach.toLocaleString()}</span>
                  <span className="text-[7.5px] text-cyan-400/75 block mt-1.5 leading-normal">Unique profile audience pools</span>
                </div>

              </div>

              {/* SINK TRAFFIC DETAILS */}
              <div className="bg-black/55 border border-white/10 rounded-[32px] p-5 space-y-3.5">
                <span className="text-[10px] uppercase font-mono font-extrabold text-pink-400 tracking-wider block border-b border-white/5 pb-2">Active Campaign Audience Details</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Daily Budget Feed:</span>
                      <span className="text-white font-mono font-bold">${dailyBudget}</span>
                    </div>
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Total Budget Max:</span>
                      <span className="text-white font-mono font-bold">${totalBudget}</span>
                    </div>
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Target Age Boundaries:</span>
                      <span className="text-white font-mono font-bold">{ageMin} - {ageMax} yrs</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Selected Locations:</span>
                      <span className="text-white font-bold max-w-xs truncate">{location}</span>
                    </div>
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Interests Weights:</span>
                      <span className="text-white font-bold">{selectedInterests.length} selected</span>
                    </div>
                    <div className="flex justify-between py-1 bg-white/3 px-2 rounded font-medium text-gray-300">
                      <span>Budget Spent Estimate:</span>
                      <span className="text-pink-400 font-mono font-black">${Math.min(totalBudget, Number((clicks * costPerClick).toFixed(2)))}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Liquid design legal terms note */}
        <footer className="bg-[#020512] px-6 py-4 border-t border-white/5 text-[9px] text-gray-500 font-mono text-center">
          Boost operations use secure digital currency simulations. Live counts synced instantly with local cache. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
