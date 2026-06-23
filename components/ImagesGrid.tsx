/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useConnectX } from '../utils/stateManager';
import { FeedPost } from '../types';
import { MOCK_IMAGES } from '../utils/mockData';
import { 
  Heart, MessageCircle, Share2, Eye, X, Bookmark, Compass,
  FolderHeart, Sparkles, SlidersHorizontal, Image
} from 'lucide-react';
import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';
import { StoryAvatar } from './StoryAvatar';

interface ImagesGridProps {
  onTriggerCreate?: () => void;
}

export const ImagesGrid: React.FC<ImagesGridProps> = ({ onTriggerCreate }) => {
  const { posts, toggleReaction, currentUser, setViewedUserId } = useConnectX();

  const [activeCategory, setActiveCategory] = useState<'Trending' | 'Recent' | 'Following'>('Trending');
  const [imagesState, setImagesState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Lightbox carousel
  const [lightboxPost, setLightboxPost] = useState<FeedPost | null>(null);
  const [collections, setCollections] = useState<string[]>([]); // Saved post IDs

  // Filter images from posts (mediaType === 'image')
  const imagePosts = posts.filter(p => p.mediaType === 'image');


  const toggleCollection = (postId: string) => {
    setCollections(prev => 
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleHeartClick = (e: React.MouseEvent, post: FeedPost) => {
    e.stopPropagation();
    toggleReaction(post.id, 'like');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 pb-20 px-2 font-sans selection:bg-pink-500">
      
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-bold text-gray-500 uppercase">Gallery Explorer</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <Image className="w-6 h-6 text-pink-500" /> Liquid Images
          </h2>
        </div>

        {/* Collections indicator button */}
        <button 
          onClick={() => {
            alert(`Your Secured Vault Collections has ${collections.length} item(s)! Check details inside your Profile page.`);
          }}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-cyan-400 group cursor-pointer"
        >
          <FolderHeart className="w-4 h-4 text-cyan-400 group-hover:scale-115 transition-transform" />
          <span>My Vault ({collections.length})</span>
        </button>
      </div>

      {/* 2. CATEGORIES FILTER PANEL */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          {(['Trending', 'Recent', 'Following'] as const).map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setImagesState('loading');
                  setActiveCategory(cat);
                  setTimeout(() => setImagesState('success'), 450);
                }}
                className={`py-1.5 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-tr from-blue-600 to-pink-500 text-white shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Miniature interactive sandbox indicator */}
          <div className="flex items-center gap-1.5 py-1 px-2.5 bg-neutral-900 border border-white/5 rounded-full">
            <span className="text-[9px] font-mono text-gray-400 font-bold uppercase shrink-0">State:</span>
            <select 
              value={imagesState}
              onChange={(e) => {
                const s = e.target.value as any;
                if (s === 'error') setErrorMessage('Payload integrity check failure (Image Stream).');
                setImagesState(s);
              }}
              className="bg-transparent text-[9px] font-mono text-pink-400 font-black uppercase outline-none cursor-pointer"
            >
              <option value="success" className="bg-black text-white">Live Success</option>
              <option value="loading" className="bg-black text-white">Shimmer Load</option>
              <option value="error" className="bg-black text-white">Error Guard</option>
            </select>
          </div>

          <button className="p-2 bg-neutral-900 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. MASONRY PICS GRID */}
      {imagesState === 'loading' ? (
        <SkeletonLoader variant="grid" />
      ) : imagesState === 'error' ? (
        <ErrorState 
          message={errorMessage} 
          onRetry={() => {
            setImagesState('loading');
            setTimeout(() => setImagesState('success'), 600);
          }} 
          onRefresh={() => {
            setImagesState('loading');
            setTimeout(() => setImagesState('success'), 500);
          }}
        />
      ) : imagePosts.length === 0 ? (
        <EmptyState 
          icon={Compass} 
          title="No Images Uploaded" 
          description={`Your active view "${activeCategory}" currently holds zero registered photography nodes.`}
          actionLabel="Upload First Snap"
          onAction={onTriggerCreate}
          variant="cyan"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {imagePosts.map((post) => {
            const likesCount = Object.keys(post.reactions).length;
            const isLiked = currentUser && post.reactions[currentUser.id] !== undefined;
            const inCollection = collections.includes(post.id);

            return (
              <div
                key={post.id}
                onClick={() => setLightboxPost(post)}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer hover:border-pink-500/30 transition-all shadow-md"
              >
                <img 
                  src={post.mediaUrls?.[0] || MOCK_IMAGES.sunsetOcean} 
                  alt="Photography grid" 
                  className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Overlying glowing reflection */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
                  <div className="flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCollection(post.id);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-md border outline-none cursor-pointer ${
                        inCollection 
                          ? 'bg-cyan-500 border-transparent text-black' 
                          : 'bg-black/30 border-white/10 text-white hover:bg-black/50'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-1">
                      <StoryAvatar 
                        userId={post.user.id} 
                        size="xs" 
                      />
                      <span 
                        onClick={() => setViewedUserId(post.user.id)}
                        className="text-4xs font-bold limit-lines-1 cursor-pointer hover:text-yellow-400 select-none"
                      >
                        @{post.user.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 font-mono text-4xs">
                      <span className="flex items-center gap-0.5">
                        <Heart className={`w-3.5 h-3.5 fill-current ${isLiked ? 'text-pink-500' : 'text-gray-300'}`} onClick={(e) => handleHeartClick(e, post)} />
                        {likesCount + 15}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3.5 h-3.5 text-gray-300" />
                        {post.comments.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gloss Reflection Panel Line */}
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/30 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. CHRYSTAL LIGHTBOX CAROUSEL VIEW */}
      {lightboxPost && (
        <div className="fixed inset-0 bg-black/96 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200">
          
          <button 
            onClick={() => setLightboxPost(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:text-white cursor-pointer hover:bg-white/10 transition-colors z-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full max-w-xl flex flex-col gap-4 relative z-40">
            {/* Image viewport */}
            <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl maxHeight-[65vh] bg-neutral-950">
              <img 
                src={lightboxPost.mediaUrls?.[0] || MOCK_IMAGES.sunsetOcean} 
                alt="Lightbox Fullscale" 
                className="w-full object-contain mx-auto max-h-[60vh]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Picture Meta Details in Frosted Glass Panel */}
            <div className="glass-panel-heavy p-4 rounded-2xl flex flex-col gap-3 border-white/15 shadow-2xl text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <StoryAvatar 
                    userId={lightboxPost.user.id} 
                    size="sm" 
                    onClickOverride={() => { setViewedUserId(lightboxPost.user.id); setLightboxPost(null); }} 
                  />
                  <div>
                    <h4 
                      onClick={() => { setViewedUserId(lightboxPost.user.id); setLightboxPost(null); }}
                      className="text-xs font-bold text-white cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      {lightboxPost.user.displayName}
                    </h4>
                    <span 
                      onClick={() => { setViewedUserId(lightboxPost.user.id); setLightboxPost(null); }}
                      className="text-5xs font-mono text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors"
                    >
                      @{lightboxPost.user.username} • {lightboxPost.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => toggleReaction(lightboxPost.id, 'like')}
                    className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer ${
                      currentUser && lightboxPost.reactions[currentUser.id] !== undefined ? 'text-pink-500 bg-pink-500/10 border border-pink-500/25' : 'text-gray-300'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                  <button 
                    onClick={() => toggleCollection(lightboxPost.id)}
                    className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer ${
                      collections.includes(lightboxPost.id) ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/30' : 'text-gray-300'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      alert("Uncompressed high scale stock downloaded safely! (Simulation)");
                    }}
                    className="p-2 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full text-white text-3xs font-semibold uppercase tracking-widest px-3 cursor-pointer"
                  >
                    Download RAW
                  </button>
                </div>
              </div>

              {/* Text message */}
              <p className="text-xs text-gray-200 font-sans leading-relaxed">
                {lightboxPost.content}
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
