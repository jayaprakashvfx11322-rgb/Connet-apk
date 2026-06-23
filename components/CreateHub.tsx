/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useConnectX } from '../utils/stateManager';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { 
  PenTool, Image, Film, Video, History, HelpCircle, ArrowLeft, Plus, Trash2, 
  Smile, Music, Sparkles, Volume2, Calendar, FileText, Check, Crop, Sliders,
  Tag, MapPin, Play, Pause, RefreshCw, Type, Sticker, VolumeX, AlertTriangle, 
  Sparkle, ShieldAlert, BadgeInfo, CheckCircle2, ChevronRight, ChevronLeft,
  Camera, Upload, Download
} from 'lucide-react';
import { MOCK_IMAGES } from '../utils/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 18 
    }
  }
};

interface CreateHubProps {
  onClose?: () => void;
  initialWorkspace?: 'hub' | 'writeup' | 'post' | 'clips' | 'video' | 'stories';
}

export const CreateHub: React.FC<CreateHubProps> = ({ onClose, initialWorkspace = 'hub' }) => {
  const { 
    addPost, addStory, addReel, addVideo, currentUser, users 
  } = useConnectX();
  const triggerHaptic = useHapticFeedback();

  // Active view state: initialWorkspace or fall back to 'hub'
  const [activeWorkspace, setActiveWorkspace] = useState<'hub' | 'writeup' | 'post' | 'clips' | 'video' | 'stories'>(initialWorkspace);

  // ==========================================
  // 0. CAMERA & UPLOAD OPTIONS FLOW STATES
  // ==========================================
  const [creationFlowStep, setCreationFlowStep] = useState<'options' | 'capture' | 'editor'>(
    initialWorkspace === 'writeup' ? 'editor' : 'options'
  );
  const [videoFileUrl, setVideoFileUrl] = useState<string>('https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4');
  
  // Webcam & Capture States
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Automatically sync/reset step when workspace switches
  const [allowDownloads, setAllowDownloads] = useState<boolean>(true);

  useEffect(() => {
    setAllowDownloads(true);
    if (activeWorkspace === 'writeup') {
      setCreationFlowStep('editor');
    } else if (activeWorkspace !== 'hub') {
      setCreationFlowStep('options');
    }
  }, [activeWorkspace]);

  // Handle webcam start / stop
  const startWebcam = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Webcam access failed, loading high-fidelity simulator:", err);
      setCameraError(err?.message || "Webcam camera hardware not found or blocked.");
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setIsRecording(false);
    setRecordSeconds(0);
  };

  useEffect(() => {
    if (creationFlowStep === 'capture') {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [creationFlowStep]);

  // Record timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Success celebration overlay state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const triggerSuccessParty = (msg: string) => {
    triggerHaptic('success');
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
      setActiveWorkspace(initialWorkspace);
      if (onClose) onClose();
    }, 3500);
  };

  // ==========================================
  // 1. ✍️ WRITEUP WORKSPACE STATE & FUNCTIONS
  // ==========================================
  const [writeupText, setWriteupText] = useState('');
  const [writeupHashtags, setWriteupHashtags] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [writeupPollEnabled, setWriteupPollEnabled] = useState(false);
  const [writeupPollQuestion, setWriteupPollQuestion] = useState('');
  const [writeupPollOptions, setWriteupPollOptions] = useState<string[]>(['Absolutely Yes', 'Not yet']);
  const [writeupAttachment, setWriteupAttachment] = useState<string | null>(null);
  const [writeupScheduled, setWriteupScheduled] = useState(false);
  const [writeupScheduleTime, setWriteupScheduleTime] = useState('2026-06-08T10:00');

  // Draft Autosave & Restore references
  useEffect(() => {
    const savedDraft = localStorage.getItem('cx_writeup_draft');
    if (savedDraft && activeWorkspace === 'writeup' && !writeupText) {
      // Just check if we want to invite user to restore
    }
  }, [activeWorkspace]);

  const saveWriteupDraft = () => {
    localStorage.setItem('cx_writeup_draft', JSON.stringify({
      text: writeupText,
      hashtags: writeupHashtags,
      pollEnabled: writeupPollEnabled,
      pollQuestion: writeupPollQuestion,
      pollOptions: writeupPollOptions,
      attachment: writeupAttachment
    }));
    alert("Draft secured! Your writing progress remains locked inside local cache.");
  };

  const restoreWriteupDraft = () => {
    const saved = localStorage.getItem('cx_writeup_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWriteupText(parsed.text || '');
        setWriteupHashtags(parsed.hashtags || []);
        setWriteupPollEnabled(parsed.pollEnabled || false);
        setWriteupPollQuestion(parsed.pollQuestion || '');
        setWriteupPollOptions(parsed.pollOptions || ['Absolutely Yes', 'Not yet']);
        setWriteupAttachment(parsed.attachment || null);
        alert("Draft parameters restored successfully!");
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("No temporary draft found inside this browser node.");
    }
  };

  const clearWriteupDraft = () => {
    localStorage.removeItem('cx_writeup_draft');
    setWriteupText('');
    setWriteupHashtags([]);
    setWriteupPollEnabled(false);
    setWriteupPollQuestion('');
    setWriteupPollOptions(['Absolutely Yes', 'Not yet']);
    setWriteupAttachment(null);
  };

  const handleAddHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = hashInput.trim().replace(/^#/, '');
    if (clean && !writeupHashtags.includes(clean)) {
      setWriteupHashtags([...writeupHashtags, clean]);
    }
    setHashInput('');
  };

  const handleMentionSelect = (username: string) => {
    setWriteupText(prev => prev + ` @${username} `);
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  const handleAddPollOption = () => {
    if (writeupPollOptions.length < 4) {
      setWriteupPollOptions([...writeupPollOptions, '']);
    }
  };

  const handleUpdatePollOption = (idx: number, val: string) => {
    const next = [...writeupPollOptions];
    next[idx] = val;
    setWriteupPollOptions(next);
  };

  const handleDeletePollOption = (idx: number) => {
    if (writeupPollOptions.length > 2) {
      setWriteupPollOptions(writeupPollOptions.filter((_, i) => i !== idx));
    }
  };

  const applyTextFormat = (tagSymbol: string) => {
    setWriteupText(prev => prev + ` ${tagSymbol}formatted-text${tagSymbol} `);
  };

  const handlePublishWriteup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeupText.trim()) return;

    // Compile hashtags and text
    let finalContent = writeupText;
    if (writeupHashtags.length > 0) {
      finalContent += '\n\n' + writeupHashtags.map(h => `#${h}`).join(' ');
    }

    const attachmentsArray = writeupAttachment ? [writeupAttachment] : undefined;

    if (writeupScheduled) {
      alert(`Publication secure queue logged! Scheduled to launch node release automatically at ${writeupScheduleTime}.`);
      clearWriteupDraft();
      triggerSuccessParty("WriteUp Scheduled in Stream queue!");
      return;
    }

    if (writeupPollEnabled) {
      const filteredOptions = writeupPollOptions.map(o => o.trim()).filter(Boolean);
      if (!writeupPollQuestion.trim() || filteredOptions.length < 2) {
        alert("Please specify a poll question and at least 2 option outcomes.");
        return;
      }
      addPost(finalContent, attachmentsArray, 'poll', {
        question: writeupPollQuestion.trim(),
        options: filteredOptions
      });
    } else {
      addPost(finalContent, attachmentsArray, writeupAttachment ? 'image' : 'text');
    }

    clearWriteupDraft();
    triggerSuccessParty("Facebook-style WriteUp compiled and index-synced successfully!");
  };

  // ==========================================
  // 2. 📸 POST WORKSPACE STATE & FUNCTIONS
  // ==========================================
  const postPresetImages = [
    MOCK_IMAGES.sunsetOcean,
    MOCK_IMAGES.neonCyber,
    MOCK_IMAGES.setup,
    MOCK_IMAGES.mountain,
    MOCK_IMAGES.festival,
    MOCK_IMAGES.techGadget
  ];
  const [postSelectedImages, setPostSelectedImages] = useState<string[]>([MOCK_IMAGES.sunsetOcean]);
  const [postActiveSlide, setPostActiveSlide] = useState(0);
  const [postCaption, setPostCaption] = useState('');
  
  // Crop & Transform state
  const [postFilter, setPostFilter] = useState<'normal' | 'clarendon' | 'lark' | 'juno' | 'moon' | 'valencia'>('normal');
  const [postZoom, setPostZoom] = useState(1.0);
  const [postRotation, setPostRotation] = useState(0);
  const [postAspectRatio, setPostAspectRatio] = useState<'1:1' | '4:5' | '16:9'>('1:1');

  // Coordinated Tagging State
  const [taggedPeople, setTaggedPeople] = useState<{ name: string; x: number; y: number }[]>([]);
  const [taggingMode, setTaggingMode] = useState(false);
  const [tagInputName, setTagInputName] = useState('');
  const [pendingTagCoords, setPendingTagCoords] = useState<{ x: number; y: number } | null>(null);
  const [postLocation, setPostLocation] = useState('Silicon Valley, California');

  const getFilterStyles = (f: string) => {
    switch (f) {
      case 'clarendon': return 'saturate-[1.4] contrast-[1.1] brightness-[1.05]';
      case 'lark': return 'hue-rotate-[-8deg] saturate-[1.1] brightness-[1.05]';
      case 'juno': return 'sepia-[0.15] saturate-[1.3] hue-rotate-[10deg] contrast-[1.05]';
      case 'moon': return 'grayscale-[1.0] contrast-[1.3] brightness-[0.95]';
      case 'valencia': return 'sepia-[0.35] saturate-[1.1] contrast-[0.9]';
      default: return '';
    }
  };

  const handlePostImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!taggingMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingTagCoords({ x, y });
  };

  const handleSaveTag = () => {
    if (pendingTagCoords && tagInputName.trim()) {
      setTaggedPeople([...taggedPeople, { name: tagInputName.trim(), ...pendingTagCoords }]);
      setTagInputName('');
      setPendingTagCoords(null);
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTaggedPeople(taggedPeople.filter((_, i) => i !== idx));
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (postSelectedImages.length === 0) return;

    // Compile mentions or tags inside caption if any location
    let finalCaption = postCaption;
    if (postLocation) {
      finalCaption += ` \n📍 ${postLocation}`;
    }
    if (taggedPeople.length > 0) {
      finalCaption += ` \nwith ` + taggedPeople.map(t => `@${t.name}`).join(' ');
    }

    // Publish photo carousel back into post arrays
    addPost(finalCaption, postSelectedImages, 'image', undefined, allowDownloads);
    triggerSuccessParty("Instagram-style visual photography post published!");
  };

  // ==========================================
  // 3. 🎬 CLIPS WORKSPACE STATE & FUNCTIONS
  // ==========================================
  const clipPresetVideos = [
    { name: 'Joyrides Loop', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
    { name: 'Escapes Horizon', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' }
  ];
  const [clipVideoUrl, setClipVideoUrl] = useState(clipPresetVideos[0].url);
  const [clipDuration, setClipDuration] = useState(30); // in seconds (15 to 90s)
  const [clipCaption, setClipCaption] = useState('');
  
  // Audios overlay picker
  const clipAudios = [
    { title: 'Chill Synthwave Pulse', artist: 'HoloSound' },
    { title: 'Lofi Coffee Afternoon', artist: 'BeatEngine' },
    { title: 'Sublime Deep Tech Rhythm', artist: 'Anu G' },
    { title: 'Cybernetic Rain Lounge', artist: 'RetroLoop' }
  ];
  const [selectedClipAudio, setSelectedClipAudio] = useState(clipAudios[0].title);
  const [audioPlay, setAudioPlay] = useState(false);
  const [volumeOriginal, setVolumeOriginal] = useState(80);
  const [volumeMusic, setVolumeMusic] = useState(50);

  // Overlays effects
  const [clipViewportEffect, setClipViewportEffect] = useState<'none' | 'scanline' | 'cyanflicker' | 'vintage'>('none');
  const [placedOverlays, setPlacedOverlays] = useState<{ id: number; text: string; color: string; style: string }[]>([]);
  const [newOverlayText, setNewOverlayText] = useState('');
  const [newOverlayColor, setNewOverlayColor] = useState('cyan');
  const [newOverlayStyle, setNewOverlayStyle] = useState('font-display');

  // Movable stickers picker
  const presetEmojis = ['🔥', '👾', '🚀', '💯', '✨', '🍿', '🎸', '🌟', '💖', '💡'];
  const [placedStickers, setPlacedStickers] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);

  // Teleprompter / Sensi-Captions ticker simulation
  const [autoCaptionsRunning, setAutoCaptionsRunning] = useState(false);
  const [autoCaptionsProgress, setAutoCaptionsProgress] = useState(0);
  const [activeCaptionPhrase, setActiveCaptionPhrase] = useState('');
  const simulatedSubtitles = [
    { time: 10, text: "Yo! Ready to unlock ConnectX?" },
    { time: 35, text: "The first Liquid Glass workspace is live." },
    { time: 65, text: "Assemble your loops instantly in under 60 seconds!" },
    { time: 90, text: "Let me know your feedback in comments! ✨" }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoCaptionsRunning && autoCaptionsProgress < 100) {
      timer = setTimeout(() => {
        setAutoCaptionsProgress(prev => {
          const next = prev + 5;
          if (next >= 100) {
            setAutoCaptionsRunning(false);
            // set interactive caption text ticking
            let capIdx = 0;
            const capTick = setInterval(() => {
              if (capIdx < simulatedSubtitles.length) {
                setActiveCaptionPhrase(simulatedSubtitles[capIdx].text);
                capIdx++;
              } else {
                clearInterval(capTick);
                setActiveCaptionPhrase('');
              }
            }, 1800);
          }
          return next;
        });
      }, 100);
    }
    return () => clearTimeout(timer);
  }, [autoCaptionsRunning, autoCaptionsProgress]);

  const handleAddTextOverlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOverlayText.trim()) {
      setPlacedOverlays([...placedOverlays, {
        id: Date.now(),
        text: newOverlayText.trim(),
        color: newOverlayColor,
        style: newOverlayStyle
      }]);
      setNewOverlayText('');
    }
  };

  const handlePlaceSticker = (emoji: string) => {
    setPlacedStickers([...placedStickers, {
      id: Date.now(),
      emoji,
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 50
    }]);
  };

  const handlePublishClip = (e: React.FormEvent) => {
    e.preventDefault();
    // Gather hashtags from layout text caption
    const hashtags = clipCaption.match(/#\w+/g)?.map(h => h.substring(1)) || ['clips', 'loops'];

    addReel(
      clipCaption || 'Felt creative. Live loop stream sequence!',
      clipVideoUrl,
      selectedClipAudio,
      hashtags,
      allowDownloads
    );
    triggerSuccessParty("Vertical short loop Clip compiled on Reels list!");
  };

  // ==========================================
  // 4. 🎥 VIDEO WORKSPACE STATE & FUNCTIONS
  // ==========================================
  const videoPresetUrls = [
    { title: 'Tech Gadgets Overview', duration: '12:35' },
    { title: 'Immersive Travel Vlogs', duration: '24:50' },
    { title: 'Electronic Retro Session', duration: '01:15:00' }
  ];
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoCategory, setVideoCategory] = useState<'Tech' | 'Gaming' | 'Vlogs' | 'Music' | 'Comedy' | 'Education'>('Tech');
  const [videoDuration, setVideoDuration] = useState('12:35');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState(MOCK_IMAGES.techGadget);
  const [videoTags, setVideoTags] = useState<string[]>(['reviews', 'engineering']);
  const [newTagInput, setNewTagInput] = useState('');
  const [videoPlaylist, setVideoPlaylist] = useState('Featured Series');

  // Progressive Sync Stream steps states
  const [videoUploadState, setVideoUploadState] = useState<'idle' | 'hashing' | 'uploading' | 'multiplexing' | 'finishing'>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);

  const startVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    setVideoUploadState('hashing');
    setUploadPercent(0);

    setTimeout(() => {
      setVideoUploadState('uploading');
      const timer = setInterval(() => {
        setUploadPercent(p => {
          if (p >= 100) {
            clearInterval(timer);
            setVideoUploadState('multiplexing');
            setTimeout(() => {
              setVideoUploadState('finishing');
              setTimeout(() => {
                // Done! Save and publish
                addVideo(
                  videoTitle,
                  videoDescription,
                  videoCategory,
                  videoFileUrl,
                  videoThumbnailUrl,
                  videoDuration,
                  '1080p',
                  allowDownloads
                );
                setVideoUploadState('idle');
                triggerSuccessParty(`Widescreen TV video "${videoTitle}" indexed safely!`);
              }, 1200);
            }, 1000);
            return 100;
          }
          return p + 10;
        });
      }, 150);
    }, 1000);
  };

  const handleAddVideoTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toLowerCase();
    if (clean && !videoTags.includes(clean)) {
      setVideoTags([...videoTags, clean]);
    }
    setNewTagInput('');
  };

  // ==========================================
  // 5. 📖 STORIES WORKSPACE STATE & FUNCTIONS
  // ==========================================
  const storyBackgrounds = [
    { name: 'Pink Retro', class: 'bg-gradient-to-tr from-pink-600 via-purple-700 to-indigo-900' },
    { name: 'Aurora Space', class: 'bg-gradient-to-br from-teal-800 via-indigo-950 to-neutral-900' },
    { name: 'Neon Cyber', class: 'bg-gradient-to-b from-rose-500 via-purple-600 to-sky-750' },
    { name: 'Sleek Eclipse', class: 'bg-gradient-to-tr from-stone-900 via-blue-950 to-neutral-800' }
  ];
  const [storyActiveBg, setStoryActiveBg] = useState(0);
  const [storyBackgroundMedia, setStoryBackgroundMedia] = useState<string | null>(null);
  const [storyAudioTrack, setStoryAudioTrack] = useState('Lo-Fi Wind Vibe');
  const [storyAudioPlaying, setStoryAudioPlaying] = useState(false);
  const [storyQuestionPrompt, setStoryQuestionPrompt] = useState('Drop an anonymous question...');
  const [storyQuestionTheme, setStoryQuestionTheme] = useState<'cyan' | 'pink' | 'emerald'>('cyan');

  // Stories Poll Widget overlays
  const [storyPollEnabled, setStoryPollEnabled] = useState(false);
  const [storyPollQuestion, setStoryPollQuestion] = useState('Are you joining the live hub tomorrow?');
  const [storyPollYesLabel, setStoryPollYesLabel] = useState('Heck Yes');
  const [storyPollNoLabel, setStoryPollNoLabel] = useState('Not yet');

  // Stories mentions system
  const [storyMentionsList, setStoryMentionsList] = useState<string[]>([]);
  const [storyCaption, setStoryCaption] = useState('');

  const handleToggleStoryMention = (username: string) => {
    if (storyMentionsList.includes(username)) {
      setStoryMentionsList(storyMentionsList.filter(u => u !== username));
    } else {
      setStoryMentionsList([...storyMentionsList, username]);
    }
  };

  const handlePublishStory = (e: React.FormEvent) => {
    e.preventDefault();

    let fullPollConfig = undefined;
    if (storyPollEnabled) {
      fullPollConfig = {
        question: storyPollQuestion,
        options: [
          { text: storyPollYesLabel || 'Yes', votes: 0 },
          { text: storyPollNoLabel || 'No', votes: 0 }
        ]
      };
    }

    // Compile story mentions right into caption description prefix
    let finalCaption = storyCaption;
    if (storyMentionsList.length > 0) {
      finalCaption = (finalCaption ? finalCaption + ' ' : '') + storyMentionsList.map(u => `@${u}`).join(' ');
    }

    // Story thumbnail images
    const activeMedia = storyBackgroundMedia || MOCK_IMAGES.sunsetOcean;

    addStory(
      activeMedia,
      finalCaption || undefined,
      storyQuestionPrompt || undefined,
      fullPollConfig,
      allowDownloads
    );

    triggerSuccessParty("Ephemeral 24H Story dispatched and loaded onto Node server!");
  };

  // Helper formatting for overlays lists
  const getOverlayFontClass = (style: string) => {
    switch (style) {
      case 'font-mono': return 'font-mono tracking-wider';
      case 'font-serif': return 'font-serif italic';
      default: return 'font-display font-extrabold tracking-tight uppercase';
    }
  };

  const getOverlayColorClass = (color: string) => {
    switch (color) {
      case 'pink': return 'text-pink-500 text-shadow-[0_0_10px_rgba(236,72,153,0.5)]';
      case 'emerald': return 'text-emerald-400 text-shadow-[0_0_10px_rgba(52,211,153,0.5)]';
      case 'gold': return 'text-yellow-400 text-shadow-[0_0_10px_rgba(250,204,21,0.5)]';
      default: return 'text-cyan-400 text-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-24 px-2 select-none relative">
      
      {/* SUCCESS OVERLAY PANEL */}
      {successMessage && (
        <div className="fixed inset-0 bg-[#020512]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
          <div className="glass-panel p-8 max-w-sm rounded-[32px] border-cyan-500/25 text-center flex flex-col items-center gap-4 shadow-[#22d3ee]/5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-[1.5px] animate-[bounce_1s_infinite]">
              <div className="w-full h-full bg-[#080f26] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-display font-black tracking-tight text-white mb-2 uppercase">Creation Synchronized</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{successMessage}</p>
            </div>

            <span className="text-[9px] font-mono py-1 px-3 bg-white/5 border border-white/10 rounded-full text-cyan-300 uppercase tracking-widest font-bold">
              Secure Stream Lock
            </span>
          </div>
        </div>
      )}

      {/* HUB POPUP MENU (Liquid Glass Picker) */}
      {activeWorkspace === 'hub' && (
        <div className="flex flex-col gap-3.5 text-center py-1.5 relative z-10 animate-in fade-in duration-300">
          <div className="flex flex-col gap-0.5 items-center relative">
            <div className="flex items-center justify-between w-full">
              <div className="flex-grow">
                <span className="text-[7.5px] font-mono tracking-[0.22em] text-cyan-400 uppercase font-black">
                  NEW CONTENT STREAM
                </span>
                <h2 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight mt-0.5 bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent">
                  Create
                </h2>
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-0 top-0 p-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer flex items-center justify-center shadow-lg hover:shadow-cyan-500/10"
                  title="Close Dialog"
                >
                  <Plus className="w-4 h-4 transform rotate-45" />
                </button>
              )}
            </div>
          </div>

          <motion.div 
            className="create-hub-container grid grid-cols-5 gap-1.5 w-full mt-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { 
                id: 'writeup', 
                label: 'WriteUp', 
                tagline: 'Share thoughts',
                emoji: '✍️',
                desc: 'Text, hashtags, polls & scheduling', 
                icon: PenTool,
                glowClass: 'hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-cyan-500/10 hover:ring-cyan-400/30 text-cyan-400 border-cyan-500/15',
                bgClass: 'from-cyan-950/20 to-neutral-950/90',
                iconBg: 'bg-cyan-500/10 text-cyan-455 border-cyan-500/15 group-hover:bg-cyan-500/20',
              },
              { 
                id: 'post', 
                label: 'Post', 
                tagline: 'Upload photo',
                emoji: '📸',
                desc: 'Carousel, crop & tags', 
                icon: Image,
                glowClass: 'hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-pink-500/10 hover:ring-pink-400/30 text-pink-400 border-pink-500/15',
                bgClass: 'from-pink-950/20 to-neutral-950/90',
                iconBg: 'bg-pink-500/10 text-pink-455 border-pink-500/15 group-hover:bg-pink-500/20',
              },
              { 
                id: 'clips', 
                label: 'Clips', 
                tagline: 'Record clip',
                emoji: '🎬',
                desc: 'Short vertical reels & music', 
                icon: Film,
                glowClass: 'hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-purple-500/10 hover:ring-purple-400/30 text-purple-400 border-purple-500/15',
                bgClass: 'from-purple-950/20 to-neutral-950/90',
                iconBg: 'bg-purple-500/10 text-purple-455 border-purple-500/20 group-hover:bg-purple-500/20',
              },
              { 
                id: 'video', 
                label: 'Video', 
                tagline: 'Post video',
                emoji: '🎥',
                desc: 'Long video & thumb upload', 
                icon: Video,
                glowClass: 'hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-indigo-500/10 hover:ring-indigo-400/30 text-indigo-400 border-indigo-500/15',
                bgClass: 'from-indigo-950/20 to-neutral-950/90',
                iconBg: 'bg-indigo-500/10 text-indigo-455 border-indigo-500/15 group-hover:bg-indigo-500/20',
              },
              { 
                id: 'stories', 
                label: 'Stories', 
                tagline: 'Temporary story',
                emoji: '📖',
                desc: '24h ephemeral posts & stickers', 
                icon: History,
                glowClass: 'hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] ring-amber-500/10 hover:ring-amber-400/30 text-amber-400 border-amber-500/15',
                bgClass: 'from-amber-950/20 to-neutral-950/90',
                iconBg: 'bg-amber-500/10 text-amber-455 border-amber-500/25 group-hover:bg-amber-500/20',
              }
            ].map((opt) => {
              const IconComponent = opt.icon;
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveWorkspace(opt.id as any);
                  }}
                  variants={itemVariants}
                  whileHover={{ 
                    y: -3, 
                    rotate: 0.5,
                    transition: { type: "spring", stiffness: 450, damping: 15 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`glass-panel border border-white/10 group relative overflow-hidden rounded-xl p-2 md:p-3 flex flex-col justify-between items-start text-left h-[105px] ring-1 cursor-pointer ${opt.glowClass}`}
                >
                  {/* Glass reflective gloss overlays */}
                  <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-100"></div>
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/[0.02] to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

                  <div className="flex flex-col gap-1.5 relative z-10 w-full">
                    {/* Glowing Icon surround container */}
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-300 ${opt.iconBg} shadow-inner`}>
                      <IconComponent className="w-3.5 h-3.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[8.5px] font-sub font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <span>{opt.emoji}</span>
                        <span className="group-hover:text-white transition-colors">{opt.label}</span>
                      </span>
                      <span className="text-[7.5px] text-gray-400 font-medium tracking-wide mt-0.5 group-hover:text-gray-200 transition-colors">
                        {opt.tagline}
                      </span>
                      <p className="text-[7.5px] text-gray-500 mt-1 leading-normal group-hover:text-gray-300 transition-colors line-clamp-2">
                        {opt.desc}
                      </p>
                    </div>
                  </div>

                  {/* Flow Action tag / Indicator */}
                  <div className="w-full relative z-10 flex justify-between items-center text-[7.5px] font-mono tracking-wider uppercase text-gray-500 group-hover:text-white transition-colors mt-auto pt-1 border-t border-white/5">
                    <span>Init</span>
                    <Plus className="w-2.5 h-2.5 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:rotate-90 transition-all duration-300" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
          
          <div className="text-[8px] font-mono text-gray-500 mt-1">
            Apple Liquid Glass Creation Desk • Autopipelined Content
          </div>
        </div>
      )}


      {/* WORKSPACE DETAILED VIEWS */}
      {activeWorkspace !== 'hub' && (
        <div className="flex flex-col gap-4 text-left animate-in fade-in duration-350">
          
          {/* Back handle bar */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                triggerHaptic('light');
                if (activeWorkspace !== 'writeup' && creationFlowStep !== 'options') {
                  setCreationFlowStep('options');
                } else if (initialWorkspace !== 'hub' && onClose) {
                  onClose();
                } else {
                  setActiveWorkspace('hub');
                }
              }}
              className="py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-white rounded-xl font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/5 z-20"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>
                {activeWorkspace !== 'writeup' && creationFlowStep !== 'options'
                  ? 'Back to Sourcing'
                  : (initialWorkspace !== 'hub' ? 'Cancel & Close' : 'Back to Creative Deck')}
              </span>
            </button>

            <span className="text-[10px] uppercase font-mono font-extrabold text-gray-500 flex items-center gap-1.5 z-20">
              <span>Node: {activeWorkspace.toUpperCase()}</span>
              {activeWorkspace !== 'writeup' && (
                <>
                  <span className="text-gray-700">•</span>
                  <span className="text-cyan-400">{creationFlowStep.toUpperCase()}</span>
                </>
              )}
            </span>
          </div>

          {/* ======================================= */}
          {/* CAMERA & UPLOAD OPTIONS SELECTION SLOTS */}
          {/* ======================================= */}
          {activeWorkspace !== 'writeup' && creationFlowStep === 'options' && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-2xl mx-auto w-full animate-in zoom-in-95 duration-305 z-10">
              <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase font-black bg-cyan-400/10 py-1.5 px-4 rounded-full border border-cyan-400/20 mb-3 block">
                {activeWorkspace === 'post' ? '📸 POST MODEL' : activeWorkspace === 'clips' ? '🎬 CLIPS MODEL' : activeWorkspace === 'video' ? '🎥 VIDEO MODEL' : '📖 STORY MODEL'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight mt-1">
                Choose Import Stream
              </h2>
              <p className="text-xs text-gray-400 max-w-md mt-2 mb-8 leading-relaxed">
                Connect and sync real-time content. Record live feed using device sensor, or upload from directory gallery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* Mode A: Capture Card */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setCreationFlowStep('capture');
                  }}
                  className="group relative flex flex-col items-center justify-center p-6 bg-[#070b19]/80 hover:bg-[#0b1227]/90 border border-white/10 hover:border-cyan-400/40 rounded-[28px] text-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_35px_rgba(34,211,238,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-105 transition-opacity" />
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform mb-4 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                    <Camera className="w-6.5 h-6.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Capture Live Feed
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed max-w-xs">
                    {activeWorkspace === 'post' && "Shoot a high-res photo in Photo Mode."}
                    {activeWorkspace === 'clips' && "Record short vertical clips for stream sequence."}
                    {activeWorkspace === 'video' && "Capture long-form cinematic video feed."}
                    {activeWorkspace === 'stories' && "Record or snap temporary story snippets."}
                  </p>
                </button>

                {/* Mode B: Upload Card */}
                <label className="group relative flex flex-col items-center justify-center p-6 bg-[#070b19]/80 hover:bg-[#0b1227]/90 border border-white/10 hover:border-pink-500/40 rounded-[28px] text-center cursor-pointer transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_35px_rgba(236,72,153,0.15)] overflow-hidden">
                  <input
                    type="file"
                    className="hidden"
                    accept={
                      activeWorkspace === 'post' ? 'image/*' : 
                      activeWorkspace === 'clips' ? 'video/*' : 
                      activeWorkspace === 'video' ? 'video/*' : 
                      'image/*,video/*'
                    }
                    onChange={(e) => {
                      triggerHaptic('medium');
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        if (activeWorkspace === 'post') {
                          setPostSelectedImages([url]);
                        } else if (activeWorkspace === 'clips') {
                          setClipVideoUrl(url);
                        } else if (activeWorkspace === 'video') {
                          setVideoFileUrl(url);
                        } else if (activeWorkspace === 'stories') {
                          setStoryBackgroundMedia(url);
                        }
                        setCreationFlowStep('editor');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-transparent opacity-0 group-hover:opacity-105 transition-opacity" />
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/25 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform mb-4 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                    <Upload className="w-6.5 h-6.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                    Upload from Gallery
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed max-w-xs">
                    Import files from your device. Supports standard video/image content synchronization.
                  </p>
                </label>
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* DEVICE LIVE INTUITIVE CAMERA SENSOR    */}
          {/* ======================================= */}
          {activeWorkspace !== 'writeup' && creationFlowStep === 'capture' && (
            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full gap-5 py-2 animate-in slide-in-from-bottom-8 duration-300 z-10">
              
              <div className="flex justify-between items-center w-full px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-wider font-extrabold text-white uppercase">
                    {isRecording ? `REC ${Math.floor(recordSeconds / 60)}:${String(recordSeconds % 60).padStart(2, '0')}` : 'CAMERA INSTANCE'}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-gray-400">
                  {activeWorkspace === 'post' ? 'PHOTO MODE' : activeWorkspace === 'clips' ? 'CLIP RECORDING' : activeWorkspace === 'video' ? 'LONG VIDEO' : 'STORY MODE'}
                </div>
              </div>

              <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-[24px] bg-black border border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center group min-h-[250px] sm:min-h-[350px]">
                <div className="absolute inset-0 border border-white/5 grid grid-cols-3 grid-rows-3 pointer-events-none z-10 opacity-45">
                  <div className="border-r border-b border-white/5" />
                  <div className="border-r border-b border-white/5" />
                  <div className="border-b border-white/5" />
                  <div className="border-r border-b border-white/5" />
                  <div className="border-r border-b border-white/5" />
                  <div className="border-b border-white/5" />
                  <div className="border-r border-white/5" />
                  <div className="border-r border-white/5" />
                  <div />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10 opacity-20" />

                {webcamStream && !cameraError ? (
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center p-6 text-center overflow-hidden">
                    {activeWorkspace === 'post' && (
                      <div className="absolute inset-0 bg-cover bg-center blur-sm transform scale-105 saturate-[1.2]" style={{ backgroundImage: `url(${MOCK_IMAGES.neonCyber})` }} />
                    )}
                    {activeWorkspace === 'clips' && (
                      <div className="absolute inset-0 bg-cover bg-center blur-sm transform scale-105 saturate-[1.2]" style={{ backgroundImage: `url(${MOCK_IMAGES.sunsetOcean})` }} />
                    )}
                    {activeWorkspace === 'video' && (
                      <div className="absolute inset-0 bg-cover bg-center blur-sm transform scale-105 saturate-[1.2]" style={{ backgroundImage: `url(${MOCK_IMAGES.setup})` }} />
                    )}
                    {activeWorkspace === 'stories' && (
                      <div className="absolute inset-0 bg-cover bg-center blur-sm transform scale-105 saturate-[1.2]" style={{ backgroundImage: `url(${MOCK_IMAGES.mountain})` }} />
                    )}
                    
                    <div className="p-5 py-7 glass-panel rounded-3xl border-white/10 max-w-sm relative z-10 m-3 backdrop-blur-md bg-[#020510]/50 shadow-2xl">
                      <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse mb-3" />
                      <h4 className="text-xs font-extrabold text-white font-mono uppercase tracking-[0.1em]">Virtual Camera Active</h4>
                      <p className="text-[10px] text-gray-300 mt-2 leading-relaxed">
                        Camera hardware simulated successfully in this sandbox node. Tap below to capture a high-quality preset stream feed!
                      </p>
                      {cameraError && (
                        <div className="text-[8px] bg-amber-500/10 border border-amber-500/25 text-amber-400 font-mono py-1 px-2.5 rounded-lg mt-3 leading-normal">
                          Notice: {cameraError}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur border border-white/10 py-1 px-2 rounded-xl text-[8px] font-mono text-gray-300 flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>ISO 100</span>
                  <span>•</span>
                  <span>1080P/60FPS</span>
                </div>

                <div className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur border border-white/10 py-1 px-2 rounded-xl text-[8px] font-mono text-gray-300 flex items-center gap-1.5 shadow-md">
                  <span>WLI: 5400K</span>
                  <span>•</span>
                  <span>SHUTTER: 1/125</span>
                </div>

                {isRecording && (
                  <div className="absolute bottom-4 left-4 z-10 bg-red-650/80 backdrop-blur border border-red-500/20 py-1 px-2.5 rounded-xl text-[9px] font-mono font-black text-white animate-pulse shadow-md flex items-center gap-1">
                    <span>🔴 VIDEO LIVE WRITING</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-3 w-full mt-2">
                <div className="flex items-center gap-8 justify-center">
                  
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCreationFlowStep('options');
                    }}
                    className="p-3 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-full hover:bg-white/10 active:scale-95 transition-all text-xs"
                    title="Change Input"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {activeWorkspace === 'post' ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('double');
                        const captureUrl = MOCK_IMAGES.neonCyber; 
                        setPostSelectedImages([captureUrl]);
                        setCreationFlowStep('editor');
                      }}
                      className="w-16 h-16 rounded-full border-4 border-white p-1 bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center relative cursor-pointer"
                      title="Capture Photo"
                    >
                      <div className="w-full h-full bg-white rounded-full shadow-inner shadow-black/25" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(isRecording ? [40, 20, 45] : 30);
                        if (isRecording) {
                          setIsRecording(false);
                          if (activeWorkspace === 'clips') {
                            setClipVideoUrl(clipPresetVideos[1].url);
                          } else if (activeWorkspace === 'video') {
                            setVideoFileUrl('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');
                          } else if (activeWorkspace === 'stories') {
                            setStoryBackgroundMedia(MOCK_IMAGES.sunsetOcean);
                          }
                          setCreationFlowStep('editor');
                        } else {
                          setIsRecording(true);
                        }
                      }}
                      className={`w-16 h-16 rounded-full border-4 border-white p-1 bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center relative cursor-pointer ${isRecording ? 'border-red-500' : 'border-white'}`}
                      title={isRecording ? 'Stop Recording' : 'Start Recording'}
                    >
                      {isRecording ? (
                        <div className="w-6 h-6 bg-red-500 rounded shadow-md animate-pulse" />
                      ) : (
                        <div className="w-12 h-12 bg-red-650 rounded-full shadow-md hover:bg-red-600 transition-colors" />
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setCreationFlowStep('options');
                    }}
                    className="p-3 bg-red-550/10 border border-red-500/10 text-red-400 hover:text-red-300 rounded-full hover:bg-red-500/20 active:scale-95 transition-all text-xs"
                    title="Cancel Capture"
                  >
                    <Plus className="w-4 h-4 transform rotate-45" />
                  </button>

                </div>

                <p className="text-[10px] text-gray-500 font-medium">
                  {activeWorkspace === 'post' ? 'Tap shutter to compile image' : isRecording ? 'Recording sequence. Tap again to commit & lock segment.' : 'Tap trigger to begin stream recording'}
                </p>
              </div>

            </div>
          )}

          {/* Render detailed forms only if creationFlowStep is 'editor' (or if writeup which is always editing) */}
          {(activeWorkspace === 'writeup' || creationFlowStep === 'editor') && (
            <>
              {/* ======================================= */}
              {/* A. WRITEUP DETAILED FORM (Facebook)   */}
              {/* ======================================= */}
              {activeWORKSPACE_RENDERER('writeup') && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Writer section */}
              <div className="md:col-span-2 flex flex-col gap-4">
                
                <div className="glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-4 shadow-xl">
                  
                  {/* Draft Bar alerts */}
                  <div className="flex justify-between items-center bg-black/35 p-3 rounded-2xl border border-white/5">
                    <span className="text-[11px] text-gray-400">💡 Local Draft Cache Manager</span>
                    <div className="flex gap-1.5">
                      <button 
                        type="button" 
                        onClick={restoreWriteupDraft}
                        className="py-1 px-2.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 text-cyan-400 rounded-lg text-4xs font-mono font-bold"
                      >
                        Restore Draft
                      </button>
                      <button 
                        type="button" 
                        onClick={saveWriteupDraft}
                        className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg text-4xs font-mono font-bold"
                      >
                        Save Draft
                      </button>
                    </div>
                  </div>

                  {/* Form toolbar formatting */}
                  <div className="flex flex-wrap gap-1 bg-black/25 p-1.5 rounded-xl border border-white/5">
                    {[
                      { l: 'Bold', tag: '**' },
                      { l: 'Italic', tag: '*' },
                      { l: 'Header', tag: '###' },
                      { l: 'Code', tag: '`' },
                      { l: 'Quote', tag: '> ' }
                    ].map(f => (
                      <button
                        key={f.l}
                        type="button"
                        onClick={() => applyTextFormat(f.tag)}
                        className="p-1 px-2 text-3xs font-mono text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
                      >
                        {f.l}
                      </button>
                    ))}
                  </div>

                  {/* Textarea */}
                  <div className="flex flex-col">
                    <textarea
                      required
                      placeholder="Input unlimited long-form content. Mention profiles using @username and add tags to populate feed indexes..."
                      rows={8}
                      value={writeupText}
                      onChange={e => {
                        setWriteupText(e.target.value);
                        // Trigger mentioning dropdown search
                        const match = e.target.value.match(/@(\w*)$/);
                        if (match) {
                          setMentionQuery(match[1]);
                          setShowMentionDropdown(true);
                        } else {
                          setShowMentionDropdown(false);
                        }
                      }}
                      className="w-full bg-white/5 border border-white/10 focus:border-cyan-400 text-xs py-3 px-4 rounded-2xl outline-none text-white leading-relaxed resize-none font-sans"
                    />

                    {/* Word characters count bar */}
                    <div className="flex justify-between items-center text-4xs font-mono text-gray-500 mt-2 px-1">
                      <span>Stream Packet: {writeupText.split(/\s+/).filter(Boolean).length} words</span>
                      <span>{writeupText.length} characters / Unlimited</span>
                    </div>
                  </div>

                  {/* Connection Mention Dropdown overlay */}
                  {showMentionDropdown && (
                    <div className="bg-neutral-950 border border-white/10 rounded-2xl p-2 flex flex-col gap-1 max-h-36 overflow-y-auto z-10">
                      <span className="text-4xs text-gray-500 font-mono px-2 uppercase">Recommend node connections</span>
                      {users.filter(u => u.username.toLowerCase().includes(mentionQuery.toLowerCase())).map(usr => (
                        <button
                          key={usr.id}
                          type="button"
                          onClick={() => handleMentionSelect(usr.username)}
                          className="flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded-lg text-left"
                        >
                          <img src={usr.profilePic} className="w-5 h-5 rounded-full" alt="avatar" />
                          <span className="text-3xs text-white">@{usr.username}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hashtags input tool */}
                  <div className="flex flex-col gap-1 text-left border-t border-white/5 pt-3">
                    <span className="text-4xs uppercase font-mono tracking-widest text-gray-400 block font-bold mb-1">Hashtag Index labels</span>
                    
                    <form onSubmit={handleAddHashtag} className="flex gap-2">
                      <div className="flex-grow flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-cyan-400 px-3 py-1">
                        <span className="text-gray-500 text-xs">#</span>
                        <input
                          type="text"
                          value={hashInput}
                          onChange={e => setHashInput(e.target.value)}
                          placeholder="trending-tag"
                          className="bg-transparent border-none text-xs text-white outline-none w-full py-1 ml-0.5"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="py-1 px-3 bg-[#0d2a45] hover:bg-[#123e66] border border-cyan-400/20 text-cyan-400 rounded-xl text-3xs font-bold"
                      >
                        + Add Tag
                      </button>
                    </form>

                    {/* Tags Chip grid */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {writeupHashtags.length === 0 ? (
                        <span className="text-4xs text-gray-500 font-mono italic">No hashtags logged. Tap labels below:</span>
                      ) : (
                        writeupHashtags.map(t => (
                          <div key={t} className="flex items-center gap-1 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-4xs py-0.5 px-2 rounded-full font-semibold font-mono">
                            <span>#{t}</span>
                            <button type="button" onClick={() => setWriteupHashtags(writeupHashtags.filter(x => x !== t))} className="text-cyan-300">×</button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Preselected Recommended Tags */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-5xs font-mono text-gray-500 uppercase tracking-wider">Hot Suggests:</span>
                      {['web3', 'innovation', 'cyber', 'lossless', 'studio'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => { if (!writeupHashtags.includes(tag)) setWriteupHashtags([...writeupHashtags, tag]) }}
                          className="bg-white/5 hover:bg-white/10 text-gray-400 text-5xs py-0.5 px-1.5 rounded border border-white/5 font-mono"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                  </div>

                </div>

              </div>

              {/* Sidebar Settings panels */}
              <div className="flex flex-col gap-4 text-left">
                
                {/* Poll generator card */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-pink-500" /> Multi-Choice Poll
                    </span>
                    <input
                      type="checkbox"
                      checked={writeupPollEnabled}
                      onChange={e => setWriteupPollEnabled(e.target.checked)}
                      className="w-4.5 h-4.5 accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {writeupPollEnabled ? (
                    <div className="flex flex-col gap-3 mt-1 text-xs">
                      <div>
                        <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Poll Question</label>
                        <input
                          type="text"
                          required
                          value={writeupPollQuestion}
                          onChange={e => setWriteupPollQuestion(e.target.value)}
                          placeholder="Ex: Release tomorrow?"
                          className="w-full bg-white/5 border border-white/10 focus:border-pink-500 outline-none p-2 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-0.5">Poll Outcomes</label>
                        {writeupPollOptions.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-1 items-center">
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={e => handleUpdatePollOption(oIdx, e.target.value)}
                              placeholder={`Option ${oIdx + 1}`}
                              className="flex-grow bg-white/5 border border-white/10 outline-none p-1.5 rounded text-xs"
                            />
                            {writeupPollOptions.length > 2 && (
                              <button 
                                type="button" 
                                onClick={() => handleDeletePollOption(oIdx)}
                                className="text-red-400 p-1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}

                        {writeupPollOptions.length < 4 && (
                          <button
                            type="button"
                            onClick={handleAddPollOption}
                            className="mt-1 py-1 px-2.5 border border-dashed border-white/20 text-gray-400 hover:text-white rounded text-4xs hover:bg-white/5 cursor-pointer font-semibold"
                          >
                            + Add Custom Outcome
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500 leading-normal">
                      Enable polls to collect interactive feedback loops instantly on streams.
                    </p>
                  )}
                </div>

                {/* Cover attachment select */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Image className="w-4 h-4 text-cyan-400" /> Attach Visual Image
                  </span>

                  <select
                    value={writeupAttachment || ''}
                    onChange={e => setWriteupAttachment(e.target.value || null)}
                    className="w-full bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-2 outline-none"
                  >
                    <option value="">No Image Attachment</option>
                    <option value={MOCK_IMAGES.sunsetOcean}>Scenic Sunset Ocean</option>
                    <option value={MOCK_IMAGES.neonCyber}>Neon Digital Cyberpunk</option>
                    <option value={MOCK_IMAGES.setup}>Minimal Workstation Desk</option>
                    <option value={MOCK_IMAGES.mountain}>Pristine Snowy Peak</option>
                  </select>

                  {writeupAttachment && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 mt-1 relative">
                      <img src={writeupAttachment} className="w-full h-full object-cover" alt="Attached preview" />
                      <button 
                        type="button" 
                        onClick={() => setWriteupAttachment(null)}
                        className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* Schedulers */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Scheduled Publishing
                    </span>
                    <input
                      type="checkbox"
                      checked={writeupScheduled}
                      onChange={e => setWriteupScheduled(e.target.checked)}
                      className="w-4.5 h-4.5 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {writeupScheduled ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <input
                        type="datetime-local"
                        value={writeupScheduleTime}
                        onChange={e => setWriteupScheduleTime(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 text-white p-2 text-xs rounded-lg outline-none font-mono"
                      />
                      <span className="text-[10px] text-gray-500">
                        Post remains buffered in offline staging queue until the specified timestamp handshake.
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">
                      Synchronize postings dynamically to capture specific peak engagement timezone indices.
                    </p>
                  )}
                </div>

                {/* Publish btn */}
                <button
                  type="button"
                  onClick={handlePublishWriteup}
                  disabled={!writeupText.trim()}
                  className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 disabled:from-blue-900/50 disabled:to-cyan-900/50 disabled:text-gray-600 text-white font-bold text-xs rounded-2xl shadow-xl active:scale-95 transition-all outline-none border border-cyan-400/20"
                >
                  {writeupScheduled ? 'Schedule WriteUp Post' : 'Publish WriteUp Now'}
                </button>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* B. INSTAGRAM POST WORKSPACE           */}
          {/* ======================================= */}
          {activeWorkspace === 'post' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Premium Preview Space with Interactive Canvas Image */}
              <div className="flex flex-col gap-4">
                
                {/* Preview Player visual box */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex flex-col gap-3 shadow-xl relative select-none">
                  <div className="flex justify-between items-center">
                    <span className="text-4xs font-mono text-gray-500">CANVAS MONITOR: {postSelectedImages.length} Frame Carousel</span>
                    <span className="text-3xs font-bold text-pink-400 font-mono tracking-wider">
                      Aspect Ratio {postAspectRatio}
                    </span>
                  </div>

                  {/* Relative Workspace Container */}
                  <div 
                    onClick={handlePostImageClick}
                    className={`relative w-full overflow-hidden bg-neutral-950 border border-white/5 rounded-2xl cursor-crosshair group flex items-center justify-center transition-all duration-300 ${
                      postAspectRatio === '1:1' ? 'aspect-square' : postAspectRatio === '4:5' ? 'aspect-[4/5] h-[340px]' : 'aspect-video'
                    }`}
                  >
                    
                    {/* Filter overlay + custom transform zooms */}
                    <div 
                      className="w-full h-full relative"
                      style={{
                        transform: `scale(${postZoom}) rotate(${postRotation}deg)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                    >
                      <img 
                        src={postSelectedImages[postActiveSlide] || MOCK_IMAGES.sunsetOcean} 
                        className={`w-full h-full object-cover select-none ${getFilterStyles(postFilter)}`}
                        alt="Workspace canvas"
                      />
                    </div>

                    {/* Left Right Carousel Swipers */}
                    {postSelectedImages.length > 1 && (
                      <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between pointer-events-auto z-10">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPostActiveSlide(prev => Math.max(0, prev - 1)) }}
                          disabled={postActiveSlide === 0}
                          className="w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center disabled:opacity-30"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPostActiveSlide(prev => Math.min(postSelectedImages.length - 1, prev + 1)) }}
                          disabled={postActiveSlide === postSelectedImages.length - 1}
                          className="w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center disabled:opacity-30"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}

                    {/* Carousel Nav indicator dots absolute overlay */}
                    {postSelectedImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/40 py-1 px-2.5 rounded-full border border-white/5">
                        {postSelectedImages.map((_, dotIdx) => (
                          <div 
                            key={dotIdx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${dotIdx === postActiveSlide ? 'bg-pink-400 w-3' : 'bg-gray-500'}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Hover Coordinate Tag Badges Layer */}
                    {taggedPeople.map((person, tagIdx) => (
                      <div
                        key={tagIdx}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bg-black/85 border border-pink-400/30 text-white text-[9px] py-1 px-2 rounded-lg flex items-center gap-1 shadow-lg cursor-default select-none pointer-events-auto filter-none"
                        style={{ left: `${person.x}%`, top: `${person.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <span className="font-mono text-pink-300">@{person.name}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tagIdx)}
                          className="text-white hover:text-red-400 font-bold ml-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Pending Tag coordinate badge dialog trigger */}
                    {pendingTagCoords && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bg-[#0b0c16] border border-cyan-400 p-2 rounded-xl flex flex-col gap-1.5 shadow-2xl z-20"
                        style={{ left: `${pendingTagCoords.x}%`, top: `${pendingTagCoords.y}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <input
                          type="text"
                          required
                          value={tagInputName}
                          onChange={e => setTagInputName(e.target.value)}
                          placeholder="Associate alias"
                          className="py-1 px-2 bg-white/5 border border-white/10 rounded text-4xs text-white outline-none w-28"
                        />
                        <div className="flex justify-end gap-1">
                          <button 
                            type="button" 
                            onClick={() => setPendingTagCoords(null)} 
                            className="py-0.5 px-2 bg-white/5 text-gray-400 text-5xs border border-white/5 rounded"
                          >
                            Cancel
                          </button>
                          <button 
                            type="button" 
                            onClick={handleSaveTag} 
                            className="py-0.5 px-2 bg-gradient-to-r from-blue-500 to-pink-500 text-white text-5xs rounded"
                          >
                            Tag
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Location tag */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex items-center justify-between shadow">
                  <div className="flex gap-2 items-center">
                    <MapPin className="w-4.5 h-4.5 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block text-3xs leading-none mb-0.5">Physical Tagged Location</span>
                      <p className="text-5xs text-gray-500 font-mono italic">GPS location node coordinate simulation.</p>
                    </div>
                  </div>

                  <select
                    value={postLocation}
                    onChange={e => setPostLocation(e.target.value)}
                    className="bg-neutral-900 border border-white/10 text-white rounded-lg text-xs py-1 px-2 outline-none"
                  >
                    <option value="Silicon Valley, California">Silicon Valley, CA</option>
                    <option value="Tokyo Shibuya, Japan">Tokyo Shibuya 🇯🇵</option>
                    <option value="Bangalore Cyber Hub, India">Bangalore Tech HUB 🇮🇳</option>
                    <option value="Paris, France">Paris, France 🇫🇷</option>
                    <option value="">No Location tag</option>
                  </select>
                </div>

              </div>

              {/* Right Column: Editing Adjustments Forms */}
              <div className="flex flex-col gap-4 text-left">
                
                {/* 1. Carousel Media selector */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                      <Image className="w-4 h-4 text-pink-500" /> Select Snapshot Carousel
                    </h4>
                    <p className="text-5xs text-gray-500">Pick raw captures down below. Tap to select or multi-select images.</p>
                  </div>

                  <div className="grid grid-cols-6 gap-1 px-[2px]">
                    {postPresetImages.map((img) => {
                      const isSelected = postSelectedImages.includes(img);
                      return (
                        <button
                          key={img}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (postSelectedImages.length > 1) {
                                setPostSelectedImages(postSelectedImages.filter(x => x !== img));
                                setPostActiveSlide(0);
                              }
                            } else {
                              if (postSelectedImages.length < 3) {
                                setPostSelectedImages([...postSelectedImages, img]);
                              } else {
                                alert("Visual capacity reaches limit: Max 3 Carousel snaps.");
                              }
                            }
                          }}
                          className={`aspect-square rounded-lg overflow-hidden border-2 relative transition-all active:scale-95 ${
                            isSelected ? 'border-pink-500 scale-95 shadow-lg shadow-pink-500/10' : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="preset option" />
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-pink-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
                              {postSelectedImages.indexOf(img) + 1}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Color Filter selectors */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" /> Image Filter Matrix
                  </h4>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
                    {[
                      { id: 'normal', label: 'Original' },
                      { id: 'clarendon', label: 'Clari' },
                      { id: 'lark', label: 'Lark' },
                      { id: 'juno', label: 'Juno' },
                      { id: 'moon', label: 'Noir' },
                      { id: 'valencia', label: 'Retro' }
                    ].map(fil => (
                      <button
                        key={fil.id}
                        type="button"
                        onClick={() => setPostFilter(fil.id as any)}
                        className={`py-1 px-3.5 rounded-lg text-4xs font-bold uppercase shrink-0 transition-colors ${
                          postFilter === fil.id 
                            ? 'bg-cyan-400/25 border border-cyan-400 text-white shadow-lg' 
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 border border-white/5'
                        }`}
                      >
                        {fil.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Crop Controls & transform dials */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3.5 shadow-lg">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                    <Crop className="w-4 h-4 text-indigo-400" /> Transform Framing
                  </h4>

                  {/* Aspect toggle dials */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {(['1:1', '4:5', '16:9'] as const).map(as => (
                      <button
                        key={as}
                        type="button"
                        onClick={() => setPostAspectRatio(as)}
                        className={`py-1 text-4xs font-mono font-black rounded border cursor-pointer ${
                          postAspectRatio === as 
                            ? 'bg-pink-400/10 border-pink-400 text-pink-400' 
                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-gray-300'
                        }`}
                      >
                        {as} Format
                      </button>
                    ))}
                  </div>

                  {/* Zoom Dial */}
                  <div className="text-xs">
                    <div className="flex justify-between items-center text-5xs font-mono text-gray-400 mb-1">
                      <span>Zoom Scaling</span>
                      <span className="text-white">{postZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={2.5}
                      step={0.1}
                      value={postZoom}
                      onChange={e => setPostZoom(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 height-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Rotation Dial */}
                  <div className="text-xs">
                    <div className="flex justify-between items-center text-5xs font-mono text-gray-400 mb-1">
                      <span>Rotation angle</span>
                      <span className="text-white">{postRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={15}
                      value={postRotation}
                      onChange={e => setPostRotation(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 height-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* 4. Tagging Switch */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex items-center justify-between shadow">
                  <div className="flex gap-2 items-center">
                    <Tag className="w-4.5 h-4.5 text-pink-500 animate-pulse" />
                    <div>
                      <span className="font-bold text-white block text-3xs leading-none mb-0.5">Click Image to Tag People</span>
                      <p className="text-5xs text-gray-500">Enable and click any coordinates on the photo.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={taggingMode}
                    onChange={e => {
                      setTaggingMode(e.target.checked);
                      if (!e.target.checked) setPendingTagCoords(null);
                    }}
                    className="w-4.5 h-4.5 accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Caption input */}
                <div>
                  <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1 px-1">Post Caption</label>
                  <input
                    type="text"
                    placeholder="Enter visual caption... #creative #vistas"
                    value={postCaption}
                    onChange={e => setPostCaption(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 focus:border-pink-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                {/* Download Settings */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex flex-col gap-3.5 shadow-lg mb-2 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
                    <span className="text-3xs font-mono uppercase tracking-wider text-gray-400">Download Settings</span>
                  </div>
                  <div 
                    onClick={() => setAllowDownloads(!allowDownloads)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                      allowDownloads 
                        ? 'bg-gradient-to-r from-pink-500/8 to-transparent border-pink-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className={`w-4 h-4 ${allowDownloads ? 'text-pink-400' : 'text-gray-500'}`} />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-none">Allow Viewers to Download</span>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">Toggle content downloads ON or OFF</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black font-mono tracking-wider ${allowDownloads ? 'text-pink-450' : 'text-gray-500'}`}>
                        {allowDownloads ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${allowDownloads ? 'bg-pink-505 bg-pink-500' : 'bg-gray-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${allowDownloads ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish buttons */}
                <button
                  type="button"
                  onClick={handlePublishPost}
                  className="py-3 bg-gradient-to-r from-pink-500 to-indigo-600 border border-pink-400/20 text-white font-bold text-xs rounded-2xl active:scale-95 transition-all outline-none"
                >
                  Publish Carousel Snapshot
                </button>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* C. SHORT CLIPS TIMELINE (TikTok)     */}
          {/* ======================================= */}
          {activeWorkspace === 'clips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Vertical Player Box Preview Column */}
              <div className="flex justify-center">
                <div className="w-full max-w-[280px] aspect-[9/16] bg-[#070b1a] rounded-[36px] border-4 border-white/10 relative overflow-hidden shadow-2xl flex flex-col justify-between p-4">
                  
                  {/* Neon overlay effect mapping */}
                  {clipViewportEffect === 'scanline' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent bg-[length:100%_4px] pointer-events-none z-10 animate-[pulse_2s_infinite]"></div>
                  )}
                  {clipViewportEffect === 'cyanflicker' && (
                    <div className="absolute inset-0 bg-transparent pointer-events-none z-10 shadow-[inset_0_0_35px_rgba(34,211,238,0.25)] animate-pulse"></div>
                  )}
                  {clipViewportEffect === 'vintage' && (
                    <div className="absolute inset-0 bg-amber-500/5 filter saturate-[0.8] contrast-[1.25] pointer-events-none z-10"></div>
                  )}

                  {/* HTML5 video preview background loop */}
                  <video 
                    src={clipVideoUrl}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    autoPlay
                    loop
                    muted
                  />

                  {/* Top indicators */}
                  <div className="relative z-10 flex justify-between items-center bg-black/40 py-1 px-3 rounded-full border border-white/10">
                    <div className="flex items-center gap-1 font-mono text-[9px] text-red-500">
                      <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                      <span>RECORD</span>
                    </div>
                    <span className="font-mono text-[8px] text-gray-300">Duration: {clipDuration}s</span>
                  </div>

                  {/* Floating emojis stickers layer */}
                  {placedStickers.map((st, sIdx) => (
                    <div
                      key={st.id}
                      className="absolute text-2xl cursor-default select-none animate-[bounce_1.5s_infinite] pointer-events-auto filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                      style={{ left: `${st.x}%`, top: `${st.y}%` }}
                    >
                      <div className="relative group">
                        <span>{st.emoji}</span>
                        <button 
                          type="button" 
                          onClick={() => setPlacedStickers(placedStickers.filter(x => x.id !== st.id))}
                          className="absolute -top-3 -right-3 text-red-400 text-3xs font-extrabold hidden group-hover:block"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Text Overlays Layer */}
                  <div className="relative z-10 mt-16 flex flex-col gap-2 pointer-events-auto">
                    {placedOverlays.map(ov => (
                      <div 
                        key={ov.id}
                        className={`p-1 px-2.5 bg-black/60 rounded-xl border border-white/10 self-start text-xs ${getOverlayFontClass(ov.style)} ${getOverlayColorClass(ov.color)} relative group`}
                      >
                        <span>{ov.text}</span>
                        <button 
                          type="button"
                          onClick={() => setPlacedOverlays(placedOverlays.filter(x => x.id !== ov.id))}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full text-white text-[8px] items-center justify-center hidden group-hover:flex"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Synchronized Subtitles / Captions text bottom row */}
                  <div className="relative z-10 text-center flex flex-col items-center gap-1 mb-8">
                    {activeCaptionPhrase && (
                      <div className="bg-cyan-500 text-black font-display font-black text-xs py-1 px-3 rounded-lg shadow-xl uppercase tracking-tighter animate-in zoom-in">
                        {activeCaptionPhrase}
                      </div>
                    )}
                    
                    {/* Spin disk mockup */}
                    <div className="absolute right-1 bottom-1 flex flex-col items-center gap-1 select-none">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-pink-500 animate-[spin_6s_linear_infinite] flex items-center justify-center shadow-lg shadow-pink-500/15">
                        <Music className="w-4 h-4 text-pink-400" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column Workspace Parameters */}
              <div className="flex flex-col gap-4 text-left">
                
                {/* Duration Limit controls */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" /> Clip Loop Boundaries
                    </span>
                    <span className="text-4xs font-mono text-gray-500">VALID: 15S TO 90S</span>
                  </div>

                  <div className="text-xs">
                    <div className="flex justify-between items-center text-5xs font-mono text-gray-400 mb-1">
                      <span>Clip Stream Length Limit</span>
                      <span className="text-white font-mono font-bold">{clipDuration} seconds</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={90}
                      value={clipDuration}
                      onChange={e => setClipDuration(parseInt(e.target.value))}
                      className="w-full h-1.5 accent-purple-500 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Background music overlay list */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Music className="w-4 h-4 text-pink-500 animate-pulse" /> Backing Tracks picker
                  </span>

                  <select
                    value={selectedClipAudio}
                    onChange={e => setSelectedClipAudio(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-2 outline-none font-mono"
                  >
                    {clipAudios.map(aud => (
                      <option key={aud.title} value={aud.title}>{aud.title} ({aud.artist})</option>
                    ))}
                  </select>

                  {/* Balancing audio sliders */}
                  <div className="grid grid-cols-2 gap-3.5 mt-2">
                    <div className="text-xs">
                      <label className="text-5xs uppercase tracking-wider font-mono text-gray-500 block mb-1">Original Mic</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={volumeOriginal}
                        onChange={e => setVolumeOriginal(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 bg-white/10 rounded-lg"
                      />
                    </div>
                    <div className="text-xs">
                      <label className="text-5xs uppercase tracking-wider font-mono text-gray-500 block mb-1">Music overlay</label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={volumeMusic}
                        onChange={e => setVolumeMusic(parseInt(e.target.value))}
                        className="w-full accent-pink-500 bg-white/10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Viewport Effects selectors */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Viewport Effects
                  </span>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'none', label: 'Clean' },
                      { id: 'scanline', label: 'VHS Scan' },
                      { id: 'cyanflicker', label: 'Cyber Glow' },
                      { id: 'vintage', label: 'Vintage' }
                    ].map(fx => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => setClipViewportEffect(fx.id as any)}
                        className={`py-1 text-5xs font-bold rounded uppercase border ${
                          clipViewportEffect === fx.id 
                            ? 'bg-amber-400/20 border-amber-400 text-white' 
                            : 'bg-white/5 text-gray-500 border-white/5 hover:text-white'
                        }`}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Movable stickers emoji selectors */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sticker className="w-4 h-4 text-teal-400" /> Stickers Picker (Tap to Place)
                  </span>

                  <div className="flex gap-2 flex-wrap text-lg px-1">
                    {presetEmojis.map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => handlePlaceSticker(em)}
                        className="p-1 hover:bg-white/10 rounded active:scale-90 transition-all font-sans"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Synchronized automated subtitle Captions trigger */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 animate-pulse">
                      <Type className="w-4 h-4 text-cyan-400" /> Speech Subtitle Captions
                    </span>
                    <button
                      type="button"
                      disabled={autoCaptionsRunning}
                      onClick={() => { setAutoCaptionsRunning(true); setAutoCaptionsProgress(0) }}
                      className="py-1 px-3 bg-[#0f172a] hover:bg-slate-900 border border-cyan-500/25 text-cyan-400 hover:text-cyan-300 font-bold rounded text-4xs"
                    >
                      {autoCaptionsRunning ? 'transcribing...' : 'Scan & Auto Captions'}
                    </button>
                  </div>

                  {autoCaptionsRunning && (
                    <div className="flex flex-col gap-1 text-[11px] font-mono text-gray-400">
                      <div className="flex justify-between">
                        <span>Speech Transcriber</span>
                        <span>{autoCaptionsProgress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded transition-all duration-100" style={{ width: `${autoCaptionsProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-500">
                    Transcribes verbal mic streams and synchronization timings beautifully to lay down captions over timeline.
                  </p>
                </div>

                {/* Placing live Text overlays */}
                <form onSubmit={handleAddTextOverlay} className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Type className="w-4 h-4 text-purple-400" /> Add Live Text overlays
                  </span>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter short text overlay"
                      value={newOverlayText}
                      onChange={e => setNewOverlayText(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 outline-none p-2 rounded-xl text-xs text-white"
                    />
                    <button 
                      type="submit"
                      disabled={!newOverlayText}
                      className="py-1.5 px-3 bg-purple-600 disabled:bg-purple-950 text-white rounded-xl text-3xs font-bold"
                    >
                      Overlay
                    </button>
                  </div>

                  {/* Text attributes filters */}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={newOverlayColor}
                      onChange={e => setNewOverlayColor(e.target.value)}
                      className="bg-neutral-900 border border-white/10 text-white rounded text-4xs p-1"
                    >
                      <option value="cyan">Neon Cyan</option>
                      <option value="pink">Neon Pink</option>
                      <option value="emerald">Neon Emerald</option>
                      <option value="gold">Neon Gold</option>
                    </select>

                    <select
                      value={newOverlayStyle}
                      onChange={e => setNewOverlayStyle(e.target.value)}
                      className="bg-neutral-900 border border-white/10 text-white rounded text-4xs p-1"
                    >
                      <option value="font-display">Bold display</option>
                      <option value="font-mono">Cyber Mono</option>
                      <option value="font-serif">Vintage Serif</option>
                    </select>
                  </div>
                </form>

                {/* Caption inputs */}
                <div>
                  <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Clips Caption</label>
                  <input
                    type="text"
                    placeholder="Describe loop vibe... #reels"
                    value={clipCaption}
                    onChange={e => setClipCaption(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 focus:border-purple-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                {/* Download Settings */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex flex-col gap-3.5 shadow-lg mb-2 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
                    <span className="text-3xs font-mono uppercase tracking-wider text-gray-400">Download Settings</span>
                  </div>
                  <div 
                    onClick={() => setAllowDownloads(!allowDownloads)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                      allowDownloads 
                        ? 'bg-gradient-to-r from-pink-500/8 to-transparent border-pink-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className={`w-4 h-4 ${allowDownloads ? 'text-pink-400' : 'text-gray-500'}`} />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-none">Allow Viewers to Download</span>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">Toggle content downloads ON or OFF</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black font-mono tracking-wider ${allowDownloads ? 'text-pink-450' : 'text-gray-500'}`}>
                        {allowDownloads ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${allowDownloads ? 'bg-pink-505 bg-pink-500' : 'bg-gray-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${allowDownloads ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish btn */}
                <button
                  type="button"
                  onClick={handlePublishClip}
                  className="py-3 bg-gradient-to-tr from-purple-500 to-indigo-600 border border-purple-400/20 text-white font-bold text-xs rounded-2xl active:scale-95 transition-all outline-none"
                >
                  Synchronize Loop Clip
                </button>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* D. LONG VIDEOS WORKSPACE (YouTube)     */}
          {/* ======================================= */}
          {activeWorkspace === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Thumbnail selections (Left column) */}
              <div className="flex flex-col gap-4">
                
                {/* Visual Thumbnail box */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-4 shadow-xl text-left select-none">
                  <span className="text-[10px] font-mono uppercase text-gray-500 leading-none">Widescreen Cover Preset</span>
                  
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 relative group bg-neutral-950 shadow-inner flex items-center justify-center">
                    <img src={videoThumbnailUrl} className="w-full h-full object-cover select-none" alt="Thumbnail video cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none group-hover:bg-black/50 transition-colors z-10">
                      <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-[9px] font-mono text-white p-1 rounded font-bold">
                      {videoDuration}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-3xs font-bold text-white uppercase tracking-wider mb-2">Preset widescreen captures</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[MOCK_IMAGES.techGadget, MOCK_IMAGES.sunsetOcean, MOCK_IMAGES.setup].map(img => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => setVideoThumbnailUrl(img)}
                          className={`aspect-video rounded-lg overflow-hidden border-2 relative transition-all ${
                            videoThumbnailUrl === img ? 'border-indigo-500' : 'border-transparent hover:border-white/10'
                          }`}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="preset choice" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Playlist assignments */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Playlist Associations
                  </span>

                  <select
                    value={videoPlaylist}
                    onChange={e => setVideoPlaylist(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-2 outline-none"
                  >
                    <option value="Featured Series">Featured Core Series</option>
                    <option value="Advanced Tutorials">Advanced Tutorials Node</option>
                    <option value="Creator Vlog Streams">Creator Vlog Streams</option>
                  </select>
                </div>

              </div>

              {/* Main Metadata Forms (Center inputs) */}
              <div className="md:col-span-2 flex flex-col gap-4">
                
                <div className="glass-panel rounded-3xl p-6 border-white/10 flex flex-col gap-4 shadow-xl">
                  
                  {videoUploadState !== 'idle' ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center gap-4">
                      
                      {videoUploadState === 'hashing' && (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
                          <h4 className="text-sm font-sub font-black text-white uppercase">Hashing binary streams</h4>
                          <p className="text-5xs font-mono text-gray-500">CHECKSUM LOCK SHA-256 INITIALIZED</p>
                        </div>
                      )}

                      {videoUploadState === 'uploading' && (
                        <div className="flex flex-col items-center gap-3.5 w-full">
                          <div className="relative w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center border border-indigo-400/20">
                            <ArrowLeft className="w-6 h-6 text-indigo-400 rotate-90" />
                          </div>
                          
                          <div className="w-full">
                            <div className="flex justify-between items-center text-5xs font-mono text-gray-400 mb-1">
                              <span>CYBER ASSET STREAM SYNC</span>
                              <span>{uploadPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-white/5 flex">
                              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-100" style={{ width: `${uploadPercent}%` }}></div>
                            </div>
                          </div>
                          <span className="text-5xs font-mono text-indigo-300">DATA RATE SIMULATION: 12.4 MB/S PACKETS</span>
                        </div>
                      )}

                      {videoUploadState === 'multiplexing' && (
                        <div className="flex flex-col items-center gap-2">
                          <Sparkles className="w-10 h-10 text-pink-400 animate-bounce" />
                          <h4 className="text-sm font-sub font-black text-white uppercase">Multiplexing video codecs</h4>
                          <p className="text-5xs font-mono text-gray-400">FINISHING HANDSHAKES ON REVENUE TRACKING TIERS</p>
                        </div>
                      )}

                      {videoUploadState === 'finishing' && (
                        <div className="flex flex-col items-center gap-2">
                          <Check className="w-10 h-10 text-emerald-400 animate-pulse" />
                          <h4 className="text-sm font-sub font-black text-emerald-400 uppercase">Synchronized Completed!</h4>
                          <span className="text-[10px] text-gray-500 font-mono">NODE COMPILED WITH CERTIFIED STATUS</span>
                        </div>
                      )}

                    </div>
                  ) : (
                    <form onSubmit={startVideoUpload} className="flex flex-col gap-4">
                      
                      {/* Video Title */}
                      <div className="text-left select-none relative">
                        <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Video Header Title (Minimum 2 min / Max 12 Hours)</label>
                        <input
                          type="text"
                          required
                          value={videoTitle}
                          onChange={e => setVideoTitle(e.target.value)}
                          placeholder="Ex: Complete Flutter v4 Framework Architecture Lessons"
                          className="w-full py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none text-xs text-white"
                        />
                      </div>

                      {/* Video description */}
                      <div>
                        <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Video description metadata</label>
                        <textarea
                          rows={4}
                          value={videoDescription}
                          onChange={e => setVideoDescription(e.target.value)}
                          placeholder="Input structured summaries, time-indexes, portfolio bookmarks, credits parameters..."
                          className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 text-xs py-3 px-4 rounded-2xl outline-none text-white leading-relaxed resize-none"
                        />
                      </div>

                      {/* Video attributes configs */}
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* Categories */}
                        <div>
                          <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Index Category</label>
                          <select
                            value={videoCategory}
                            onChange={e => setVideoCategory(e.target.value as any)}
                            className="w-full bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-2 outline-none"
                          >
                            <option value="Tech">Advanced Tech / Engineering</option>
                            <option value="Gaming">Pro E-Sports Gaming</option>
                            <option value="Vlogs">Creator Raw Vlogs</option>
                            <option value="Music">Duo-Tone Audio Music</option>
                            <option value="Comedy">Social Media Comedy</option>
                            <option value="Education">Skill Builders Education</option>
                          </select>
                        </div>

                        {/* Video length check */}
                        <div>
                          <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Simulated Duration packet</label>
                          <select
                            value={videoDuration}
                            onChange={e => setVideoDuration(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-2 outline-none font-mono"
                          >
                            {videoPresetUrls.map(o => (
                              <option key={o.title} value={o.duration}>{o.title} ({o.duration})</option>
                            ))}
                          </select>
                        </div>

                      </div>

                      {/* Tags comma builder */}
                      <div className="border-t border-white/5 pt-4 text-left">
                        <span className="text-5xs uppercase font-mono tracking-widest text-gray-400 block font-bold mb-1">Video Taxonomy tags</span>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={e => setNewTagInput(e.target.value)}
                            placeholder="Add tag (Ex: layout)"
                            className="flex-grow py-2 px-3 bg-white/5 border border-white/10 focus:border-indigo-500 outline-none text-xs text-white rounded-xl"
                          />
                          <button 
                            type="button" 
                            onClick={handleAddVideoTag}
                            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-3xs font-bold"
                          >
                            Add chip
                          </button>
                        </div>

                        {/* Video layout tags chips list */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {videoTags.map(v => (
                            <div key={v} className="flex items-center gap-1.5 bg-indigo-400/10 border border-indigo-400/20 text-indigo-300 text-4xs py-0.5 px-2 rounded-full font-mono font-semibold">
                              <span>{v}</span>
                              <button type="button" onClick={() => setVideoTags(videoTags.filter(x => x !== v))} className="text-indigo-400">×</button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alert warnings */}
                      <div className="bg-indigo-500/5 p-3 rounded-2xl border border-indigo-500/10 flex gap-2">
                        <BadgeInfo className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-[10px] text-gray-400 font-sans leading-snug">
                          YouTube-style TV index rules require video length metrics boundaries conforming to: Minimum 2 min up to 12 Hours. Checked.
                        </span>
                      </div>

                      {/* Download Settings */}
                      <div className="glass-panel p-4 rounded-3xl border-white/10 flex flex-col gap-3.5 shadow-lg mb-2 text-left">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
                          <span className="text-3xs font-mono uppercase tracking-wider text-gray-400">Download Settings</span>
                        </div>
                        <div 
                          onClick={() => setAllowDownloads(!allowDownloads)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                            allowDownloads 
                              ? 'bg-gradient-to-r from-pink-500/8 to-transparent border-pink-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                              : 'bg-white/[0.02] border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Download className={`w-4 h-4 ${allowDownloads ? 'text-pink-400' : 'text-gray-500'}`} />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-white leading-none">Allow Viewers to Download</span>
                              <span className="text-[9px] text-gray-450 font-mono mt-0.5">Toggle content downloads ON or OFF</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black font-mono tracking-wider ${allowDownloads ? 'text-pink-450' : 'text-gray-500'}`}>
                              {allowDownloads ? 'ON' : 'OFF'}
                            </span>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${allowDownloads ? 'bg-pink-505 bg-pink-500' : 'bg-gray-700'}`}>
                              <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${allowDownloads ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Publish button */}
                      <button
                        type="submit"
                        className="py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl outline-none shadow-xl cursor-pointer"
                      >
                        Publish Widescreen TV Video
                      </button>

                    </form>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* E. 24H STORY WORKSPACE (Facebook/Snap) */}
          {/* ======================================= */}
          {activeWorkspace === 'stories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column Story Preview Design Board */}
              <div className="flex justify-center select-none">
                <div className="w-[280px] aspect-[9/16] rounded-[36px] border-4 border-white/10 relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
                  
                  {/* Select background classes mapping */}
                  <div className={`absolute inset-0 z-0 transition-all ${storyBackgrounds[storyActiveBg].class}`}></div>

                  {/* Backdrop wallpaper option */}
                  {storyBackgroundMedia && (
                    <img src={storyBackgroundMedia} className="absolute inset-0 w-full h-full object-cover select-none z-0 mix-blend-overlay opacity-80" alt="backdrop image filter" />
                  )}

                  {/* Top user cards */}
                  <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5 text-left">
                      <img src={currentUser?.profilePic} className="w-6 h-6 rounded-full border border-white/20" alt="avatar" />
                      <div>
                        <span className="text-[9px] font-bold text-white block leading-none mb-0.5">{currentUser?.displayName}</span>
                        <span className="text-[7px] text-gray-300 font-mono block">Node Story</span>
                      </div>
                    </div>
                    
                    <span className="p-0.5 bg-red-600/35 border border-red-500 text-red-100 text-[8px] rounded uppercase font-mono tracking-widest font-extrabold flex gap-1 items-center">
                      <Trash2 className="w-2.5 h-2.5" /> 24H
                    </span>
                  </div>

                  {/* Simulated story question widget ask sticker overlay */}
                  <div className="relative z-10 flex flex-col items-center gap-3 w-full self-center">
                    
                    {/* Customizable question stickers container wrapper */}
                    {storyQuestionPrompt && (
                      <div className={`p-4 rounded-3xl w-full text-center shadow-lg relative flex flex-col gap-2 ${
                        storyQuestionTheme === 'pink' 
                          ? 'bg-gradient-to-tr from-pink-500 to-purple-650' 
                          : storyQuestionTheme === 'emerald' 
                          ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-black' 
                          : 'bg-gradient-to-tr from-blue-500 to-cyan-500'
                      }`}>
                        <div className="flex justify-center mb-0.5">
                          <Smile className="w-5 h-5 text-white bg-black/25 p-1 rounded-full text-center" />
                        </div>
                        <h4 className="text-3xs font-display font-black text-white uppercase tracking-wider">{storyQuestionPrompt}</h4>
                        <input
                          type="text"
                          disabled
                          placeholder="Type answer..."
                          className="w-full bg-white/20 border border-white/10 rounded-lg text-[9px] py-1 text-center text-white placeholder:text-white/60 outline-none cursor-default"
                        />
                      </div>
                    )}

                    {/* Interactive voting poll overlays widget */}
                    {storyPollEnabled && (
                      <div className="bg-black/60 border border-white/10 rounded-2xl p-4 w-full text-center flex flex-col gap-2 shadow-2xl backdrop-blur-md">
                        <span className="text-[10px] font-display font-bold text-white leading-tight">{storyPollQuestion || 'Will we win?'}</span>
                        <div className="grid grid-cols-2 gap-2 text-3xs font-bold font-mono">
                          <div className="py-2.5 px-1.5 bg-pink-500 text-white rounded-xl uppercase tracking-tighter">
                            {storyPollYesLabel || 'Yes'}
                          </div>
                          <div className="py-2.5 px-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl uppercase tracking-tighter">
                            {storyPollNoLabel || 'No'}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Stories mentions lists rendering as neon badges bottom overlay */}
                  <div className="relative z-10 flex flex-wrap gap-1 justify-center max-w-full overflow-hidden">
                    {storyMentionsList.map(u => (
                      <div key={u} className="bg-pink-500 border border-white/10 text-white font-mono text-[8px] py-0.5 px-1.5 rounded-full shadow font-semibold">
                        @{u}
                      </div>
                    ))}
                  </div>

                  {/* Story footer */}
                  <div className="relative z-10 text-center text-[9px] font-mono text-gray-300 bg-black/40 py-1.5 rounded-xl border border-white/5">
                    🎵 Track: {storyAudioTrack}
                  </div>

                </div>
              </div>

              {/* Right Column story parameters edit sheet */}
              <div className="flex flex-col gap-4 text-left">
                
                {/* Wallpaper presets picker selector */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkle className="w-4 h-4 text-cyan-400" /> Story Wallpaper Preset
                  </span>

                  <div className="grid grid-cols-4 gap-2">
                    {storyBackgrounds.map((bg, bgIdx) => (
                      <button
                        key={bg.name}
                        onClick={() => { setStoryActiveBg(bgIdx); setStoryBackgroundMedia(null) }}
                        className={`py-2 text-[10px] font-bold text-white rounded-xl transition-all uppercase ${bg.class} border-2 ${
                          storyActiveBg === bgIdx && !storyBackgroundMedia ? 'border-cyan-400 scale-95 shadow-md' : 'border-transparent hover:scale-105'
                        }`}
                      >
                        {bg.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>

                  {/* Backdrop media visual pickers */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <span className="text-5xs uppercase tracking-widest font-mono text-gray-500">Overlay Backdrop design captures</span>
                    <select
                      value={storyBackgroundMedia || ''}
                      onChange={e => setStoryBackgroundMedia(e.target.value || null)}
                      className="bg-neutral-900 border border-white/10 text-white rounded-lg text-xs p-1.5 outline-none font-mono"
                    >
                      <option value="">No backing snapshot wallpaper (Solid Gradient)</option>
                      <option value={MOCK_IMAGES.sunsetOcean}>Scenic Sunset Ocean overlay</option>
                      <option value={MOCK_IMAGES.neonCyber}>Neon Digital Cyberpunk lane</option>
                      <option value={MOCK_IMAGES.setup}>Minimal Workstation Workspace</option>
                    </select>
                  </div>
                </div>

                {/* Question sticker customizer */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <HelpCircle className="w-4 h-4 text-pink-500 animate-pulse" /> Custom Ask Sticker widget
                  </span>

                  <div>
                    <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Sticker Text prompt</label>
                    <input
                      type="text"
                      value={storyQuestionPrompt}
                      onChange={e => setStoryQuestionPrompt(e.target.value)}
                      placeholder="Ask me anything..."
                      className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Sticker Wallpaper Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cyan', 'pink', 'emerald'] as const).map(th => (
                        <button
                          key={th}
                          onClick={() => setStoryQuestionTheme(th)}
                          className={`py-1 text-5xs font-bold uppercase rounded border ${
                            storyQuestionTheme === th 
                              ? 'bg-pink-500/10 border-pink-400 text-pink-400' 
                              : 'bg-white/5 text-gray-400 border-white/5 hover:text-white'
                          }`}
                        >
                          {th} theme
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Poll customizer overlay widgets */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3 shadow-lg border-l-4 border-l-pink-500">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 font-display uppercase">
                      🗳️ Place Story Vote Poll
                    </span>
                    <input
                      type="checkbox"
                      checked={storyPollEnabled}
                      onChange={e => setStoryPollEnabled(e.target.checked)}
                      className="w-4.5 h-4.5 accent-pink-500 cursor-pointer animate-pulse"
                    />
                  </div>

                  {storyPollEnabled && (
                    <div className="flex flex-col gap-2 mt-1 py-1 text-xs">
                      <div>
                        <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Poll Question</label>
                        <input
                          type="text"
                          required
                          value={storyPollQuestion}
                          onChange={e => setStoryPollQuestion(e.target.value)}
                          className="w-full py-1 px-2 bg-white/5 border border-white/10 rounded outline-none text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Option 1 (YES)</label>
                          <input
                            type="text"
                            required
                            value={storyPollYesLabel}
                            onChange={e => setStoryPollYesLabel(e.target.value)}
                            className="w-full py-1 px-2 bg-white/5 border border-white/10 rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Option 2 (NO)</label>
                          <input
                            type="text"
                            required
                            value={storyPollNoLabel}
                            onChange={e => setStoryPollNoLabel(e.target.value)}
                            className="w-full py-1 px-2 bg-white/5 border border-white/10 rounded text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mentions tags connections finder inside stories context */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <PenTool className="w-4 h-4 text-cyan-400" /> Mention connects
                  </span>

                  <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
                    {users.map(usr => {
                      const isMentioned = storyMentionsList.includes(usr.username);
                      return (
                        <button
                          key={usr.id}
                          type="button"
                          onClick={() => handleToggleStoryMention(usr.username)}
                          className={`py-1 px-2.5 rounded-full text-4xs font-mono font-bold flex items-center gap-1 transition-all ${
                            isMentioned 
                              ? 'bg-pink-500 border border-pink-400 text-white' 
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <img src={usr.profilePic} className="w-3.5 h-3.5 rounded-full" alt="profile mini decoration" />
                          <span>@{usr.username}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audio overlays picker options */}
                <div className="glass-panel p-5 rounded-3xl border-white/10 flex flex-col gap-2">
                  <label className="text-xs font-bold text-white mb-2 block border-b border-white/5 pb-1">🎵 Story Sound overlays</label>
                  <select
                    value={storyAudioTrack}
                    onChange={e => setStoryAudioTrack(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 text-white rounded text-xs p-1.5 outline-none font-mono"
                  >
                    <option value="Lo-Fi Wind Vibe">Lo-Fi Wind Vibe (Ambient)</option>
                    <option value="Electro Spark Waves">Electro Spark Waves (Cyber)</option>
                    <option value="Golden Sunset Cafe">Golden Sunset Cafe (Acoustic)</option>
                  </select>
                </div>

                {/* Captions description details */}
                <div>
                  <label className="text-5xs uppercase tracking-wider font-mono text-gray-400 block mb-1">Story Caption / details</label>
                  <input
                    type="text"
                    placeholder="Short story note overlay caption..."
                    value={storyCaption}
                    onChange={e => setStoryCaption(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>

                {/* Warn nodes selfdestruct */}
                <div className="bg-rose-500/5 p-3.5 rounded-2xl border border-red-500/10 flex gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-red-400 shrink-0" />
                  <p className="text-[10px] text-gray-450 font-sans leading-relaxed">
                    Ephemeral Stories node is configured strictly to self-destruct from stream cache indexing networks after exactly 24 hours. Handshake secure.
                  </p>
                </div>

                {/* Download Settings */}
                <div className="glass-panel p-4 rounded-3xl border-white/10 flex flex-col gap-3.5 shadow-lg mb-2 text-left">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-1.5">
                    <span className="text-3xs font-mono uppercase tracking-wider text-gray-400">Download Settings</span>
                  </div>
                  <div 
                    onClick={() => setAllowDownloads(!allowDownloads)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                      allowDownloads 
                        ? 'bg-gradient-to-r from-pink-500/8 to-transparent border-pink-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className={`w-4 h-4 ${allowDownloads ? 'text-pink-400' : 'text-gray-500'}`} />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-white leading-none">Allow Viewers to Download</span>
                        <span className="text-[9px] text-gray-400 font-mono mt-0.5">Toggle content downloads ON or OFF</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black font-mono tracking-wider ${allowDownloads ? 'text-pink-450' : 'text-gray-500'}`}>
                        {allowDownloads ? 'ON' : 'OFF'}
                      </span>
                      <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${allowDownloads ? 'bg-pink-505 bg-pink-500' : 'bg-gray-700'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white shadow transition-transform duration-300 ${allowDownloads ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch trigger */}
                <button
                  type="button"
                  onClick={handlePublishStory}
                  className="py-3 bg-gradient-to-tr from-amber-500 to-rose-500 border border-amber-400/20 text-white font-bold text-xs rounded-2xl hover:brightness-110 active:scale-95 transition-all outline-none text-center"
                >
                  Deploy Ephemeral Story (24H Lock)
                </button>

              </div>

            </div>
          )}

            </>
          )}

        </div>
      )}

    </div>
  );

  // Helper renderer selector
  function activeWORKSPACE_RENDERER(workspace: typeof activeWorkspace) {
    return activeWorkspace === workspace;
  }
};
export default CreateHub;
