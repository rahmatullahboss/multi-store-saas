import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, Image as ImageIcon, MousePointer2, LayoutTemplate, 
  Smartphone, Eye, RotateCcw, Copy, Save, CheckCircle2,
  Square, FileText, BarChart3, Video, Star, Move
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';
import { useIsMobile } from '~/hooks/useIsMobile';

export function DragDropBuilderShowcase() {
  const { t } = useTranslation();
  const [activeDrop, setActiveDrop] = useState<number | null>(null);
  const [canvasElements, setCanvasElements] = useState([
    { id: 1, type: 'header', height: 'h-16' },
    { id: 2, type: 'hero', height: 'h-48' }
  ]);

  // Animation sequence state
  const [animationStep, setAnimationStep] = useState(0);
  const isMobile = useIsMobile();

  const widgets = [
    { id: 'text', icon: Type, label: t('landingDragDrop_widgetText') },
    { id: 'image', icon: ImageIcon, label: t('landingDragDrop_widgetImage') },
    { id: 'button', icon: Square, label: t('landingDragDrop_widgetButton') },
    { id: 'form', icon: FileText, label: t('landingDragDrop_widgetForm') },
    { id: 'chart', icon: BarChart3, label: t('landingDragDrop_widgetChart') },
    { id: 'video', icon: Video, label: t('landingDragDrop_widgetVideo') },
    { id: 'review', icon: Star, label: t('landingDragDrop_widgetReview') },
  ];

  const features = [
    {
      icon: LayoutTemplate,
      title: t('landingDragDrop_pixelPerfect'),
      desc: t('landingDragDrop_placeAnywhere'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10'
    },
    {
      icon: Smartphone,
      title: t('landingDragDrop_responsive'),
      desc: t('landingDragDrop_perfectEverywhere'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      icon: Eye,
      title: t('landingDragDrop_livePreview'),
      desc: t('landingDragDrop_seeRealTime'),
      color: 'text-orange-400',
      bg: 'bg-orange-500/10'
    },
    {
      icon: Save,
      title: t('landingDragDrop_autoSave'),
      desc: t('landingDragDrop_nothingLost'),
      color: 'text-green-400',
      bg: 'bg-green-500/10'
    },
    {
      icon: RotateCcw,
      title: t('landingDragDrop_undoRedo'),
      desc: t('landingDragDrop_backToPrevious'),
      color: 'text-red-400',
      bg: 'bg-red-500/10'
    },
    {
      icon: Copy,
      title: t('landingDragDrop_copyPaste'),
      desc: t('landingDragDrop_sectionCopyPaste'),
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10'
    }
  ];

  useEffect(() => {
    const sequence = async () => {
      // Disable animation on mobile
      if (isMobile) return;

      while (true) {
        // Reset
        setActiveDrop(null);
        setAnimationStep(0); // Idle
        await new Promise(r => setTimeout(r, 1000));

        // Start Drag (Pick "Review" widget)
        setAnimationStep(1); // Cursor moves to widget
        await new Promise(r => setTimeout(r, 1000));

        setAnimationStep(2); // Dragging starts
        await new Promise(r => setTimeout(r, 800)); // Moving to canvas

        setActiveDrop(2); // Highlight drop zone
        await new Promise(r => setTimeout(r, 400)); // Hovering

        setAnimationStep(3); // Drop
        setCanvasElements(prev => [...prev, { id: 3, type: 'review', height: 'h-32' }]);
        setActiveDrop(null);
        
        await new Promise(r => setTimeout(r, 2000)); // Show result

        // Reset canvas for next loop
        setCanvasElements(prev => prev.filter(el => el.id !== 3));
      }
    };
    sequence();
  }, [isMobile]);

  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0F0D]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-40" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
          >
            <Move className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">{t('landingDragDrop_title')}</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            🎨 {t('landingDragDrop_title')} — <span className="text-purple-400">{t('landingDragDrop_customizeAsYouWish')}</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('landingDragDrop_builderDesc')}
          </p>
        </div>

        {/* Builder Mockup */}
        <div className="relative mx-auto max-w-5xl mb-24">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg" />
          
          <div className="relative bg-[#1a1f1d] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex h-[600px]">
            
            {/* Sidebar (Widgets) */}
            <div className="w-64 bg-[#111] border-r border-white/5 flex flex-col">
              <div className="p-4 border-b border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('landingDragDrop_widgets')}</span>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
                {widgets.map((w) => (
                  <div key={w.id} className="aspect-square bg-white/5 hover:bg-white/10 rounded-lg flex flex-col items-center justify-center cursor-move border border-white/5 hover:border-purple-500/30 transition-colors group relative">
                    <w.icon className="w-6 h-6 text-white/50 group-hover:text-purple-400 mb-2" />
                    <span className="text-xs text-white/50 group-hover:text-white">{w.label}</span>
                    
                    {/* Simulated Ghost Widget for Animation */}
                    {w.id === 'review' && animationStep >= 2 && animationStep < 3 && (
                      <motion.div
                        layoutId="ghost-widget"
                        className="absolute inset-0 bg-purple-600 rounded-lg z-50 flex items-center justify-center shadow-2xl opacity-80"
                        initial={{ x: 0, y: 0 }}
                        animate={{ 
                          x: 300, // Move to canvas center approx
                          y: 150,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      >
                         <w.icon className="w-8 h-8 text-white" />
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-[#0f1211] p-8 relative overflow-y-auto overflow-x-hidden">
               {/* Browser Top Bar Mock */}
               <div className="h-2 w-full flex gap-1.5 mb-6 opacity-30">
                 <div className="w-2 h-2 rounded-full bg-red-500" />
                 <div className="w-2 h-2 rounded-full bg-yellow-500" />
                 <div className="w-2 h-2 rounded-full bg-green-500" />
               </div>

               {/* Elements List */}
               <div className="space-y-4 max-w-2xl mx-auto">
                 <AnimatePresence>
                   {canvasElements.map((el) => (
                     <motion.div
                       key={el.id}
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className={`w-full rounded-lg border-2 border-dashed transition-colors duration-300 relative group
                         ${el.type === 'review' ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}
                       `}
                     >
                        {/* Mock Content */}
                        <div className={`p-6 ${el.height} flex items-center justify-center`}>
                           {el.type === 'header' && (
                             <div className="w-full flex justify-between items-center px-4">
                               <div className="w-20 h-4 bg-white/10 rounded" />
                               <div className="flex gap-4">
                                 <div className="w-12 h-3 bg-white/5 rounded" />
                                 <div className="w-12 h-3 bg-white/5 rounded" />
                                 <div className="w-20 h-8 bg-purple-600/50 rounded-md" />
                               </div>
                             </div>
                           )}
                           {el.type === 'hero' && (
                             <div className="text-center space-y-4">
                               <div className="w-3/4 h-8 bg-white/10 rounded mx-auto" />
                               <div className="w-1/2 h-4 bg-white/5 rounded mx-auto" />
                               <div className="flex justify-center gap-4 mt-6">
                                 <div className="w-32 h-10 bg-white/10 rounded-md" />
                                 <div className="w-32 h-10 border border-white/10 rounded-md" />
                               </div>
                             </div>
                           )}
                           {el.type === 'review' && (
                             <div className="grid grid-cols-3 gap-4 w-full px-4">
                               {[1,2,3].map(i => (
                                 <div key={i} className="bg-[#1a1f1d] p-4 rounded-lg border border-white/5">
                                   <div className="flex gap-1 mb-2 text-yellow-500">
                                     <Star className="w-3 h-3 fill-current" />
                                     <Star className="w-3 h-3 fill-current" />
                                     <Star className="w-3 h-3 fill-current" />
                                     <Star className="w-3 h-3 fill-current" />
                                     <Star className="w-3 h-3 fill-current" />
                                   </div>
                                   <div className="w-full h-2 bg-white/10 rounded mb-2" />
                                   <div className="w-2/3 h-2 bg-white/10 rounded" />
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-transparent group-hover:border-blue-500/50 border-2 border-transparent rounded-lg pointer-events-none transition-colors" />
                     </motion.div>
                   ))}
                 </AnimatePresence>

                 {/* Drop Zone Indicator */}
                 <motion.div 
                    animate={{ 
                      height: activeDrop ? 100 : 0,
                      opacity: activeDrop ? 1 : 0,
                      marginBottom: activeDrop ? 16 : 0
                    }}
                    className="w-full rounded-lg border-2 border-dashed border-purple-500 bg-purple-500/10 flex items-center justify-center overflow-hidden"
                 >
                    <span className="text-purple-400 text-sm font-medium">{t('landingDragDrop_dropHere')}</span>
                 </motion.div>

               </div>

               {/* Animated Cursor */}
               {animationStep > 0 && (
                  <motion.div
                    className="absolute z-[60] pointer-events-none"
                    initial={{ x: 50, y: 300 }} // Initial sidebar pos approx
                    animate={
                      animationStep === 1 ? { x: 50, y: 300 } : // Start
                      animationStep === 2 ? { x: 400, y: 450 } : // Move to canvas drop zone
                      animationStep === 3 ? { x: 450, y: 500, opacity: 0 } : // Drop and vanish
                      { x: 50, y: 300 }
                    }
                    transition={{ duration: animationStep === 2 ? 0.8 : 0.5 }}
                  >
                    <MousePointer2 className="w-6 h-6 text-white fill-black drop-shadow-xl" />
                  </motion.div>
               )}

            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
            >
               <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                 <feature.icon className={`w-6 h-6 ${feature.color}`} />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
               <p className="text-white/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
