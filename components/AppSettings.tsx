/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useConnectX } from '../utils/stateManager';
import { 
  Sliders, Shield, Globe, Bell, Eye, VolumeX, EyeOff, Save, KeyRound,
  Camera, Image, Mic, Users, MapPin, Smartphone, ChevronRight, CheckCircle2,
  Lock, Info, UserCheck, HelpCircle, HardDrive, FileText, Cpu, Terminal, Download, BookOpen,
  Fingerprint
} from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

export const AppSettings: React.FC = () => {
  const { currentUser, updateProfile } = useConnectX();
  const triggerHaptic = useHapticFeedback();

  // Active sub tab: 'profile' (Screen 11 Reference Layout) or 'app' (Screen 12 Reference Layout)
  const [currentSettingsSection, setCurrentSettingsSection] = useState<'profile' | 'app'>('profile');

  // Modal overlays for each profile menu click
  const [openFormModal, setOpenFormModal] = useState<'edit' | 'info' | 'privacy' | 'verification' | 'connected' | 'blocked' | 'data' | null>(null);

  // Profile fields form states
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');

  // App Toggles
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [preferredLang, setPreferredLang] = useState('English');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [hapticIntensity, setHapticIntensity] = useState<'off' | 'light' | 'medium' | 'heavy'>(() => {
    return (localStorage.getItem('connectx_haptic_intensity') as any) || 'medium';
  });

  // APK Compilation Dashboard State (Functional Simulator)
  const [compiling, setCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [apkLogs, setApkLogs] = useState<string[]>([]);
  const [apkReady, setApkReady] = useState(false);

  // Listen for showcase console overrides
  useEffect(() => {
    (window as any).overrideSettingsSection = (section: 'profile' | 'app', subItem?: string) => {
      setCurrentSettingsSection(section);
      if (subItem) {
        if (subItem === 'Edit Profile') {
          setOpenFormModal('edit');
        } else if (subItem === 'Account Information') {
          setOpenFormModal('info');
        } else if (subItem === 'Privacy & Visibility') {
          setOpenFormModal('privacy');
        } else if (subItem === 'Verification') {
          setOpenFormModal('verification');
        } else if (subItem === 'Connected Accounts') {
          setOpenFormModal('connected');
        } else if (subItem === 'Blocked Users') {
          setOpenFormModal('blocked');
        } else if (subItem === 'Download Your Data') {
          setOpenFormModal('data');
        } else {
          setOpenFormModal(null);
        }
      } else {
        setOpenFormModal(null);
      }
    };

    return () => {
      delete (window as any).overrideSettingsSection;
    };
  }, []);

  const startApkBuildSimulator = () => {
    if (compiling) return;
    setCompiling(true);
    setApkReady(false);
    setCompileProgress(1);
    setApkLogs(["[ConnectX-Builder] Initializing secure Android packaging pipeline..."]);

    const steps = [
      { t: 800, p: 12, log: "[Gradle-Daemon] Starting build daemon connection (v8.2)..." },
      { t: 1500, p: 25, log: "[AndroidSDK] Target API detected: 34 (Android 14). Resolving library dependencies..." },
      { t: 2300, p: 40, log: "[Compile] Processing 14 frontend screens inside /src/components/..." },
      { t: 3000, p: 48, log: "[Vite-Pack] Compiling responsive layout assets to single bundle chunk (JS/CSS)..." },
      { t: 3800, p: 62, log: "[KotlinC] Compiling source-code bindings, mapping E2E Secure Messaging channels..." },
      { t: 4500, p: 75, log: "[AAPTC] Packaging vector resources, manifest.json and cyber-neon launcher icon..." },
      { t: 5200, p: 88, log: "[Signer] Signing connectx-v1.0-release.apk with premium Keystore fingerprint SHA-256..." },
      { t: 5900, p: 95, log: "[Zipalign] Optimizing APK file-system bytes alignment..." },
      { t: 6500, p: 100, log: "SUCCESS: connectx-release-v1.0.apk successfully generated! [Size: 12.8 MB]" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCompileProgress(step.p);
        setApkLogs(p => [...p, step.log]);
        if (idx === steps.length - 1) {
          setCompiling(false);
          setApkReady(true);
        }
      }, step.t);
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      bio,
      location,
      website
    });
    setOpenFormModal(null);
    alert("Profile parameters updated successfully!");
  };

  if (!currentUser) return null;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 pb-20 px-2 font-sans selection:bg-pink-500 text-left">
      
      {/* SECTION SELECTOR SWITCH (Tab controller) */}
      <div className="flex bg-neutral-900/90 p-1 rounded-xl border border-white/5 w-full font-display shadow-lg z-10 shrink-0">
        <button 
          onClick={() => setCurrentSettingsSection('profile')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${currentSettingsSection === 'profile' ? 'bg-gradient-to-tr from-cyan-500/20 to-pink-500/10 border border-white/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)] font-extrabold' : 'text-gray-400 hover:text-white'}`}
        >
          Profile Settings
        </button>
        <button 
          onClick={() => setCurrentSettingsSection('app')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${currentSettingsSection === 'app' ? 'bg-gradient-to-tr from-cyan-500/20 to-pink-500/10 border border-white/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.1)] font-extrabold' : 'text-gray-400 hover:text-white'}`}
        >
          App Settings
        </button>
      </div>

      {/* RENDER PROFILE SETTINGS (Screen 11 Reference Layout) */}
      {currentSettingsSection === 'profile' && (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
          
          <div className="bg-neutral-950/40 p-3 rounded-xl border border-white/5 flex items-center gap-3 mb-1.5">
            <img src={currentUser.profilePic} className="w-10 h-10 rounded-full ring-2 ring-cyan-400/50 object-cover" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-white">{currentUser.displayName}</span>
                <span className="bg-cyan-500/10 text-cyan-400 text-[7px] font-mono font-bold px-1 py-0.5 rounded-full border border-cyan-400/20">VERIFIED ✓</span>
              </div>
              <span className="text-4xs font-mono text-gray-500 block mt-0.5">@{currentUser.username} • {currentUser.email}</span>
            </div>
          </div>

          <div className="bg-neutral-950/60 border border-white/5 rounded-xl overflow-hidden flex flex-col">
            {[
              { id: 'edit', label: 'Edit Profile', icon: KeyRound, desc: 'Change alias, location & website details' },
              { id: 'info', label: 'Account Information', icon: Info, desc: 'E2E cryptographic identity keys' },
              { id: 'privacy', label: 'Privacy & Visibility', icon: EyeOff, desc: 'Lock node stream content and connections' },
              { id: 'verification', label: 'Verification', icon: UserCheck, desc: 'Verified creator status application' },
              { id: 'connected', label: 'Connected Accounts', icon: Sliders, desc: 'Secure OAuth social identity bridges' },
              { id: 'blocked', label: 'Blocked Users', icon: Shield, desc: 'Manage blacklisted node peers' },
              { id: 'activity', label: 'Activity Log', icon: FileText, desc: 'Timestamped credentials execution log' },
              { id: 'data', label: 'Download Your Data', icon: HardDrive, desc: 'Request encrypted backup ZIP of contents' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setOpenFormModal(item.id as any)}
                className="w-full py-2.5 px-3 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <item.icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-200 block leading-tight">{item.label}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>

        </div>
      )}

      {/* RENDER APP SETTINGS (Screen 12 Reference Layout) */}
      {currentSettingsSection === 'app' && (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-150">
          
          <div className="bg-neutral-950/60 border border-white/5 rounded-xl overflow-hidden flex flex-col">
            
            {/* DARK MODE TOGGLE */}
            <div className="py-3 px-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-500">
                  <Sliders className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-200 block leading-tight">Dark Mode</span>
                  <span className="text-[9px] text-gray-500">Premium futuristic matrix wallpaper theme</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={(e) => setDarkMode(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-pink-500 shadow-md animate-none"></div>
              </label>
            </div>

            {/* LANGUAGE SELECTOR */}
            <div className="py-2.5 px-3 flex flex-col border-b border-white/5 hover:bg-white/[0.01] transition-all">
              <button 
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-500">
                    <Globe className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-200 block leading-tight">Language</span>
                    <span className="text-[9px] text-gray-500">Adjust local vernacular translations</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-pink-400 font-mono font-bold uppercase">{preferredLang}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-600 transition-transform ${showLangDropdown ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {showLangDropdown && (
                <div className="mt-2.5 grid grid-cols-2 gap-1.5 bg-black/40 p-2 rounded-lg border border-white/5 font-mono text-[9px] text-gray-300">
                  {['English', 'Spanish', 'Hindi', 'French', 'German', 'Japanese'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setPreferredLang(lang); setShowLangDropdown(false); }}
                      className={`p-1.5 rounded-lg text-left border ${preferredLang === lang ? 'bg-pink-500/10 border-pink-500/40 text-pink-400' : 'bg-transparent border-white/5 hover:border-white/10'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SYSTEM NOTIFICATIONS TOGGLE */}
            <div className="py-2.5 px-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-500">
                  <Bell className="w-3.5 h-3.5 text-pink-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-200 block leading-tight">Notifications</span>
                  <span className="text-[9px] text-gray-500">Enable real-time push toast alerts</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pushNotifs} 
                  onChange={(e) => setPushNotifs(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-pink-500 shadow-md animate-none"></div>
              </label>
            </div>

            {/* DATA SAVER MODE */}
            <div className="py-2.5 px-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-500">
                  <VolumeX className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-200 block leading-tight">Data Saver</span>
                  <span className="text-[9px] text-gray-500">Compress media layouts to save bandwidth</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={dataSaver} 
                  onChange={(e) => setDataSaver(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2.5px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-pink-500 shadow-md animate-none"></div>
              </label>
            </div>

            {/* HAPTIC INTENSITY SETTINGS */}
            <div className="py-3 px-3 flex flex-col gap-2.5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-500">
                    <Fingerprint className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-200 block leading-tight">Haptic Feedback</span>
                    <span className="text-[9px] text-gray-500">Vibration feedback during main interactions</span>
                  </div>
                </div>
                
                {/* Visual Status Indicator */}
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-md uppercase font-bold border transition-colors ${
                  hapticIntensity === 'off' 
                    ? 'bg-neutral-800 text-gray-500 border-white/5' 
                    : hapticIntensity === 'light' 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-400/20' 
                    : hapticIntensity === 'medium' 
                    ? 'bg-pink-500/10 text-pink-400 border-pink-400/20' 
                    : 'bg-gradient-to-tr from-pink-500/10 to-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse'
                }`}>
                  {hapticIntensity}
                </span>
              </div>

              {/* Segmented Intensity Selector */}
              <div className="grid grid-cols-4 bg-neutral-950 p-1 rounded-lg border border-white/5 w-full font-mono text-[9px] font-bold">
                {(['off', 'light', 'medium', 'heavy'] as const).map((level) => {
                  const isActive = hapticIntensity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setHapticIntensity(level);
                        localStorage.setItem('connectx_haptic_intensity', level);
                        if (level !== 'off') {
                          if (level === 'light') {
                            triggerHaptic('light');
                          } else if (level === 'medium') {
                            triggerHaptic('medium');
                          } else if (level === 'heavy') {
                            triggerHaptic('heavy');
                          }
                        }
                      }}
                      className={`py-1.5 rounded-md text-center transition-all cursor-pointer select-none capitalize ${
                        isActive 
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold shadow-md' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIMPLE REPETITIVE STATIC ITEMS FOR FULL-FIDELITY SCREEN 12 LIST GRAPHICS */}
            {[
              { label: 'Playback & Streaming', icon: Smartphone, desc: 'Automatic autoplay, stream high resolutions' },
              { label: 'Privacy & Security', icon: Lock, desc: 'Control encryption envelopes & key storage' },
              { label: 'Help & Support', icon: HelpCircle, desc: 'Search documentation & community nodes FAQ' },
              { label: 'About ConnectX', icon: Sliders, desc: 'ConnectX PoC v1.0.0 Stable release' }
            ].map(item => (
              <button
                key={item.label}
                onClick={() => alert(`Reviewing static option: "${item.label}" - preconfigured for production release!`)}
                className="py-2.5 px-3 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                    <item.icon className="w-3.5 h-3.5 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-200 block leading-tight">{item.label}</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-pink-400 transition-colors" />
              </button>
            ))}

          </div>
        </div>
      )}

      {/* MODAL SIMULATION VIEWER (identity forms edit profile modal etc.) */}
      {openFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#070b19] border border-white/10 rounded-3xl p-5 shadow-2xl relative">
            
            <button 
              onClick={() => setOpenFormModal(null)}
              className="absolute right-4 top-4 text-gray-500 hover:text-white hover:bg-white/5 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* EDIT PROFILE SUB-FORM (Screen 11 click element) */}
            {openFormModal === 'edit' && (
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-3 text-left">
                <div className="border-b border-white/5 pb-2 mb-2">
                  <h3 className="font-extrabold text-sm text-white">Edit Profile Details</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Modify your ConnectX public signature node parameters.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wide text-gray-400">Display Alias Name</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl outline-none text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wide text-gray-400">Bio Signature</label>
                  <textarea
                    value={bio}
                    rows={3}
                    onChange={e => setBio(e.target.value)}
                    className="w-full py-2.5 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl outline-none text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-mono tracking-wide text-gray-400">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl outline-none text-xs text-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-mono tracking-wide text-gray-400">Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={e => setWebsite(e.target.value)}
                      className="w-full py-2 px-3 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl outline-none text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:opacity-90 active:scale-98 transition-all text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Profile Details
                </button>
              </form>
            )}

            {/* ACCOUNT INFO FORM */}
            {openFormModal === 'info' && (
              <div className="flex flex-col gap-3 text-left font-mono">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-extrabold text-sm text-white font-sans">Account Cryptography</h3>
                  <p className="text-[10px] text-gray-500 font-sans mt-0.5">Your sandbox identity key signatures.</p>
                </div>

                <div className="bg-black/40 border border-white/10 p-3 rounded-xl flex flex-col gap-2.5 text-[10px] text-gray-400">
                  <div>
                    <span className="text-[8px] text-gray-600 block uppercase">NODE PUBLIC IDENTIFIER</span>
                    <span className="text-cyan-400 tracking-wide font-bold break-all">cx_enclave_{currentUser.id}_sha256_e82cfd770a1a3</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-600 block uppercase">SECURED LINK EMAIL</span>
                    <span className="text-white font-bold">{currentUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-600 block uppercase">REGISTRATION FLOW</span>
                    <span className="text-pink-400 font-bold uppercase">{currentUser.accountType} sync</span>
                  </div>
                </div>
                <button 
                  onClick={() => setOpenFormModal(null)}
                  className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-center text-xs font-bold font-sans text-white cursor-pointer"
                >
                  Acknowledge Sec key
                </button>
              </div>
            )}

            {/* PRIVACY SHIELD */}
            {openFormModal === 'privacy' && (
              <div className="flex flex-col gap-3 text-left">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-extrabold text-sm text-white">Privacy & Visibility Control</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Toggle E2E visibility of your feed.</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-xs font-bold text-white block">Private Enclave Node</span>
                    <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">Require mutual peer approvals before granting folder stream decryption.</span>
                  </div>
                  <input type="checkbox" defaultChecked={true} className="w-5 h-5 accent-cyan-400 cursor-pointer" />
                </div>
                <button 
                  onClick={() => setOpenFormModal(null)}
                  className="mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-extrabold rounded-xl text-center cursor-pointer"
                >
                  Save Privacy Nodes Change
                </button>
              </div>
            )}

            {/* VERIFICATION */}
            {openFormModal === 'verification' && (
              <div className="flex flex-col gap-4 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-pulse">
                  <CheckCircle2 className="w-8 h-8 text-cyan-400 stroke-2" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Creator Verification Status</h3>
                  <p className="text-[10px] text-emerald-400 font-mono font-bold mt-1 text-center bg-emerald-400/10 py-1 px-3 rounded-full inline-block">APPROVED VERIFIED NODE ✓</p>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans px-2">
                  Congratulations! This node contains authenticated cryptographic links. Your posts display the blue circular checked endorsement directly across all feeds.
                </p>
                <button 
                  onClick={() => setOpenFormModal(null)}
                  className="mt-2 w-full py-2.5 bg-neutral-900 border border-white/5 text-xs text-white rounded-xl text-center cursor-pointer"
                >
                  Close status desk
                </button>
              </div>
            )}

            {/* CONNECTED ACCOUNTS */}
            {openFormModal === 'connected' && (
              <div className="flex flex-col gap-3 text-left">
                <div className="border-b border-white/5 pb-2">
                  <h3 className="font-extrabold text-sm text-white">Connected Accounts</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">Active linked credentials integrations.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-white font-mono font-bold">Google Auth ID</span>
                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 py-0.5 px-2 rounded-full border border-emerald-400/10">ACTIVE SYNC ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-white font-mono font-bold">Instagram sync</span>
                    <span className="text-[9px] font-mono bg-neutral-800 text-gray-500 py-0.5 px-2 rounded-full">NOT LINKED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-white font-mono font-bold">Facebook sync</span>
                    <span className="text-[9px] font-mono bg-neutral-800 text-gray-500 py-0.5 px-2 rounded-full">NOT LINKED</span>
                  </div>
                </div>
                <button 
                  onClick={() => setOpenFormModal(null)}
                  className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-center text-xs font-bold text-white cursor-pointer"
                >
                  Dismiss bridges
                </button>
              </div>
            )}

            {/* BLOCKED USERS */}
            {openFormModal === 'blocked' && (
              <div className="flex flex-col gap-3 text-center py-2">
                <Shield className="w-12 h-12 text-pink-500 mx-auto" />
                <h3 className="font-extrabold text-sm text-white mt-1">Blocked Node Peers</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed px-4">
                  There are currently 0 blacklisted nodes in your sandbox environment routing tables.
                </p>
                <button 
                  onClick={() => setOpenFormModal(null)}
                  className="mt-4 w-full py-2.5 bg-white/5 rounded-xl text-xs font-bold text-white cursor-pointer"
                >
                  Return to settings
                </button>
              </div>
            )}

            {/* DOWNLOAD DATA */}
            {openFormModal === 'data' && (
              <div className="flex flex-col gap-2.5 text-center py-2">
                 <HardDrive className="w-10 h-10 text-cyan-400 animate-bounce mx-auto" />
                 <h3 className="font-extrabold text-xs text-white mt-1">Download Node Backup</h3>
                 <p className="text-[10px] text-gray-400 leading-relaxed px-3">
                   ConnectX provides a direct package build of all your public posts, images, and chat logs in a signed `.zip` export stream.
                 </p>
                 <button 
                   onClick={() => {
                     alert("Preparing connectx_node_backup_kavin23.zip (2.4 MB). Generating cryptographic keys...");
                     setOpenFormModal(null);
                   }}
                   className="mt-3 w-full py-1.5 bg-gradient-to-tr from-cyan-400 to-blue-500 text-black text-[11px] font-extrabold rounded-lg cursor-pointer"
                 >
                   Generate signed .ZIP backup
                 </button>
               </div>
             )}

           </div>
         </div>
       )}

       {/* 4. CONNECTX APK LIVE PRODUCTION & COMPILING HUB (Retained from instructions) */}
       <div className="glass-panel rounded-xl p-3.5 border-white/5 flex flex-col gap-2.5 shadow-xl text-left bg-black/40 mt-2 z-10 shrink-0">
         <div>
           <span className="text-[8px] font-mono tracking-wider font-bold text-pink-500 uppercase">Binary Distribution Center</span>
           <h3 className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
             <Cpu className="w-3.5 h-3.5 text-pink-500" /> Compile & Download ConnectX APK
           </h3>
           <p className="text-[9px] text-gray-500 mt-0.5">
             Package ConnectX's source directory using the live Android production build runner to compile a high-performance APK.
           </p>
         </div>

         {/* Compile Trigger Card */}
         <div className="bg-neutral-900/60 border border-white/5 p-2.5 rounded-lg flex flex-col gap-2">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
             <div>
               <span className="text-3xs text-white font-bold block">Android Target: APK (Release Bundle)</span>
               <span className="text-[9px] text-gray-400 block mt-0.5">Version: 1.0.0 • arm64-v8a Architecture</span>
             </div>
             <button
               onClick={startApkBuildSimulator}
               disabled={compiling}
               className={`px-2 py-1 rounded-md font-bold text-[9px] cursor-pointer transition-all active:scale-95 flex items-center gap-1 shrink-0 ${
                 compiling 
                   ? 'bg-neutral-800 text-gray-500 cursor-not-allowed'
                   : 'bg-pink-500 text-white hover:bg-pink-600 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
               }`}
             >
               <Cpu className={`w-2.5 h-2.5 ${compiling ? 'animate-spin' : ''}`} />
               {compiling ? `COMPILING... ${compileProgress}%` : 'COMPILE APK'}
             </button>
            </div>

          {/* Compilation progress bar */}
          {compileProgress > 0 && (
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-0.5">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${compileProgress}%` }}
              ></div>
            </div>
          )}

          {/* Scrolling Terminal log outputs if compiling or complete */}
          {apkLogs.length > 0 && (
            <div className="bg-black border border-white/10 rounded-lg p-2.5 font-mono text-[8px] text-[#A6E22E] h-24 overflow-y-auto flex flex-col gap-1 select-text">
              {apkLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('SUCCESS') ? 'text-pink-400 font-extrabold' : ''}>
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Download APK trigger once compilation completes successfully */}
          {apkReady && (
            <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-lg flex items-center justify-between animate-in zoom-in-95 duration-150">
              <div className="text-left">
                <span className="text-[10px] font-bold text-pink-400 block leading-none">APK Successfully Compiled!</span>
              </div>
              <a
                href="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=512&h=512&q=80" 
                download="connectx-v1.0-release.apk"
                onClick={() => alert("Downloading package: connectx-release-v1.0.apk (12.8 MB). Install on your Android phone to execute direct local installation!")}
                className="px-2 py-1 rounded bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-[9px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-2.5 h-2.5" /> DOWNLOAD APK
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
