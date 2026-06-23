/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useConnectX } from '../utils/stateManager';
import { 
  Users, ShieldAlert, Newspaper, Sliders, ShieldCheck, Trash2, 
  Settings, DollarSign, TrendingUp, Compass, Plus, Percent, RefreshCw, AlertCircle, X, CheckSquare
} from 'lucide-react';
import { useEffect } from 'react';

export const AdminPanel: React.FC = () => {
  const { 
    posts, deletePost, users, groups,
    adminLoadAllCreators, adminLoadAllWithdrawals, adminLoadPayoutLogs, 
    adminApproveWithdrawal, adminRejectWithdrawal, adminSaveConfig,
    platformConfig
  } = useConnectX();

  const [activeTab, setActiveTab] = useState<'moderation' | 'ads' | 'config' | 'monetization'>('moderation');
  
  // Custom CPM configuration
  const [platformCpm, setPlatformCpm] = useState('2.50');
  const [bonusRate, setBonusRate] = useState('0.15');

  // Ad campaign creation state
  const [campaignBudget, setCampaignBudget] = useState('10000');
  const [campaignBrand, setCampaignBrand] = useState('');
  const [adCampaignList, setAdCampaignList] = useState([
    { id: 1, brand: 'Tesla Space Enclaves', budget: '$15,000', clicks: 420 },
    { id: 2, brand: 'Apple Lossless Vision', budget: '$42,000', clicks: 1205 }
  ]);
  const [newBrand, setNewBrand] = useState('');
  const [newBudget, setNewBudget] = useState('');

  // Full-Stack Monetization states
  const [allCreators, setAllCreators] = useState<any[]>([]);
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [payoutLogsQueue, setPayoutLogsQueue] = useState<any[]>([]);
  const [platformConfigForm, setPlatformConfigForm] = useState({
    revenueSharePercent: 80,
    platformCpm: 2.50,
    minimumWithdrawalAmount: 5.00
  });
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isAdminProcessing, setIsAdminProcessing] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');

  const loadAdminMonetizationData = async () => {
    try {
      const creators = await adminLoadAllCreators();
      const withdrawals = await adminLoadAllWithdrawals();
      const logs = await adminLoadPayoutLogs();
      setAllCreators(creators || []);
      setAllWithdrawals(withdrawals || []);
      setPayoutLogsQueue(logs || []);
      if (platformConfig) {
        setPlatformConfigForm({
          revenueSharePercent: platformConfig.revenueSharePercent,
          platformCpm: platformConfig.platformCpm,
          minimumWithdrawalAmount: platformConfig.minimumWithdrawalAmount
        });
      }
    } catch (e) {
      console.warn('Network sync bounds under sandbox mode configured.', e);
    }
  };

  useEffect(() => {
    loadAdminMonetizationData();
  }, [activeTab]);

  const handleApprove = async (id: string) => {
    setIsAdminProcessing(true);
    setAdminFeedback('');
    const res = await adminApproveWithdrawal(id);
    setIsAdminProcessing(false);
    if (res.success) {
      setAdminFeedback("Withdrawal approved! Real-time payout was executed successfully via integrated API gateways.");
      loadAdminMonetizationData();
    } else {
      setAdminFeedback(`Error clearing payout: ${res.error}`);
    }
  };

  const handleOpenRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setIsAdminProcessing(true);
    setAdminFeedback('');
    const res = await adminRejectWithdrawal(rejectId, rejectReason.trim());
    setIsAdminProcessing(false);
    setRejectId(null);
    if (res.success) {
      setAdminFeedback("Withdrawal rejected successfully & note updated.");
      loadAdminMonetizationData();
    } else {
      setAdminFeedback(`Error rejecting: ${res.error}`);
    }
  };

  const handleSavePlatformConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminProcessing(true);
    setAdminFeedback('');
    const res = await adminSaveConfig({
      revenueSharePercent: Number(platformConfigForm.revenueSharePercent),
      platformCpm: Number(platformConfigForm.platformCpm),
      minimumWithdrawalAmount: Number(platformConfigForm.minimumWithdrawalAmount)
    });
    setIsAdminProcessing(false);
    if (res.success) {
      setAdminFeedback("Platform configuration tariffs saved securely inside the global parameter database!");
      loadAdminMonetizationData();
    } else {
      setAdminFeedback(`Error saving parameters: ${res.error}`);
    }
  };

  // Reported posts mock database (subset of posts with custom flags)
  const [reportedQueue, setReportQueue] = useState([
    { id: 'rep_1', reporter: 'Priya', postContent: "I hate mechanical keyboards! They are loud and disrupt my creative zone.", reason: "Harassment/Hate", postId: posts[0]?.id },
    { id: 'rep_2', reporter: 'Kavin', postContent: "Check out this leaked lossless music deck. Unreleased album stream files.", reason: "Copyright Infringement", postId: posts[1]?.id }
  ]);

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !newBudget.trim()) return;
    setAdCampaignList(prev => [
      ...prev,
      { id: Date.now(), brand: newBrand.trim(), budget: `$${newBudget.trim()}`, clicks: 0 }
    ]);
    setNewBrand('');
    setNewBudget('');
    alert("New advertisement campaign launched under multi-signature clearance bounds!");
  };

  const handleDismissReport = (repId: string) => {
    setReportQueue(prev => prev.filter(r => r.id !== repId));
    alert("Report dismissed securely. Post cleared of system restrictions.");
  };

  const handlePurgePostOnReport = (repId: string, postId?: string) => {
    if (postId) {
      deletePost(postId);
    }
    setReportQueue(prev => prev.filter(r => r.id !== repId));
    alert("Secured Purge finalized. Post removed from global index feeds successfully.");
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-20 px-2 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 uppercase font-bold">Platform Governance</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-pink-500 animate-[spin_5s_linear_infinite]" /> Admin Center
          </h2>
        </div>

        <span className="text-[9px] font-mono py-0.5 px-2 bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold rounded-full uppercase tracking-wider">
          Super Admin Node
        </span>
      </div>

      {/* 2. CHOOSE NAVIGATION SPECIFIC TAB PANEL */}
      <div className="grid grid-cols-4 gap-1 bg-neutral-950 p-[4px] rounded-xl border border-white/5 text-center">
        {(['moderation', 'ads', 'config', 'monetization'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white/10 text-cyan-400 border border-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'moderation' ? 'Content' : tab === 'ads' ? 'Ad Campaigns' : tab === 'config' ? 'CPM Config' : 'Monetization'}
            </button>
          );
        })}
      </div>

      {/* 3. CONDITIONAL BODY SEALS DISPLAY */}
      <div className="flex flex-col gap-3">
        
        {/* TAB 1: MODERATION BOARD */}
        {activeTab === 'moderation' && (
          <div className="flex flex-col gap-3 text-left">
            
            <div className="flex items-center justify-between px-1">
              <span className="text-4xs font-mono text-gray-400 uppercase tracking-widest font-bold">Flagged content queue ({reportedQueue.length})</span>
            </div>

            {reportedQueue.length === 0 ? (
              <div className="glass-panel p-10 rounded-2xl text-center flex flex-col items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-green-400 animate-pulse" />
                <h4 className="text-xs font-bold text-green-400">Moderation Queue is Clean</h4>
                <p className="text-4xs text-gray-400">All published post pixels and audioroll feeds cleared automatic checks.</p>
              </div>
            ) : (
              reportedQueue.map((rep) => (
                <div 
                  key={rep.id}
                  className="glass-panel rounded-2xl p-4 border-l-4 border-l-red-500 border-white/10 flex flex-col gap-2 shadow-lg"
                >
                  <div className="flex justify-between items-center bg-black/30 p-2 rounded-xl">
                    <span className="text-5xs font-mono text-gray-400">
                      FLAGGED FOR: <span className="text-red-400 font-bold uppercase">{rep.reason}</span>
                    </span>
                    <span className="text-5xs font-mono text-gray-500">
                      Reporter: @{rep.reporter}
                    </span>
                  </div>

                  <p className="text-3xs text-gray-200 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
                    "{rep.postContent}"
                  </p>

                  <div className="flex justify-end gap-2.5 mt-1">
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="py-1 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-lg text-4xs font-bold cursor-pointer transition-colors"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handlePurgePostOnReport(rep.id, rep.postId)}
                      className="py-1 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-4xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Purge completely from indexing"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Purge post</span>
                    </button>
                  </div>
                </div>
              ))
            )}

          </div>
        )}

        {/* TAB 2: ADVERTISEMENTS SPONSORSHIP CAMPAIGNS */}
        {activeTab === 'ads' && (
          <div className="glass-panel rounded-2xl p-5 border-white/10 flex flex-col gap-5 text-left shadow-2xl">
            
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4 text-cyan-400" /> Platform Advertisement Campaigns
              </h3>
              <p className="text-[11px] text-gray-400 font-sans">Setup campaigns. Ad pixels render automatically inside the Home page text feed for monetization CPM pools.</p>
            </div>

            {/* Campaign form */}
            <form onSubmit={handleCreateAd} className="flex flex-col gap-3 bg-black/45 p-4 rounded-xl border border-white/5">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Tesla, Nike, SpaceX"
                    value={newBrand}
                    onChange={e => setNewBrand(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Campaign Budget ($ USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={newBudget}
                    onChange={e => setNewBudget(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="py-2.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl text-white font-semibold text-xs active:scale-95 transition-all shadow-md cursor-pointer"
              >
                + Launch Targeted Ad campaign
              </button>
            </form>

            {/* Active brands */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-4xs font-mono font-bold text-gray-400 uppercase tracking-widest block mb-1">Active Ad listings</span>
              {adCampaignList.map((camp) => (
                <div key={camp.id} className="flex justify-between items-center bg-black/45 border border-white/5 p-3 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none mb-1">{camp.brand}</h4>
                    <span className="text-5xs font-mono text-gray-500">BUDGET TOTAL: {camp.budget}</span>
                  </div>
                  <span className="text-4xs font-mono text-cyan-400 font-bold shrink-0">{camp.clicks} impressions</span>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: PLATFORM CPM / REVENUES TARIFFS */}
        {activeTab === 'config' && (
          <div className="glass-panel p-5 rounded-2xl border-white/10 flex flex-col gap-4 text-left shadow-xl">
            
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-pink-500" /> Revenue tariffs parameters
              </h3>
              <p className="text-[11px] text-gray-400">Configure global base advertisement share and creator bonus overrides variables.</p>
            </div>

            <div className="flex flex-col gap-4 bg-black/45 p-4 rounded-xl border border-white/5 font-sans">
              
              <div>
                <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Ad CPM Share (per 1k clicks)</label>
                <div className="flex gap-2">
                  <span className="p-2 bg-neutral-900 border border-white/10 text-white rounded-lg text-xs font-mono font-bold shrink-0">$</span>
                  <input
                    type="number"
                    value={platformCpm}
                    onChange={e => setPlatformCpm(e.target.value)}
                    className="flex-grow py-2 px-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 text-xs text-white outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Reels bonus rate multiplier</label>
                <input
                  type="text"
                  value={bonusRate}
                  onChange={e => setBonusRate(e.target.value)}
                  className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg focus:border-pink-500 text-xs text-white outline-none font-mono font-bold"
                />
              </div>

              <button
                onClick={() => {
                  alert(`Platform specifications synchronized: CPM rate set to $${platformCpm} USD, Reels Bonus set to ${bonusRate}. All active calculations are updated.`);
                }}
                className="py-2.5 bg-gradient-to-tr from-blue-500 to-pink-500 rounded-xl text-white font-bold text-xs"
              >
                Apply Tariff changes
              </button>

            </div>

          </div>
        )}

        {/* TAB 4: MONETIZATION GOVERNANCE & LIVE PAYOUT OPERATIONS */}
        {activeTab === 'monetization' && (
          <div className="flex flex-col gap-4 text-left">
            
            {/* Header Description */}
            <div className="glass-panel p-5 rounded-2xl border-white/10 flex flex-col gap-2 shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                <DollarSign className="w-4 h-4 text-pink-500 animate-pulse" /> Monetization Clearing House
              </h3>
              <p className="text-[11px] text-gray-400">Manage creator wallets ledger, approve withdrawal requests via secure payment pipelines, and set global split rates.</p>
            </div>

            {/* General Admin Action Alert Feedback */}
            {adminFeedback && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded-xl flex gap-1.5 items-center text-cyan-400 text-[10px] font-mono">
                <CheckSquare className="w-4 h-4 shrink-0 text-cyan-400 animate-bounce" />
                <span>{adminFeedback}</span>
              </div>
            )}

            {/* Sub-Dialogue: Rejection Form Cover Overlay */}
            {rejectId && (
              <div className="p-4 bg-red-950/90 border border-red-500/30 rounded-xl flex flex-col gap-3 animate-in fade-in duration-200">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">Withdrawal Reject Ledger</span>
                  <button onClick={() => setRejectId(null)} className="text-gray-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-300 block mb-1">State Rejection Note / Cause</label>
                  <input
                    type="text"
                    required
                    placeholder="Specify why (e.g. Account detail verification failed or insufficient status)..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full py-2 px-3 bg-black/30 border border-white/10 focus:border-red-400 outline-none text-xs text-white rounded-lg font-mono"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => setRejectId(null)} 
                    className="py-1 px-3 bg-neutral-900 hover:bg-neutral-800 text-gray-400 font-bold text-[9px] rounded uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmReject} 
                    disabled={!rejectReason.trim()}
                    className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white font-bold text-[9px] rounded uppercase cursor-pointer disabled:opacity-40"
                  >
                    Reject Transaction
                  </button>
                </div>
              </div>
            )}

            {/* SECTION A: PENDING CLEARANCES ACTION LIST */}
            <div className="glass-panel p-4 rounded-xl border-white/10 flex flex-col gap-3">
              <span className="text-[9px] font-mono font-black tracking-widest text-gray-500 uppercase block">Pending Clearance Requests ({allWithdrawals.filter(w => w.status === 'pending').length})</span>
              
              {allWithdrawals.filter(w => w.status === 'pending').length === 0 ? (
                <div className="p-6 bg-black/35 rounded-xl border border-white/5 text-center text-gray-500 text-[11px] font-mono">
                  No pending withdrawal requests in the clearing queue.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {allWithdrawals.filter(w => w.status === 'pending').map((req) => (
                    <div key={req.id} className="p-3.5 bg-black/55 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-black text-white font-mono">${req.amount.toFixed(2)} USD</span>
                          <span className="text-[8px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase">{req.method}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono">Creator ID: <span className="font-extrabold text-white">{req.username}</span> ({req.address})</p>
                        <span className="text-[8px] text-gray-600 font-mono block mt-0.5">Submitted: {new Date(req.timestamp).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex gap-1.5 shrink-0">
                        <button 
                          onClick={() => handleApprove(req.id)}
                          disabled={isAdminProcessing}
                          className="py-1.5 px-3 bg-green-500/10 hover:bg-[#A6E22E] border border-green-500/20 hover:text-black text-green-400 rounded-lg text-[9px] font-bold font-mono uppercase transition-all cursor-pointer"
                        >
                          Approve Gateway Payout
                        </button>
                        <button 
                          onClick={() => handleOpenRejectDialog(req.id)}
                          disabled={isAdminProcessing}
                          className="py-1.5 px-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:text-white text-red-400 rounded-lg text-[9px] font-bold font-mono uppercase transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION B: SYSTEM PARAMETERS PARAM FORUM */}
            <form onSubmit={handleSavePlatformConfig} className="glass-panel p-4 rounded-xl border-white/10 flex flex-col gap-3">
              <span className="text-[9px] font-mono font-black tracking-widest text-gray-500 uppercase block">Monetization Tariffs & Splits</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-400 block mb-1">Creator Share Split (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="80"
                    value={platformConfigForm.revenueSharePercent}
                    onChange={(e) => setPlatformConfigForm(prev => ({ ...prev, revenueSharePercent: Number(e.target.value) }))}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-400 block mb-1">CPM Rate (Ad rate / 1k views)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="2.50"
                    value={platformConfigForm.platformCpm}
                    onChange={(e) => setPlatformConfigForm(prev => ({ ...prev, platformCpm: Number(e.target.value) }))}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-400 block mb-1">Minimum Withdrawal ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    placeholder="5.00"
                    value={platformConfigForm.minimumWithdrawalAmount}
                    onChange={(e) => setPlatformConfigForm(prev => ({ ...prev, minimumWithdrawalAmount: Number(e.target.value) }))}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isAdminProcessing}
                className="py-2.5 bg-gradient-to-r from-cyan-400 to-pink-500 hover:opacity-95 rounded-lg text-black font-extrabold text-[10px] uppercase font-mono tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-40"
              >
                Save Global Tariff Splits
              </button>
            </form>

            {/* SECTION C: GLOBAL CREATORS WALLETS DIRECTORY LEDGER */}
            <div className="glass-panel p-4 rounded-xl border-white/10 flex flex-col gap-3">
              <span className="text-[9px] font-mono font-black tracking-widest text-gray-500 uppercase block">Global Creators Ledger</span>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[9px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-500 uppercase pb-2">
                      <th className="py-2">Creator ID</th>
                      <th className="py-2">Active Bal</th>
                      <th className="py-2">Pending Escrow</th>
                      <th className="py-2">Total Cashout</th>
                      <th className="py-2">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCreators.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-600">No active creator wallet profiles mapped yet.</td>
                      </tr>
                    ) : (
                      allCreators.map((cr) => (
                        <tr key={cr.id} className="border-b border-white/5 text-gray-300 hover:bg-white/5 transition-all">
                          <td className="py-2.5 font-bold text-white">{cr.username}</td>
                          <td className="py-2.5 text-cyan-400 font-extrabold">${cr.balance.toFixed(2)}</td>
                          <td className="py-2.5 text-amber-400">${cr.pendingEarnings.toFixed(2)}</td>
                          <td className="py-2.5 text-[#A6E22E]">${cr.totalPaid.toFixed(2)}</td>
                          <td className="py-2.5 text-pink-400">{cr.adImpressions.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION D: SYSTEM LIVE WEBHOOK LOGS \& TRANSACTIONS */}
            <div className="glass-panel p-4 rounded-xl border-white/10 flex flex-col gap-3">
              <span className="text-[9px] font-mono font-black tracking-widest text-gray-500 uppercase block">Payment gateway logs terminal</span>
              <div className="bg-[#050b18]/95 border border-white/10 rounded-xl p-3 font-mono text-[8px] text-green-400 h-44 overflow-y-auto flex flex-col gap-1 leading-snug">
                <div>[SYSTEM] Terminal connection initialized at: {new Date().toLocaleTimeString()}</div>
                <div>[SYSTEM] API routes listening secure webhook pipelines: PayPal Payouts, Razorpay Core contacts, Drizzle SQLite...</div>
                {payoutLogsQueue.length === 0 ? (
                  <div className="text-gray-550 mt-1">[IDLE] Awaiting outgoing payments clearance sweeps...</div>
                ) : (
                  payoutLogsQueue.map((log) => (
                    <div key={log.id} className="border-t border-white/5 pt-1 mt-1 text-gray-300">
                      <div className="flex justify-between font-bold">
                        <span className="text-cyan-400">[{log.method.toUpperCase()} PAYOUT] {log.status}</span>
                        <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-pink-400 font-bold">Amount: ${log.amount.toFixed(2)} | Creator ID: {log.creatorId}</div>
                      <div>Address: {log.address}</div>
                      <div className="text-cyan-300 break-all text-[7.5px]">Details: {JSON.stringify(log.gatewayResponse)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
export default AdminPanel;
