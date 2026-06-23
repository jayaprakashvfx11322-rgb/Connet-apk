/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useConnectX } from '../utils/stateManager';
import { 
  MapPin, Link2, Eye, Award, Trash2, DollarSign, 
  Edit, Grid, Image, Play, Video as VideoIcon, 
  Heart, MessageCircle, Share2, Clipboard, ChevronLeft, 
  X, Check, UserPlus, UserMinus, MessageSquare, Send
} from 'lucide-react';
import { MOCK_IMAGES } from '../utils/mockData';
import { SkeletonLoader, EmptyState, ErrorState } from './StateFeedback';
import { StoryAvatar } from './StoryAvatar';

interface ProfilePageProps {
  onOpenSettings: () => void;
  onTriggerCreate?: () => void;
  onNavigate?: (tab: string) => void;
}

const AVAILABLE_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop',
];

const AVAILABLE_COVERS = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
  'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=800',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onOpenSettings, onTriggerCreate, onNavigate }) => {
  const { 
    currentUser, users, posts, reels, videos, deletePost, 
    viewedUserId, setViewedUserId, updateProfile, selectChatUser, addComment 
  } = useConnectX();

  const [activeTab, setActiveTab] = useState<'posts' | 'images' | 'reels' | 'videos'>('posts');
  const [profileState, setProfileState] = useState<'loading' | 'error' | 'success'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals / Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');
  const [editCoverPic, setEditCoverPic] = useState('');

  // Selected post detail lightbox modal
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [selectedPostType, setSelectedPostType] = useState<'post' | 'reel' | 'video'>('post');
  const [newComment, setNewComment] = useState('');

  // Toast banner support
  const [toastMessage, setToastMessage] = useState('');

  if (!currentUser) {
    return (
      <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-white/5 mx-2">
        <span className="text-gray-500 font-mono text-xs block">Please sign up first to inspect profile streams.</span>
      </div>
    );
  }

  // Determine which user profile to load
  const viewedUser = (viewedUserId ? users.find(u => u.id === viewedUserId) : null) || currentUser;
  const isOwnProfile = viewedUser.id === currentUser.id;

  // Follow/Unfollow status (represented as being in currentUser's connections)
  const isFollowing = currentUser.connects.includes(viewedUser.id);

  // Stats calculation
  const userPosts = posts.filter(p => p.user.id === viewedUser.id && (p.mediaType === 'text' || p.mediaType === 'poll'));
  const userImages = posts.filter(p => p.user.id === viewedUser.id && p.mediaType === 'image');
  const userReels = reels.filter(r => r.user.id === viewedUser.id);
  const userVideos = videos.filter(v => v.publisher.id === viewedUser.id);

  const totalPostsCount = userPosts.length + userImages.length + userReels.length + userVideos.length;

  // Real-time Follower Counters matching Instagram rules
  const followersList = users.filter(u => u.connects.includes(viewedUser.id));
  const baseFollowerCount = viewedUser.username === 'kavin_23' ? 2450 : 
                            viewedUser.username === 'priya_vibe' ? 3120 :
                            viewedUser.username === 'anu_creative' ? 840 :
                            viewedUser.username === 'vicky_vlog' ? 1890 : 250;

  const followersCount = baseFollowerCount + followersList.length;
  const followingCount = viewedUser.connects.length + (viewedUser.username === 'kavin_23' ? 431 : 124);

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Toggle follow
  const handleFollowToggle = () => {
    let updatedConnects;
    if (isFollowing) {
      updatedConnects = currentUser.connects.filter(id => id !== viewedUser.id);
      triggerToast(`Unfollowed @${viewedUser.username}`);
    } else {
      updatedConnects = [...currentUser.connects, viewedUser.id];
      triggerToast(`Following @${viewedUser.username}`);
    }
    updateProfile({ connects: updatedConnects });
  };

  // Open Edit Dialog
  const openEditModal = () => {
    setEditUsername(viewedUser.username);
    setEditDisplayName(viewedUser.displayName);
    setEditBio(viewedUser.bio);
    setEditLocation(viewedUser.location);
    setEditWebsite(viewedUser.website);
    setEditProfilePic(viewedUser.profilePic);
    setEditCoverPic(viewedUser.coverPic || MOCK_IMAGES.sunsetOcean);
    setIsEditing(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim() || !editDisplayName.trim()) {
      alert('Username and Display Name are required!');
      return;
    }
    updateProfile({
      username: editUsername.trim(),
      displayName: editDisplayName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      website: editWebsite.trim(),
      profilePic: editProfilePic,
      coverPic: editCoverPic
    });
    setIsEditing(false);
    triggerToast('Profile updated successfully across the platform!');
  };

  // Handle Share Profile Link
  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/p/${viewedUser.username}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast('Instagram-style profile link copied to clipboard!');
    }).catch(() => {
      triggerToast('Linked copied!');
    });
  };

  // Handle direct Message routing
  const handleMessageRoute = () => {
    if (selectChatUser && onNavigate) {
      selectChatUser(viewedUser);
      onNavigate('Messages');
    }
  };

  // Open content detail lightbox
  const handleOpenPostLightbox = (contentItem: any, type: 'post' | 'reel' | 'video') => {
    setSelectedPost(contentItem);
    setSelectedPostType(type);
    setNewComment('');
  };

  // Post dynamic comments in Lightbox
  const handleLightboxCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !newComment.trim()) return;

    if (selectedPostType === 'post') {
      addComment(selectedPost.id, newComment.trim());
      // Refresh selectedPost references inside state
      const freshPost = posts.find(p => p.id === selectedPost.id);
      if (freshPost) {
        setSelectedPost(freshPost);
      }
    } else {
      // Mock and append local comments for reels or videos
      const freshComment = {
        id: 'comm_' + Date.now(),
        username: currentUser.username,
        userDisplayName: currentUser.displayName,
        profilePic: currentUser.profilePic,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.displayName,
          profilePic: currentUser.profilePic
        },
        text: newComment.trim(),
        timestamp: 'Just now'
      };
      
      const updatedPost = {
        ...selectedPost,
        comments: [freshComment, ...(selectedPost.comments || [])]
      };
      setSelectedPost(updatedPost);
    }
    setNewComment('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 pb-24 px-1 font-sans selection:bg-yellow-500 selection:text-black">
      
      {/* Toast Alert message bubble */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 border border-black/10 text-neutral-950 font-bold py-2 px-5 rounded-full shadow-2xl z-50 text-xs tracking-wide animate-bounce flex items-center gap-2">
          <Check className="w-4 h-4 text-neutral-950" />
          {toastMessage}
        </div>
      )}

      {/* Navigation Header Title Bar */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-2">
          {!isOwnProfile && (
            <button 
              onClick={() => setViewedUserId(currentUser.id)}
              className="p-1 hover:bg-neutral-900 rounded-lg text-yellow-400 transition-colors"
              title="Return to my profile"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-sm font-bold font-mono tracking-wider text-yellow-400">
            {isOwnProfile ? 'MY CANVASES NODE' : `@${viewedUser.username}`}
          </span>
        </div>
        
        {isOwnProfile ? (
          <button 
            onClick={openEditModal}
            className="text-2xs font-bold uppercase tracking-wider text-neutral-400 hover:text-yellow-400 transition-colors py-1 px-3 border border-neutral-800 rounded-lg bg-neutral-950/60"
          >
            Quick Edit
          </button>
        ) : (
          <span className="text-4xs font-mono py-1 px-2.5 bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20 uppercase font-bold">
            Viewing Creator
          </span>
        )}
      </div>

      {/* Instagram Banner Cover & Avatar Header Block */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-900 bg-black/40 shadow-2xl">
        {/* Cover Photo */}
        <div className="relative h-40 sm:h-52 w-full bg-neutral-900">
          <img 
            src={viewedUser.coverPic || MOCK_IMAGES.sunsetOcean} 
            className="w-full h-full object-cover opacity-75" 
            alt="Profile cover banner" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-black/30 pointer-events-none" />
        </div>

        {/* PROFILE MAIN HEADER - Overlapping Avatar */}
        <div className="px-5 pb-5 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-14 sm:-mt-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-3.5 text-left">
            {/* Avatar overlapping frame */}
            <div className="shrink-0 relative z-20 mb-2 sm:mb-0">
              <StoryAvatar userId={viewedUser.id} size="2xl" />
            </div>

            {/* Title & Bio Details */}
            <div className="mb-1 text-left">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                  {viewedUser.displayName}
                </h2>
                {followersCount > 1000 && (
                  <span className="w-4.5 h-4.5 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow" title="Verified ConnectX Artist">
                    ✓
                  </span>
                )}
              </div>
              <span className="text-2xs font-mono text-yellow-400/80 tracking-wide block mt-1">@{viewedUser.username}</span>
              
              <p className="text-xs text-gray-300 font-sans mt-2.5 max-w-md leading-relaxed whitespace-pre-wrap">
                {viewedUser.bio || 'Chasing high cpm streams, cinematography portfolios, and authentic creative stories.'}
              </p>

              {/* Location & Website inline row */}
              <div className="flex gap-4 flex-wrap text-4xs font-mono text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-yellow-400/70" />
                  {viewedUser.location || 'Chennai, India'}
                </span>
                {viewedUser.website && (
                  <a 
                    href={`https://${viewedUser.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1 text-yellow-400 hover:underline"
                  >
                    <Link2 className="w-3 h-3 text-yellow-400/70" />
                    {viewedUser.website}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social CTAs Action Row */}
          <div className="flex items-center gap-2 self-start md:self-end mt-2 md:mt-0 shrink-0">
            {isOwnProfile ? (
              <>
                <button 
                  onClick={openEditModal}
                  className="py-2 px-4 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-yellow-400/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button 
                  onClick={handleShareProfile}
                  className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-gray-300 hover:text-white rounded-xl text-xs cursor-pointer shadow-md transition-all shrink-0"
                  title="Share profile link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {/* Follow Button toggles state directly */}
                <button 
                  onClick={handleFollowToggle}
                  className={`py-2 px-4 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer scale-100 uppercase tracking-wider shrink-0 ${
                    isFollowing 
                      ? 'bg-neutral-900 text-gray-400 hover:text-white border border-neutral-800 hover:border-neutral-600' 
                      : 'bg-yellow-400 text-neutral-950 hover:bg-yellow-300 font-black shadow-md hover:shadow-yellow-400/15'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 animate-pulse" />
                      Follow
                    </>
                  )}
                </button>

                {/* Direct DM Message trigger */}
                <button 
                  onClick={handleMessageRoute}
                  className="py-2 px-3 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-gray-200 hover:text-yellow-400 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  title="Secure message enclaves"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message
                </button>

                {/* Share Link */}
                <button 
                  onClick={handleShareProfile}
                  className="p-2 border border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900 text-gray-400 hover:text-white rounded-xl cursor-pointer transition-all shrink-0"
                  title="Share Link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* INSTAGRAM-STYLE THREE COLUMN STATISTICS ROW */}
      <div className="grid grid-cols-3 gap-0.5 border-y border-neutral-900 bg-neutral-950/30 py-3.5 rounded-xl text-center shadow-lg">
        <div>
          <span className="block text-lg font-black text-white font-mono leading-none mb-1">{totalPostsCount}</span>
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Publications</span>
        </div>
        <div>
          <span className="block text-lg font-black text-yellow-400 font-mono leading-none mb-1">{followersCount}</span>
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Followers</span>
        </div>
        <div>
          <span className="block text-lg font-black text-white font-mono leading-none mb-1">{followingCount}</span>
          <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Following</span>
        </div>
      </div>

      {/* INSTAGRAM CONTROLLABLE GRID FILTER VIEW (Tabs) */}
      <div className="flex flex-col gap-2.5 bg-neutral-950/80 border border-neutral-900 p-2 rounded-2xl">
        <div className="grid grid-cols-4 gap-1 border-b border-neutral-900 pb-2">
          {[
            { id: 'posts', label: 'Feeds', icon: Grid, count: userPosts.length },
            { id: 'images', label: 'Snaps', icon: Image, count: userImages.length },
            { id: 'reels', label: 'Reels', icon: Play, count: userReels.length },
            { id: 'videos', label: 'Videos', icon: VideoIcon, count: userVideos.length }
          ].map(tab => {
            const active = activeTab === tab.id;
            const TabIcon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setProfileState('loading');
                  setActiveTab(tab.id as any);
                  setTimeout(() => setProfileState('success'), 200);
                }}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  active 
                    ? 'bg-yellow-400 text-black font-black shadow-md shadow-yellow-400/10' 
                    : 'text-gray-400 hover:text-white hover:bg-neutral-900/40'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span className="text-[9px] uppercase tracking-wider font-extrabold block">
                  {tab.label} ({tab.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* State decoders simulator slider widget */}
        <div className="flex items-center justify-between px-1.5 py-0.5">
          <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest font-black">Secure Data Feed Status:</span>
          <div className="flex items-center gap-1 bg-neutral-900 py-0.5 px-2 border border-neutral-800 rounded-full scale-90 select-none">
            <span className="text-[8px] font-mono text-gray-500 font-bold">MODE:</span>
            <select 
              value={profileState}
              onChange={(e) => {
                const s = e.target.value as any;
                if (s === 'error') setErrorMessage('Payload stream decoding exception (Profile Streams).');
                setProfileState(s);
              }}
              className="bg-transparent text-[8px] font-mono text-yellow-400 font-black uppercase outline-none cursor-pointer"
            >
              <option value="success" className="bg-black text-white">Live Success</option>
              <option value="loading" className="bg-black text-white">Shimmer Load</option>
              <option value="error" className="bg-black text-white">Error Guard</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID DISPLAY CONTENT FEED */}
      <div className="w-full text-left min-h-[250px]">
        {profileState === 'loading' ? (
          <SkeletonLoader variant={activeTab === 'images' ? 'grid' : 'list'} count={4} />
        ) : profileState === 'error' ? (
          <ErrorState 
            message={errorMessage} 
            onRetry={() => {
              setProfileState('loading');
              setTimeout(() => setProfileState('success'), 300);
            }} 
            onRefresh={() => {
              setProfileState('loading');
              setTimeout(() => setProfileState('success'), 300);
            }}
          />
        ) : (
          <>
            
            {/* 1. FEEDS (TEXT/POLL) */}
            {activeTab === 'posts' && (
              userPosts.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950/40 rounded-2xl border border-neutral-900/60 flex flex-col items-center justify-center gap-2">
                  <Grid className="w-8 h-8 text-neutral-700 animate-pulse" />
                  <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">No text stream publications</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userPosts.map(post => (
                    <div 
                      key={post.id} 
                      onClick={() => handleOpenPostLightbox(post, 'post')}
                      className="glass-panel p-4 rounded-2xl border-neutral-900 hover:border-yellow-400/20 bg-neutral-950/20 hover:bg-neutral-950/50 transition-all flex flex-col justify-between gap-3 shadow-md pr-5 cursor-pointer relative group"
                    >
                      <div className="absolute top-4 right-4 text-3xs font-mono text-gray-600 bg-neutral-950 py-0.5 px-2 rounded-full border border-neutral-900 group-hover:text-yellow-400 transition-colors">
                        Click to view
                      </div>

                      <div className="grow">
                        <span className="text-[10px] font-mono text-yellow-400 font-bold tracking-widest block uppercase mb-1">
                          {post.timestamp}
                        </span>
                        <p className="text-xs text-gray-100 leading-normal line-clamp-3">{post.content}</p>
                      </div>

                      {/* Trash deletes allowed on own posts */}
                      {isOwnProfile && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Permanently delete this text post? This is irreversible.")) {
                              deletePost(post.id);
                              triggerToast('Post purged successfully.');
                            }
                          }}
                          className="self-end p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 2. SNAPS (IMAGES GRID) - INSTAGRAM SQUARES STYLE */}
            {activeTab === 'images' && (
              userImages.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950/40 rounded-2xl border border-neutral-900/60 flex flex-col items-center justify-center gap-2">
                  <Image className="w-8 h-8 text-neutral-700" />
                  <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">No photo snapshots uploaded</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  {userImages.map(img => (
                    <div 
                      key={img.id} 
                      onClick={() => handleOpenPostLightbox(img, 'post')}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-900 hover:border-yellow-400/40 bg-neutral-950 transition-all shadow-md cursor-pointer group"
                    >
                      <img src={img.mediaUrls?.[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="snap" referrerPolicy="no-referrer" />
                      
                      {/* Interactive Hover Layer */}
                      <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all">
                        <span className="flex items-center gap-1 text-xs font-bold font-mono text-white">
                          <Heart className="w-4 h-4 text-yellow-400 fill-current" />
                          {Object.keys(img.reactions || {}).length}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-bold font-mono text-white">
                          <MessageCircle className="w-4 h-4 text-cyan-400" />
                          {img.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 3. REELS ASRECT LOOP PLAY LIST */}
            {activeTab === 'reels' && (
              userReels.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950/40 rounded-2xl border border-neutral-900/60 flex flex-col items-center justify-center gap-2">
                  <Play className="w-8 h-8 text-neutral-700" />
                  <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">No short reels uploaded</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
                  {userReels.map(reel => (
                    <div 
                      key={reel.id} 
                      onClick={() => handleOpenPostLightbox(reel, 'reel')}
                      className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-neutral-950 hover:border-yellow-400/40 bg-black cursor-pointer group"
                    >
                      <video src={reel.videoUrl} className="w-full h-full object-cover opacity-80" muted playsInline />
                      
                      <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/40 group-hover:bg-neutral-950/65 transition-all">
                        <Play className="w-6 h-6 text-yellow-400 fill-current opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                      </div>

                      {/* Info overlay inside */}
                      <div className="absolute bottom-2 inset-x-2 text-center select-none bg-black/50 py-1 rounded backdrop-blur-md">
                        <span className="text-[8px] font-mono line-clamp-1 p-0.5 text-gray-300">
                          {reel.caption}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* 4. LONG FORM VIDEOS */}
            {activeTab === 'videos' && (
              userVideos.length === 0 ? (
                <div className="py-16 text-center bg-neutral-950/40 rounded-2xl border border-neutral-900/60 flex flex-col items-center justify-center gap-2">
                  <VideoIcon className="w-8 h-8 text-neutral-700" />
                  <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">No long videos published</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userVideos.map(vid => (
                    <div 
                      key={vid.id} 
                      onClick={() => handleOpenPostLightbox(vid, 'video')}
                      className="glass-panel p-3.5 rounded-2xl border-neutral-900 hover:border-yellow-400/20 bg-neutral-950/30 hover:bg-neutral-900/40 cursor-pointer flex flex-col gap-3 transition-colors text-left"
                    >
                      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-neutral-900 shrink-0">
                        <img src={vid.thumbnailUrl} className="w-full h-full object-cover opacity-80" alt="Thumb" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 right-2 font-mono text-[9px] bg-black/85 text-white py-0.5 px-1.5 rounded-full font-bold">
                          {vid.duration}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 leading-none mb-1.5">{vid.title}</h4>
                        <span className="text-5xs font-mono text-gray-500 uppercase block tracking-wider">
                          Views: {vid.views.toLocaleString()} • Quality: {vid.quality}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </>
        )}
      </div>

      {/* INSTAGRAM EDIT PROFILE SHEET (MODAL OVERLAY) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#070b13] border border-neutral-800 rounded-[28px] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(242,201,76,0.15)] max-h-[90vh] text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h3 className="text-sm font-black text-yellow-400 uppercase tracking-wider font-mono">Edit Canvas Details</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 px-1.5 hover:bg-neutral-900 text-gray-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-5">
              
              {/* Cover Selection Row */}
              <div>
                <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-2 font-black">Select Cover Banner</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVAILABLE_COVERS.map((cov, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setEditCoverPic(cov)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        editCoverPic === cov ? 'border-yellow-400 scale-[1.04]' : 'border-transparent opacity-65 hover:opacity-100'
                      }`}
                    >
                      <img src={cov} className="w-full h-full object-cover" alt="cover option" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Avatar Selection Row */}
              <div>
                <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-2 font-black">Select Profile Avatar</label>
                <div className="grid grid-cols-8 gap-2">
                  {AVAILABLE_AVATARS.map((av, avIdx) => (
                    <button
                      key={avIdx}
                      type="button"
                      onClick={() => setEditProfilePic(av)}
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all h-9 w-9 shrink-0 ${
                        editProfilePic === av ? 'border-yellow-400 scale-[1.06]' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} className="w-full h-full object-cover animate-fade-in" alt="avatar option" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Profile Pic URL Input */}
              <div className="bg-black/40 border border-neutral-900 p-3 rounded-2xl flex flex-col gap-2">
                <span className="text-[8px] font-mono font-bold text-gray-500 uppercase">Or specify Custom URLs:</span>
                <input
                  type="text"
                  placeholder="Custom avatar image URL..."
                  value={editProfilePic}
                  onChange={(e) => setEditProfilePic(e.target.value)}
                  className="w-full py-2 px-3 bg-neutral-950 border border-neutral-800 focus:border-yellow-400 text-3xs text-gray-200 outline-none rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-neutral-950 border border-neutral-850 focus:border-yellow-400 outline-none text-xs text-white rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-neutral-950 border border-neutral-850 focus:border-yellow-400 outline-none text-xs text-white rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">Biography (Bio)</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell your fans or connections about yourself..."
                  className="w-full py-2.5 px-3.5 bg-neutral-950 border border-neutral-850 focus:border-yellow-400 outline-none text-xs text-white rounded-xl resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai, India"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-neutral-950 border border-neutral-850 focus:border-yellow-400 outline-none text-xs text-white rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-5xs font-mono text-gray-500 uppercase tracking-widest block mb-1.5 font-bold">Website</label>
                  <input
                    type="text"
                    placeholder="e.g. connectx.app/myart"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="w-full py-2.5 px-3.5 bg-neutral-950 border border-neutral-850 focus:border-yellow-400 outline-none text-xs text-white rounded-xl font-mono text-yellow-400"
                  />
                </div>
              </div>

              {/* Apply / Save Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-gradient-to-tr from-yellow-500 to-yellow-400 text-black font-black text-xs uppercase tracking-widest active:scale-[0.98] transition-transform rounded-xl cursor-pointer shadow-lg shadow-yellow-400/10"
              >
                Apply Parameters Sync
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INSTAGRAM-STYLE FULLVIEW DETAILS LIGHTBOX MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-3xl bg-[#03060a] border border-neutral-850 rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[92vh] sm:max-h-[85vh] text-left shadow-2xl relative">
            
            {/* Mobile close button */}
            <button 
              onClick={() => setSelectedPost(null)}
              className="md:hidden absolute top-3 right-3 bg-black/60 p-1.5 border border-neutral-800 rounded-full text-white hover:text-yellow-400 z-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* LEFT COLUMN: Media Container (7 cols on desktop) */}
            <div className="md:col-span-7 bg-neutral-950 flex items-center justify-center relative aspect-video md:aspect-square overflow-hidden border-r border-neutral-900/60 max-h-[45vh] md:max-h-[85vh]">
              {selectedPostType === 'post' && selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 ? (
                <img 
                  src={selectedPost.mediaUrls[0]} 
                  className="w-full h-full object-cover" 
                  alt="Selected Snapshot" 
                />
              ) : selectedPostType === 'post' ? (
                /* Text/Poll post */
                <div className="p-8 text-center flex flex-col justify-center min-h-[180px] w-full">
                  <span className="text-3xs uppercase font-mono text-yellow-400/60 mb-2">{selectedPost.timestamp}</span>
                  <p className="text-sm font-sans leading-relaxed text-gray-200 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
              ) : (
                /* Reel or Youtube video */
                <video 
                  src={selectedPost.videoUrl} 
                  className="w-full h-full object-cover" 
                  controls 
                  autoPlay 
                  loop 
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* RIGHT COLUMN: Metadata & Responsive Comments (5 cols on desktop) */}
            <div className="md:col-span-5 flex flex-col justify-between max-h-[47vh] md:max-h-[85vh]">
              
              {/* Header Info */}
              <div className="p-3.5 border-b border-neutral-900 bg-neutral-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      onClick={() => {
                        setViewedUserId(viewedUser.id);
                        setSelectedPost(null);
                      }}
                      className="w-8 h-8 rounded-full p-[1px] bg-yellow-400 border border-black cursor-pointer shadow shrink-0"
                    >
                      <img src={viewedUser.profilePic} className="w-full h-full rounded-full object-cover" alt="Author" />
                    </div>
                    <div className="text-left">
                      <h4 
                        onClick={() => {
                          setViewedUserId(viewedUser.id);
                          setSelectedPost(null);
                        }}
                        className="text-2xs font-extrabold text-white leading-none hover:text-yellow-400 transition-colors cursor-pointer"
                      >
                        {viewedUser.displayName}
                      </h4>
                      <span className="text-[9px] font-mono text-gray-500">@{viewedUser.username}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedPost(null)}
                    className="hidden md:block p-1 hover:bg-neutral-900 border border-transparent hover:border-neutral-805 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Post detail description snippet */}
                {selectedPostType !== 'post' && (
                  <p className="text-[11px] text-gray-300 leading-normal mt-2.5 italic">
                    "{selectedPost.caption || selectedPost.title || selectedPost.description}"
                  </p>
                )}
              </div>

              {/* Comments Feed List Space */}
              <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
                <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-wider block font-bold">
                  Responses & Feedback ({selectedPost.comments?.length || 0})
                </span>

                {(selectedPost.comments || []).length === 0 ? (
                  <div className="py-6 text-center text-gray-600 italic text-[11px]">
                    No comments parsed yet on this node feed.
                  </div>
                ) : (
                  (selectedPost.comments || []).map((comm: any) => {
                    const commenterUser = comm.user || {
                      id: 'user_' + comm.username,
                      username: comm.username,
                      displayName: comm.userDisplayName || comm.username,
                      profilePic: comm.profilePic
                    };

                    return (
                      <div key={comm.id} className="flex gap-2.5 text-left border-b border-neutral-900/45 pb-2">
                        {/* Interactive commenter details */}
                        <div 
                          onClick={() => {
                            setViewedUserId(commenterUser.id);
                            setSelectedPost(null);
                          }}
                          className="w-6.5 h-6.5 rounded-full p-[1px] bg-neutral-800 hover:bg-yellow-400 cursor-pointer shadow shrink-0"
                        >
                          <img src={commenterUser.profilePic} className="w-full h-full rounded-full object-cover" alt="Commenter" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => {
                                setViewedUserId(commenterUser.id);
                                setSelectedPost(null);
                              }}
                              className="text-[10px] font-bold text-white hover:text-yellow-400 transition-colors cursor-pointer"
                            >
                              {commenterUser.displayName || commenterUser.username}
                            </span>
                            <span className="text-[8px] font-mono text-gray-600">@{commenterUser.username}</span>
                          </div>
                          <p className="text-[10.5px] text-gray-300 leading-relaxed mt-0.5">{comm.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Social Action metrics bar (Instagram Style Footer) */}
              <div className="border-t border-neutral-900/60 p-3 bg-neutral-950/40">
                
                {/* Send Comment Input */}
                <form onSubmit={handleLightboxCommentSubmit} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Add an interactive comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-[#090d15] border border-neutral-850 outline-none text-2xs py-2 px-3 rounded-xl text-white placeholder:text-gray-500 focus:border-yellow-400"
                  />
                  <button 
                    type="submit"
                    className="p-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl transition-all cursor-pointer shadow"
                    title="Send comment block"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
