import React from 'react';
import { useConnectX } from '../utils/stateManager';

interface StoryAvatarProps {
  userId: string;
  profilePic?: string; // Opt override
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  onClickOverride?: (e: React.MouseEvent) => void;
  disableClick?: boolean;
}

export const StoryAvatar: React.FC<StoryAvatarProps> = ({
  userId,
  profilePic,
  size = 'md',
  onClickOverride,
  disableClick = false
}) => {
  const { stories, users, currentUser, setActiveStoryUserId, setViewedUserId } = useConnectX();

  // Find user details if no profilePic passed
  const targetUser = users.find(u => u.id === userId) || (currentUser?.id === userId ? currentUser : null);
  const avatarUrl = profilePic || targetUser?.profilePic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

  // Get active stories for this specific user
  const userStories = stories.filter(s => s.user.id === userId);
  const hasStories = userStories.length > 0;

  // Determine if there are unviewed stories
  const hasUnviewed = hasStories && userStories.some(s => {
    if (!currentUser) return true;
    return !s.viewers.some(v => v.userId === currentUser.id);
  });

  // Size configurations
  const sizeClasses = {
    'xs': {
      outer: 'w-7 h-7 p-[1.5px]',
      inner: 'bg-black w-full h-full rounded-full p-[1px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-6 h-6 border border-white/10'
    },
    'sm': {
      outer: 'w-9 h-9 p-[1.5px]',
      inner: 'bg-black w-full h-full rounded-full p-[1px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-8 h-8 border border-white/10'
    },
    'md': {
      outer: 'w-11 h-11 p-[2px]',
      inner: 'bg-black w-full h-full rounded-full p-[1.5px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-10 h-10 border border-white/10'
    },
    'lg': {
      outer: 'w-13 h-13 p-[2px]',
      inner: 'bg-black w-full h-full rounded-full p-[1.5px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-12 h-12 border border-white/10'
    },
    'xl': {
      outer: 'w-17 h-17 p-[2.5px]',
      inner: 'bg-black w-full h-full rounded-full p-[1.5px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-16 h-16 border border-white/10'
    },
    '2xl': {
      outer: 'w-21 h-21 p-[3px]',
      inner: 'bg-black w-full h-full rounded-full p-[2px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-20 h-20 border border-white/15'
    },
    '3xl': {
      outer: 'w-25 h-25 p-[3px]',
      inner: 'bg-black w-full h-full rounded-full p-[2px]',
      img: 'w-full h-full rounded-full object-cover',
      noStory: 'w-24 h-24 border border-white/15'
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses['md'];

  const handleClick = (e: React.MouseEvent) => {
    if (disableClick) return;
    e.stopPropagation();

    if (onClickOverride) {
      onClickOverride(e);
      return;
    }

    if (hasStories) {
      // Tap on unviewed/viewed story -> Open full-screen story viewer
      setActiveStoryUserId(userId);
    } else {
      // No active story -> Go to Profile
      setViewedUserId(userId);
    }
  };

  // Render Story Ring component
  if (hasStories) {
    const ringBgClass = hasUnviewed
      ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500 shadow-[0_0_12px_rgba(234,179,8,0.25)]'
      : 'bg-neutral-600';

    return (
      <div 
        onClick={handleClick}
        className={`${currentSize.outer} rounded-full ${ringBgClass} shrink-0 cursor-pointer hover:scale-103 active:scale-97 transition-all`}
      >
        <div className={currentSize.inner}>
          <img 
            src={avatarUrl} 
            className={currentSize.img} 
            alt="User Story" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  // Render Standard avatar with no story
  return (
    <img 
      onClick={handleClick}
      src={avatarUrl} 
      className={`${currentSize.noStory} rounded-full object-cover shrink-0 ${disableClick ? '' : 'cursor-pointer hover:opacity-90 active:scale-97 transition-all'}`} 
      alt="User Profile" 
      referrerPolicy="no-referrer"
    />
  );
};
