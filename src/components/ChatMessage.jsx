import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`py-5 px-4 md:px-6 flex gap-4 transition-colors ${
        isUser 
          ? 'bg-transparent' 
          : 'bg-slate-900/60 border-y border-slate-800/40'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/10">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold tracking-wide text-slate-300">
            {isUser ? 'You' : 'RAG Assistant'}
          </span>
          
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60 transition-all"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {isUser ? (
          <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed font-normal">
            {message.content}
          </p>
        ) : (
          <div className="text-sm prose-custom">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

