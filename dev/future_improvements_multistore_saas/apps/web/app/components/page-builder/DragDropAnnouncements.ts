/**
 * Drag and Drop Announcements Component
 *
 * Provides screen reader announcements for drag and drop operations.
 * Based on @dnd-kit accessibility best practices from Context7.
 *
 * Usage:
 * <DndContext
 *   announcements={createBuilderAnnouncements(sections)}
 *   ...
 * >
 */

import type { Announcements } from '@dnd-kit/core';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

/**
 * Get Bengali name for a section by ID
 */
function getSectionName(sections: BuilderSection[], id: string | number): string {
  const section = sections.find((s) => s.id === id || s.id === String(id));
  if (!section) return `সেকশন ${id}`;

  const meta = getSectionMeta(section.type);
  return meta?.name || section.type;
}

/**
 * Create screen reader announcements for drag operations
 */
export function createBuilderAnnouncements(sections: BuilderSection[]): Announcements {
  return {
    onDragStart({ active }) {
      const name = getSectionName(sections, active.id);
      return `${name} তুলে ধরা হয়েছে। সরাতে তীর কী ব্যবহার করুন, ছাড়তে স্পেস বা এন্টার চাপুন।`;
    },

    onDragOver({ active, over }) {
      if (!over) {
        return `${getSectionName(sections, active.id)} কোনো ড্রপ জোনের উপরে নেই।`;
      }

      const activeName = getSectionName(sections, active.id);
      const overName = getSectionName(sections, over.id);

      return `${activeName} এখন ${overName} এর উপরে আছে।`;
    },

    onDragEnd({ active, over }) {
      if (!over) {
        return `${getSectionName(sections, active.id)} বাতিল করা হয়েছে।`;
      }

      const activeName = getSectionName(sections, active.id);
      const overName = getSectionName(sections, over.id);

      if (active.id === over.id) {
        return `${activeName} তার জায়গায় রাখা হয়েছে।`;
      }

      return `${activeName} ${overName} এর জায়গায় সরানো হয়েছে।`;
    },

    onDragCancel({ active }) {
      return `ড্র্যাগ বাতিল করা হয়েছে। ${getSectionName(sections, active.id)} তার আগের জায়গায় ফিরে গেছে।`;
    },
  };
}

/**
 * English announcements for non-Bengali users
 */
export function createBuilderAnnouncementsEn(sections: BuilderSection[]): Announcements {
  const getSectionNameEn = (id: string | number): string => {
    const section = sections.find((s) => s.id === id || s.id === String(id));
    if (!section) return `Section ${id}`;

    const meta = getSectionMeta(section.type);
    return meta?.nameEn || section.type;
  };

  return {
    onDragStart({ active }) {
      const name = getSectionNameEn(active.id);
      return `Picked up ${name}. Use arrow keys to move, space or enter to drop.`;
    },

    onDragOver({ active, over }) {
      if (!over) {
        return `${getSectionNameEn(active.id)} is not over a drop zone.`;
      }

      return `${getSectionNameEn(active.id)} is over ${getSectionNameEn(over.id)}.`;
    },

    onDragEnd({ active, over }) {
      if (!over) {
        return `${getSectionNameEn(active.id)} was dropped.`;
      }

      if (active.id === over.id) {
        return `${getSectionNameEn(active.id)} was dropped in its original position.`;
      }

      return `${getSectionNameEn(active.id)} was moved to ${getSectionNameEn(over.id)}'s position.`;
    },

    onDragCancel({ active }) {
      return `Dragging cancelled. ${getSectionNameEn(active.id)} returned to its original position.`;
    },
  };
}

/**
 * Screen reader instructions for keyboard navigation
 */
export const keyboardInstructions = {
  bn: {
    draggable: 'ড্র্যাগ করতে স্পেস বা এন্টার চাপুন',
    dragging: 'সরাতে তীর কী ব্যবহার করুন, ছাড়তে স্পেস বা এন্টার চাপুন, বাতিল করতে Escape চাপুন',
  },
  en: {
    draggable: 'Press space or enter to start dragging',
    dragging: 'Use arrow keys to move, space or enter to drop, escape to cancel',
  },
};

export default createBuilderAnnouncements;
