/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useConnectX } from '../utils/stateManager';
import { 
  Sparkles, Calendar, ShieldCheck, AlertCircle, BarChart3, Clock, 
  Send, Compass, CheckCircle2, RefreshCw
} from 'lucide-react';
import { MOCK_IMAGES } from '../utils/mockData';

export const CreatorStudio: React.FC = () => {
  const { posts, reels, videos } = useConnectX();

  const [activeTab, setActiveTab] = useState<'overview' | 'scheduler' | 'copyright'>('overview');
  
  // Scheduling state
  const [scheduledDrafts, setScheduledDrafts] = useState([
    { id: 1, title: 'Summer Cinematic Drone Vlog - 4K edit', type: 'video', time: 'June 10, 2026 - 06:00 PM' },
    { id: 2, title: 'Tech setup overhaul photoshoot (#mechanicalkeyboard)', type: 'post', time: 'June 12, 2026 - 10:00 AM' }
  ]);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftType, setDraftType] = useState('video');
  const [draftTime, setDraftTime] = useState('June 15, 2026 - 08:00 PM');

  // Copyright checking tool state
  const [checkingFile, setCheckingFile] = useState(false);
  const [checkResult, setCheckResult] = useState<{ status: 'idle' | 'scanning' | 'passed' | 'failed', message: string }>({ status: 'idle', message: '' });

  const handleCreateDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    setScheduledDrafts(prev => [
      ...prev,
      { id: Date.now(), title: draftTitle.trim(), type: draftType, time: draftTime }
    ]);
    setDraftTitle('');
    alert("Draft scheduled successfully! Credentials indexed.");
  };

  const handleCopyrightCheck = () => {
    setCheckResult({ status: 'scanning', message: "AES fingerprint scanner indexing metadata..." });
    setTimeout(() => {
      const items = [
        { status: 'passed' as const, message: "CRITICAL:_No licenses triggered._Clean. Safe for all worldwide advertisement monetization." },
        { status: 'passed' as const, message: "CRITICAL:_No matching profiles discovered._Passed copyright scans checks." },
        { status: 'failed' as const, message: "WARNING:_Licensed audioroll detected._'Priya Original' conflicts with international label registers. Manual approval or ad sharing required." }
      ];
      const selected = items[Math.floor(Math.random() * items.length)];
      setCheckResult(selected);
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-20 px-2 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 uppercase">Creator Ecosystem</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-500" /> Creator Studio
          </h2>
        </div>
      </div>

      {/* 2. CHOOSE ACTION TAB SWITCHERS */}
      <div className="grid grid-cols-3 gap-1 px-1 bg-neutral-950 rounded-xl border border-white/5 text-center">
        {(['overview', 'scheduler', 'copyright'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 rounded-lg text-3xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white/10 text-cyan-400 border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' ? 'Performance Insights' : tab === 'scheduler' ? 'Media Scheduler' : 'Copyright Audits'}
            </button>
          );
        })}
      </div>

      {/* 3. CONDITIONAL BODY CONTENT RENDERS */}
      <div className="flex flex-col gap-3">
        
        {/* TAB 1: CONTENT PERFORMANCE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4">
            
            <div className="grid grid-cols-3 gap-2 text-center text-white">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col gap-1 shadow-md">
                <BarChart3 className="w-5 h-5 text-cyan-400 mx-auto" />
                <span className="text-4xs text-gray-400 font-mono">AVG REACH RECIP</span>
                <span className="text-sm font-extrabold font-mono text-cyan-400">84.2%</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col gap-1 shadow-md">
                <Clock className="w-5 h-5 text-pink-400 mx-auto" />
                <span className="text-4xs text-gray-400 font-mono font-bold">WATCH_SECONDS</span>
                <span className="text-sm font-extrabold font-mono text-pink-400">42,520h</span>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col gap-1 shadow-md">
                <RefreshCw className="w-5 h-5 text-yellow-400 mx-auto" />
                <span className="text-4xs text-gray-400 font-mono">RETENTION</span>
                <span className="text-sm font-extrabold font-mono text-yellow-400">81.5%</span>
              </div>
            </div>

            {/* List of currently active creations and audit details */}
            <div className="glass-panel rounded-2xl p-4 border-white/10">
              <h3 className="text-xs font-bold text-white mb-3 text-left">Creations Analytics Logs</h3>
              <div className="flex flex-col gap-3">
                
                {videos.map(vid => (
                  <div key={vid.id} className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5 text-left">
                    <div className="overflow-hidden grow">
                      <span className="font-bold text-xs text-white truncate block">{vid.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{vid.category} • {vid.views.toLocaleString()} impressions</span>
                    </div>
                    <span className="text-3xs font-mono text-cyan-400 font-bold shrink-0 ml-4">
                      +{(vid.views * 0.05).toFixed(0)} reach
                    </span>
                  </div>
                ))}

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: POST / VIDEO SCHEDULER */}
        {activeTab === 'scheduler' && (
          <div className="glass-panel rounded-2xl p-5 border-white/10 flex flex-col gap-5 text-left">
            
            <div>
              <h3 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-400 font-bold" /> Schedule Publication
              </h3>
              <p className="text-[11px] text-gray-400">Lock and schedule automatically publishing long-form videos, reels, or photo text logs.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateDraft} className="flex flex-col gap-3.5 bg-black/45 p-4 rounded-xl border border-white/5">
              <div>
                <label className="text-4xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Creation Draft Title</label>
                <input
                  type="text"
                  placeholder="Ex: Cinematic Vlog Pt. III"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-4xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Type</label>
                  <select
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                    className="w-full py-2 px-2 bg-neutral-900 border border-white/10 text-white rounded-lg outline-none text-xs"
                  >
                    <option value="video">Long-Form Video</option>
                    <option value="reel">Reel (9:16)</option>
                    <option value="post">Image Post</option>
                  </select>
                </div>
                <div>
                  <label className="text-4xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Schedule date Time</label>
                  <input
                    type="text"
                    value={draftTime}
                    onChange={(e) => setDraftTime(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="py-2.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl text-white font-semibold hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer shadow-md"
              >
                Schedule Release
              </button>
            </form>

            {/* Listing Drafts */}
            <div className="mt-2 text-left">
              <span className="text-4xs font-mono font-bold text-gray-400 tracking-widest uppercase">Pending Draft Queue</span>
              <div className="flex flex-col gap-2 mt-2">
                {scheduledDrafts.map((draft) => (
                  <div key={draft.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-3 rounded-xl">
                    <div>
                      <div className="text-xs font-bold text-white">{draft.title}</div>
                      <span className="text-4xs font-mono text-gray-500">TYPE: {draft.type.toUpperCase()} • SCHEDULED TIME: {draft.time}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setScheduledDrafts(prev => prev.filter(d => d.id !== draft.id));
                        alert("Scheduled release removed successfully.");
                      }}
                      className="text-4xs font-semibold hover:text-red-400 text-gray-500"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: COPYRIGHT INTELLIGENCE scanner */}
        {activeTab === 'copyright' && (
          <div className="glass-panel rounded-2xl p-5 border-white/10 flex flex-col gap-4 text-left">
            
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Automated Copyright Intelligence
              </h3>
              <p className="text-[11px] text-gray-400">Scan metadata, audio feeds, and pixels of your scheduled file against international copyright registers.</p>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <span className="text-3xs font-mono text-gray-400 block mb-3.5 uppercase">Audit checking tools</span>
              
              <button
                onClick={handleCopyrightCheck}
                disabled={checkResult.status === 'scanning'}
                className="py-2.5 px-6 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-full active:scale-95 transition-all text-xs disabled:opacity-40"
              >
                {checkResult.status === 'scanning' ? 'Scanning Metadata...' : 'Scan Selected Files'}
              </button>

              {/* Checks response display panels */}
              {checkResult.status !== 'idle' && (
                <div className={`mt-5 p-3.5 rounded-xl border flex gap-3 text-left items-start ${
                  checkResult.status === 'scanning'
                    ? 'bg-blue-950/20 border-blue-500/25 text-blue-400'
                    : checkResult.status === 'passed'
                      ? 'bg-green-500/10 border-green-500/25 text-green-400'
                      : 'bg-red-500/10 border-red-500/25 text-red-400 animate-bounce'
                }`}>
                  {checkResult.status === 'scanning' ? (
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0 mt-0.5" />
                  ) : checkResult.status === 'passed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-3xs font-mono uppercase font-bold block mb-1">
                      {checkResult.status.toUpperCase()}
                    </span>
                    <p className="text-3xs leading-relaxed text-gray-200">{checkResult.message}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
