'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Languages, 
  AlertTriangle, 
  Bot, 
  User, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Apple,
  Syringe
} from 'lucide-react';
import { useLanguage } from '@/components/common/LanguageContext';
import { aiAdvisorApi } from '@/lib/api';
import { farmStore } from '@/lib/store';
import { AIMessage } from '@/lib/types';

const INITIAL_MESSAGES_EN: AIMessage[] = [
  {
    id: 'm1',
    sender: 'assistant',
    content: `Namaste Rajesh Ji! 🙏 Welcome to **DairyMitra AI Advisor**.

I am your dedicated dairy farming specialist, trained on ICAR-NDRI livestock nutrition protocols, tropical cattle health, and modern dairy farm management.

How can I help you optimize your dairy farm operations today?`,
    timestamp: 'Just now',
    category: 'general',
  },
];

const INITIAL_MESSAGES_HI: AIMessage[] = [
  {
    id: 'm1_hi',
    sender: 'assistant',
    content: `नमस्ते राजेश जी! 🙏 **डेयरीमित्र AI सलाहकार** में आपका स्वागत है।

मैं आपका समर्पित पशुपालन एवं डेयरी विशेषज्ञ हूँ। मैं संतुलित आहार (TMR), दूध उत्पादन में वृद्धि, टीकाकरण और मौसमी बीमारियों से बचाव में आपकी सहायता कर सकता हूँ।

आज आपके गोकुल डेयरी फार्म के लिए मैं क्या जानकारी प्रदान करूँ?`,
    timestamp: 'अभी',
    category: 'general',
  },
];

const PROMPTS_EN = [
  "How to increase milk yield in Murrah buffaloes?",
  "What is the balanced daily ration for a 15L Gir cow?",
  "Signs and first aid for early stage Mastitis",
  "Annual vaccination schedule for FMD and HS",
  "How to improve butterfat percentage in cow milk?",
];

const PROMPTS_HI = [
  "मुर्रा भैंस का दूध और फैट (वसा) कैसे बढ़ाएं?",
  "15 लीटर दूध देने वाली गिर गाय का संतुलित आहार क्या होना चाहिए?",
  "थनैला रोग के शुरुआती लक्षण और प्राथमिक उपचार क्या हैं?",
  "पशुओं के लिए खुरपका-मुंहपका (FMD) और गलघोंटू का टीका कब लगवाएं?",
  "गाय के दूध में फैट (Fat %) और SNF बढ़ाने के घरेलू उपाय?",
];

export default function AIAdvisorPage() {
  const { language, setLanguage, t } = useLanguage();
  const [messages, setMessages] = useState<AIMessage[]>(
    language === 'hi' ? INITIAL_MESSAGES_HI : INITIAL_MESSAGES_EN
  );
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // When language switches, reload initial greeting if only 1 message
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages(language === 'hi' ? INITIAL_MESSAGES_HI : INITIAL_MESSAGES_EN);
    }
  }, [language]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const res = await aiAdvisorApi.ask(query, language);
      const assistantMsg: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: AIMessage = {
        id: `e-${Date.now()}`,
        sender: 'assistant',
        content: language === 'hi'
          ? "क्षमा करें, अनुरोध संसाधित करने में समस्या आई। कृपया पुनः प्रयास करें।"
          : "Sorry, I encountered an issue processing your query. Please try again.",
        timestamp: 'Now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentPrompts = language === 'hi' ? PROMPTS_HI : PROMPTS_EN;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] space-y-4">
      {/* Top Header & Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.aiTitle}</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{t.aiSubtitle}</p>
        </div>

        {/* Language selector toggle */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          <button
            onClick={() => setLanguage('en')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
              language === 'en' ? 'bg-forest text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
              language === 'hi' ? 'bg-forest text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      {/* Strict Veterinary Disclaimer Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 shrink-0">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Veterinary Caution:</strong> {t.disclaimer}
        </p>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest text-white shadow-xs mt-0.5">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-forest text-white shadow-xs rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                <div className={`text-[10px] ${isUser ? 'text-white/70 text-right' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isThinking && (
          <div className="flex gap-3 max-w-md items-center text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-forest text-white">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <span>{t.thinking}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Carousel / Strip */}
      <div className="space-y-1.5 shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          {t.suggestedQuestions}:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {currentPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-forest hover:bg-emerald-50 hover:text-forest transition-colors shadow-2xs font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Bar */}
      <div className="relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.askAnything}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-4 pr-24 text-xs text-slate-800 placeholder-slate-400 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest shadow-xs"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isThinking}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-xl bg-forest px-4 py-1.5 text-xs font-semibold text-white hover:bg-forest/90 disabled:opacity-50 transition-colors shadow-xs"
        >
          <span>{t.send}</span>
          <Send className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
