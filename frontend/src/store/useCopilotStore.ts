import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    uncertainty?: string;
    tools_used?: string[];
    provenance?: { source: string; model_version: string };
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

interface CopilotState {
  isOpen: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  createSession: () => string;
  setActiveSession: (id: string) => void;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, content: string, metadata?: ChatMessage['metadata']) => void;
}

export const useCopilotStore = create<CopilotState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      sessions: [],
      activeSessionId: null,

      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open) => set({ isOpen: open }),

      createSession: () => {
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          updatedAt: Date.now(),
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: newSession.id,
        }));
        return newSession.id;
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      deleteSession: (id) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== id);
          return {
            sessions: newSessions,
            activeSessionId: state.activeSessionId === id ? (newSessions[0]?.id || null) : state.activeSessionId,
          };
        });
      },

      addMessage: (sessionId, message) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const updatedMessages = [...s.messages, message];
              // Auto-generate title from first user message
              let title = s.title;
              if (s.messages.length === 0 && message.role === 'user') {
                title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '');
              }
              return { ...s, messages: updatedMessages, title, updatedAt: Date.now() };
            }
            return s;
          });
          return { sessions: sessions.sort((a, b) => b.updatedAt - a.updatedAt) };
        });
      },

      updateMessage: (sessionId, messageId, content, metadata) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const messages = s.messages.map((m) => {
                if (m.id === messageId) {
                  return { ...m, content, metadata: metadata || m.metadata };
                }
                return m;
              });
              return { ...s, messages };
            }
            return s;
          });
          return { sessions };
        });
      }
    }),
    {
      name: 'kargosetu-copilot-storage',
      partialize: (state) => ({ sessions: state.sessions, activeSessionId: state.activeSessionId }),
    }
  )
);
