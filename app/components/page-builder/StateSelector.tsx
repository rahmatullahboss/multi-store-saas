/**
 * StateSelector Component
 * 
 * A toggle UI for switching between CSS pseudo-class states (Normal, Hover, Focus, Active)
 * in the GrapesJS editor. Works with the Selector Manager API.
 */

import { useState, useEffect } from 'react';
import { MousePointer2, Hand, Focus, Zap } from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export default function StateSelector({ editor }: { editor?: any }) {
  const { t } = useTranslation();
  const [activeState, setActiveState] = useState('');

  const STATES = [
    { name: '', label: t('normalState'), icon: MousePointer2 },
    { name: 'hover', label: t('hoverState'), icon: Hand },
    { name: 'focus', label: t('focusState'), icon: Focus },
    { name: 'active', label: t('activeState'), icon: Zap },
  ];

  // Sync with GrapesJS state
  useEffect(() => {
    if (!editor) return;
    
    const sm = editor.SelectorManager;
    
    // Listen for state changes from GrapesJS
    const handleStateChange = () => {
      setActiveState(sm.getState() || '');
    };
    
    editor.on('selector:state', handleStateChange);
    
    // Set initial state
    setActiveState(sm.getState() || '');
    
    return () => {
      editor.off('selector:state', handleStateChange);
    };
  }, [editor]);

  const handleStateChange = (stateName: string) => {
    if (!editor) return;
    editor.SelectorManager.setState(stateName);
    setActiveState(stateName);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mr-2 w-full sm:w-auto mb-1 sm:mb-0">{t('stateLabel')}:</span>
      {STATES.map((state) => {
        const Icon = state.icon;
        const isActive = activeState === state.name;
        return (
          <button
            key={state.name}
            onClick={() => handleStateChange(state.name)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all
              ${isActive 
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-200' 
                : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
              }
            `}
            title={`Style for :${state.name || 'normal'} state`}
          >
            <Icon size={12} strokeWidth={2.5} />
            {state.label}
          </button>
        );
      })}
    </div>
  );
}
