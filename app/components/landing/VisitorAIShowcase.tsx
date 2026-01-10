import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Zap, Check, Bot, Send, Sparkles } from 'lucide-react';

export function VisitorAIShowcase() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', text: string, id: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);

  // Suggested questions for the demo
  const suggestions = [
    { text: "OZZYL কি?", action: 1 },
    { text: "Pricing কেমন?", action: 2 },
    { text: "কিভাবে শুরু করব?", action: 3 }
  ];

  const conversationFlows = {
    1: {
      user: "OZZYL কি?",
      ai: "OZZYL হলো বাংলাদেশী মার্চেন্টদের জন্য একটি কমপ্লিট ই-কমার্স সলিউশন। বিকাশ/নগদ পেমেন্ট, ইনভেন্টরি ম্যানেজমেন্ট, এবং ল্যান্ডিং পেজ বিল্ডার - সব আছে এক জায়গায়!",
    },
    2: {
      user: "Pricing কেমন?",
      ai: "আমাদের কোনো হিডেন চার্জ নেই! ফ্রি প্ল্যানে ১টি প্রোডাক্ট। স্টার্টার প্ল্যান ৫০০ টাকা/মাসে ৫০টি প্রোডাক্ট। আর প্রিমিয়াম প্ল্যানে আনলিমিটেড সব!",
    },
    3: {
      user: "কিভাবে শুরু করব?",
      ai: "খুব সহজ! ১. সাইন আপ করুন ২. স্টোরের নাম দিন ৩. প্রোডাক্ট আপলোড করে বিক্রি শুরু করুন। ১০ মিনিটের বেশি লাগবে না!",
    }
  };

  const handlSuggestionClick = async (action: number) => {
    if (isTyping) return;
    
    // Add User Message
    const flow = conversationFlows[action as keyof typeof conversationFlows];
    setMessages(prev => [...prev, { role: 'user', text: flow.user, id: Date.now() }]);
    
    // AI Thinking Delay
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add AI Response
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: flow.ai, id: Date.now() + 1 }]);
  };

  // Initial greeting
  useEffect(() => {
    setTimeout(() => {
      setMessages([{
        role: 'ai',
        text: "হ্যালো! আমি OZZYL AI। আপনার অনলাইন ব্যবসা নিয়ে কিভাবে সাহায্য করতে পারি?",
        id: 1
      }]);
    }, 500);
  }, []);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#006A4E]/5 via-transparent to-[#006A4E]/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">New Feature</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            OZZYL সম্পর্কে জানতে চান?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              AI কে জিজ্ঞেস করুন!
            </span>
          </h2>
          
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Sales team এর দরকার নেই — AI ই আপনার সব প্রশ্নের উত্তর দেবে ২৪/৭
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          
          {/* LEFT: Feature List */}
          <div className="w-full lg:w-5/12 flex flex-col justify-center space-y-8">
            {[
              { title: "AI বলে দেবে", desc: "OZZYL কি করে? মুহূর্তের মধ্যে উত্তর পান" },
              { title: "Pricing জানুন", desc: "প্যাকেজ ডিটেইলস নিয়ে কনফিউশন? জিজ্ঞেস করুন" },
              { title: "ফিচার ডিটেইলস", desc: "কোন টুলের কাজ কি? বিস্তারিত জানুন" },
              { title: "২৪/৭ সার্ভিস", desc: "কোনো waiting নেই, দিনে-রাতে সবসময় রেডি" },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.div
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="pt-8"
            >
              <div className="inline-block p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border border-white/10">
                <p className="text-sm text-emerald-200 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Sales team এর খরচ বাঁচান, কাস্টমার স্যাটিসফ্যাকশন বাড়ান
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Chat Demo */}
          <div className="w-full lg:w-7/12 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full opacity-30" />
            
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 h-[600px] flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-[#151515]">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white">OZZYL Assistant</h3>
                  <p className="text-xs text-white/50">Always active</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
                <AnimatePresence mode='popLayout'>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'ai' 
                            ? 'bg-white/10 text-white rounded-tl-none border border-white/5' 
                            : 'bg-emerald-600 text-white rounded-tr-none shadow-lg shadow-emerald-900/20'
                        }`}
                      >
                         {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                       <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                         <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                /* Empty div to scroll to */
                <div className="h-4" /> 
              </div>

              {/* Suggestions Chips */}
              <div className="p-4 pt-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handlSuggestionClick(s.action)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-full text-sm text-emerald-400 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {s.text}
                  </button>
                ))}
              </div>

              {/* Fake Input Area */}
              <div className="p-4 border-t border-white/5 bg-[#151515]">
                <div className="h-12 bg-black/30 rounded-xl border border-white/5 flex items-center px-4 justify-between">
                  <span className="text-white/30 text-sm">Type a message...</span>
                  <div className="p-2 bg-emerald-600/20 rounded-lg">
                    <Send className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
