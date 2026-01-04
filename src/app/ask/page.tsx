'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useLanguage';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';

export default function AskPage() {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          language: lang,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      return lang === 'bn'
        ? 'দুঃখিত, উত্তর দিতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।'
        : 'Sorry, there was an error. Please try again.';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(input.trim());
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 hover:bg-slate-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">{t.chat.title}</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{t.chat.title}</h2>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              {lang === 'bn'
                ? 'চট্টগ্রামের যেকোনো এলাকা সম্পর্কে জিজ্ঞাসা করুন'
                : 'Ask about any area in Chittagong'}
            </p>

            {/* Suggestions */}
            <div className="space-y-2 w-full max-w-sm">
              {t.chat.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-left text-sm text-slate-300 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] px-4 py-3 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-br-md'
                      : 'bg-slate-800 text-slate-200 rounded-bl-md'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      // Simple markdown-like bold parsing
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="font-semibold">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="text-sm text-slate-400">{t.chat.thinking}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-4">
        <div className="max-w-lg mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.chat.placeholder}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-colors active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
