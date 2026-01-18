/**
 * AI Chat Types
 * 
 * Defines chat message and history structures
 * for AI sidebar conversation.
 */

import type { ComponentType, SelectedComponent, SelectionContext } from './editor.types';
import type { AIAction } from './actions.types';

/**
 * Chat message in the AI sidebar
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  
  /** Who sent the message */
  role: 'user' | 'assistant' | 'system';
  
  /** Message text */
  content: string;
  
  /** When message was sent */
  timestamp: Date;
  
  /** Context at time of message */
  context?: {
    selectedElementId: string;
    selectedElementType: ComponentType;
  };
  
  /** Actions from AI response */
  actions?: AIAction[];
  
  /** Message status */
  status: 'pending' | 'success' | 'error' | 'preview';
}

/**
 * Request payload to AI endpoint
 */
export interface AIRequest {
  selectedComponent: SelectedComponent;
  userCommand: string;
  context?: SelectionContext;
  conversationHistory?: ChatMessage[];
}

/**
 * Entry in the action history timeline
 */
export interface HistoryEntry {
  /** Unique entry ID */
  id: string;
  
  /** When action was applied */
  timestamp: Date;
  
  /** Type of action performed */
  actionType: string;
  
  /** Description of change */
  description: string;
  
  /** Undo stack size at this point */
  undoCount: number;
  
  /** Associated message ID */
  messageId: string;
  
  /** Target component ID */
  targetComponentId: string;
  
  /** Target component type */
  targetComponentType: ComponentType;
}
