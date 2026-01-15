/**
 * MagicSectionWrapper - Lovable-style Section Editor
 * 
 * Wraps landing page sections with:
 * - Gradient border highlight on hover
 * - Floating "✨ Magic Edit" button
 * - AI edit modal for natural language editing
 * - Upgrade modal for free users
 */

import { useState, useRef, type ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { AIEditPanel } from './AIEditPanel';
import { AIUpgradeModal } from '~/components/modals/AIUpgradeModal';
import type { PlanType } from '~/utils/plans.server';

interface MagicSectionWrapperProps<T = Record<string, unknown>> {
  sectionId: string;
  sectionLabel: string;
  data: T;
  onUpdate: (newData: T) => void;
  isEditable?: boolean;
  planType?: PlanType;
  children: ReactNode;
}

export function MagicSectionWrapper<T = Record<string, unknown>>({
  sectionId,
  sectionLabel,
  data,
  onUpdate,
  isEditable = true,
  planType = 'free',
  children,
}: MagicSectionWrapperProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Don't add any wrapper if not editable
  if (!isEditable) {
    return <>{children}</>;
  }

  // Check if user can use AI (paid plans only get unlimited, free gets 5/day)
  const canUseUnlimitedAI = planType !== 'free';

  const handleEditClick = () => {
    // Free users see upgrade modal, paid users see edit panel
    if (!canUseUnlimitedAI) {
      setShowUpgradeModal(true);
    } else {
      setIsEditing(true);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const handleUpdate = (newData: T) => {
    onUpdate(newData);
    setIsEditing(false);
  };

  return (
    <div
      ref={sectionRef}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Border Overlay - Lovable/Vercel style */}
      <div
        className={`
          absolute inset-0 rounded-2xl pointer-events-none z-10
          transition-all duration-300 ease-out
          ${isHovered || isEditing
            ? 'opacity-100'
            : 'opacity-0'
          }
        `}
        style={{
          background: isHovered || isEditing
            ? 'linear-gradient(90deg, rgba(168,85,247,0.4) 0%, rgba(236,72,153,0.4) 50%, rgba(168,85,247,0.4) 100%)'
            : 'transparent',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Section Label Badge */}
      <div
        className={`
          absolute top-3 left-3 z-20
          px-2.5 py-1 rounded-md
          bg-gradient-to-r from-purple-600 to-pink-500
          text-white text-xs font-semibold
          shadow-lg shadow-purple-500/25
          transition-all duration-300 ease-out
          ${isHovered || isEditing
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2'
          }
        `}
      >
        {sectionLabel}
      </div>

      {/* Magic Edit Button */}
      <button
        onClick={handleEditClick}
        className={`
          absolute top-3 right-3 z-20
          flex items-center gap-1.5 
          px-3 py-1.5 rounded-full
          bg-gradient-to-r from-purple-600 to-pink-500
          text-white text-sm font-medium
          shadow-lg shadow-purple-500/30
          hover:shadow-xl hover:shadow-purple-500/40
          hover:scale-105
          transition-all duration-300 ease-out
          ${isHovered || isEditing
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 pointer-events-none'
          }
        `}
      >
        <Sparkles className="w-4 h-4" />
        Magic Edit
      </button>

      {/* The actual section content */}
      {children}

      {/* AI Edit Panel */}
      {isEditing && sectionRef.current && (
        <AIEditPanel
          sectionId={sectionId}
          sectionLabel={sectionLabel}
          currentData={data}
          anchorRect={sectionRef.current.getBoundingClientRect()}
          onClose={handleClose}
          onUpdate={(newData) => handleUpdate(newData as T)}
        />
      )}

      {/* Upgrade Modal for Free Users */}
      <AIUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        remainingToday={5}
      />
    </div>
  );
}
