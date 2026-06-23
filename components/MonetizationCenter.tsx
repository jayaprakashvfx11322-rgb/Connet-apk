/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useConnectX } from '../utils/stateManager';
import { 
  DollarSign, Landmark, CreditCard, Send, Sparkles, TrendingUp,
  AlertCircle, ShieldCheck, Gift, Award, Share2, ArrowLeft, ChevronDown, Download, RefreshCw
} from 'lucide-react';
import * as d3 from 'd3';

interface ChartDataPoint {
  day: number;
  date: Date;
  followers: number;
  engagement: number;
}

// Interactive real-time D3 line chart with Liquid Glass aesthetic
const D3RealtimeLineChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(() => {
    const data: ChartDataPoint[] = [];
    const startDay = new Date();
    startDay.setDate(startDay.getDate() - 30);
    
    let currentFollowers = 18450;
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDay);
      date.setDate(date.getDate() + i);
      
      const growth = Math.floor(Math.random() * 80) + 25;
      currentFollowers += growth;
      
      const engagement = Math.floor(Math.random() * 1000) + 800;
      data.push({
        day: i + 1,
        date,
        followers: currentFollowers,
        engagement
      });
    }
    return data;
  });

  const [selectedMetric, setSelectedMetric] = useState<'followers' | 'engagement' | 'both'>('both');
  const [livePulse, setLivePulse] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 500, height: 185 });
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const exportToCSV = () => {
    try {
      const headers = ['Date', 'Followers', 'Daily Engagement (Reacts)', 'Day'];
      const rows = chartData.map(d => {
        const formattedDate = d.date.toISOString().split('T')[0];
        return [formattedDate, d.followers, d.engagement, d.day];
      });
      const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `connectx_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export CSV archive:', err);
    }
  };

  // Resize container tracking
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDims({
            width: entry.contentRect.width,
            height: 185
          });
        }
      }
    });
    observer.observe(chartContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Live real-time tick updates simulating dynamic metrics increment
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (!last) return prev;
        
        const nextDate = new Date(last.date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const growth = Math.floor(Math.random() * 110) + 30;
        const nextFollowers = last.followers + growth;
        
        const baseEng = last.engagement;
        const dev = Math.floor(Math.random() * 240) - 120;
        const nextEng = Math.max(600, Math.min(2800, baseEng + dev));
        
        next.shift();
        next.push({
          day: last.day + 1,
          date: nextDate,
          followers: nextFollowers,
          engagement: nextEng
        });
        return next;
      });
      
      setLivePulse(true);
      const timer = setTimeout(() => setLivePulse(false), 900);
      return () => clearTimeout(timer);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const d3Margin = { top: 18, right: 35, bottom: 20, left: 35 };
  const plotWidth = Math.max(55, dims.width - d3Margin.left - d3Margin.right);
  const plotHeight = Math.max(55, dims.height - d3Margin.top - d3Margin.bottom);

  // Generate scales securely with D3 calculations
  const minDate = chartData[0]?.date || new Date();
  const maxDate = chartData[chartData.length - 1]?.date || new Date();

  const d3XScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([0, plotWidth]);

  const minFollowers = d3.min(chartData, (d: ChartDataPoint) => d.followers) as number || 18450;
  const maxFollowers = d3.max(chartData, (d: ChartDataPoint) => d.followers) as number || 23000;
  const d3YFollowers = d3.scaleLinear()
    .domain([minFollowers * 0.995, maxFollowers * 1.005])
    .range([plotHeight, 0]);

  const minEngagement = d3.min(chartData, (d: ChartDataPoint) => d.engagement) as number || 700;
  const maxEngagement = d3.max(chartData, (d: ChartDataPoint) => d.engagement) as number || 2200;
  const d3YEngagement = d3.scaleLinear()
    .domain([minEngagement * 0.95, maxEngagement * 1.05])
    .range([plotHeight, 0]);

  // Curve paths mappings
  const followersLine = d3.line<ChartDataPoint>()
    .x(d => d3XScale(d.date))
    .y(d => d3YFollowers(d.followers))
    .curve(d3.curveMonotoneX)(chartData) || '';

  const engagementLine = d3.line<ChartDataPoint>()
    .x(d => d3XScale(d.date))
    .y(d => d3YEngagement(d.engagement))
    .curve(d3.curveMonotoneX)(chartData) || '';

  const followersArea = d3.area<ChartDataPoint>()
    .x(d => d3XScale(d.date))
    .y0(plotHeight)
    .y1(d => d3YFollowers(d.followers))
    .curve(d3.curveMonotoneX)(chartData) || '';

  const engagementArea = d3.area<ChartDataPoint>()
    .x(d => d3XScale(d.date))
    .y0(plotHeight)
    .y1(d => d3YEngagement(d.engagement))
    .curve(d3.curveMonotoneX)(chartData) || '';

  // Tick generator
  const d3XTicks = d3XScale.ticks(Math.max(2, Math.floor(dims.width / 110)));
  const d3YFollowerTicks = d3YFollowers.ticks(4);
  const d3YEngagementTicks = d3YEngagement.ticks(4);

  const dateFormatter = d3.timeFormat('%m/%d');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (chartData.length === 0) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left - d3Margin.left;
    
    if (mouseX < 0 || mouseX > plotWidth) {
      setHoveredPoint(null);
      return;
    }
    
    const hoverDate = d3XScale.invert(mouseX);
    const bisect = d3.bisector((d: ChartDataPoint) => d.date).left;
    const idx = bisect(chartData, hoverDate, 1);
    const p0 = chartData[idx - 1];
    const p1 = chartData[idx];
    
    let closest = p0;
    if (p1 && p0) {
      closest = (hoverDate.getTime() - p0.date.getTime() > p1.date.getTime() - hoverDate.getTime()) ? p1 : p0;
    }
    
    if (closest) {
      setHoveredPoint(closest);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const latestPoint = chartData[chartData.length - 1];

  return (
    <div className="flex flex-col gap-3 w-full bg-gradient-to-tr from-[#050b18]/80 to-neutral-950 border border-white/5 rounded-2xl p-4 relative overflow-hidden text-left shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      {/* Glossy highlight bar */}
      <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      
      {/* Top Controls Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 ${livePulse ? 'scale-150' : ''}`}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#22D3EE] font-black uppercase">LIVE SPECTRAL METRICS</span>
            {exportSuccess && (
              <span className="text-[9px] font-mono text-cyan-400 font-extrabold ml-2.5 animate-pulse select-none">✦ CSV EXPORTED!</span>
            )}
          </div>
          <p className="text-[8px] font-mono text-gray-500 tracking-wider">30-DAY FOLLOWER GROWTH & DAILY ENGAGEMENT ACTIVITY</p>
        </div>

        {/* Dynamic Metric Toggles & Export Option */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <div className="flex gap-1">
            {[
              { id: 'followers', label: 'Followers' },
              { id: 'engagement', label: 'Reacts' },
              { id: 'both', label: 'Dual Axis' }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedMetric(opt.id as any)}
                className={`p-1 px-2.5 rounded-lg border text-[8.5px] font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  selectedMetric === opt.id
                    ? 'bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-cyan-400/30 text-white shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                    : 'bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            title="Download CSV Analytics"
            className="p-1 px-2.5 rounded-lg border border-pink-500/30 bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 hover:text-pink-300 text-[8.5px] font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1 shadow-[0_0_8px_rgba(236,72,153,0.1)] hover:scale-105 active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Numerical Insights Board */}
      <div className="grid grid-cols-2 gap-4 bg-black/30 p-2.5 rounded-xl border border-white/5">
        <div>
          <span className="text-[7.5px] font-mono text-gray-500 uppercase font-black block leading-none">Total Follower Base</span>
          <span className="text-sm font-mono font-black text-cyan-400 block mt-1.5">
            👥 {latestPoint ? d3.format(',')(latestPoint.followers) : '22,410'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[7.5px] font-mono text-gray-500 uppercase font-black block leading-none">Activity Velocity</span>
          <span className="text-sm font-mono font-black text-pink-400 block mt-1.5">
            🔥 {latestPoint ? d3.format(',')(latestPoint.engagement) : '1,500'}
          </span>
        </div>
      </div>

      {/* SVG Axis / Line Plot Canvas */}
      <div ref={chartContainerRef} className="w-full relative min-h-[185px] mt-1 select-none">
        
        <svg 
          width={dims.width} 
          height={dims.height} 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="followerGlowArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0"/>
            </linearGradient>

            <linearGradient id="engagementGlowArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.12"/>
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0"/>
            </linearGradient>

            <linearGradient id="tooltipGlowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22D3EE"/>
              <stop offset="50%" stopColor="#8B5CF6"/>
              <stop offset="100%" stopColor="#ec4899"/>
            </linearGradient>

            {/* Glowing lines filters */}
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            <filter id="pinkGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines intersection X index */}
          <g transform={`translate(${d3Margin.left}, ${d3Margin.top + plotHeight})`}>
            {d3XTicks.map((tick, i) => {
              const xCoord = d3XScale(tick);
              return (
                <g key={i} className="text-[7px] font-mono fill-gray-500">
                  <text x={xCoord} y={13} textAnchor="middle" className="fill-gray-500 select-none">
                    {dateFormatter(tick)}
                  </text>
                  <line x1={xCoord} y1={0} x2={xCoord} y2={-plotHeight} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3,3" />
                </g>
              );
            })}
          </g>

          {/* Y Axis Left - Followers */}
          {(selectedMetric === 'followers' || selectedMetric === 'both') && (
            <g transform={`translate(${d3Margin.left}, ${d3Margin.top})`}>
              {d3YFollowerTicks.map((tick, i) => {
                const yCoord = d3YFollowers(tick);
                return (
                  <g key={i} className="text-[6.5px] font-mono">
                    <text x={-5} y={yCoord + 2} textAnchor="end" className="fill-cyan-400/80 font-bold select-none">
                      {d3.format('~s')(tick)}
                    </text>
                    <line x1={0} y1={yCoord} x2={plotWidth} y2={yCoord} stroke="rgba(6, 182, 212, 0.03)" />
                  </g>
                );
              })}
              <text x={-d3Margin.left + 5} y={-4} className="text-[6.5px] font-mono fill-cyan-400 uppercase select-none font-black tracking-wider text-left">
                Followers
              </text>
            </g>
          )}

          {/* Y Axis Right - Engagement */}
          {(selectedMetric === 'engagement' || selectedMetric === 'both') && (
            <g transform={`translate(${d3Margin.left + plotWidth}, ${d3Margin.top})`}>
              {d3YEngagementTicks.map((tick, i) => {
                const yCoord = d3YEngagement(tick);
                return (
                  <g key={i} className="text-[6.5px] font-mono">
                    <text x={5} y={yCoord + 2} textAnchor="start" className="fill-pink-400/80 font-bold select-none">
                      {d3.format('~s')(tick)}
                    </text>
                    {selectedMetric === 'engagement' && (
                      <line x1={-plotWidth} y1={yCoord} x2={0} y2={yCoord} stroke="rgba(236, 72, 153, 0.03)" />
                    )}
                  </g>
                );
              })}
              <text x={12} y={-4} className="text-[6.5px] font-mono fill-pink-400 uppercase select-none font-black tracking-wider text-right">
                Reacts
              </text>
            </g>
          )}

          {/* Interactive Plot Paths */}
          <g transform={`translate(${d3Margin.left}, ${d3Margin.top})`}>
            
            {/* Followers Area & Line */}
            {(selectedMetric === 'followers' || selectedMetric === 'both') && (
              <>
                <path d={followersArea} fill="url(#followerGlowArea)" />
                <path 
                  d={followersLine} 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  filter="url(#cyanGlow)"
                />
              </>
            )}

            {/* Engagement Area & Line */}
            {(selectedMetric === 'engagement' || selectedMetric === 'both') && (
              <>
                <path d={engagementArea} fill="url(#engagementGlowArea)" />
                <path 
                  d={engagementLine} 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="1.8" 
                  strokeLinecap="round" 
                  strokeDasharray={selectedMetric === 'both' ? '3,3' : undefined}
                  filter="url(#pinkGlow)"
                />
              </>
            )}

            {/* Hover vertical tracing cursor line */}
            {hoveredPoint && (
              <line 
                x1={d3XScale(hoveredPoint.date)} 
                y1={0} 
                x2={d3XScale(hoveredPoint.date)} 
                y2={plotHeight} 
                stroke="rgba(255, 255, 255, 0.15)" 
                strokeWidth="1" 
                strokeDasharray="2,2" 
              />
            )}

            {/* Circular active focus nodes */}
            {hoveredPoint && (
              <>
                {(selectedMetric === 'followers' || selectedMetric === 'both') && (
                  <circle 
                    cx={d3XScale(hoveredPoint.date)} 
                    cy={d3YFollowers(hoveredPoint.followers)} 
                    r="3.5" 
                    fill="#22D3EE" 
                    stroke="#080D1E" 
                    strokeWidth="1.5"
                  />
                )}
                {(selectedMetric === 'engagement' || selectedMetric === 'both') && (
                  <circle 
                    cx={d3XScale(hoveredPoint.date)} 
                    cy={d3YEngagement(hoveredPoint.engagement)} 
                    r="3.5" 
                    fill="#EC4899" 
                    stroke="#080D1E" 
                    strokeWidth="1.5"
                  />
                )}
              </>
            )}
          </g>

          {/* Interactive Tooltip Card */}
          {hoveredPoint && (
            <g transform={`translate(${
              d3XScale(hoveredPoint.date) > plotWidth / 2 
                ? d3XScale(hoveredPoint.date) - 95
                : d3XScale(hoveredPoint.date) + d3Margin.left + 15
            }, ${d3Margin.top + 8})`}>
              <rect 
                width={120} 
                height={55} 
                rx={10} 
                fill="rgba(8, 13, 30, 0.9)" 
                stroke="rgba(255, 255, 255, 0.1)" 
                strokeWidth={1}
                className="backdrop-blur-md"
              />
              <rect 
                width={120} 
                height={1.5} 
                rx={0.5}
                fill="url(#tooltipGlowGrad)"
              />
              <text x={8} y={13} className="text-[7.5px] font-mono fill-gray-400 font-extrabold select-none">
                {d3.timeFormat('%B %d, %Y')(hoveredPoint.date)}
              </text>
              
              <text x={8} y={28} className="text-[8.5px] font-mono font-black fill-cyan-400 select-none">
                👥 {d3.format(',')(hoveredPoint.followers)}
              </text>
              <text x={8} y={40} className="text-[7px] font-mono text-gray-500 select-none">
                Follower Growth
              </text>

              <text x={68} y={28} className="text-[8.5px] font-mono font-black fill-pink-400 select-none">
                🔥 {d3.format(',')(hoveredPoint.engagement)}
              </text>
              <text x={68} y={40} className="text-[7px] font-mono text-gray-500 select-none">
                Daily Reacts
              </text>
            </g>
          )}
        </svg>

      </div>
    </div>
  );
};

export const MonetizationCenter: React.FC = () => {
  const { 
    currentUser, 
    creatorWallet, 
    withdrawalRequests, 
    platformConfig, 
    loadCreatorWallet, 
    requestPayoutClearance 
  } = useConnectX();

  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'marketplace'>('overview');
  const [selectedSubView, setSelectedSubView] = useState<'overall' | 'video_earnings'>('overall');
  
  // Withdrawal Form states
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'PayPal' | 'Bank'>('PayPal');
  const [payoutAddress, setPayoutAddress] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadCreatorWallet(currentUser.id);
    }
  }, [currentUser?.id]);

  const handleRefreshWallet = async () => {
    if (!currentUser?.id) return;
    setIsRefreshing(true);
    await loadCreatorWallet(currentUser.id);
    setIsRefreshing(false);
  };

  if (!currentUser) return null;

  const walletBalance = creatorWallet ? creatorWallet.balance : (currentUser.totalEarnings ?? 3125.46);
  const pendingEarnings = creatorWallet?.pendingEarnings ?? 154.20;
  const totalPaid = creatorWallet?.totalPaid ?? 1200.00;
  const adImpressions = creatorWallet?.adImpressions ?? 542000;

  // Handle cashout
  const handleCashoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const amountNum = parseFloat(withdrawalAmount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage("Please input a valid withdrawal amount!");
      return;
    }

    const minAmount = platformConfig?.minimumWithdrawalAmount ?? 5.00;
    if (amountNum < minAmount) {
      setErrorMessage(`The minimum allowed payout clearance is $${minAmount.toFixed(2)} USD.`);
      return;
    }

    if (amountNum > walletBalance) {
      setErrorMessage("Insufficient balance in your Creator wallet!");
      return;
    }

    // Security check: verify payment details/coordinates before submission
    if (payoutMethod === 'PayPal') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payoutAddress.trim())) {
        setErrorMessage("Please provide a valid PayPal email coordinate!");
        return;
      }
    } else if (payoutMethod === 'UPI') {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;
      if (!upiRegex.test(payoutAddress.trim())) {
        setErrorMessage("Please provide a valid Indian Virtual Payment Address (UPI ID, e.g., user@account)!");
        return;
      }
    } else {
      if (payoutAddress.trim().length < 8) {
        setErrorMessage("Bank Account / IBAN must contain at least 8 alphanumeric coordinates!");
        return;
      }
    }

    setIsProcessing(true);
    const result = await requestPayoutClearance(amountNum, payoutMethod, payoutAddress, {
      holderName: currentUser.displayName,
      clientIp: '127.0.0.1'
    });
    setIsProcessing(false);

    if (result.success) {
      setSuccessMessage(`Withdrawal of $${amountNum.toFixed(2)} USD submitted! Awaiting clearance. Status logs updated.`);
      setWithdrawalAmount('');
      setPayoutAddress('');
      // Force refresh wallet
      handleRefreshWallet();
    } else {
      setErrorMessage(result.error || "Gateway connection error. A duplicate or pending request is already under process.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4 pb-20 px-1 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] font-mono tracking-wider font-bold text-gray-500 uppercase">Monetization Hub</span>
          <h2 className="text-xl font-display font-black text-white tracking-tight flex items-center gap-1.5 animate-pulse">
            <DollarSign className="w-5 h-5 text-cyan-400" /> Creator Vault
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={handleRefreshWallet} 
            title="Refresh Wallet Sync"
            className="p-1.5 bg-neutral-900 border border-white/5 rounded-full hover:bg-neutral-850 hover:border-cyan-500/20 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          
          <div className="flex items-center gap-1 py-1 px-3 bg-cyan-500/10 border border-cyan-400/25 rounded-full text-3xs font-black text-cyan-400 uppercase tracking-wider">
            <span>Active Balance: ${walletBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. TAB CONTROLS (Screen 9 / 16 Overview vs Actions) */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-[4px] rounded-xl border border-white/5 text-center">
        {(['overview', 'payouts', 'marketplace'] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab !== 'overview') setSelectedSubView('overall');
              }}
              className={`py-2 px-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-tr from-cyan-400/20 to-pink-500/10 text-cyan-400 border border-white/10 shadow-[0_0_12px_rgba(34,211,238,0.1)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'overview' ? 'Monetization' : tab === 'payouts' ? 'Withdraw Cash' : 'Brand Sponsor'}
            </button>
          );
        })}
      </div>

      {/* 3. CONDITIONAL BODY CONTENT */}
      <div className="flex flex-col gap-3">
        
        {/* OVERVIEW MODULE WITH SUB-VIEWS FOR SCREEN 9 AND SCREEN 16 */}
        {activeTab === 'overview' && (
          selectedSubView === 'overall' ? (
            /* --- SCREEN 9: MONETIZATION OVERVIEW --- */
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-left">
              
              {/* Header inside Screen 9 */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono tracking-widest text-gray-400 font-bold uppercase">Accruement Categories</span>
                <div className="flex items-center gap-1 text-[9px] font-mono text-gray-500">
                  <span>Last 30 days</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>

              {/* Row 1: Triple cards (Videos, Reels, Posts) exactly as Screen 9 layout */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'videos', label: 'Videos', val: '$1,234.56', rate: '+12.5%', border: 'border-purple-500/30', textStyle: 'text-purple-400', clickable: true },
                  { id: 'reels', label: 'Reels', val: '$678.90', rate: '+8.3%', border: 'border-pink-500/25', textStyle: 'text-pink-400', clickable: false },
                  { id: 'posts', label: 'Posts', val: '$345.20', rate: '+5.2%', border: 'border-blue-500/20', textStyle: 'text-blue-400', clickable: false }
                ].map(card => (
                  <button
                    key={card.id}
                    onClick={() => {
                      if (card.clickable) setSelectedSubView('video_earnings');
                    }}
                    className={`bg-[#050b18]/70 border ${card.border} p-3 rounded-2xl text-left transition-all active:scale-95 flex flex-col justify-between h-[85px] relative overflow-hidden group ${card.clickable ? 'cursor-pointer hover:border-cyan-400/30' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 leading-none">
                        <span className="text-[8px] font-mono tracking-wide text-gray-500 uppercase font-bold">{card.label}</span>
                        {card.clickable && <span className="text-[7px] text-cyan-400 bg-cyan-400/10 px-1 rounded font-mono">DETAIL</span>}
                      </div>
                      <span className={`text-[13px] font-mono font-black text-white mt-1.5 block`}>{card.val}</span>
                    </div>
                    <span className="text-[8.5px] font-mono text-[#A6E22E] font-bold block mt-1">{card.rate}</span>
                  </button>
                ))}
              </div>

              {/* Row 2: Double wider cards (Images, Stories) exactly as Screen 9 layout */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'images', label: 'Images', val: '$289.40', rate: '+6.7%', border: 'border-cyan-500/20', textStyle: 'text-cyan-400' },
                  { id: 'stories', label: 'Stories', val: '$123.50', rate: '+3.1%', border: 'border-amber-500/25', textStyle: 'text-amber-400' }
                ].map(card => (
                  <div
                    key={card.id}
                    className={`bg-[#050b18]/70 border ${card.border} p-3.5 rounded-2xl text-left flex flex-col justify-between h-[75px] relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-mono tracking-wide text-gray-500 uppercase font-bold">{card.label}</span>
                      <span className="text-[8.5px] font-mono text-[#A6E22E] font-bold">{card.rate}</span>
                    </div>
                    <span className="text-[14px] font-mono font-black text-white block mt-2">{card.val}</span>
                  </div>
                ))}
              </div>

              {/* D3 Real-Time Line Chart visualization on followers growth and engagement */}
              <D3RealtimeLineChart />

            </div>
          ) : (
            /* --- SCREEN 16: EARNINGS DETAIL (VIDEOS) --- */
            <div className="flex flex-col gap-4 animate-in slide-in-from-right duration-250 text-left">
              
              {/* Back selector row */}
              <div className="flex items-center justify-between pb-1 border-b border-white/5 mb-1 px-1">
                <button
                  onClick={() => setSelectedSubView('overall')}
                  className="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 flex items-center gap-1 cursor-pointer transition-all text-[9px] font-bold"
                >
                  <ArrowLeft className="w-3 h-3 text-cyan-400" /> Back to List
                </button>
                <div className="flex items-center gap-1 text-[9px] font-mono text-gray-500 uppercase font-black">
                  <span>Video Earnings</span>
                  <ChevronDown className="w-3 h-3 text-pink-500" />
                </div>
              </div>

              {/* Large Earning Indicator Box */}
              <div className="bg-[#050b18]/80 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-sub font-mono text-gray-500 block uppercase font-bold mb-1">Accrued Video Share</span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-mono font-black text-white tracking-tight">$1,234.56</span>
                    <span className="text-3xs font-mono py-0.5 px-1.5 bg-green-500/10 text-green-400 font-extrabold rounded-full border border-green-500/20">+12.5%</span>
                  </div>
                </div>

                {/* Video Earnings SVG Graph */}
                <div className="w-full h-24 mt-6 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 35" preserveAspectRatio="none">
                    <path
                      d="M 0,32 Q 10,18 20,24 T 45,9 T 70,22 T 90,8 T 100,5"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_5px_rgba(236,72,153,0.4)]"
                    />
                    <path
                      d="M 0,32 Q 10,18 20,24 T 45,9 T 70,22 T 90,8 T 100,5 L 100,35 L 0,35 Z"
                      fill="url(#cardGlowFill)"
                    />
                  </svg>
                  <div className="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[7px] text-gray-650 px-1">
                    <span>MAY 1</span>
                    <span>MAY 10</span>
                    <span>MAY 20</span>
                    <span>MAY 30</span>
                  </div>
                </div>
              </div>

              {/* Three detailed grid items (Views, Watch Time, RPM) exactly as Screen 16 */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Views', value: '612K' },
                  { label: 'Watch Time (Hrs)', value: '18.4K' },
                  { label: 'RPM', value: '$2.01' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-[#050b18]/60 border border-white/5 p-3 rounded-xl flex flex-col justify-center">
                    <span className="text-[8px] font-mono text-gray-500 uppercase font-black tracking-wide leading-none mb-1.5 block">{stat.label}</span>
                    <span className="text-[13px] font-mono font-black text-white">{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-cyan-400/5 border border-cyan-400/10 rounded-xl text-[9px] text-gray-400 text-left leading-relaxed">
                <span className="font-bold text-cyan-400">💡 RPM Insights:</span> Highest payout peaks originate from region node coordinates matching USA and EUR 1080p long-form views. Keep producing high search rank titles!
              </div>

            </div>
          )
        )}

        {/* PAYOUT WITHDRAWAL SUB MODULE */}
        {activeTab === 'payouts' && (
          <div className="flex flex-col gap-4">
            
            {/* Real-time Creator Wallet Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-left">
              {[
                { label: 'Current Balance', value: `$${walletBalance.toFixed(2)}`, desc: 'Accrued views share', icon: DollarSign, color: 'text-cyan-400', bg: 'border-cyan-500/20' },
                { label: 'Pending Earnings', value: `$${pendingEarnings.toFixed(2)}`, desc: 'In gateway escrow', icon: RefreshCw, color: 'text-amber-400', bg: 'border-amber-500/20' },
                { label: 'Total Paid Out', value: `$${totalPaid.toFixed(2)}`, desc: 'Successfully routed', icon: Landmark, color: 'text-green-400', bg: 'border-green-500/20' },
                { label: 'Ad Impressions', value: adImpressions.toLocaleString(), desc: 'Recorded view counts', icon: Sparkles, color: 'text-pink-400', bg: 'border-pink-500/20' }
              ].map((tile, idx) => (
                <div key={idx} className={`bg-[#050b18]/80 border ${tile.bg} p-3 rounded-2xl flex flex-col justify-between h-[85px]`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase font-black">{tile.label}</span>
                    <tile.icon className={`w-3.5 h-3.5 ${tile.color}`} />
                  </div>
                  <div>
                    <span className="text-[13px] font-mono font-black text-white block">{tile.value}</span>
                    <span className="text-[7.5px] font-mono text-gray-600 block mt-0.5">{tile.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel rounded-2xl p-5 border-white/10 flex flex-col gap-4 text-left shadow-2xl">
              <div>
                <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-cyan-400 animate-pulse" /> Vault Cashouts
                </h3>
                <p className="text-[11px] text-gray-400">Withdraw secure accrued creator earnings directly matching international clearance guidelines.</p>
              </div>

              {/* Status Alert Panels */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl flex gap-1.5 items-center text-red-400 text-[10px] font-mono text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/25 rounded-xl flex gap-1.5 items-center text-[#A6E22E] text-[10px] font-mono text-left">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-green-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleCashoutSubmit} className="flex flex-col gap-3.5 bg-black/45 p-4 rounded-xl border border-white/5 animate-in fade-in duration-200">
                
                <div className="grid grid-cols-3 gap-2">
                  {(['PayPal', 'UPI', 'Bank'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPayoutMethod(method)}
                      className={`py-3 px-1 border rounded-xl text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                        payoutMethod === method 
                          ? 'bg-cyan-500/10 border-cyan-500/35 text-white' 
                          : 'bg-white/5 border-white/10 text-gray-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-400 block mb-1">
                    {payoutMethod === 'PayPal' ? 'PayPal Email Handle' : payoutMethod === 'UPI' ? 'UPI Address Handle (e.g. user@bank)' : 'Bank IBAN Code / Account'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={payoutMethod === 'PayPal' ? 'me@paypal.com' : payoutMethod === 'UPI' ? 'user@upi' : 'US1234567890'}
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="text-[8px] uppercase tracking-wider font-mono text-gray-400 block mb-1">Withdrawal Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min={platformConfig?.minimumWithdrawalAmount || 5}
                    step="0.01"
                    placeholder={`EX: ${(platformConfig?.minimumWithdrawalAmount || 5).toFixed(2)}`}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 outline-none text-xs text-white rounded-lg font-mono"
                  />
                  <span className="text-[8px] text-gray-500 block mt-1 font-mono">Minimum withdrawal limit: ${(platformConfig?.minimumWithdrawalAmount || 5.00).toFixed(2)} USD. Verified.</span>
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="py-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-pink-500 rounded-xl text-black font-extrabold hover:opacity-90 transition-all text-xs cursor-pointer shadow-lg disabled:opacity-40"
                >
                  {isProcessing ? 'Verifying Safe Signatures...' : 'Approve Transfer Payout'}
                </button>
              </form>

              {/* Withdrawal Requests History List (Real-Time Gateway Sync) */}
              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] font-mono font-black tracking-widest text-gray-500 uppercase">Withdrawal Transactions History</span>
                
                {withdrawalRequests.length === 0 ? (
                  <div className="p-3 bg-[#050b18]/40 border border-white/5 rounded-xl text-center text-gray-500 text-[10px] font-mono leading-none">
                    No historic withdrawal records logged yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                    {withdrawalRequests.map((req) => (
                      <div key={req.id} className="bg-black/55 border border-white/5 p-3 rounded-xl flex flex-col gap-1 text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                          <span className="text-white font-extrabold">${req.amount.toFixed(2)} USD</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            req.status === 'approved' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : req.status === 'rejected'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 mt-1">
                          <span>{req.method} • {req.address}</span>
                          <span>{new Date(req.timestamp).toLocaleDateString()}</span>
                        </div>
                        {req.payoutDetails && (
                          <div className="mt-1 pb-0.5 border-t border-white/5 pt-1 text-[8px] font-mono text-gray-500">
                            {req.payoutDetails.reason && (
                              <p className="text-red-400/80">Reason: {req.payoutDetails.reason}</p>
                            )}
                            {req.payoutDetails.payoutId && (
                              <p className="text-cyan-400/80">Ref: {req.payoutDetails.payoutId}</p>
                            )}
                            {req.payoutDetails.gatewayRef && (
                              <p className="text-green-400/80">Txn ID: {req.payoutDetails.gatewayRef}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded-xl flex gap-1.5 items-start text-cyan-400">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold block mb-1">Secure escrow clearance</span>
                  <p className="text-[9px] leading-relaxed text-gray-300">ConnectX routes payout vectors safely under multi-signature protocol nodes. Safe & secure.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* BRAND COLLABORATIONS (Affiliate Marketplace) */}
        {activeTab === 'marketplace' && (
          <div className="glass-panel rounded-2xl p-5 border-white/10 flex flex-col gap-4 text-left shadow-2xl">
            
            <div>
              <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-pink-500" /> Creator Brand Collaborations
              </h3>
              <p className="text-[11px] text-gray-400">Discover affiliate listing packages. Embed sponsored referral widgets and earn 15% override commission pools.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { name: 'Apex Drone Pro Video Affiliate', commission: '15% override', description: 'Embed Apex drones purchase tags inside long-form videos.', clicks: 420 },
                { name: 'ConnectX Neon UI Resource Kit', commission: '25% override', description: 'Refer design layout resources inside text feed posts.', clicks: 120 }
              ].map((sponsor, sidx) => (
                <div key={sidx} className="bg-black/45 border border-white/5 p-3 rounded-xl flex justify-between items-center text-left animate-in fade-in duration-250">
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none mb-1">{sponsor.name}</h4>
                    <p className="text-[10px] text-gray-400 leading-tight mt-1">{sponsor.description}</p>
                    <span className="text-[9px] font-mono text-cyan-400 block mt-1.5 font-bold">{sponsor.commission} • {sponsor.clicks} hits</span>
                  </div>
                  <button 
                    onClick={() => alert(`Sponsor affiliate token "${sponsor.name.toLowerCase().replace(/ /g, '_')}_code" generated! Paste this hashtag inside creations.`)}
                    className="py-1 px-3 bg-pink-500 text-white rounded-full text-[9px] font-bold cursor-pointer hover:bg-pink-650 transition-colors shrink-0 ml-2"
                  >
                    Copy Token
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
