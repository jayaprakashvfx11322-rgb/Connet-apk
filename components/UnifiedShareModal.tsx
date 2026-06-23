/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Check, Link, ExternalLink, Image, Users, MessageCircle, Send, Facebook, Twitter, MessageSquare
} from 'lucide-react';
import { Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useConnectX } from '../utils/stateManager';
import { FeedPost, Reel, YouTubeVideo, Story } from '../types';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface UnifiedShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedPost | Reel | YouTubeVideo | Story;
  contentType: 'writeup' | 'post' | 'clip' | 'video' | 'story';
}

export const UnifiedShareModal: React.FC<UnifiedShareModalProps> = ({
  isOpen,
  onClose,
  item,
  contentType,
}) => {
  const { 
    currentUser, 
    users, 
    addStory, 
    sendMessageToSpecificUser,
    updatePostStats,
    updateReelStats,
    updateVideoStats,
    updateStoryStats
  } = useConnectX();

  const triggerHaptic = useHapticFeedback();

  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss copied state
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!item) return null;

  // Resolve metadata
  const resolveMetadata = () => {
    let title = 'ConnectX Content';
    let description = 'Check out this awesome thread on ConnectX social hub!';
    let imageUrl = 'https://picsum.photos/id/1025/600/400';
    const id = item.id;
    const url = `${window.location.origin}/post/${id}`;

    const userName = (item as any).user?.displayName || (item as any).publisher?.displayName || 'A ConnectX Creator';
    const userTag = (item as any).user?.username || (item as any).publisher?.username || 'creator';

    if (contentType === 'writeup' || contentType === 'post') {
      const p = item as FeedPost;
      title = `Feed post by @${userTag}`;
      description = p.content.substring(0, 100) + (p.content.length > 100 ? '...' : '');
      if (p.mediaUrls && p.mediaUrls.length > 0) {
        imageUrl = p.mediaUrls[0];
      }
    } else if (contentType === 'clip') {
      const r = item as Reel;
      title = `Reel clip by @${userTag}`;
      description = r.caption;
      imageUrl = r.videoUrl || imageUrl;
    } else if (contentType === 'video') {
      const v = item as YouTubeVideo;
      title = v.title;
      description = v.description.substring(0, 120) + (v.description.length > 120 ? '...' : '');
      imageUrl = v.thumbnailUrl || imageUrl;
    } else if (contentType === 'story') {
      const s = item as Story;
      title = `Story update from @${userTag}`;
      description = s.caption || 'A premium visual update story';
      imageUrl = s.mediaUrl || imageUrl;
    }

    return { title, description, imageUrl, url, userName, userTag };
  };

  const metadata = resolveMetadata();

  const triggerLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  const registerShareStats = () => {
    let shares = (item as any).shares || 0;
    if (contentType === 'video') shares = (item as any).sharesCount || 0;
    const increment = 1;

    if (contentType === 'writeup' || contentType === 'post') {
      updatePostStats(item.id, { shares: shares + increment });
    } else if (contentType === 'clip') {
      updateReelStats(item.id, { shares: shares + increment });
    } else if (contentType === 'video') {
      updateVideoStats(item.id, { sharesCount: shares + increment });
    } else if (contentType === 'story') {
      updateStoryStats(item.id, { sharesCount: (item as any).sharesCount + increment });
    }
  };

  // Helper to trigger standard copy link functionality
  const handleCopyLink = () => {
    triggerHaptic('success');
    registerShareStats();
    navigator.clipboard.writeText(metadata.url);
    setCopied(true);
    triggerLocalToast('Link copied! 🔗');
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for native share protocol list fallback
  const handleNativeShare = async () => {
    triggerHaptic('light');
    registerShareStats();
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.title,
          text: `${metadata.description}\n\nShared via ConnectX:`,
          url: metadata.url
        });
        triggerLocalToast('Shared successfully! 📤');
        onClose();
      } catch (err) {
        console.warn('Native share error or closed:', err);
        triggerLocalToast('Share sheet closed');
      }
    } else {
      handleCopyLink();
    }
  };

  // Deep Link Protocols launcher
  const handleAppShare = (appName: string) => {
    registerShareStats();
    const shareText = `${metadata.title} - ${metadata.description} ${metadata.url}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(metadata.url);

    let linkStr = '';
    switch (appName) {
      case 'WhatsApp':
        triggerHaptic('light');
        linkStr = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case 'X (Twitter)':
        triggerHaptic('light');
        linkStr = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(metadata.title)}`;
        break;
      case 'Facebook':
        triggerHaptic('light');
        linkStr = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'Telegram':
        triggerHaptic('light');
        linkStr = `https://telegram.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'Messenger':
        triggerHaptic('light');
        linkStr = `https://www.facebook.com/dialog/send?app_id=123456789&link=${encodedUrl}&redirect_uri=${encodedUrl}`;
        break;
      case 'Instagram':
        triggerHaptic('success');
        navigator.clipboard.writeText(metadata.url);
        triggerLocalToast('Link copied for Instagram! 📸');
        window.open('https://www.instagram.com', '_blank');
        return;
      default:
        handleNativeShare();
        return;
    }

    triggerLocalToast(`Launching ${appName}...`);
    setTimeout(() => {
      window.open(linkStr, '_blank', 'noopener,noreferrer');
    }, 300);
  };

  // Stories publisher
  const handleStoryShare = () => {
    triggerHaptic('success');
    const caption = `Check out @${metadata.userTag}'s premium content!`;
    addStory(metadata.imageUrl, caption, undefined, undefined, true, 'image');
    registerShareStats();
    triggerLocalToast('Re-shared to Story! 📸');
    setTimeout(() => onClose(), 800);
  };

  // Peer-to-peer transmit tool
  const connectedUsers = users.filter(usr => 
    currentUser?.connects?.includes(usr.id)
  );

  const handleConnectionsShare = () => {
    if (connectedUsers.length === 0) {
      triggerHaptic('error');
      triggerLocalToast('Add peer connections first! 👥');
      return;
    }
    triggerHaptic('success');
    connectedUsers.forEach(usr => {
      const fullTextToSend = `Check out this premium content!\n\nShared Link: ${metadata.title}\nLink: ${metadata.url}`;
      sendMessageToSpecificUser(usr.id, fullTextToSend);
    });
    registerShareStats();
    triggerLocalToast(`Transmitted to ${connectedUsers.length} peers! 💬`);
    setTimeout(() => onClose(), 800);
  };

  // Defining clean items grid for the compact Liquid Glass popup
  const shareItems = [
    {
      id: 'whatsapp',
      icon: MessageCircle,
      color: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 border border-transparent',
      action: () => handleAppShare('WhatsApp'),
      title: 'WhatsApp'
    },
    {
      id: 'instagram',
      icon: Instagram,
      color: 'hover:bg-pink-500/10 hover:border-pink-500/30 text-pink-400 border border-transparent',
      action: () => handleAppShare('Instagram'),
      title: 'Instagram'
    },
    {
      id: 'facebook',
      icon: Facebook,
      color: 'hover:bg-blue-500/10 hover:border-blue-500/30 text-blue-400 border border-transparent',
      action: () => handleAppShare('Facebook'),
      title: 'Facebook'
    },
    {
      id: 'telegram',
      icon: Send,
      color: 'hover:bg-sky-500/10 hover:border-sky-500/30 text-sky-400 border border-transparent',
      action: () => handleAppShare('Telegram'),
      title: 'Telegram'
    },
    {
      id: 'messenger',
      icon: MessageSquare,
      color: 'hover:bg-indigo-500/10 hover:border-indigo-500/30 text-indigo-400 border border-transparent',
      action: () => handleAppShare('Messenger'),
      title: 'Messenger'
    },
    {
      id: 'x',
      icon: Twitter,
      color: 'hover:bg-white/10 hover:border-white/30 text-white border border-transparent',
      action: () => handleAppShare('X (Twitter)'),
      title: 'X'
    },
    {
      id: 'copylink',
      icon: copied ? Check : Link,
      color: copied 
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
        : 'hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-400 border border-transparent',
      action: handleCopyLink,
      title: 'Copy Link'
    },
    {
      id: 'more',
      icon: ExternalLink,
      color: 'hover:bg-purple-500/10 hover:border-purple-500/30 text-purple-400 border border-transparent',
      action: handleNativeShare,
      title: 'More Apps'
    },
    {
      id: 'story',
      icon: Image,
      color: 'hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400 border border-transparent',
      action: handleStoryShare,
      title: 'Share to Story'
    },
    {
      id: 'connections',
      icon: Users,
      color: 'hover:bg-teal-500/10 hover:border-teal-500/30 text-teal-400 border border-transparent',
      action: handleConnectionsShare,
      title: 'Share to Connections'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-50 flex flex-col items-center justify-end p-4"
        >
          
          {/* Backdrop Tap Outside Trigger */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            onClick={() => {
              triggerHaptic('selection');
              onClose();
            }} 
          />

          {/* Toast Notification Container, perfectly centered relative to sheet */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.9 }}
                className="absolute bottom-22 bg-black/95 border border-cyan-500/20 px-3 py-1.5 rounded-full shadow-[0_4px_20px_rgba(34,211,238,0.2)] flex items-center gap-1 pointer-events-none z-55 text-[7.5px] font-mono font-bold text-cyan-400 uppercase tracking-wider"
              >
                <div className="w-1 h-1 rounded-full bg-cyan-455 animate-ping" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Redesigned Ultra-Compact Saucer Popup */}
          <motion.div 
            ref={sheetRef}
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 200 }}
            dragElastic={{ top: 0.05, bottom: 0.65 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 50) {
                triggerHaptic('selection');
                onClose();
              }
            }}
            className="relative w-[210px] bg-[#0a0a0c]/95 backdrop-blur-3xl border border-white/10 rounded-[20px] shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex flex-col items-center p-1.5 pb-2 z-10 select-none overflow-hidden mb-2"
          >
            {/* Ambient glowing accent line */}
            <div className="absolute top-0 inset-x-0 h-[1.2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-rose-450 opacity-70 pointer-events-none" />

            {/* Micro Tap/Slide handle */}
            <div className="w-6 h-[2px] bg-white/15 rounded-full shrink-0 cursor-grab active:cursor-grabbing mb-2 transition-colors hover:bg-white/25" />

            {/* Highly optimized Grid containing exactly the 10 icons with pristine 5x2 layout */}
            <div className="grid grid-cols-5 gap-1.5 w-full justify-items-center">
              {shareItems.map((smItem) => {
                const Icon = smItem.icon;
                return (
                  <motion.button
                    key={smItem.id}
                    onClick={() => {
                      smItem.action();
                    }}
                    type="button"
                    whileHover={{ scale: 1.15, y: -1.5 }}
                    whileTap={{ scale: 0.9, y: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-white/[0.03] duration-150 cursor-pointer relative ${smItem.color}`}
                    title={smItem.title}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
