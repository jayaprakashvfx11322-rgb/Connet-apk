/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useConnectX } from '../utils/stateManager';
import { ConnectXUser, GroupChat } from '../types';
import { 
  Users, UserPlus, UserCheck, Inbox, MessageSquare, Compass, 
  MapPin, PlusCircle, Check, X, ShieldAlert, AlertCircle
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';
import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';

interface ConnectsManagerProps {
  onSelectChatUser: (user: ConnectXUser) => void;
  onSelectGroupChat: (group: GroupChat) => void;
}

export const ConnectsManager: React.FC<ConnectsManagerProps> = ({ onSelectChatUser, onSelectGroupChat }) => {
  const { 
    currentUser, users, groups, acceptConnectRequest, declineConnectRequest, sendConnectRequest, disconnectUser, setViewedUserId
  } = useConnectX();

  const [activeTab, setActiveTab] = useState<'Connected' | 'Requests' | 'Suggestions' | 'Communities'>('Connected');
  const [connectsState, setConnectsState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (tab: typeof activeTab) => {
    setConnectsState('loading');
    setActiveTab(tab);
    setTimeout(() => {
      setConnectsState('success');
    }, 450);
  };


  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-stone-950 rounded-2xl border border-white/5 mx-2">
        <span className="text-gray-500 font-mono text-xs block">Please sign up first to inspect social connectors.</span>
      </div>
    );
  }

  // Segment user lists
  const connectedUsers = users.filter(u => currentUser.connects.includes(u.id));
  const incomingRequests = users.filter(u => currentUser.pendingRequests.includes(u.id));
  
  // Suggestions (Exclude self, already connected, and already requested)
  const suggestionUsers = users.filter(u => 
    u.id !== currentUser.id && 
    !currentUser.connects.includes(u.id) && 
    !currentUser.sentRequests.includes(u.id) &&
    !currentUser.pendingRequests.includes(u.id)
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-20 px-2 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between border-b border-b-white/5 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 uppercase">Connect Engine</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" /> Connects Hub
          </h2>
        </div>

        {/* Counter of total connects */}
        <div className="flex items-center gap-1.5 py-1 px-3 bg-pink-500/10 border border-pink-500/20 rounded-full text-xs font-semibold text-pink-400">
          <UserCheck className="w-4 h-4 text-pink-400" />
          <span>Connected: {currentUser.connects.length}</span>
        </div>
      </div>

      {/* 2. CHOOSE NAVIGATION TABS WITH SANDBOX INDICATOR */}
      <div className="flex flex-col gap-2 bg-neutral-950 p-2.5 rounded-xl border border-white/5">
        <div className="grid grid-cols-4 gap-1 border-b border-white/5 pb-2">
          {(['Connected', 'Requests', 'Suggestions', 'Communities'] as const).map((tab) => {
            const isActive = activeTab === tab;
            
            let count = 0;
            if (tab === 'Connected') count = connectedUsers.length;
            if (tab === 'Requests') count = incomingRequests.length;
            if (tab === 'Suggestions') count = suggestionUsers.length;
            if (tab === 'Communities') count = groups.length;

            return (
              <button
                key={tab}
                onClick={() => {
                  setConnectsState('loading');
                  setActiveTab(tab);
                  setTimeout(() => setConnectsState('success'), 450);
                }}
                className={`py-2 px-1 rounded-lg text-3xs font-bold uppercase transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 text-cyan-400 border border-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="truncate">{tab}</span>
                <span className="font-mono text-4xs opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sandbox Indicator */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
            <Inbox className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Connection Engine State:</span>
          </span>
          <div className="flex items-center gap-1.5 py-0.5 px-2 bg-neutral-900 border border-white/5 rounded-full scale-90">
            <span className="text-[8px] font-mono text-gray-500 font-bold uppercase">State:</span>
            <select 
              value={connectsState}
              onChange={(e) => {
                const s = e.target.value as any;
                if (s === 'error') setErrorMessage('Diffie-Hellman handshake error on Node Synchroniser.');
                setConnectsState(s);
              }}
              className="bg-transparent text-[8px] font-mono text-cyan-400 font-black uppercase outline-none cursor-pointer"
            >
              <option value="success" className="bg-black text-white">Live Sync</option>
              <option value="loading" className="bg-black text-white">Shimmer Load</option>
              <option value="error" className="bg-black text-white">Error Guard</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. CONDITIONAL TAB BODY RENDER */}
      <div className="flex flex-col gap-3">
        {connectsState === 'loading' ? (
          <SkeletonLoader variant="list" count={4} />
        ) : connectsState === 'error' ? (
          <ErrorState 
            message={errorMessage} 
            onRetry={() => {
              setConnectsState('loading');
              setTimeout(() => setConnectsState('success'), 600);
            }} 
            onRefresh={() => {
              setConnectsState('loading');
              setTimeout(() => setConnectsState('success'), 500);
            }}
          />
        ) : (
          <>
            {/* ACTIVE CONNECTIONS TAB */}
            {activeTab === 'Connected' && (
              connectedUsers.length === 0 ? (
                <EmptyState 
                  icon={Compass} 
                  title="No Active Connections" 
                  description="You haven't established communication bonds with any peers yet. Explore suggestions to connect."
                  actionLabel="Discover Connections"
                  onAction={() => handleTabChange('Suggestions')}
                  variant="pink"
                />
              ) : (
                connectedUsers.map((user) => (

              <div 
                key={user.id}
                className="group glass-panel rounded-2xl p-4 border-white/10 flex items-center justify-between text-left shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => setViewedUserId(user.id)}
                    className="w-11 h-11 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 to-pink-500 shrink-0 cursor-pointer hover:opacity-85"
                  >
                    <img src={user.profilePic} className="w-full h-full rounded-full object-cover border border-black" alt="Avatar" />
                  </div>
                  <div>
                    <h3 
                      onClick={() => setViewedUserId(user.id)}
                      className="text-xs font-bold text-white tracking-tight cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      {user.displayName}
                    </h3>
                    <span 
                      onClick={() => setViewedUserId(user.id)}
                      className="text-[10px] text-gray-400 block font-mono cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      @{user.username}</span>
                    <span className="text-[9px] text-pink-400 block limit-lines-1 italic max-w-xs">{user.bio}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onSelectChatUser(user)}
                    className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-md cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-white" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                  <button
                    onClick={() => disconnectUser(user.id)}
                    className="p-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/25 hover:text-red-400 text-gray-400 rounded-xl text-2xs transition-all cursor-pointer"
                    title="Disconnect user link"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* INCOMING CONNECTIONS REQUESTS */}
        {activeTab === 'Requests' && (
          incomingRequests.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center flex flex-col items-center gap-2">
              <Inbox className="w-8 h-8 text-gray-600" />
              <h4 className="text-xs font-bold text-white">No incoming requests</h4>
              <p className="text-4xs text-gray-500 mt-1">Pending connection applications when peers connect with you will land here.</p>
            </div>
          ) : (
            incomingRequests.map((user) => (
              <div 
                key={user.id}
                className="glass-panel rounded-2xl p-4 border-white/10 flex items-center justify-between text-left shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <img 
                    onClick={() => setViewedUserId(user.id)}
                    src={user.profilePic} 
                    className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/10 cursor-pointer hover:opacity-85" 
                    alt="Avatar" 
                  />
                  <div>
                    <h3 
                      onClick={() => setViewedUserId(user.id)}
                      className="text-xs font-bold text-white tracking-tight cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      {user.displayName}
                    </h3>
                    <span 
                      onClick={() => setViewedUserId(user.id)}
                      className="text-[10px] text-gray-400 block font-mono leading-none cursor-pointer hover:text-yellow-400 transition-colors text-left"
                    >
                      @{user.username}
                    </span>
                    <span className="text-4xs text-gray-500 leading-normal">wants to connect with you securely</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => acceptConnectRequest(user.id)}
                    className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center rounded-xl text-xs hover:scale-105 active:scale-95 transition-all text-2xs cursor-pointer shadow-md"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => declineConnectRequest(user.id)}
                    className="p-2.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-2xs cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* CONNECT SUGGESTIONS matches */}
        {activeTab === 'Suggestions' && (
          suggestionUsers.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center flex flex-col items-center gap-2">
              <Compass className="w-8 h-8 text-gray-600" />
              <h4 className="text-xs font-bold text-white">No matched suggestions</h4>
              <p className="text-4xs text-gray-400">Everyone on the node is already connected!</p>
            </div>
          ) : (
            suggestionUsers.map((user) => {
              // calculate matching interest elements
              const matchingInterests = user.interests.filter(i => currentUser.interests.includes(i));
              
              return (
                <div 
                  key={user.id}
                  className="glass-panel rounded-2xl p-4 border-white/10 flex items-center justify-between text-left shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <img src={user.profilePic} className="w-11 h-11 rounded-full object-cover shrink-0 border border-white/10" alt="Avatar" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs font-bold text-white leading-none">{user.displayName}</h3>
                        {/* matching tag block */}
                        {matchingInterests.length > 0 && (
                          <span className="text-5xs bg-pink-500/10 border border-pink-500/30 text-pink-400 font-semibold py-0.5 px-1.5 rounded font-mono uppercase">
                            {matchingInterests[0]} match
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block font-mono">@{user.username}</span>
                      <span className="text-4xs text-gray-500 tracking-tight block">Located in: {user.location || 'Distributed Node'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => sendConnectRequest(user.id)}
                    className="p-2 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-full text-xs font-semibold hover:scale-105 active:scale-95 transition-all text-2xs cursor-pointer shadow-md"
                  >
                    + Connect
                  </button>
                </div>
              );
            })
          )
        )}

        {/* CHANNELS AND COMMUNITIES lounges */}
        {activeTab === 'Communities' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-3xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Global channels lounge</span>
              <button 
                onClick={() => {
                  const name = prompt("Enter Community Lounge Name:");
                  const desc = prompt("Enter Short description:");
                  if (name && desc) {
                    alert("Mock Lounge created! Invitees are syncing securely.");
                  }
                }}
                className="text-4xs font-bold text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                + Create Lounge
              </button>
            </div>

            {groups.map((grp) => (
              <div 
                key={grp.id}
                className="glass-panel rounded-2xl p-4 border-white/10 flex items-center justify-between text-left shadow-lg relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden border border-white/10">
                    <img src={grp.avatar} className="w-full h-full object-cover" alt="Group" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white">{grp.name}</h3>
                      <span className="text-[9px] bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 font-mono py-0.5 px-2 rounded-full font-bold uppercase tracking-widest text-[8px]">
                        {grp.type}
                      </span>
                    </div>
                    <p className="text-4xs text-gray-400 line-clamp-1 max-w-xs">{grp.description}</p>
                    <span className="text-5xs font-mono text-gray-500">{grp.members.length} participating nodes</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectGroupChat(grp)}
                  className="p-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer text-2xs shadow-md"
                >
                  Enter Chat
                </button>
              </div>
            ))}
          </div>
        )}
          </>
        )}

      </div>

    </div>
  );
};
