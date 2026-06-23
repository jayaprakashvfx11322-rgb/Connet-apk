/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useConnectX } from '../utils/stateManager';
import { ConnectXUser, Message, GroupChat } from '../types';
import { 
  Send, Phone, Video, ShieldCheck, Image, Paperclip, Mic, 
  X, AlertCircle, Smile, Volume2, CornerDownLeft, FileText, CheckCheck
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';
import { StoryAvatar } from './StoryAvatar';

export const MessagingHub: React.FC = () => {
  const { 
    currentUser, users, messages, sendMessageToUser, sendMessageToGroup, 
    activeChatUser, activeGroupChat, selectChatUser, selectGroupChat, groups
  } = useConnectX();

  const [inputText, setInputText] = useState('');
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video', user: ConnectXUser | null } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [secDrawerOpen, setSecDrawerOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Filter messages for active chat
  const chatMessages = messages.filter(msg => {
    if (activeGroupChat) {
      return msg.isGroup && msg.groupId === activeGroupChat.id;
    }
    if (activeChatUser && currentUser) {
      return (
        (!msg.isGroup) &&
        ((msg.senderId === currentUser.id && msg.receiverId === activeChatUser.id) ||
         (msg.senderId === activeChatUser.id && msg.receiverId === currentUser.id))
      );
    }
    return false;
  });

  // Scroll to bottom on load or new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeChatUser, activeGroupChat]);

  // Handle message sending
  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeGroupChat) {
      sendMessageToGroup(inputText.trim());
    } else if (activeChatUser) {
      sendMessageToUser(inputText.trim());
    }
    
    setInputText('');
  };

  // Simulate uploading attachments
  const triggerAttachment = (type: 'image' | 'video' | 'document') => {
    if (!currentUser) return;
    const desc = type === 'image' 
      ? `Sent a high-res rendering.` 
      : `Shared project manifest.pdf`;

    const url = type === 'image' ? MOCK_IMAGES.neonCyber : '';

    if (activeGroupChat) {
      sendMessageToGroup(desc, url, type);
    } else if (activeChatUser) {
      sendMessageToUser(desc, url, type);
    }
    alert(`Encrypted ${type.toUpperCase()} file processed and dispatched securely.`);
  };

  // Simulate audio recorders
  const triggerVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      if (activeGroupChat) {
        sendMessageToGroup("Voice note recording synced.", '', undefined);
      } else if (activeChatUser) {
        sendMessageToUser("Voice note recording synced.", '', undefined, "0:14");
      }
      alert("Simulated voice node recorded, encrypted with AES-GCM-256 and dispatched.");
    }, 2500);
  };

  if (!currentUser) return null;

  // Active friends to initiate chat with (connected ones)
  const conversationPartners = users.filter(u => currentUser.connects.includes(u.id));

  return (
    <div className="w-full max-w-3xl mx-auto h-[82h] bg-black rounded-3xl border border-white/10 flex relative overflow-hidden shadow-2xl">
      
      {/* 1. LEFT NAVIGATION CONNECTIONS SIDEBAR */}
      <aside className="w-32 sm:w-56 border-r border-white/5 flex flex-col justify-between shrink-0 bg-[#060a16]/65 backdrop-blur-xl z-20">
        
        {/* Connection header */}
        <div className="p-3 border-b border-white/5 text-left">
          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block mb-1">Enclaves</span>
          <h3 className="text-xs font-bold text-white tracking-widest uppercase">E2E secure</h3>
        </div>

        {/* Scrollable channels & contacts */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2.5 px-1.5 flex flex-col gap-4">
          
          {/* Groups list */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-mono uppercase text-cyan-400 font-bold px-2 text-left">Channels</span>
            {groups.map((group) => {
              const isActive = activeGroupChat?.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => selectGroupChat(group)}
                  className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/15 to-transparent border-l-2 border-cyan-400 text-white' 
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <img src={group.avatar} className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0" alt="avatar" />
                  <div className="hidden sm:block overflow-hidden grow">
                    <div className="text-4xs font-bold truncate leading-none mb-0.5">{group.name}</div>
                    <span className="text-5xs font-mono text-gray-500 block truncate">{group.type}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct channels list */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-mono uppercase text-pink-400 font-bold px-2 text-left">Direct Nodes</span>
            {conversationPartners.map((partner) => {
              const isActive = activeChatUser?.id === partner.id;
              return (
                <button
                  key={partner.id}
                  onClick={() => selectChatUser(partner)}
                  className={`w-full p-2 rounded-xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500/15 to-transparent border-l-2 border-pink-400 text-white' 
                      : 'hover:bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <StoryAvatar userId={partner.id} size="xs" onClickOverride={(e) => { e.stopPropagation(); selectChatUser(partner); }} />
                  <div className="hidden sm:block overflow-hidden grow">
                    <div className="text-4xs font-bold truncate leading-none mb-0.5">{partner.displayName}</div>
                    <span className="text-5xs font-mono text-gray-500 block truncate leading-none">@{partner.username}</span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </aside>

      {/* 2. RIGHT DISCUSSION VIEWPORT CHATBOX */}
      <main className="flex-grow flex flex-col justify-between bg-black relative">
        {activeChatUser || activeGroupChat ? (
          <>
            {/* Header detail */}
            <header className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-[#080d22]/40 backdrop-blur-md relative z-20">
              <div className="flex items-center gap-3">
                {activeGroupChat ? (
                  <div className="w-8 h-8 rounded-full border border-white/10 shrink-0">
                    <img 
                      src={activeGroupChat.avatar} 
                      className="w-full h-full rounded-full object-cover" 
                      alt="Current group chat avatar" 
                    />
                  </div>
                ) : (
                  activeChatUser && (
                    <StoryAvatar userId={activeChatUser.id} size="sm" />
                  )
                )}
                <div className="text-left">
                  <h4 className="text-xs font-bold text-white leading-none mb-0.5">
                    {activeGroupChat ? activeGroupChat.name : activeChatUser?.displayName}
                  </h4>
                  <button 
                    onClick={() => setSecDrawerOpen(true)}
                    className="text-5xs font-mono text-green-400 flex items-center gap-1 leading-none hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span>ENCRYPTED_TUNNEL_ESTABLISHED</span>
                  </button>
                </div>
              </div>

              {/* Calls trigger and security icons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => activeChatUser && setActiveCall({ type: 'voice', user: activeChatUser })}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors cursor-pointer"
                  title="Voice Call link"
                >
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => activeChatUser && setActiveCall({ type: 'video', user: activeChatUser })}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-colors cursor-pointer"
                  title="Video Call link"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </header>

            {/* Conversation list box */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 custom-scrollbar bg-[radial-gradient(ellipse_at_bottom_left,rgba(8,12,30,0.5),transparent_60%)]">
              {chatMessages.length === 0 ? (
                <div className="my-auto py-12 text-center flex flex-col items-center gap-2 text-gray-500">
                  <ShieldCheck className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <span className="text-2xs font-mono text-cyan-400 uppercase tracking-widest">End-to-End Encrypted Tunnel</span>
                  <p className="text-3xs text-gray-400 max-w-xs mt-1">Chat history is sealed locally with state cryptographic hashes. No credentials leaked.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  const senderUser = users.find(u => u.id === msg.senderId);
                  
                  return (
                    <div 
                      key={msg.id}
                      className={`flex gap-2.5 items-start max-w-[85%] text-left ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      {!isMe && (
                        <img 
                          src={senderUser?.profilePic || MOCK_AVATARS.anu} 
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5 border border-white/10" 
                          alt="avatar" 
                        />
                      )}

                      <div className="flex flex-col gap-1">
                        {/* Group sender name */}
                        {activeGroupChat && !isMe && (
                          <span className="text-[8px] font-mono text-[#be185d] font-bold">@{senderUser?.username}</span>
                        )}

                        <div className={`p-3 rounded-2xl relative border ${
                          isMe 
                            ? 'bg-gradient-to-tr from-blue-700 to-cyan-500 text-white border-cyan-400/15 rounded-br-none shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                            : 'bg-[#0f152d]/90 text-gray-100 border-white/10 rounded-bl-none shadow'
                        }`}>
                          <p className="text-3xs leading-relaxed font-sans">{msg.text}</p>
                          
                          {/* Attachments rendering */}
                          {msg.mediaUrl && (
                            <img src={msg.mediaUrl} className="w-40 rounded-xl mt-2.5 border border-white/10 cursor-pointer object-cover" alt="Attachment" />
                          )}

                          {msg.mediaType === 'document' && (
                            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2 mt-2">
                              <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                              <div className="overflow-hidden">
                                <div className="text-[9px] font-bold text-white truncate">project_spec.pdf</div>
                                <span className="text-5xs font-mono text-gray-400">1.2 MB • Encrypted Log</span>
                              </div>
                            </div>
                          )}

                          {msg.voiceDuration && (
                            <div className="flex items-center gap-2.5 bg-black/35 py-1.5 px-2.5 rounded-xl mt-2">
                              <Mic className="w-4.5 h-4.5 text-pink-500 animate-pulse shrink-0" />
                              {/* Visual audio wave bar simulation */}
                              <div className="flex gap-0.5 items-center">
                                <span className="w-1 h-3 bg-cyan-400 rounded-full inline-block animate-[pulse_1s_infinite]"></span>
                                <span className="w-1 h-4 bg-cyan-400 rounded-full inline-block"></span>
                                <span className="w-1 h-2.5 bg-cyan-400 rounded-full inline-block"></span>
                                <span className="w-1 h-4.5 bg-cyan-400 rounded-full inline-block"></span>
                                <span className="w-1 h-1 bg-cyan-400 rounded-full inline-block"></span>
                              </div>
                              <span className="text-4xs font-mono text-gray-300 ml-1.5">{msg.voiceDuration}</span>
                            </div>
                          )}
                        </div>

                        {/* Stamp and double check indicator */}
                        <div className={`flex items-center gap-1 text-[8px] font-mono text-gray-500 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span>12:45 PM</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef}></div>
            </div>

            {/* Simulated Recording Audio Indicator */}
            {isRecording && (
              <div className="p-3 bg-pink-900/40 border-t border-pink-500/25 flex items-center justify-center gap-2 text-pink-400 text-xs font-mono animate-pulse z-20">
                <Mic className="w-4.5 h-4.5 text-pink-400 animate-bounce" />
                <span>ACTIVE RECORDING ENCRYPTING SYSTEM RUNNING... (RELEASE TO DISPATCH)</span>
              </div>
            )}

            {/* Send plate form */}
            <form onSubmit={handleSendSubmit} className="p-3 border-t border-white/5 bg-neutral-900/50 flex gap-1.5 items-center relative z-20 pb-7 rounded-b-none">
              
              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  onClick={() => triggerAttachment('image')} 
                  className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Share Image mock"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onClick={() => triggerAttachment('document')} 
                  className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Share Document mock"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button 
                  type="button" 
                  onMouseDown={triggerVoiceNote}
                  onClick={triggerVoiceNote}
                  className="p-2 hover:bg-white/10 rounded-xl text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                  title="Hold voice recording"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Secure message write-up..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#121c3b] border border-white/10 rounded-xl outline-none text-xs py-3.5 px-4 text-white placeholder:text-gray-500"
              />

              <button 
                type="submit" 
                className="p-3.5 bg-gradient-to-r from-blue-500 to-pink-500 rounded-xl text-white cursor-pointer hover:opacity-95 shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="my-auto py-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
            <ShieldCheck className="w-12 h-12 text-pink-500 animate-pulse" />
            <h4 className="text-sm font-bold text-white tracking-wider">No Active Enclave Enlisted</h4>
            <p className="text-2xs text-gray-500 max-w-sm">Select a colleague or channel from the secure E2E listings on the left to initialize communications.</p>
          </div>
        )}
      </main>

      {/* 3. VIRTUAL SHIELD LOCK ENVELOPE SECRETS DRAWER */}
      {secDrawerOpen && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#070b1c] border border-white/15 rounded-3xl p-6 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <span className="text-3xs uppercase font-mono tracking-widest text-[#06b6d4] font-bold">Tunnel Integrity Report</span>
              <button onClick={() => setSecDrawerOpen(false)} className="p-1 rounded-full bg-white/5 text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono text-5xs text-gray-300">
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-4xs leading-normal">
                Perfect Forward Secrecy active. Encryption keys are generated dynamic via Diffie-Hellman handshakes on every single transaction. Ephemeral storage verified.
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[8px] text-gray-500 block">ENCRYPTION ALGO:</span>
                  <span className="text-white text-3xs font-medium">AES-GCM-256-Bit</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                  <span className="text-[8px] text-gray-500 block">KEY IDENTITY HASH:</span>
                  <span className="text-white text-3xs font-medium truncate block">cx_e2e_dh_07f3ba9e89...</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSecDrawerOpen(false)}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold"
            >
              Close Shield Report
            </button>
          </div>
        </div>
      )}

      {/* 4. IMMERSIVE ACTIVE VOICE/VIDEO CALL MODAL OVERLAYS */}
      {activeCall && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col justify-between items-center py-10 px-6 select-none animate-in fade-in">
          
          {/* Header */}
          <header className="w-full max-w-sm flex flex-col items-center text-center">
            <span className="text-[#ec4899] font-mono text-3xs uppercase tracking-widest font-bold mb-3 animate-ping">
              SECURE CONNECTX {activeCall.type.toUpperCase()} CALLING...
            </span>

            <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-pink-500 shadow-2xl mb-4 relative">
              <img src={activeCall.user?.profilePic} className="w-full h-full rounded-full object-cover border-4 border-black" alt="avatar" />
            </div>

            <h3 className="text-lg font-bold text-white">{activeCall.user?.displayName}</h3>
            <span className="text-4xs font-mono text-gray-500">@{activeCall.user?.username} • Mumbai Host Node</span>
          </header>

          {/* Cinematic floating simulation camera stream (if video) */}
          {activeCall.type === 'video' && (
            <div className="relative aspect-video w-full max-w-sm rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900 shrink-0">
              <img src={MOCK_IMAGES.sunsetOcean} className="w-full h-full object-cover" alt="Call Stream Backing" />
              <div className="absolute bottom-3 right-3 w-16 h-24 rounded-lg overflow-hidden border border-white/20 shadow bg-black">
                <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="My front cam stream" />
              </div>
            </div>
          )}

          {activeCall.type === 'voice' && (
            <div className="w-full max-w-xs flex flex-col justify-center gap-2 items-center">
              <Volume2 className="w-8 h-8 text-cyan-400 animate-bounce" />
              <span className="text-5xs font-mono text-gray-400">CONNECTX LOSSLÉSS AUDIO STREAM SYNCING</span>
            </div>
          )}

          {/* Foot plate controls */}
          <footer className="w-full max-w-sm flex justify-center gap-4">
            <button
              onClick={() => {
                alert("Simulated call session completed successfully.");
                setActiveCall(null);
              }}
              className="py-3 px-6 bg-red-600 text-white font-bold rounded-full text-xs hover:bg-red-700 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Decline / Disconnect
            </button>
            <button
              onClick={() => {
                alert("Simulated voice note or system alert: Mic has been muted.");
              }}
              className="py-3 px-6 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white rounded-full text-xs text-gray-300 font-bold cursor-pointer"
            >
              Mute Mic
            </button>
          </footer>

        </div>
      )}

    </div>
  );
};
