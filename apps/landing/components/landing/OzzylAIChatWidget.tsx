/**
 * Ozzyl AI Chat Widget
 * Enterprise-grade visitor chatbot for the marketing landing page
 *
 * Features:
 * - Lead Capture (Name + Phone) before chat
 * - Persistent Chat History (via visitorId)
 * - Floating button with pulse animation
 * - Glassmorphism chat panel
 * - Typing indicator
 * - Quick suggestion chips
 * - Mobile responsive (full-screen on mobile)
 * - Bengali-first design
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, Loader2, ArrowRight, Phone } from 'lucide-react';
import { useTranslation } from '@/app/contexts/LanguageContext';
import { AIResponseRendererDark } from '@/components/ui/AIResponseRenderer';
import { ASSETS } from '@/config/assets';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function OzzylAIChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasShownGreeting, setHasShownGreeting] = useState(false);

  // Registration State
  const [isRegistered, setIsRegistered] = useState(false);
  const [visitorId, setVisitorId] = useState<number | null>(null);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        t('landingOzzylChat_initialMsg') || 'Hello! I am Ozzyl AI. How can I help you today?',
    },
  ]);

  // Update initial message when language changes
  useEffect(() => {
    setMessages((prev) => {
      // Only update if the first message is the initial greeting and hasn't been deleted
      if (prev.length > 0 && prev[0].id === '1' && prev[0].role === 'assistant') {
        const newMessages = [...prev];
        newMessages[0] = {
          ...newMessages[0],
          content:
            t('landingOzzylChat_initialMsg') || 'Hello! I am Ozzyl AI. How can I help you today?',
        };
        return newMessages;
      }
      return prev;
    });
  }, [t]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_SUGGESTIONS = [
    { text: t('landingOzzylChat_suggestWhatIs') || 'What is Ozzyl AI?', emoji: '💡' },
    { text: t('landingOzzylChat_suggestPricing') || 'What is the price?', emoji: '💰' },
    { text: t('landingOzzylChat_suggestBkash') || 'Do you support bKash?', emoji: '📱' },
    { text: t('landingOzzylChat_suggestHowToStart') || 'How to start?', emoji: '🚀' },
  ];

  // Check LocalStorage for Visitor ID
  useEffect(() => {
    const storedId = localStorage.getItem('ozzyl_visitor_id');
    if (storedId) {
      setVisitorId(parseInt(storedId));
      setIsRegistered(true);
    }
  }, []);

  // Show greeting popup once on page load, then auto-hide
  useEffect(() => {
    if (!hasShownGreeting && !isOpen) {
      const showTimer = setTimeout(() => {
        setShowGreeting(true);
        setHasShownGreeting(true);
      }, 1500); // Show after 1.5s

      return () => clearTimeout(showTimer);
    }
  }, [hasShownGreeting, isOpen]);

  // Auto-hide greeting after 5 seconds
  useEffect(() => {
    if (showGreeting) {
      const hideTimer = setTimeout(() => {
        setShowGreeting(false);
      }, 5000);

      return () => clearTimeout(hideTimer);
    }
  }, [showGreeting]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRegistered]);

  // Focus input when opened (if registered)
  useEffect(() => {
    if (isOpen && isRegistered) {
      setShowGreeting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isRegistered]);

  // Validate Bangladesh phone number (01XXXXXXXXX - 11 digits)
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    return bdPhoneRegex.test(cleaned);
  };

  const getVisitorChatEndpoint = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_OZZYL_APP_API_BASE ||
      process.env.NEXT_PUBLIC_OZZYL_APP_BASE ||
      'https://app.ozzyl.com';
    return `${baseUrl.replace(/\/$/, '')}/api/visitor-chat`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    setErrorMSG('');

    if (!regName.trim() || !regPhone.trim() || isLoading) return;

    // Validate phone
    const cleanedPhone = regPhone.replace(/\D/g, '');
    if (!validatePhone(cleanedPhone)) {
      setPhoneError(
        t('landingOzzylChat_phoneInvalidError') || 'Enter a valid Bangladeshi mobile number'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(getVisitorChatEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name: regName, phone: regPhone }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw || 'Invalid server response' };
      }

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setVisitorId(data.visitorId);
      localStorage.setItem('ozzyl_visitor_id', data.visitorId.toString());
      setIsRegistered(true);
    } catch (err: any) {
      setErrorMSG(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !visitorId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Build history (last 6 messages excluding current)
    const history = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch(getVisitorChatEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: text,
          visitorId,
          history,
        }),
      });

      const raw = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { error: raw || 'Invalid server response' };
      }

      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: t('landingOzzylChat_errorMsg') || 'Something went wrong.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Floating Chat Button with Brand Logo */}
      <AnimatePresence>
        {!isOpen && (
          <>
            {/* Greeting Popup */}
            <AnimatePresence>
              {showGreeting && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: [0, -15, 0], // Jump/Bounce animation
                    scale: 1,
                  }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{
                    y: { duration: 0.6, ease: 'easeOut', times: [0, 0.5, 1] },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                  }}
                  className="fixed bottom-24 right-6 z-50 max-w-[280px] flex items-start gap-4 p-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform origin-bottom-right shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #0A2F25 0%, #051510 100%)',
                    border: '1px solid rgba(0, 106, 78, 0.3)',
                    boxShadow:
                      '0 10px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                  }}
                  onClick={() => setIsOpen(true)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={ASSETS.brand.logoSmall}
                      alt="Ozzyl"
                      className="w-12 h-12 rounded-xl shadow-lg"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#051510] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Ozzyl AI</h4>
                    <p className="text-xs text-white/80 leading-relaxed max-w-[180px]">
                      {t('landingOzzylChat_greetingMsg') ||
                        'Hi! Want to know how AI can grow your business?'}
                    </p>
                  </div>
                  {/* Arrow pointing to button */}
                  <div
                    className="absolute -bottom-2 right-8 w-4 h-4 transform rotate-45 border-r border-b border-[#006A4E]/30"
                    style={{ background: '#051510' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Button */}
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: hasShownGreeting ? 0 : [0, -8, 0], // Single bounce only on first show
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                y: { delay: 1.5, duration: 0.4, ease: 'easeOut' },
              }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #00875F 0%, #006A4E 50%, #004D38 100%)',
                boxShadow: '0 0 30px rgba(0, 135, 95, 0.5), 0 8px 25px -5px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Animated ring */}
              <span className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-30" />
              {/* Inner glow */}
              <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-50" />
              {/* Logo */}
              <img
                src={ASSETS.brand.logoSmallBlack}
                alt="Ozzyl AI"
                className="w-10 h-10 relative z-10 object-contain"
                loading="lazy"
                decoding="async"
              />
              {/* Online indicator */}
              <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white z-20 animate-pulse" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] flex flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/80"
            style={{
              background: 'linear-gradient(180deg, #111A16 0%, #0A0F0D 100%)',
              border: '1px solid rgba(0, 106, 78, 0.3)',
              boxShadow:
                '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 60px -20px rgba(0, 106, 78, 0.2)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#0A2F25]/20 border-b border-[#006A4E]/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#004D38] p-0.5 shadow-lg shadow-[#006A4E]/20">
                    <img
                      src={ASSETS.brand.logoSmallBlack}
                      alt="Ozzyl"
                      className="w-full h-full rounded-[10px] object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0F0D]" />
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2 text-base">
                    Ozzyl AI
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#006A4E] text-white rounded-full tracking-wide">
                      {t('landingOzzylChat_betaBadge') || 'BETA'}
                    </span>
                  </h3>
                  <p className="text-xs text-white/50 font-medium">
                    {t('landingOzzylChat_alwaysHelp') || 'Always here to help'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="https://wa.me/8801739416661"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/10 rounded-lg text-[#25D366] transition-colors"
                  title="WhatsApp Support"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </a>
                <a
                  href="tel:+8801739416661"
                  className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                  title="Call Us"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content: Registration Form vs Chat */}
            {!isRegistered ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#006A4E]/10 rounded-full flex items-center justify-center mb-4 border border-[#006A4E]/20">
                  <User className="w-8 h-8 text-[#006A4E]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {t('landingOzzylChat_identifyYourself') || 'Identify Yourself'}
                </h3>
                <p className="text-sm text-white/60 mb-6">
                  {t('landingOzzylChat_identifyDesc') ||
                    'Please provide your details to start the conversation.'}
                </p>

                <form onSubmit={handleRegister} className="w-full space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-white/70 ml-1">
                      {t('landingOzzylChat_yourName') || 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#006A4E] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition"
                      placeholder={t('landingOzzylChat_namePlaceholder') || 'Enter your name'}
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-medium text-white/70 ml-1">
                      {t('landingOzzylChat_phone') || 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#006A4E] rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition"
                      placeholder={t('landingOzzylChat_phonePlaceholder') || '01XXXXXXXXX'}
                    />
                  </div>

                  {phoneError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                      {phoneError}
                    </div>
                  )}

                  {errorMSG && !isRegistered && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                      {errorMSG}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#006A4E] hover:bg-[#005740] text-white font-medium rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#006A4E]/20"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      t('landingOzzylChat_startChat') || 'Start Chat'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
                          msg.role === 'user' ? 'bg-white/10' : ''
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <User className="w-4 h-4 text-white/70" />
                        ) : (
                          <img src={ASSETS.brand.logoSmall} alt="Ozzyl" className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] sm:text-sm leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-[#006A4E] to-[#005740] text-white rounded-tr-sm'
                            : 'bg-white/10 border border-white/5 rounded-tl-sm backdrop-blur-sm'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          <AIResponseRendererDark response={msg.content} />
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={ASSETS.brand.logoSmall} alt="Ozzyl" className="w-3.5 h-3.5" />
                      </div>
                      <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
                        <span
                          className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="w-2 h-2 bg-[#006A4E] rounded-full animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 2 && (
                  <div
                    className="px-4 pb-2 flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {QUICK_SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s.text)}
                        disabled={isLoading}
                        className="flex-shrink-0 px-3 py-1.5 bg-white/5 hover:bg-[#006A4E]/20 border border-white/10 hover:border-[#006A4E]/40 rounded-full text-xs text-white/70 hover:text-white transition whitespace-nowrap disabled:opacity-50"
                      >
                        <span className="mr-1.5">{s.emoji}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-white/5 bg-black/20">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={t('landingOzzylChat_typeMessage') || 'Type your message...'}
                      disabled={isLoading}
                      className="flex-1 bg-white/5 border border-white/10 focus:border-[#006A4E]/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2.5 bg-gradient-to-r from-[#006A4E] to-[#00875F] hover:from-[#005740] hover:to-[#006A4E] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-[#006A4E]/30"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Footer CTA */}
            <div className="px-4 py-2 bg-[#006A4E]/10 border-t border-[#006A4E]/20">
              <a
                href="https://app.ozzyl.com/auth/register"
                className="flex items-center justify-center gap-2 text-xs font-medium text-[#00875F] hover:text-white transition"
              >
                <span>{t('landingOzzylChat_createFreeStore') || 'Create Your Free Store'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
