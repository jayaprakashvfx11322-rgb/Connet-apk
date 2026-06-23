/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useConnectX } from '../utils/stateManager';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { ConnectXUser } from '../types';
import { 
  ArrowLeft, Check, Eye, EyeOff, Mail, Calendar, Sparkles, 
  MapPin, Globe, Camera, Shield, Laptop, Lock, ArrowRight,
  CircleCheck, Instagram, Facebook, Phone, Smartphone
} from 'lucide-react';
import { MOCK_AVATARS, MOCK_IMAGES } from '../utils/mockData';

// Signup Stages sequence
const STEPS = [
  'Welcome',
  'Choose Method',
  'Verify Email',
  'Create Username',
  'Create Password',
  'Date of Birth',
  'Profile Pic',
  'Create Bio',
  'Choose Interests',
  'Final Setup'
];

export const AuthWizard: React.FC = () => {
  const { loginAsDemo, signupComplete, users } = useConnectX();
  const triggerHaptic = useHapticFeedback();

  // Current sub-flow
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [signupMethod, setSignupMethod] = useState<'google' | 'facebook' | 'instagram' | 'email' | 'mobile' | null>(null);

  // Flow State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0 = request, 1 = OTP verify, 2 = password update
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState(['2', '4', '6', '8', '1', '3']);
  const [newPassword, setNewPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('alexjohn@gmail.com');
  const [loginPassword, setLoginPassword] = useState('AppleGlass123!');
  const [loginError, setLoginError] = useState('');

  const [emailInput, setEmailInput] = useState('alexjohn@gmail.com');
  const [mobileNumber, setMobileNumber] = useState('+91 98765 43210');
  const [isSmsSent, setIsSmsSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['2', '4', '6', '8', '1', '3']);
  const [username, setUsername] = useState('alex_john25');
  const [displayName, setDisplayName] = useState('Alex John');
  const [password, setPassword] = useState('AppleGlass123!');
  const [showPassword, setShowPassword] = useState(false);
  
  // Date of Birth
  const [dobDay, setDobDay] = useState('19');
  const [dobMonth, setDobMonth] = useState('Jul');
  const [dobYear, setDobYear] = useState('2000');

  // Bio and Details
  const [bio, setBio] = useState('Travel lover ✈️ | Dreamer | Creating content & spreading positivity ✨ Living life, one moment at a time 🌍');
  const [location, setLocation] = useState('Chennai, India');
  const [website, setWebsite] = useState('youtube.com/@alex');
  const [profilePic, setProfilePic] = useState(MOCK_AVATARS.anu);
  const [coverPic, setCoverPic] = useState(MOCK_IMAGES.sunsetOcean);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Travel', 'Music', 'Photography']);

  // Timer for OTP
  const [timer, setTimer] = useState(45);
  useEffect(() => {
    let interval: any;
    if (currentStepIndex === 2 && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [currentStepIndex, timer]);

  // Handle interest toggling
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  // Password Requirements calculations
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Suggestions for Username
  const usernameSuggestions = [
    'alex_john25',
    'alexjohn_25',
    'alexjohn25x',
    'alex_johnx25',
    'its_alexjohn'
  ];

  // Simulated Facebook/Instagram API syncs
  const handleSocialImport = (platform: 'facebook' | 'instagram') => {
    setSignupMethod(platform);
    if (platform === 'facebook') {
      setDisplayName('Alex John');
      setEmailInput('alexjohn@gmail.com');
      setBio('Wanderlust soul 🗺️ Tech designer based in Mumbai. Digital creator.');
      setProfilePic('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop');
    } else {
      setDisplayName('Alex Glass');
      setEmailInput('alexglass@gmail.com');
      setBio('Retro computing enthusiast 🕹️ Capturing the neon dreamscapes.');
      setProfilePic('https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&fit=crop');
    }
    // Advance to sync screen
    setSignupMethod(platform);
    setCurrentStepIndex(10); // FB / IG Auth Screen spec
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentStepIndex === STEPS.length - 1) {
      // Execute registration
      const newUser: ConnectXUser = {
        id: 'user_' + Date.now(),
        username: username,
        displayName: displayName,
        email: emailInput,
        bio: bio,
        profilePic: profilePic,
        coverPic: coverPic,
        dob: `${dobYear}-${dobMonth}-${dobDay}`,
        location: location,
        website: website,
        interests: selectedInterests,
        connects: ['user_kavin', 'user_priya'], // standard default starter connects
        sentRequests: [],
        pendingRequests: [],
        totalViews: 0,
        totalReach: 0,
        totalEarnings: 0,
        accountType: signupMethod || 'email'
      };
      signupComplete(newUser);
    }
  };

  const handleBack = () => {
    if (currentStepIndex === 10) {
      // return to method choose
      setCurrentStepIndex(1);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Interests list
  const AVAILABLE_INTERESTS = [
    'Travel', 'Music', 'Food', 'Gaming', 'Fitness', 
    'Fashion', 'Film', 'Photography', 'Technology', 
    'Art', 'Sports', 'Business'
  ];

  return (
    <div className="min-h-screen bg-[#040816] text-white flex flex-col items-center justify-between py-6 px-4 md:px-12 selection:bg-[#FF2E9A] selection:text-white relative overflow-hidden font-sans">
      
      {/* Radiant Glowing Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>
      
      {/* Header section (Skip Option & Back Navigation) */}
      <header className="w-full max-w-lg flex items-center justify-between z-10 px-2">
        {currentStepIndex > 0 && currentStepIndex !== 10 && (
          <button 
            type="button"
            onClick={handleBack} 
            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
        )}
        <div className="flex-1"></div>
        {currentStepIndex === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Jump right into sandbox:</span>
            <button
              onClick={() => loginAsDemo('user_kavin')}
              className="py-1 px-3 text-xs bg-gradient-to-r from-[#2563FF] to-[#FF2E9A] rounded-full font-bold hover:opacity-90 active:scale-95 transition-all text-white border border-white/20 custom-button cursor-pointer"
            >
              Demo Profile (Kavin)
            </button>
          </div>
        )}
      </header>

      {/* Primary Card Viewport */}
      <main className="w-full max-w-lg liquid-glass-card-heavy rounded-[28px] p-6 md:p-8 flex flex-col justify-between my-auto relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-white/15">
        
        {/* Gloss glass glow bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-white/20 to-pink-500/0 rounded-t-[28px]"></div>

        {/* LOGIN SCREEN */}
        {isLoginMode && !isForgotPasswordMode && (
          <div className="py-2 flex flex-col h-full animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2563FF] via-[#8B5CF6] to-[#FF2E9A] border border-white/25 shadow-[0_0_15px_rgba(37,99,255,0.3)] mb-3 overflow-hidden">
                <span className="text-3xl font-display font-extrabold text-white">X</span>
              </div>
              <h2 className="text-2xl font-display font-bold text-white">Welcome Back</h2>
              <p className="text-xs text-gray-400 mt-1">Enter your credentials to access your secure cyber space.</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <div className="mb-4 text-left">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-1.5">Username, Email or Mobile</label>
              <div className="relative flex items-center bg-white/5 border border-white/15 focus-within:border-yellow-400 rounded-xl px-3 py-1 transition-all">
                <Mail className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                  className="bg-transparent border-none outline-none py-2.5 text-sm text-white w-full"
                  placeholder="e.g. kavin or alexjohn@gmail.com"
                />
              </div>
            </div>

            <div className="mb-4 text-left">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-1.5">Password</label>
              <div className="relative flex items-center bg-white/5 border border-white/15 focus-within:border-yellow-400 rounded-xl px-3 py-1 transition-all">
                <Lock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                  className="bg-transparent border-none outline-none py-2.5 text-sm text-white w-full font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white ml-2 shrink-0 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                type="button"
                onClick={() => { setIsForgotPasswordMode(true); setForgotPasswordStep(0); setLoginError(''); }}
                className="text-xs text-yellow-400 font-semibold hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              onClick={() => {
                const userLower = loginEmail.toLowerCase().trim();
                const matched = users.find(u => 
                  u.username.toLowerCase() === userLower || 
                  u.email.toLowerCase() === userLower ||
                  (u.location && u.location.toLowerCase().includes(userLower))
                );
                if (matched) {
                  setLoginError('');
                  loginAsDemo(matched.id);
                } else {
                  setLoginError('Invalid credentials in this session.');
                }
              }}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:opacity-95 active:scale-98 transition-all shadow-[0_4px_20px_rgba(250,204,21,0.25)] cursor-pointer"
            >
              Log In
            </button>

            <p className="text-xs text-gray-400 text-center mt-6">
              New to ConnectX?{' '}
              <button
                onClick={() => { setIsLoginMode(false); }}
                className="text-yellow-400 font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}

        {/* FORGOT PASSWORD RECOVERY FLOW */}
        {isForgotPasswordMode && (
          <div className="py-2 flex flex-col h-full animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => {
                  if (forgotPasswordStep > 0) {
                    setForgotPasswordStep(p => p - 1);
                  } else {
                    setIsForgotPasswordMode(false);
                  }
                }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-display font-bold text-white text-left">Reset Password</h2>
            </div>

            {forgotPasswordStep === 0 && (
              <div className="text-left">
                <p className="text-xs text-gray-400 mb-6 leading-relaxed text-left">
                  Enter your registered email address or mobile number to receive a secure recovery code.
                </p>

                <div className="mb-6">
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-1.5">Email or Mobile</label>
                  <div className="relative flex items-center bg-white/5 border border-white/15 focus-within:border-yellow-400 rounded-xl px-3 py-1 transition-all">
                    <Smartphone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="bg-transparent border-none outline-none py-2.5 text-sm text-white w-full"
                      placeholder="alexjohn@gmail.com or +91 98765..."
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!forgotPasswordEmail) return;
                    setForgotPasswordStep(1);
                  }}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {forgotPasswordStep === 1 && (
              <div className="flex flex-col items-center text-center">
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  We've sent a 6-digit cryptographic verification code to <span className="text-white font-semibold font-mono">{forgotPasswordEmail}</span>
                </p>

                {/* OTP row */}
                <div className="flex gap-2 mb-6">
                  {forgotPasswordOtp.map((char, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => {
                        const next = [...forgotPasswordOtp];
                        next[idx] = e.target.value;
                        setForgotPasswordOtp(next);
                      }}
                      className="w-11 h-12 bg-white/5 border border-white/15 focus:border-yellow-400 text-center text-lg font-bold rounded-xl outline-none focus:bg-white/10 transition-all font-mono text-white"
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setForgotPasswordStep(2);
                  }}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  Verify Code
                </button>
              </div>
            )}

            {forgotPasswordStep === 2 && (
              <div className="text-left">
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  Choose a brand new secure password for your identity lock.
                </p>

                <div className="mb-6 relative">
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-1.5">New Password</label>
                  <div className="relative flex items-center bg-white/5 border border-white/15 focus-within:border-yellow-400 rounded-xl px-3 py-1 transition-all">
                    <Lock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-transparent border-none outline-none py-2.5 text-sm text-white w-full font-mono"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!newPassword) return;
                    setIsForgotPasswordMode(false);
                    setForgotPasswordStep(0);
                    setLoginEmail(forgotPasswordEmail);
                    setLoginPassword(newPassword);
                    alert("Your password has been reset successfully! Log in to access your dashboard.");
                  }}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  Reset Password & Log In
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {!isLoginMode && !isForgotPasswordMode && currentStepIndex === 0 && (
          <div className="flex flex-col items-center text-center py-6 animate-in fade-in duration-200">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-[32px] bg-gradient-to-tr from-[#2563FF]/30 to-[#FF2E9A]/20 border border-white/15 shadow-[0_0_40px_rgba(37,99,255,0.3)] mb-6 overflow-hidden animate-pulse">
              <span className="text-6xl font-display font-extrabold bg-gradient-to-tr from-[#2563FF] via-[#8B5CF6] to-[#FF2E9A] bg-clip-text text-transparent transform hover:scale-110 transition-transform">X</span>
              <div className="absolute -inset-10 bg-gradient-to-br from-white/10 via-white/0 to-transparent transform rotate-45 pointer-events-none"></div>
            </div>
            
            <h1 className="text-4xl font-display font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              ConnectX
            </h1>
            <p className="text-sm font-semibold tracking-widest text-[#FF2E9A] mb-8 uppercase flex items-center gap-1.5 font-mono drop-shadow-[0_0_8px_rgba(255,46,154,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF2E9A]" /> Connect. Share. Inspire.
            </p>
 
            <button
              onClick={() => {
                triggerHaptic('medium');
                setCurrentStepIndex(1);
              }}
              className="w-full py-4 rounded-xl liquid-glass-capsule-blue font-bold text-white text-base relative cursor-pointer"
            >
              Create Account
            </button>

            <div className="w-full flex items-center my-6">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-xs text-gray-500 mx-4 uppercase tracking-wider font-mono">or continue with</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => { setSignupMethod('google'); setCurrentStepIndex(2); }}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium flex items-center justify-center gap-3 active:scale-99 cursor-pointer"
              >
                <span className="w-5 h-5 flex items-center justify-center bg-white text-black rounded-full text-xs font-bold font-serif">G</span>
                Continue with Google
              </button>
              <button
                onClick={() => handleSocialImport('facebook')}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium flex items-center justify-center gap-3 active:scale-99 cursor-pointer"
              >
                <Facebook className="w-5 h-5 text-blue-500 fill-current" />
                Continue with Facebook
              </button>
              <button
                onClick={() => handleSocialImport('instagram')}
                className="w-full py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium flex items-center justify-center gap-3 active:scale-99 cursor-pointer"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
                Continue with Instagram
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-8">
              Already have an account?{' '}
              <button onClick={() => setIsLoginMode(true)} className="text-yellow-400 font-semibold hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          </div>
        )}

        {/* STEP 2: CHOOSE ACCOUNT / METHOD */}
        {!isLoginMode && !isForgotPasswordMode && currentStepIndex === 1 && (
          <div className="py-2 flex flex-col h-full animate-in fade-in duration-200">
            <h2 className="text-2xl font-display font-bold mb-1 text-left">Create Account</h2>
            <p className="text-sm text-gray-400 mb-6 font-sans text-left">Choose how you want to create your ConnectX account</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setSignupMethod('google'); setCurrentStepIndex(2); }}
                className="w-full py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between active:scale-99 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-white text-black rounded-full text-sm font-black font-mono">G</span>
                  <span className="text-sm font-medium">Continue with Google</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => handleSocialImport('facebook')}
                className="w-full py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between active:scale-99 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Facebook className="w-6 h-6 text-blue-500 fill-current" />
                  <span className="text-sm font-medium">Continue with Facebook</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>

              <button
                onClick={() => handleSocialImport('instagram')}
                className="w-full py-4 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center justify-between active:scale-99 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Instagram className="w-6 h-6 text-pink-500" />
                  <span className="text-sm font-medium">Continue with Instagram</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>

              <div className="w-full flex items-center my-4">
                <div className="flex-1 h-[1px] bg-white/10"></div>
                <span className="text-xs text-gray-500 mx-4 uppercase tracking-wider font-mono">or connect with</span>
                <div className="flex-1 h-[1px] bg-white/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-left">
                <button
                  onClick={() => { setSignupMethod('email'); setCurrentStepIndex(2); }}
                  className="py-3 px-3 bg-white/5 border border-white/10 hover:border-yellow-400 rounded-xl text-left transition-all active:scale-98 cursor-pointer"
                >
                  <Mail className="w-5 h-5 text-yellow-500 mb-1.5" />
                  <div className="text-xs font-bold">Email Signup</div>
                  <span className="text-[10px] text-gray-500">Secure proposal</span>
                </button>

                <button
                  onClick={() => { setSignupMethod('mobile'); setCurrentStepIndex(2); setIsSmsSent(false); }}
                  className="py-3 px-3 bg-white/5 border border-white/10 hover:border-yellow-400 rounded-xl text-left transition-all active:scale-98 cursor-pointer"
                >
                  <Smartphone className="w-5 h-5 text-yellow-500 mb-1.5" />
                  <div className="text-xs font-bold">Mobile Signup</div>
                  <span className="text-[10px] text-gray-500">SMS OTP identity</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400 mt-10">
              Already have an account?{' '}
              <button onClick={() => setIsLoginMode(true)} className="text-yellow-400 font-semibold hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          </div>
        )}

        {/* STEP 3: OTP VERIFICATION (EMAIL & MOBILE CODES) */}
        {!isLoginMode && !isForgotPasswordMode && currentStepIndex === 2 && (
          <div className="py-2 flex flex-col items-center animate-in fade-in duration-200">
            {signupMethod === 'mobile' && !isSmsSent ? (
              <div className="w-full text-center">
                <h2 className="text-2xl font-display font-bold mb-1 text-left">Enter Mobile Number</h2>
                <p className="text-sm text-gray-400 mb-6 font-sans text-left">
                  We'll send a 6-digit confirmation SMS code to your phone.
                </p>

                {/* Smartphone Icon Glow */}
                <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-8 mx-auto relative shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                  <Smartphone className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>

                <div className="mb-6 max-w-sm mx-auto text-left">
                  <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-1.5 text-left">Mobile Phone Number</label>
                  <div className="relative flex items-center bg-white/5 border border-white/15 focus-within:border-yellow-400 rounded-xl px-3 py-1 transition-all">
                    <Phone className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="bg-transparent border-none outline-none py-2.5 text-sm text-white w-full tracking-wide"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsSmsSent(true);
                    setTimer(45);
                  }}
                  className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                >
                  Send OTP Code via SMS
                </button>
              </div>
            ) : (
              <div className="w-full text-center flex flex-col items-center">
                <h2 className="text-2xl font-display font-bold mb-1">
                  {signupMethod === 'mobile' ? 'Verify Your Mobile' : 'Verify Your Email'}
                </h2>
                <p className="text-sm text-gray-400 mb-6 font-sans">
                  We've sent a 6-digit cryptographic verification code to{' '}
                  <span className="text-white font-semibold font-mono">
                    {signupMethod === 'mobile' ? mobileNumber : emailInput}
                  </span>
                </p>

                {/* Verification icon */}
                <div className="w-20 h-20 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-8 relative shadow-[0_0_20px_rgba(250,204,21,0.1)]">
                  {signupMethod === 'mobile' ? (
                    <Smartphone className="w-8 h-8 text-yellow-400 animate-pulse" />
                  ) : (
                    <Mail className="w-8 h-8 text-yellow-500 animate-pulse" />
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-black animate-pulse">
                    <Check className="w-3.5 h-3.5 text-black stroke-3" />
                  </div>
                </div>

                {/* OTP Inputs */}
                <div className="flex gap-2 mb-6 justify-center">
                  {otpCode.map((char, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={char}
                      onChange={(e) => {
                        const next = [...otpCode];
                        next[idx] = e.target.value;
                        setOtpCode(next);
                      }}
                      className="w-11 h-12 bg-white/5 border border-white/15 focus:border-yellow-400 text-center text-lg font-bold rounded-xl outline-none focus:bg-white/10 transition-all font-mono text-white"
                    />
                  ))}
                </div>

                <p className="text-xs text-gray-400 mb-8 font-mono">
                  {timer > 0 ? (
                    `Resend code in 00:${timer < 10 ? '0' + timer : timer}`
                  ) : (
                    <button onClick={() => setTimer(45)} className="text-yellow-400 hover:underline cursor-pointer">
                      Resend OTP Code
                    </button>
                  )}
                </p>

                <button
                  onClick={handleNext}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-yellow-400 to-amber-500 text-black active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(250,204,21,0.25)]"
                >
                  Verify & Continue
                </button>

                <button onClick={() => setTimer(45)} className="text-xs text-gray-500 hover:text-white mt-4 transition-colors">
                  Didn't receive the code? <span className="text-yellow-400">Resend</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: CREATE USERNAME */}
        {!isLoginMode && !isForgotPasswordMode && currentStepIndex === 3 && (
          <div className="py-2 flex flex-col h-full">
            <h2 className="text-2xl font-display font-bold mb-1">Create Username</h2>
            <p className="text-sm text-gray-400 mb-6">Choose a unique, premium username to claim your spot.</p>

            <div className="mb-6 relative">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full py-4 px-4 pr-12 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-xl outline-none font-medium focus:bg-white/10 transition-all font-mono text-base"
                  placeholder="alex_john"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-cyan-400/20 text-cyan-400 w-6 h-6 rounded-full border border-cyan-400/10">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div className="mb-8">
              <span className="text-xs text-gray-500 font-mono block mb-3">Suggestions for you:</span>
              <div className="flex flex-wrap gap-2">
                {usernameSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setUsername(suggestion)}
                    className={`py-2 px-3.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                      username === suggestion 
                        ? 'bg-gradient-to-r from-blue-500/20 to-pink-500/20 border-pink-500/35 text-white font-medium'
                        : 'bg-white/5 hover:bg-white/15 border-white/10 text-gray-300'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold liquid-button-blue text-white active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 5: CREATE PASSWORD */}
        {currentStepIndex === 4 && (
          <div className="py-2 flex flex-col h-full">
            <h2 className="text-2xl font-display font-bold mb-1">Create Password</h2>
            <p className="text-sm text-gray-400 mb-6">Your password must be highly secure and bulletproof. E2E Shield.</p>

            <div className="mb-6 relative">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-4 pr-12 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-xl outline-none font-medium focus:bg-white/10 transition-all font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-2.5 mb-8 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasMinLen ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {hasMinLen ? <Check className="w-3 h-3 stroke-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                </div>
                <span className={`text-xs ${hasMinLen ? 'text-gray-200' : 'text-gray-500'}`}>At least 8 characters</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasUpper ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {hasUpper ? <Check className="w-3 h-3 stroke-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                </div>
                <span className={`text-xs ${hasUpper ? 'text-gray-200' : 'text-gray-500'}`}>One uppercase letter</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasNum ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {hasNum ? <Check className="w-3 h-3 stroke-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                </div>
                <span className={`text-xs ${hasNum ? 'text-gray-200' : 'text-gray-500'}`}>One number</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasSpecial ? 'bg-cyan-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                  {hasSpecial ? <Check className="w-3 h-3 stroke-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                </div>
                <span className={`text-xs ${hasSpecial ? 'text-gray-200' : 'text-gray-500'}`}>One special character</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!(hasMinLen && hasUpper && hasNum && hasSpecial)}
              className="w-full py-4 rounded-xl font-semibold liquid-button-purple text-white active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.25)]"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 6: DATE OF BIRTH */}
        {currentStepIndex === 5 && (
          <div className="py-2 flex flex-col h-full text-center">
            <h2 className="text-2xl font-display font-bold mb-1">Your Date of Birth</h2>
            <p className="text-sm text-gray-400 mb-8 bg-white/5 py-2.5 px-4 rounded-xl inline-block mx-auto">This won't be shown publicly on your profile lock.</p>

            {/* Apple Scrolling Wheel Mockup design */}
            <div className="flex justify-center items-center gap-4 bg-white/5 border border-white/10 rounded-2xl py-6 px-10 mb-8 relative">
              {/* Highlight glass bar selection */}
              <div className="absolute left-4 right-4 h-12 top-1/2 -translate-y-1/2 bg-white/5 border-y border-white/10 pointer-events-none rounded-md"></div>
              
              <div className="flex flex-col text-center w-14 gap-2 text-sm z-10 font-mono">
                <span className="text-gray-600">17</span>
                <span className="text-gray-500">18</span>
                <span className="text-white text-lg font-bold scale-110 tracking-wide">{dobDay}</span>
                <span className="text-gray-500">20</span>
                <span className="text-gray-600">21</span>
              </div>
              <div className="text-white/20 font-bold font-mono">|</div>
              <div className="flex flex-col text-center w-20 gap-2 text-sm z-10 font-mono">
                <span className="text-gray-600">May</span>
                <span className="text-gray-500">Jun</span>
                <span className="text-white text-lg font-bold scale-110 tracking-wide">{dobMonth}</span>
                <span className="text-gray-500">Aug</span>
                <span className="text-gray-600">Sep</span>
              </div>
              <div className="text-white/20 font-bold font-mono">|</div>
              <div className="flex flex-col text-center w-20 gap-2 text-sm z-10 font-mono">
                <span className="text-gray-600">1998</span>
                <span className="text-gray-500">1999</span>
                <span className="text-white text-lg font-bold scale-110 tracking-wide">{dobYear}</span>
                <span className="text-gray-500">2001</span>
                <span className="text-gray-600">2002</span>
              </div>
            </div>

            {/* Custom selectors instead of scrolling just for prototype functionality */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              <input 
                type="number" 
                value={dobDay} 
                onChange={e => setDobDay(e.target.value)} 
                className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-mono focus:border-cyan-400 outline-none"
                placeholder="Day"
              />
              <select 
                value={dobMonth} 
                onChange={e => setDobMonth(e.target.value)}
                className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-mono focus:border-cyan-400 outline-none text-white appearance-none"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                  <option key={m} value={m} className="bg-neutral-900 text-white">{m}</option>
                ))}
              </select>
              <input 
                type="number" 
                value={dobYear} 
                onChange={e => setDobYear(e.target.value)}
                className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-mono focus:border-cyan-400 outline-none"
                placeholder="Year"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold liquid-button-blue text-white active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 7: UPLOAD PROFILE PICTURE */}
        {currentStepIndex === 6 && (
          <div className="py-2 flex flex-col items-center">
            <h2 className="text-2xl font-display font-bold mb-1 text-center">Add Profile Picture</h2>
            <p className="text-sm text-gray-400 mb-6 text-center">Add a profile picture to personalize your account page.</p>

            {/* Liquid interactive picture uploader */}
            <div className="relative mb-8">
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-pink-500 p-[3px] shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                <div className="bg-black w-full h-full rounded-full flex items-center justify-center overflow-hidden relative group">
                  <img src={profilePic} alt="Preview Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Upload trigger button */}
              <button 
                type="button"
                onClick={() => setProfilePic(MOCK_AVATARS.kavin)}
                className="absolute bottom-1 right-2 w-10 h-10 rounded-full bg-cyan-400 text-black flex items-center justify-center border-4 border-black hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Camera className="w-4 h-4 text-black stroke-2" />
              </button>
            </div>

            <div className="w-full grid grid-cols-5 gap-2 mb-8 bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="col-span-5 text-gray-400 text-xs font-mono mb-1 text-center">Pick a premium aesthetic preset:</span>
              {Object.values(MOCK_AVATARS).map((av, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setProfilePic(av)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer ${profilePic === av ? 'border-pink-500' : 'border-white/10'}`}
                >
                  <img src={av} alt="Quick preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold liquid-button-pink text-white active:scale-98 transition-all cursor-pointer shadow-[0_4px_25px_rgba(236,72,153,0.3)]"
            >
              Upload Photo
            </button>

            <button 
              type="button"
              onClick={handleNext} 
              className="text-xs text-gray-400 hover:text-white font-medium mt-4 transition-colors font-mono cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* STEP 8: CREATE BIO */}
        {currentStepIndex === 7 && (
          <div className="py-2 flex flex-col h-full">
            <h2 className="text-2xl font-display font-bold mb-1">Create Your Bio</h2>
            <p className="text-sm text-gray-400 mb-6">Tell people about yourself. Craft your digital signature.</p>

            <div className="mb-6 relative">
              <label className="text-xs text-gray-500 uppercase tracking-widest font-mono block mb-2">My Bio Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={150}
                rows={4}
                className="w-full py-3 px-4 bg-white/5 border border-white/15 focus:border-cyan-400 rounded-xl outline-none text-sm leading-relaxed focus:bg-white/10 transition-all font-sans custom-scrollbar"
                placeholder="Traveler | Creator..."
              />
              <span className="absolute right-3 bottom-3 text-2xs text-gray-500 font-mono">
                {bio.length}/150
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div>
                <label className="text-2xs text-gray-500 uppercase tracking-wider font-mono block mb-1.5">Location</label>
                <div className="flex items-center bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-400 transition-all">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
                  <input 
                    type="text" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="bg-transparent border-none outline-none text-xs w-full text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-2xs text-gray-500 uppercase tracking-wider font-mono block mb-1.5">Website</label>
                <div className="flex items-center bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 focus-within:border-cyan-400 transition-all">
                  <Globe className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
                  <input 
                    type="text" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    className="bg-transparent border-none outline-none text-xs w-full text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold liquid-button-blue text-white active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              Continue
            </button>

            <button 
              type="button"
              onClick={handleNext} 
              className="text-xs text-gray-400 hover:text-white font-medium mt-4 text-center transition-colors font-mono cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* STEP 9: CHOOSE INTERESTS */}
        {currentStepIndex === 8 && (
          <div className="py-2 flex flex-col h-full">
            <h2 className="text-2xl font-display font-bold mb-1">Choose Your Interests</h2>
            <p className="text-sm text-gray-400 mb-6 font-sans">Select a few topics you love. We'll curate your liquid dashboard.</p>

            {/* Interest pills grid */}
            <div className="grid grid-cols-3 gap-2.5 mb-8">
              {AVAILABLE_INTERESTS.map((interest) => {
                const selected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-3 px-2 rounded-2xl text-xs font-medium border text-center transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${
                      selected 
                        ? 'bg-gradient-to-r from-blue-500/25 to-pink-500/25 border-cyan-400 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
                    {interest}
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold liquid-button-blue text-white active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              Continue
            </button>

            <button 
              type="button"
              onClick={() => { setSelectedInterests([]); handleNext(); }} 
              className="text-xs text-gray-400 hover:text-white font-medium mt-4 text-center transition-colors font-mono cursor-pointer"
            >
              Skip
            </button>
          </div>
        )}

        {/* STEP 10: FINAL READY PAGE */}
        {currentStepIndex === 9 && (
          <div className="py-4 flex flex-col items-center justify-center text-center">
            
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-pink-500 p-[3px] mb-6 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-pulse">
              <div className="bg-black w-full h-full rounded-full flex items-center justify-center">
                <CircleCheck className="w-12 h-12 text-pink-500 stroke-2" />
              </div>
            </div>

            <h2 className="text-3xl font-display font-extrabold mb-2 bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
              You're All Set! 🎉
            </h2>
            <p className="text-sm text-gray-400 max-w-xs mb-8">
              Let's personalize your experience. Your Liquid Glass credentials and cryptographic connectors are verified.
            </p>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex flex-col gap-3 text-left">
              <span className="text-pink-400 font-mono text-2xs uppercase tracking-widest block mb-1">Onboarding Checklist Completed</span>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Your liquid glass details are synced</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Default secure cryptography channels initialized</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-gray-300">
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span>Primary interest categories indexed successfully</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 active:scale-98 transition-all text-white shadow-[0_6px_30px_rgba(236,72,153,0.4)] cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* STEP 11/12: FACEBOOK / INSTAGRAM SYNCING EXTREME FIDELITY PROPELLER SCREEN */}
        {currentStepIndex === 10 && (
          <div className="py-2 flex flex-col h-full items-center">
            
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              {signupMethod === 'facebook' ? (
                <Facebook className="w-9 h-9 text-blue-500 fill-current" />
              ) : (
                <Instagram className="w-9 h-9 text-pink-500" />
              )}
            </div>

            <h2 className="text-2xl font-display font-bold mb-1 text-center">
              Login with {signupMethod === 'facebook' ? 'Facebook' : 'Instagram'}
            </h2>
            <p className="text-xs text-gray-400 mb-6 text-center">
              We'll secure and import your social identity to ConnectX.
            </p>

            {/* Imported items preview list */}
            <div className="w-full flex flex-col gap-3.5 bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
              <span className="text-cyan-400 font-mono text-3xs uppercase tracking-wider">Discovered Credentials</span>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-gray-400">DisplayName</span>
                <span className="text-white font-medium">{displayName}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                <span className="text-gray-400">Imported Email</span>
                <span className="text-white font-medium font-mono">{emailInput}</span>
              </div>
              <div className="flex items-center gap-3.5 py-1">
                <span className="text-gray-400 text-xs text-left grow">Profile Picture</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
                  <img src={profilePic} alt="Imported Avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-left py-1 text-xs text-gray-300">
                <span className="text-gray-400 block mb-1">Imported Bio descriptor</span>
                <span className="italic">"{bio}"</span>
              </div>
            </div>

            <p className="text-2xs text-gray-400 mb-6 text-center">
              We will never post anything without your cryptographic authorization. E2E secure badge.
            </p>

            <button
              onClick={() => {
                // Advance to Email OTP just to confirm secure linking
                setCurrentStepIndex(2);
              }}
              className="w-full py-4 rounded-xl font-semibold liquid-button-blue text-white active:scale-98 transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.25)]"
            >
              Continue as {displayName.split(' ')[0]}
            </button>

            <button 
              type="button"
              onClick={handleBack} 
              className="text-xs text-gray-400 hover:text-white mt-4 font-mono transition-all cursor-pointer"
            >
              Sign up with another account
            </button>
          </div>
        )}

      </main>

      {/* SIGNUP TIMELINE OVERVIEW FOOTER */}
      <footer className="w-full max-w-4xl flex flex-col items-center gap-1.5 z-10 px-2 mt-8 py-2 border-t border-white/5 bg-black/40 backdrop-blur-md rounded-2xl">
        <span className="text-3xs uppercase text-zinc-400 tracking-widest font-mono font-bold">Signup Onboarding Timeline Overview</span>
        
        <div className="w-full flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-2.5 max-w-3xl">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex && currentStepIndex !== 10;
            const isActive = idx === currentStepIndex && currentStepIndex !== 10;
            return (
              <div key={step} className="flex items-center gap-1 shrink-0 first:pl-2 last:pr-2">
                
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border text-2xs font-mono font-bold ${
                    isCompleted 
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 border-transparent text-white shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                      : isActive 
                        ? 'bg-pink-600 border-pink-400/50 text-white scale-110 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                        : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-3" /> : (idx + 1)}
                  </div>
                  <span className={`text-4xs font-mono tracking-wider font-medium hidden md:block ${
                    isActive ? 'text-pink-500 font-bold' : isCompleted ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className={`w-6 h-[2px] rounded-full transition-all hidden md:block ${
                    isCompleted ? 'bg-cyan-500/50' : 'bg-white/5'
                  }`}></div>
                )}

              </div>
            );
          })}
        </div>
      </footer>

    </div>
  );
};
