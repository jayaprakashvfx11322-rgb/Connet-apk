import React, { useState, useEffect, useRef } from 'react';
import { useConnectX } from '../utils/stateManager';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Eye, Send, Play, Pause, AlertCircle, Smile } from 'lucide-react';

export const StoryViewerOverlay: React.FC = () => {
  const { 
    activeStoryUserId, 
    setActiveStoryUserId, 
    stories, 
    currentUser, 
    deleteStory, 
    viewStory, 
    updateStoryStats, 
    setViewedUserId,
    users
  } = useConnectX();

  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [questionReply, setQuestionReply] = useState('');
  const [justVoted, setJustVoted] = useState<{[storyId: string]: number}>({});

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Touch gesture state for swipe-down to close
  const touchStartY = useRef<number>(0);
  const touchStartX = useRef<number>(0);

  // Get and sort this user's stories chronologically
  const userStories = stories
    .filter(s => s.user.id === activeStoryUserId)
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  const activeStory = userStories[storyIndex];

  // 1. Initial configuration or load first unviewed story slide
  useEffect(() => {
    if (userStories.length > 0) {
      // Find the first story slide that has NOT been viewed by the current user
      const firstUnviewedIdx = userStories.findIndex(
        s => !s.viewers.some(v => v.userId === currentUser?.id)
      );
      setStoryIndex(firstUnviewedIdx !== -1 ? firstUnviewedIdx : 0);
      setProgress(0);
    }
  }, [activeStoryUserId]);

  // 2. View story hook - when slide changes, view the story
  useEffect(() => {
    if (activeStory) {
      viewStory(activeStory.id);
      setProgress(0);
    }
  }, [storyIndex, activeStory?.id]);

  // Handle slide transitions
  const handleNextStory = () => {
    if (storyIndex < userStories.length - 1) {
      setStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      // No more stories for this user -> Close auto
      setActiveStoryUserId(null);
    }
  };

  const handlePrevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  // 3. Autoplay and timer interval
  useEffect(() => {
    if (!activeStory || isPaused || showViewers) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const isVideo = activeStory.mediaType === 'video';
    const totalDuration = isVideo ? 12000 : 5000; // 12s for video, 5s for image
    const stepTime = 100; // Check every 100ms
    const totalSteps = totalDuration / stepTime;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressIntervalRef.current!);
          handleNextStory();
          return 0;
        }
        return prev + (100 / totalSteps);
      });
    }, stepTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeStory?.id, isPaused, showViewers, storyIndex]);

  // Synchronize playing states of custom video ref if active story has video
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused || showViewers) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, activeStory?.id, showViewers]);

  if (!activeStoryUserId || userStories.length === 0) {
    return null;
  }

  const isOwner = currentUser?.id === activeStoryUserId;

  // Swipe gesture listeners
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    // Pause story on hold
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const diffY = endY - touchStartY.current;
    const diffX = endX - touchStartX.current;

    // Detect solid swipe down (Y-axis diff > 80 pixels)
    if (diffY > 80 && Math.abs(diffY) > Math.abs(diffX)) {
      setActiveStoryUserId(null); // Close
    }
  };

  // Interactive Poll Voting Functionality
  const handleVote = (optionIndex: number) => {
    if (!activeStory.poll || justVoted[activeStory.id] !== undefined) return;

    // Update poll counts
    const updatedOptions = activeStory.poll.options.map((opt, oidx) => {
      if (oidx === optionIndex) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    updateStoryStats(activeStory.id, {
      poll: {
        question: activeStory.poll.question,
        options: updatedOptions
      }
    });

    setJustVoted(prev => ({ ...prev, [activeStory.id]: optionIndex }));
  };

  // Interactive Question Sticker Answer Submission
  const handleQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionReply.trim()) return;

    // Simulate appending a viewer response under story statistics securely
    const viewerResponse = {
      userId: currentUser?.id || 'demo_user',
      username: currentUser?.username || 'viewer',
      profilePic: currentUser?.profilePic || '',
      timestamp: 'Just now',
      message: questionReply
    };

    // Alert completion
    alert(`Answer dispatched to @${activeStory.user.username}: "${questionReply}"`);
    setQuestionReply('');
  };

  // Story slide deletion handler
  const handleDeleteSlide = () => {
    const storyIdToDelete = activeStory.id;
    deleteStory(storyIdToDelete);
    
    // Adjust indices or auto close
    if (userStories.length <= 1) {
      setActiveStoryUserId(null);
    } else {
      if (storyIndex >= userStories.length - 1) {
        setStoryIndex(userStories.length - 2);
      }
      setProgress(0);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#000000] z-50 flex flex-col justify-between items-center py-6 px-4 select-none animate-in fade-in duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ambient background blur backing visual shadows */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 z-10 pointer-events-none"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full bg-yellow-500/5 blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Top Banner Control Panel (Progress indicators and Author Info Row) */}
      <header className="w-full max-w-md z-20 flex flex-col gap-3 pointer-events-auto">
        {/* Progress Bars (Multiple Story indicator bars) */}
        <div className="w-full flex gap-1 h-[2.5px]">
          {userStories.map((st, i) => {
            let barWidth = '0%';
            if (i < storyIndex) barWidth = '100%';
            if (i === storyIndex) barWidth = `${progress}%`;

            return (
              <div key={st.id} className="flex-1 bg-white/20 rounded-full h-full overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-100 ease-linear"
                  style={{ width: barWidth }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Profile Card & Info Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setViewedUserId(activeStory.user.id);
                setActiveStoryUserId(null);
              }}
              className="w-9 h-9 rounded-full border border-white/25 cursor-pointer hover:scale-103 transition-transform overflow-hidden"
            >
              <img src={activeStory.user.profilePic} className="w-full h-full object-cover" alt="story owner" />
            </div>
            <div className="text-left">
              <h4 
                onClick={(e) => {
                  e.stopPropagation();
                  setViewedUserId(activeStory.user.id);
                  setActiveStoryUserId(null);
                }}
                className="text-xs font-bold text-white leading-none cursor-pointer hover:text-yellow-400 transition-colors"
              >
                {activeStory.user.displayName}
              </h4>
              <span 
                className="text-[10px] font-mono text-gray-400 tracking-wide block mt-0.5"
              >
                @{activeStory.user.username} • {activeStory.timestamp}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {/* Viewers panel toggle button (Owner only) */}
            {isOwner && (
              <button 
                onClick={() => setShowViewers(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 rounded-full text-[10px] font-mono text-gray-200"
              >
                <Eye className="w-3.5 h-3.5 text-gray-300" />
                <span>{activeStory.viewers?.length || 0}</span>
              </button>
            )}

            {/* Delete button (Owner only) */}
            {isOwner && (
              <button 
                onClick={handleDeleteSlide}
                className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                title="Delete this Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Overlay button */}
            <button 
              onClick={() => setActiveStoryUserId(null)}
              className="p-1.5 rounded-full bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Core Media Display Slide Container (Split Left/Right sides for Navigation) */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center items-center z-20 relative p-4">
        {/* Left Side Tab Navigation Overlay (30% width) */}
        <div 
          onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}
          className="absolute left-0 top-0 bottom-0 w-[30%] z-20 cursor-pointer pointer-events-auto"
        />

        {/* Right Side Tab Navigation Overlay (70% width, except for interactive buttons) */}
        <div 
          onClick={(e) => { e.stopPropagation(); handleNextStory(); }}
          className="absolute right-0 top-0 bottom-0 w-[70%] z-10 cursor-pointer pointer-events-auto"
        />

        {/* Autoplay Pause indicators overlay */}
        {isPaused && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full py-1 px-3 z-30 flex items-center gap-1 pointer-events-none">
            <Pause className="w-2.5 h-2.5 text-yellow-400 animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-gray-300 uppercase tracking-widest">Hold Paused</span>
          </div>
        )}

        {/* Media elements */}
        {activeStory.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={activeStory.mediaUrl}
            autoPlay
            playsInline
            controls={false}
            className="w-full h-[65vh] object-cover rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-0"
            onEnded={handleNextStory}
            referrerPolicy="no-referrer"
          />
        ) : (
          <img 
            src={activeStory.mediaUrl} 
            alt="Story Content" 
            className="w-full h-[65vh] object-cover rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-0" 
            referrerPolicy="no-referrer"
          />
        )}

        {/* Floating Story Caption Overlay */}
        {activeStory.caption && (
          <div className="absolute bottom-8 left-6 right-6 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 z-30 pointer-events-auto shadow-2xl">
            <p className="text-xs leading-relaxed text-white text-center font-semibold">
              {activeStory.caption}
            </p>
          </div>
        )}

        {/* Interactive Poll Sticker Layer */}
        {activeStory.poll && (
          <div 
            onClick={e => e.stopPropagation()}
            className="absolute top-1/3 left-6 right-6 p-4 rounded-2xl bg-[#080d22]/95 border border-yellow-500/25 backdrop-blur-xl shadow-2xl flex flex-col gap-3 z-30 pointer-events-auto"
          >
            <span className="text-[8px] uppercase tracking-widest text-yellow-400 font-mono font-black text-center">Interactive Poll</span>
            <h5 className="text-xs font-bold text-white text-center leading-normal px-2">{activeStory.poll.question}</h5>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              {activeStory.poll.options.map((opt, oindex) => {
                const hasVoted = justVoted[activeStory.id] !== undefined;
                const votedForThis = justVoted[activeStory.id] === oindex;

                // Total votes calculations
                const baseTotal = activeStory.poll!.options.reduce((sum, o) => sum + o.votes, 0);
                const percent = baseTotal > 0 ? Math.round((opt.votes / baseTotal) * 100) : 50;

                return (
                  <button
                    key={oindex}
                    disabled={hasVoted}
                    onClick={() => handleVote(oindex)}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      votedForThis
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-transparent text-black shadow-lg animate-bounce'
                        : 'bg-white/5 border-white/10 text-gray-200 hover:bg-white/10'
                    }`}
                  >
                    <div>{opt.text}</div>
                    {hasVoted && (
                      <div className="text-[10px] font-mono mt-0.5 text-yellow-400">{percent}%</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Ask Sticker Question Layer */}
        {activeStory.questionPrompt && (
          <div 
            onClick={e => e.stopPropagation()}
            className="absolute top-1/4 left-6 right-6 p-4 rounded-2xl bg-gradient-to-tr from-neutral-900 via-[#0a0f24] to-neutral-950 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col gap-3 items-center z-30 pointer-events-auto"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center animate-pulse shadow-sm">
              <Smile className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-[8px] uppercase tracking-widest text-yellow-400 font-mono font-bold leading-none">Creator Question</span>
            <h5 className="text-xs font-bold text-white text-center leading-normal px-2 mt-0.5">{activeStory.questionPrompt}</h5>
            
            <form onSubmit={handleQuestionSubmit} className="w-full flex gap-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 focus-within:border-yellow-400 transition-colors">
              <input
                type="text"
                placeholder="Type response anonymously..."
                value={questionReply}
                onChange={(e) => setQuestionReply(e.target.value)}
                className="bg-transparent border-none text-xs text-white grow outline-none placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!questionReply.trim()}
                className="p-1 px-2.5 bg-yellow-400 rounded-lg text-[9px] font-bold text-black hover:bg-yellow-500 disabled:opacity-45 transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Slide-Up Viewer Draw Panel layout (Story details & viewers ledger) */}
      <AnimatePresence>
        {showViewers && isOwner && (
          <motion.div 
            initial={{ translateY: '100%' }}
            animate={{ translateY: '0%' }}
            exit={{ translateY: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            onClick={e => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-950 border-t border-white/15 rounded-t-3xl z-40 p-5 pb-8 flex flex-col gap-4 text-left shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-400 animate-pulse" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Story Viewers Ledger</h3>
              </div>
              <button 
                onClick={() => setShowViewers(false)}
                className="p-1 rounded-full bg-white/5 text-gray-400 hover:text-white text-xs font-mono px-2"
              >
                Dismiss
              </button>
            </div>

            <div className="overflow-y-auto max-h-[30vh] flex flex-col gap-2 no-scrollbar pr-1">
              {!activeStory.viewers || activeStory.viewers.length === 0 ? (
                <div className="py-6 text-center text-gray-500 text-5xs font-mono uppercase tracking-widest flex flex-col gap-1 items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-neutral-600 mb-1" />
                  <span>No viewers yet index</span>
                  <span className="text-[8px] text-gray-600 normal-case mt-0.5">Share with connects to begin streaming metrics.</span>
                </div>
              ) : (
                activeStory.viewers.map((viewer) => {
                  const matchingUser = users.find(u => u.id === viewer.userId);
                  return (
                    <div 
                      key={viewer.userId} 
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => {
                        setViewedUserId(viewer.userId);
                        setActiveStoryUserId(null); // Close story viewer
                        setShowViewers(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={viewer.profilePic} className="w-7 h-7 rounded-full object-cover border border-white/10" alt="viewer profile pic" />
                        <div>
                          <span className="font-bold text-xs text-white block leading-none">{viewer.username}</span>
                          <span className="text-[9px] text-gray-450 font-mono mt-0.5 block">Node ID Connect</span>
                        </div>
                      </div>
                      <span className="text-5xs text-gray-500 font-mono">{viewer.timestamp || 'Just now'}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty block to support spacing */}
      <div className="h-6" />
    </div>
  );
};
