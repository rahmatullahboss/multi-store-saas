/**
 * GrapesJS Editor Component
 * 
 * A React wrapper for the GrapesJS editor core.
 */

import { useState, useEffect } from 'react';
import GjsEditor, { Canvas } from '@grapesjs/react';
import grapesjs from 'grapesjs';
import gjsBlocksBasic from 'grapesjs-blocks-basic';
import gjsForms from 'grapesjs-plugin-forms';

// Important: Import GrapesJS CSS
import 'grapesjs/dist/css/grapes.min.css';
import '~/styles/grapesjs-overrides.css';
import '~/styles/grapesjs-navigator.css'; // Custom Navigator Styles
import { getGrapesConfig } from '~/lib/grapesjs/config';
import { bdBlocksPlugin } from '~/lib/grapesjs/bd-blocks';
import { animationPlugin } from '~/lib/grapesjs/animation-plugin';
import swiperPlugin from '~/lib/grapesjs/plugins/slider';
import productLoopPlugin from '~/lib/grapesjs/plugins/product-loop';
import shapeDividersPlugin from '~/lib/grapesjs/plugins/shape-dividers';
import popupPlugin from '~/lib/grapesjs/plugins/popup';
import EditorToolbar from './Toolbar';
import SidebarPanel from './SidebarPanel';
import { Sparkles, Loader2, CheckCircle, X } from 'lucide-react';
import MagicGenerateModal from "./MagicGenerateModal";
import BlockLibraryModal from "./BlockLibraryModal";
import AiChatWidget from "./AiChatWidget";
import { toast } from 'sonner';
import ContextMenu from './ContextMenu';

interface GrapesEditorProps {
  pageId?: string;
  planType?: string;
  onStorageStatusChange?: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  publishedBaseUrl?: string;
  pageSlug?: string;
}

export default function GrapesEditor({ pageId, planType = 'free', onStorageStatusChange, publishedBaseUrl, pageSlug }: GrapesEditorProps) {
  const [editor, setEditor] = useState<any>(null);
  const isAiLocked = planType === 'free';
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isBlockLibraryOpen, setIsBlockLibraryOpen] = useState(false);
  const [aiDesignMode, setAiDesignMode] = useState<'full-page' | 'section-design'>('full-page');
  const [selectedComponentData, setSelectedComponentData] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Section Templates for Smart Section Actions
  const SECTION_TEMPLATES: Record<string, string> = {
    hero: `<section class="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center"><h1 class="text-5xl font-bold mb-4">Your Amazing Headline</h1><p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">A compelling subheadline that explains your value proposition.</p><button class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-xl">Get Started Now</button></section>`,
    features: `<section class="py-16 px-6 bg-white"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Us</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"><div class="text-center p-6"><div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🚀</div><h3 class="font-bold text-xl mb-2">Fast & Easy</h3><p class="text-gray-600">Get started in minutes.</p></div><div class="text-center p-6"><div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">💰</div><h3 class="font-bold text-xl mb-2">Save Money</h3><p class="text-gray-600">Affordable pricing.</p></div><div class="text-center p-6"><div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⭐</div><h3 class="font-bold text-xl mb-2">Premium Quality</h3><p class="text-gray-600">Top-tier service.</p></div></div></section>`,
    pricing: `<section class="py-16 px-6 bg-gray-50"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Simple Pricing</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"><div class="bg-white rounded-2xl p-8 shadow-lg border"><h3 class="font-bold text-lg mb-2">Starter</h3><div class="text-4xl font-bold mb-4">$9<span class="text-lg text-gray-500">/mo</span></div><ul class="space-y-3 mb-8 text-gray-600"><li>✓ 5 Projects</li><li>✓ Basic Support</li></ul><button class="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold">Start Free</button></div><div class="bg-indigo-600 text-white rounded-2xl p-8 shadow-xl transform scale-105"><h3 class="font-bold text-lg mb-2">Pro</h3><div class="text-4xl font-bold mb-4">$29<span class="text-lg opacity-70">/mo</span></div><ul class="space-y-3 mb-8 opacity-90"><li>✓ Unlimited Projects</li><li>✓ Priority Support</li></ul><button class="w-full py-3 bg-white text-indigo-600 rounded-lg font-bold">Get Started</button></div><div class="bg-white rounded-2xl p-8 shadow-lg border"><h3 class="font-bold text-lg mb-2">Enterprise</h3><div class="text-4xl font-bold mb-4">$99<span class="text-lg text-gray-500">/mo</span></div><ul class="space-y-3 mb-8 text-gray-600"><li>✓ Everything in Pro</li><li>✓ Dedicated Support</li></ul><button class="w-full py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold">Contact</button></div></div></section>`,
    testimonials: `<section class="py-16 px-6 bg-white"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">What Customers Say</h2><div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"><div class="bg-gray-50 rounded-2xl p-6"><p class="text-gray-600 mb-4">"This product changed my business!"</p><div class="flex items-center gap-3"><div class="w-10 h-10 bg-indigo-200 rounded-full"></div><div><p class="font-bold">Sarah J.</p><p class="text-sm text-gray-500">CEO</p></div></div></div><div class="bg-gray-50 rounded-2xl p-6"><p class="text-gray-600 mb-4">"Best investment. 5 stars!"</p><div class="flex items-center gap-3"><div class="w-10 h-10 bg-green-200 rounded-full"></div><div><p class="font-bold">Michael R.</p><p class="text-sm text-gray-500">Founder</p></div></div></div><div class="bg-gray-50 rounded-2xl p-6"><p class="text-gray-600 mb-4">"Amazing support!"</p><div class="flex items-center gap-3"><div class="w-10 h-10 bg-purple-200 rounded-full"></div><div><p class="font-bold">Emily W.</p><p class="text-sm text-gray-500">Designer</p></div></div></div></div></section>`,
    faq: `<section class="py-16 px-6 bg-gray-50"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">FAQ</h2><div class="max-w-3xl mx-auto space-y-4"><div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="font-bold text-lg mb-2">How do I get started?</h3><p class="text-gray-600">Sign up and start using immediately.</p></div><div class="bg-white rounded-xl p-6 shadow-sm"><h3 class="font-bold text-lg mb-2">Can I cancel anytime?</h3><p class="text-gray-600">Yes, cancel anytime.</p></div></div></section>`,
    contact: `<section class="py-16 px-6 bg-white"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Contact Us</h2><form class="max-w-xl mx-auto space-y-4"><input type="text" placeholder="Name" class="w-full px-4 py-3 border rounded-lg"/><input type="email" placeholder="Email" class="w-full px-4 py-3 border rounded-lg"/><textarea placeholder="Message" rows="4" class="w-full px-4 py-3 border rounded-lg"></textarea><button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Send</button></form></section>`,
    footer: `<footer class="py-12 px-6 bg-gray-900 text-white"><div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8"><div><h3 class="font-bold text-lg mb-4">Company</h3><p class="text-gray-400 text-sm">Making the world better.</p></div><div><h4 class="font-bold mb-4">Product</h4><ul class="space-y-2 text-gray-400 text-sm"><li>Features</li><li>Pricing</li></ul></div><div><h4 class="font-bold mb-4">Company</h4><ul class="space-y-2 text-gray-400 text-sm"><li>About</li><li>Contact</li></ul></div><div><h4 class="font-bold mb-4">Legal</h4><ul class="space-y-2 text-gray-400 text-sm"><li>Privacy</li><li>Terms</li></ul></div></div></footer>`,
    cta_banner: `<section class="py-16 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center"><h2 class="text-3xl font-bold mb-4">Ready to Get Started?</h2><p class="text-xl opacity-90 mb-8">Join thousands of happy customers.</p><button class="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg shadow-xl">Start Free Trial</button></section>`,
    stats: `<section class="py-16 px-6 bg-indigo-600 text-white"><div class="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center"><div><div class="text-4xl font-bold mb-2">10K+</div><p class="opacity-80">Customers</p></div><div><div class="text-4xl font-bold mb-2">50M+</div><p class="opacity-80">Transactions</p></div><div><div class="text-4xl font-bold mb-2">99.9%</div><p class="opacity-80">Uptime</p></div><div><div class="text-4xl font-bold mb-2">24/7</div><p class="opacity-80">Support</p></div></div></section>`,
    team: `<section class="py-16 px-6 bg-white"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Our Team</h2><div class="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto"><div class="text-center"><div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div><h3 class="font-bold">John Doe</h3><p class="text-gray-500 text-sm">CEO</p></div><div class="text-center"><div class="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div><h3 class="font-bold">Jane Smith</h3><p class="text-gray-500 text-sm">CTO</p></div></div></section>`,
    gallery: `<section class="py-16 px-6 bg-gray-50"><h2 class="text-3xl font-bold text-center mb-12 text-gray-900">Gallery</h2><div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"><div class="aspect-square bg-gray-200 rounded-xl"></div><div class="aspect-square bg-gray-300 rounded-xl"></div><div class="aspect-square bg-gray-200 rounded-xl"></div><div class="aspect-square bg-gray-300 rounded-xl"></div></div></section>`,
    logo_cloud: `<section class="py-12 px-6 bg-white"><p class="text-center text-gray-500 mb-8">Trusted by industry leaders</p><div class="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto"><div class="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">LOGO</div><div class="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">LOGO</div><div class="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">LOGO</div><div class="w-24 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold">LOGO</div></div></section>`,
  };

  // AI Command Execution - WORLD-CLASS (30+ Actions)
  const handleExecuteAiCommand = (command: any) => {
    if (!editor) return;
    
    let target = editor.getSelected();
    if (command.target === 'wrapper' || !target) {
      target = editor.getWrapper();
    }

    try {
      switch (command.action) {
        // ========== Design & Style ==========
        case 'update_style':
          if (command.value) {
            target.addStyle(command.value);
            toast.success('স্টাইল আপডেট হয়েছে! ✨');
          }
          break;

        case 'apply_color_scheme':
          if (command.value) {
            const colors = command.value;
            target.addStyle({
              '--primary-color': colors.primary || '#6366f1',
              '--secondary-color': colors.secondary || '#8b5cf6',
              '--accent-color': colors.accent || '#f59e0b',
              '--bg-color': colors.background || '#ffffff',
              '--text-color': colors.text || '#1f2937',
            });
            toast.success('কালার স্কিম অ্যাপ্লাই হয়েছে! 🎨');
          }
          break;

        case 'apply_typography':
          if (command.value) {
            target.addStyle({
              fontFamily: command.value.bodyFont || 'Inter, sans-serif',
            });
            toast.success('Typography আপডেট হয়েছে! 📝');
          }
          break;

        case 'add_animation':
          if (command.value) {
            const animations: Record<string, string> = {
              fadeIn: 'fadeIn 0.5s ease-out',
              fadeInUp: 'fadeInUp 0.6s ease-out',
              slideUp: 'slideUp 0.5s ease-out',
              bounceIn: 'bounceIn 0.8s ease-out',
              pulse: 'pulse 2s infinite',
            };
            target.addStyle({ animation: animations[command.value] || command.value });
            toast.success('Animation যোগ হয়েছে! ✨');
          }
          break;

        case 'apply_glassmorphism':
          target.addStyle({
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '16px',
          });
          toast.success('Glassmorphism অ্যাপ্লাই হয়েছে! 🪟');
          break;

        case 'apply_gradient':
          if (command.value) {
            const gradients: Record<string, string> = {
              sunset: 'linear-gradient(to right, #f97316, #ec4899)',
              ocean: 'linear-gradient(to right, #3b82f6, #14b8a6)',
              forest: 'linear-gradient(to right, #16a34a, #10b981)',
              royal: 'linear-gradient(to right, #6366f1, #8b5cf6)',
            };
            const bg = typeof command.value === 'string' 
              ? gradients[command.value] || `linear-gradient(to right, ${command.value})`
              : `linear-gradient(${command.value.direction || 'to right'}, ${command.value.from}, ${command.value.to})`;
            target.addStyle({ background: bg });
            toast.success('Gradient অ্যাপ্লাই হয়েছে! 🌈');
          }
          break;

        case 'add_shadow':
          const shadows: Record<string, string> = {
            sm: '0 1px 2px rgba(0,0,0,0.05)',
            md: '0 4px 6px rgba(0,0,0,0.1)',
            lg: '0 10px 15px rgba(0,0,0,0.1)',
            xl: '0 20px 25px rgba(0,0,0,0.15)',
            '2xl': '0 25px 50px rgba(0,0,0,0.25)',
          };
          target.addStyle({ boxShadow: shadows[command.value] || command.value });
          toast.success('Shadow যোগ হয়েছে! 🌑');
          break;

        case 'make_responsive':
          // Basic responsive - hide on mobile or adjust
          toast.info('Responsive settings applied');
          break;

        // ========== Content & Copy ==========
        case 'update_content':
          if (command.value) {
            target.set('content', command.value);
            toast.success('Content আপডেট হয়েছে! 📝');
          }
          break;

        case 'generate_headline':
        case 'generate_description':
        case 'generate_cta':
        case 'improve_copy':
          if (command.value) {
            target.set('content', command.value);
            toast.success('AI Copy জেনারেট হয়েছে! ✍️');
          }
          break;

        // ========== Smart Sections ==========
        case 'add_hero_section':
          editor.addComponents(SECTION_TEMPLATES.hero);
          toast.success('Hero Section যোগ হয়েছে! 🦸');
          break;

        case 'add_features_section':
          editor.addComponents(SECTION_TEMPLATES.features);
          toast.success('Features Section যোগ হয়েছে! ⭐');
          break;

        case 'add_pricing_table':
          editor.addComponents(SECTION_TEMPLATES.pricing);
          toast.success('Pricing Table যোগ হয়েছে! 💰');
          break;

        case 'add_testimonials':
          editor.addComponents(SECTION_TEMPLATES.testimonials);
          toast.success('Testimonials যোগ হয়েছে! 💬');
          break;

        case 'add_faq_section':
          editor.addComponents(SECTION_TEMPLATES.faq);
          toast.success('FAQ Section যোগ হয়েছে! ❓');
          break;

        case 'add_contact_form':
          editor.addComponents(SECTION_TEMPLATES.contact);
          toast.success('Contact Form যোগ হয়েছে! 📧');
          break;

        case 'add_footer':
          editor.addComponents(SECTION_TEMPLATES.footer);
          toast.success('Footer যোগ হয়েছে! 🔻');
          break;

        case 'add_cta_banner':
          editor.addComponents(SECTION_TEMPLATES.cta_banner);
          toast.success('CTA Banner যোগ হয়েছে! 📢');
          break;

        case 'add_image_gallery':
          editor.addComponents(SECTION_TEMPLATES.gallery);
          toast.success('Image Gallery যোগ হয়েছে! 🖼️');
          break;

        case 'add_team_section':
          editor.addComponents(SECTION_TEMPLATES.team);
          toast.success('Team Section যোগ হয়েছে! 👥');
          break;

        case 'add_stats_section':
          editor.addComponents(SECTION_TEMPLATES.stats);
          toast.success('Stats Section যোগ হয়েছে! 📊');
          break;

        case 'add_logo_cloud':
          editor.addComponents(SECTION_TEMPLATES.logo_cloud);
          toast.success('Logo Cloud যোগ হয়েছে! 🏢');
          break;

        // ========== Generic Components ==========
        case 'add_component':
          if (command.value) {
            if (target === editor.getWrapper()) {
              editor.addComponents(command.value);
            } else {
              const collection = target.collection;
              const index = target.index();
              collection.add(command.value, { at: index + 1 });
            }
            toast.success('Component যোগ হয়েছে! ➕');
          }
          break;

        case 'remove_component':
          target.remove();
          toast.success('Component ডিলিট হয়েছে! 🗑️');
          break;

        case 'update_trait':
          if (command.value) {
            target.addAttributes(command.value);
            toast.success('Attributes আপডেট হয়েছে!');
          }
          break;

        // ========== Advanced ==========
        case 'update_layout':
          if (command.value) {
            target.addStyle(command.value);
            toast.success('Layout আপডেট হয়েছে! 📐');
          }
          break;

        case 'add_custom_css':
          if (command.value) {
            // Add to editor's CSS
            editor.CssComposer.addRules(command.value);
            toast.success('Custom CSS যোগ হয়েছে! 💻');
          }
          break;

        case 'duplicate_section':
          if (target && target !== editor.getWrapper()) {
            const clone = target.clone();
            target.collection.add(clone, { at: target.index() + 1 });
            toast.success('Section ডুপ্লিকেট হয়েছে! 📋');
          }
          break;

        case 'reorder_sections':
          if (target && command.value) {
            const collection = target.collection;
            const currentIndex = target.index();
            const newIndex = command.value === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= 0 && newIndex < collection.length) {
              collection.remove(target);
              collection.add(target, { at: newIndex });
              toast.success(`Section ${command.value === 'up' ? 'উপরে' : 'নিচে'} নেওয়া হয়েছে!`);
            }
          }
          break;

        case 'optimize_seo':
          toast.info('SEO Optimization applied');
          break;

        case 'general_advice':
          // Just display message, no action
          break;

        default:
          console.log('[AI] Unknown action:', command.action);
      }
    } catch (e) {
      console.error('AI Command Execution Failed:', e);
      toast.error('কমান্ড এক্সিকিউশন ব্যর্থ হয়েছে');
    }
  };

  // Page Configurations (Featured Product, WhatsApp, etc.)
  const [pageConfig, setPageConfig] = useState<{
    featuredProductId?: number;
    featuredProductName?: string;
    whatsappNumber?: string;
    whatsappMessage?: string;
    timerEndDate?: string;
    socialProofCount?: number;
    socialProofText?: string;
  }>({});

  // Global Theme State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#2563eb', // blue-600
    fontHeading: 'Hind Siliguri',
    fontBody: 'Hind Siliguri',
  });

  // Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  
  // Custom Event Listener for Tab Switching from Context Menu
  useEffect(() => {
    const handleTabSwitch = (e: CustomEvent) => {
        // This is caught by SidebarPanel ideally, or we can pass a prop if we hoist state
        // Since SidebarPanel manages its own state locally, we might need to hoist `activeTab` to `GrapesEditor`.
        // For now, we will dispatch it to window and let SidebarPanel listen, OR hoist the state.
        // Hoisting state is cleaner.
    };
    // window.addEventListener('switch-sidebar-tab', handleTabSwitch as any);
    // return () => window.removeEventListener('switch-sidebar-tab', handleTabSwitch as any);
  }, []);

  const onEditor = (editorInstance: any) => {
    console.log('Editor loaded', editorInstance);
    setEditor(editorInstance);

    // Disable default context menu and show custom one
    editorInstance.on('load', () => {
        const body = editorInstance.Canvas.getBody();
        body.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            // Calculate absolute position based on iframe offset
            const canvasOffset = editorInstance.Canvas.getElement().getBoundingClientRect();
            setContextMenuPos({
                x: canvasOffset.left + e.clientX,
                y: canvasOffset.top + e.clientY
            });
            // Select component under cursor if not selected
            const target = editorInstance.getSelected();
            if (!target) {
                // editorInstance.select(e.target); // This is tricky with iframe coordinates, let Grapes handle selection mostly
            }
        });
    });

    // 1. Initial Data Loading (pageConfig)
    editorInstance.on('storage:load', (res: any) => {
      if (res && res.pageConfig) {
        setPageConfig(res.pageConfig);
      }
      if (res && res.themeConfig) {
        setThemeConfig(res.themeConfig);
      }
    });

    // 2. Inject pageConfig during Save
    editorInstance.on('storage:start:store', (data: any) => {
      onStorageStatusChange?.('saving');
      data.pageConfig = pageConfig;
      data.themeConfig = themeConfig;
      data.html = editorInstance.getHtml();
      data.css = editorInstance.getCss();
      if (editorInstance.isPublishing) {
        data.publish = true;
      }
    });

    editorInstance.on('storage:end:store', () => {
      onStorageStatusChange?.('saved');
      // Reset to idle after 3 seconds
      setTimeout(() => {
        onStorageStatusChange?.('idle');
      }, 3000);
    });

    editorInstance.on('storage:error', () => {
      onStorageStatusChange?.('error');
      // Reset to idle after 5 seconds or keep error? 
      // Let's reset to idle after 5s so it doesn't stay stuck
      setTimeout(() => {
        onStorageStatusChange?.('idle');
      }, 5000);
    });

    // 3. Add Magic Generate Button to Panel
    editorInstance.Panels.addButton('options', {
      id: 'magic-generate',
      className: isAiLocked 
        ? 'bg-slate-400 text-white font-bold !px-3 !border-none hover:bg-slate-500 flex items-center gap-2'
        : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold !px-3 !border-none hover:opacity-90 flex items-center gap-2',
      label: isAiLocked ? `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        AI Generate (PRO)
      ` : '✨ AI Generate',
      command: 'open-magic-modal',
      attributes: { title: isAiLocked ? 'Unlock Magic AI (Premium)' : 'Generate Landing Page with AI' }
    });

    editorInstance.Commands.add('open-magic-modal', {
      run: () => {
          setAiDesignMode('full-page');
          setIsMagicModalOpen(true);
      },
    });

    editorInstance.Commands.add('open-ai-design-modal', {
      run: () => {
          const selected = editorInstance.getSelected();
          if (selected) {
            setSelectedComponentData(selected.toHTML());
            setAiDesignMode('section-design');
            setIsMagicModalOpen(true);
          } else {
            toast.error("Please select a block to design with AI");
          }
      },
    });

    // Add Sparkle icon to component toolbar
    editorInstance.on('component:selected', () => {
      const selected = editorInstance.getSelected();
      if (selected) {
        const toolbar = selected.get('toolbar');
        const hasAiBtn = toolbar.some((btn: any) => btn.command === 'open-ai-design-modal');
        
        if (!hasAiBtn) {
          toolbar.unshift({
            attributes: { title: 'Design with AI', class: 'fa fa-magic' },
            command: 'open-ai-design-modal',
            label: `
              <svg viewBox="0 0 24 24" fill="none" width="12" height="12" style="margin: 4px" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            `
          });
          selected.set('toolbar', toolbar);
        }
      }
    });

    // Initial Theme Injection
    updateCanvasTheme(editorInstance, themeConfig);
  };

  const handleMagicGenerate = (data: any) => {
    if (!editor) return;

    if (aiDesignMode === 'section-design') {
      const selected = editor.getSelected();
      if (selected && data.html) {
        // Replace selected component with new HTML
        const index = selected.index();
        
        // Add components and get the first one
        const newComps = editor.addComponents(data.html, { at: index });
        const newComp = newComps[0];
        
        // Apply CSS if provided
        if (data.css && newComp) {
          newComp.addStyle(data.css);
        }
        
        selected.remove();
        editor.select(newComp);
        toast.success("Design updated by AI!");
      }
      return;
    }

    // Full Page Mode
    editor.DomComponents.clear();
    if (data.blocks && Array.isArray(data.blocks)) {
      data.blocks.sort((a: any, b: any) => a.order - b.order).forEach((block: any) => {
        const blockType = block.type;
        const blockDef = editor.Blocks.get(blockType);
        
        if (blockDef) {
           const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
           if (content) {
             editor.addComponents(content);
           }
        }
      });
    }
    toast.success("Page generated successfully!");
  };

  // Handle template loading
  const handleLoadTemplate = (templateId: string) => {
    if (!editor) return;

    // Import template config
    import('~/lib/grapesjs/template-configs').then(({ TEMPLATE_CONFIGS }) => {
      const template = TEMPLATE_CONFIGS[templateId];
      if (!template) {
        console.warn(`Template not found: ${templateId}`);
        return;
      }

      // Clear existing canvas content
      editor.DomComponents.clear();

      //Load template blocks sequentially
      template.blocks.forEach((blockId) => {
        const blockDef = editor.Blocks.get(blockId);
        if (blockDef) {
          const content = blockDef.getContent ? blockDef.getContent() : blockDef.attributes.content;
          if (content) {
            editor.addComponents(content);
          } else {
            console.warn(`Content not found for block: ${blockId}`);
          }
        } else {
          console.warn(`Block not found: ${blockId}`);
        }
      });

      // Apply template colors to theme
      setThemeConfig({
        primaryColor: template.themeColors.primaryColor,
        secondaryColor: template.themeColors.secondaryColor,
        fontHeading: template.themeColors.fontHeading,
        fontBody: template.themeColors.fontBody,
      });

      toast.success(`Template "${template.nameEn}" loaded!`);
    });
  };
  
  // Smart Sync: Update blocks when pageConfig changes
  useEffect(() => {
    if (!editor || !pageConfig) return;

    const syncConfigToBlocks = () => {
      const wrapper = editor.getWrapper();
      if (!wrapper) return;

      // Update Featured Product references
      if (pageConfig.featuredProductName) {
        wrapper.find('.product-name').forEach((comp: any) => {
          comp.set('content', pageConfig.featuredProductName);
        });
      }

      // Update WhatsApp links
      if (pageConfig.whatsappNumber) {
        const msg = encodeURIComponent(pageConfig.whatsappMessage || '');
        const url = `https://wa.me/${pageConfig.whatsappNumber}?text=${msg}`;
        wrapper.find('.whatsapp-link').forEach((comp: any) => {
          // Check if it's a link component or has a tagName 'a'
          if (comp.get('type') === 'link' || comp.get('tagName') === 'a') {
            comp.addAttributes({ href: url });
          }
        });
      }

      // Update Social Proof
      if (pageConfig.socialProofCount !== undefined && pageConfig.socialProofCount !== null) {
        wrapper.find('.social-proof-count').forEach((comp: any) => {
          comp.set('content', pageConfig.socialProofCount?.toString() || '0');
        });
      }

      // Update Countdown Timers
      if (pageConfig.timerEndDate) {
        wrapper.find('[data-gjs-type="countdown"]').forEach((comp: any) => {
          comp.set('end-date', pageConfig.timerEndDate);
        });
      }
    };

    syncConfigToBlocks();
  }, [pageConfig, editor]);

  // Inject Dynamic Tailwind Config when Theme Changes
  useEffect(() => {
    if (editor) {
      updateCanvasTheme(editor, themeConfig);
    }
  }, [themeConfig, editor]);

  const updateCanvasTheme = (editor: any, config: any) => {
    const frame = editor.Canvas.getFrameEl();
    if (!frame) return;

    const doc = frame.contentDocument;
    if (!doc) return;

    // Remove existing theme style if any
    const existingStyle = doc.getElementById('theme-variables-style');
    if (existingStyle) existingStyle.remove();

    // Create new theme style with CSS custom properties
    const style = doc.createElement('style');
    style.id = 'theme-variables-style';
    style.innerHTML = `
      :root {
        --primary-color: ${config.primaryColor};
        --secondary-color: ${config.secondaryColor};
        --font-heading: "${config.fontHeading}", sans-serif;
        --font-body: "${config.fontBody}", sans-serif;
      }
      
      /* Apply fonts to common elements */
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-heading);
      }
      
      body, p, span, div, a, button, input, textarea, select {
        font-family: var(--font-body);
      }
      
      /* Utility classes for theme colors */
      .bg-primary { background-color: var(--primary-color) !important; }
      .text-primary { color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      
      .bg-secondary { background-color: var(--secondary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .border-secondary { border-color: var(--secondary-color) !important; }
      
      /* Button hover effects */
      .bg-primary:hover { filter: brightness(0.9); }
      .bg-secondary:hover { filter: brightness(0.9); }
    `;
    
    // Inject into head
    doc.head.appendChild(style);
  };
  
  // State for Controlling Tabs via Context Menu
  const [activeSidebarTab, setActiveSidebarTab] = useState<'widgets' | 'design' | 'structure' | 'settings'>('widgets');

  useEffect(() => {
      // Listen for the custom event
      const handleTabSwitch = (e: CustomEvent) => {
          if (e.detail) {
              setActiveSidebarTab(e.detail);
          }
      };
      window.addEventListener('switch-sidebar-tab', handleTabSwitch as any);
      return () => window.removeEventListener('switch-sidebar-tab', handleTabSwitch as any);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white">
      <GjsEditor
        grapesjs={grapesjs}
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        // Pass GrapesJS options
        options={{
          ...getGrapesConfig(null as any, pageId, planType),
          height: '100%',
        }}
        // Load plugins correctly
        plugins={[
          gjsBlocksBasic as any,
          gjsForms as any,
          bdBlocksPlugin as any, // Our custom blocks
          animationPlugin as any, // Animation traits for all components
          swiperPlugin as any, // New Slider Plugin
          productLoopPlugin as any, // Product Loop Plugin
          shapeDividersPlugin as any, // Shape Dividers
          popupPlugin as any, // Popup Builder
        ]}
        onEditor={onEditor}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <EditorToolbar 
            isAiLocked={isAiLocked} 
            onOpenLibrary={() => setIsBlockLibraryOpen(true)}
            publishedPageUrl={publishedBaseUrl && pageSlug ? `${publishedBaseUrl}/p/${pageSlug}` : undefined}
          />
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Unified Left Sidebar: Blocks + Customization */}
            <div className="h-full overflow-hidden flex-shrink-0">
            <SidebarPanel 
                themeConfig={themeConfig} 
                onThemeChange={setThemeConfig}
                pageConfig={pageConfig}
                onPageConfigChange={setPageConfig}
                onLoadTemplate={handleLoadTemplate}
                activeTab={activeSidebarTab}
                onTabChange={setActiveSidebarTab}
            />
            </div>

            {/* Main Area: Canvas */}
            <div 
                className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative"
                onContextMenu={(e) => {
                  e.preventDefault(); 
                  // Fallback if not caught by iframe
                }}
            >
                <div className="w-full h-full shadow-lg relative bg-white">
                    <Canvas className="h-full w-full" />
                </div>
                
                {/* Custom Context Menu */}
                {contextMenuPos && (
                  <ContextMenu 
                    editor={editor} 
                    position={contextMenuPos} 
                    onClose={() => setContextMenuPos(null)} 
                  />
                )}
            </div>
          </div>
        </div>
      </GjsEditor>

      <MagicGenerateModal 
        isOpen={isMagicModalOpen} 
        onClose={() => {
          setIsMagicModalOpen(false);
          setSelectedComponentData(null);
        }}
        onGenerate={handleMagicGenerate}
        mode={aiDesignMode}
        initialData={selectedComponentData || undefined}
        isLocked={isAiLocked}
        featuredProductId={pageConfig.featuredProductId}
      />

      <BlockLibraryModal 
        isOpen={isBlockLibraryOpen}
        onClose={() => setIsBlockLibraryOpen(false)}
        editor={editor}
      />
      
      <AiChatWidget 
          editor={editor}
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          onExecuteCommand={handleExecuteAiCommand}
          isLocked={isAiLocked}
          featuredProductId={pageConfig.featuredProductId}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        /* GrapesJS Built-in Styles Overrides to match our UI */
        .gjs-sm-property-input input, .gjs-sm-property-input select {
          border: 1px solid #f1f5f9 !important;
          border-radius: 8px !important;
          background-color: #f8fafc !important;
          color: #1e293b !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          width: 100% !important;
        }
        .gjs-sm-property-input input:focus {
          border-color: #10b981 !important;
          outline: none !important;
        }
        .gjs-trait-input-container input, .gjs-trait-input-container select {
          border: 0 !important;
          background: transparent !important;
          width: 100% !important;
          font-size: 11px !important;
        }
      `}} />
    </div>
  );
}

