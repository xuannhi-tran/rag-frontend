import React, { useRef, useEffect } from 'react';
import { 
  Send, 
  Menu, 
  Trash2, 
  Sparkles, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import ChatMessage from './ChatMessage';

export default function ChatArea({
  messages,
  question,
  setQuestion,
  onSend,
  loading,
  onClearChat,
  onToggleSidebar,
  documentCount
}) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const starterPrompts = [
    {
      title: "Summarize Document",
      desc: "Provide a comprehensive summary of key points and objectives",
      prompt: "Can you provide a comprehensive summary of the uploaded document?"
    },
    {
      title: "Key Findings & Data",
      desc: "Extract all significant findings, statistics, or metrics",
      prompt: "What are the most important findings and key data points mentioned?"
    },
    {
      title: "Action Items & Next Steps",
      desc: "List recommendations, actionable conclusions, or next steps",
      prompt: "What action items, conclusions, or recommendations are outlined?"
    }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Auto adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [question]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (question.trim() && !loading) {
        onSend();
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>RAG Pipeline</span>
            </div>
            <span className="text-xs text-slate-400">
              {documentCount > 0 ? (
                <span className="text-emerald-400 font-medium">● {documentCount} Document{documentCount > 1 ? 's' : ''} Ready</span>
              ) : (
                <span className="text-amber-400/90 font-medium">○ No documents active</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-xl shadow-sky-500/10 mb-6">
              <Sparkles className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 font-display">
              How can I assist you today?
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-10 leading-relaxed">
              Upload your documents in the sidebar and ask questions. I retrieve relevant context to give precise, grounded answers.
            </p>

            {/* Starter Prompt Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              {starterPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(item.prompt);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-900 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                      {item.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[12px] text-slate-400 leading-normal">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto divide-y divide-slate-800/30">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="py-5 px-4 md:px-6 flex gap-4 bg-slate-900/60 border-y border-slate-800/40">
                <div className="shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold tracking-wide text-slate-300 block mb-2">
                    RAG Assistant
                  </span>
                  <div className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    <span className="text-xs text-slate-400 ml-2">Searching knowledge base & generating answer...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Form Section */}
      <div className="p-4 md:p-5 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim() && !loading) onSend();
            }}
            className="relative flex items-end gap-2 bg-slate-900 border border-slate-700/80 focus-within:border-sky-500/80 focus-within:ring-2 focus-within:ring-sky-500/20 rounded-2xl p-2 shadow-lg transition-all"
          >
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your uploaded documents..."
              rows={1}
              className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-slate-100 text-sm placeholder:text-slate-500 resize-none px-3 py-2 max-h-44 min-h-[42px]"
            />

            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="shrink-0 p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Enter ↵</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">Shift + Enter</kbd> for new line</span>
            <span>RAG Grounded Responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

