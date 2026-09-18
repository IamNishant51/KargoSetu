"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCopilotStore, ChatMessage } from "@/store/useCopilotStore";
import { MessageSquare, X, Send, Bot, User, Trash2, StopCircle, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";

export default function GlobalCopilot() {
  const { 
    isOpen, toggleOpen, setOpen, sessions, activeSessionId, 
    createSession, setActiveSession, deleteSession, addMessage, updateMessage 
  } = useCopilotStore();

  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    let sessionId = activeSessionId;
    if (!sessionId || !activeSession) {
      sessionId = createSession();
    }

    const userMessageId = crypto.randomUUID();
    addMessage(sessionId, {
      id: userMessageId,
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    });

    const currentInput = input.trim();
    setInput("");
    setIsGenerating(true);

    const assistantMessageId = crypto.randomUUID();
    addMessage(sessionId, {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now()
    });

    // Create a new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const history = sessions.find(s => s.id === sessionId)?.messages || [];
      const payloadHistory = history.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/v1/copilot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput, history: payloadHistory }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        throw new Error(res.status === 404 ? "Copilot endpoint not found on backend. Sync Hugging Face." : "Failed to fetch response.");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      let streamedMetadata: ChatMessage['metadata'] = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              break;
            }
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.type === "chunk") {
                streamedContent += data.text;
                updateMessage(sessionId, assistantMessageId, streamedContent, streamedMetadata);
              } else if (data.type === "metadata") {
                streamedMetadata = {
                  tools_used: data.tools_used,
                  uncertainty: data.uncertainty,
                  provenance: data.provenance
                };
                updateMessage(sessionId, assistantMessageId, streamedContent, streamedMetadata);
              }
            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
         updateMessage(sessionId, assistantMessageId, sessions.find(s => s.id === sessionId)?.messages.find(m => m.id === assistantMessageId)?.content + " [Generation Stopped]");
      } else {
         updateMessage(sessionId, assistantMessageId, "Error: " + (err.message || "Failed to analyze data."));
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#0A2342] text-white rounded-full shadow-[0_4px_12px_rgba(10,35,66,0.3)] flex items-center justify-center hover:scale-105 transition-transform z-50 ring-2 ring-white"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[380px] sm:w-[450px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E2E6EB] flex overflow-hidden z-50 flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
      
      {/* Header */}
      <div className="bg-[#0A2342] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-white/10 rounded">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <div>
            <h3 className="font-display font-bold text-[15px]">KargoSetu Copilot</h3>
            <p className="text-[11px] opacity-80 font-mono tracking-wide uppercase">AI Decision Engine</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={`absolute top-0 left-0 h-full w-[200px] bg-[#FAF7F1] border-r border-[#E2E6EB] transition-transform duration-300 z-10 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-3">
            <button 
              onClick={() => {
                createSession();
                if (window.innerWidth < 640) setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E6EB] rounded-lg text-sm font-semibold text-[#0A2342] hover:bg-gray-50"
            >
              <Plus size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
            {sessions.map(s => (
              <div 
                key={s.id} 
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-[13px] ${activeSessionId === s.id ? "bg-[#E2E6EB] font-medium" : "hover:bg-white"}`}
                onClick={() => {
                  setActiveSession(s.id);
                  if (window.innerWidth < 640) setSidebarOpen(false);
                }}
              >
                <span className="truncate w-full text-[#3D4F68]">{s.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex flex-col flex-1 bg-white h-full transition-all duration-300 ${sidebarOpen ? "ml-[200px] pointer-events-none sm:pointer-events-auto opacity-50 sm:opacity-100" : ""}`}>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60 px-6">
                <Bot size={40} className="mb-3 text-[#D95D0F]" />
                <p className="font-semibold text-[#0A2342]">How can I help you?</p>
                <p className="text-[13px] mt-1 text-[#3D4F68]">Ask about live freight forecasts, vessel feasibility, or port risks.</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === 'user' 
                      ? 'bg-[#0A2342] text-white rounded-br-none' 
                      : 'bg-white border border-[#E2E6EB] text-[#0A2342] shadow-sm rounded-bl-none'
                  }`}>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1.5 opacity-60">
                        <Bot size={14} />
                        <span className="font-mono text-[10px] uppercase tracking-wider">Copilot</span>
                      </div>
                    )}
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</div>
                    
                    {/* Metadata display */}
                    {m.metadata && m.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-black/5 flex flex-col gap-1 text-[11px] font-mono opacity-75">
                        {m.metadata.tools_used && m.metadata.tools_used.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="font-bold">Tools:</span> 
                            {m.metadata.tools_used.map(t => (
                              <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">{t}</span>
                            ))}
                          </div>
                        )}
                        {m.metadata.uncertainty && (
                          <div><span className="font-bold">Uncertainty:</span> {m.metadata.uncertainty}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#E2E6EB]">
            {isGenerating && (
               <div className="flex justify-center mb-2">
                 <button 
                   onClick={stopGeneration}
                   className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                 >
                   <StopCircle size={14} /> Stop Generating
                 </button>
               </div>
            )}
            <div className="flex items-end gap-2 bg-[#FAF7F1] p-1.5 rounded-xl border border-[#E2E6EB] focus-within:border-[#D95D0F] focus-within:ring-1 focus-within:ring-[#D95D0F]/30 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Copilot..."
                className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-[14px] p-2"
                rows={1}
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="p-2.5 bg-[#D95D0F] text-white rounded-lg hover:bg-[#B45309] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 m-0.5"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
