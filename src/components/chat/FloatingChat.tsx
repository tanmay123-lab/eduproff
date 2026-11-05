import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  Bot,
  User as UserIcon,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { processSafarMessage, ChatMessage, SupportedLanguage } from "@/services/safarAiEngine";

const QUICK_PROMPTS = [
  { labelEn: "🔍 Verify Certificate", labelHi: "🔍 सर्टिफिकेट जांचें", query: "How to verify certificate?" },
  { labelEn: "🛡️ Trust Score Explained", labelHi: "🛡️ ट्रस्ट स्कोर क्या है?", query: "What is trust score?" },
  { labelEn: "🎓 Student & CV Guide", labelHi: "🎓 छात्र और CV गाइड", query: "How can candidates upload and generate CV?" },
  { labelEn: "🏢 Recruiter Search", labelHi: "🏢 रिक्रूटर पोर्टल", query: "How do recruiters verify candidates?" },
];

export function FloatingChat() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<SupportedLanguage>("en");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "bot",
          text: lang === "hi"
            ? "नमस्ते! मैं 'सफर' हूँ — आपका EduProof AI सहायक 🌟\n\nमैं प्रमाणपत्र सत्यापन, ट्रस्ट स्कोर, या छात्र/रिक्रूटर पोर्टल में आपकी सहायता के लिए तैयार हूँ।\n\nआप किसी भी सर्टिफिकेट आईडी को सीधे यहाँ लिखकर भी सत्यापित कर सकते हैं!"
            : "Hello! I am Safar — your EduProof AI Assistant 🌟\n\nI am here to guide you through credential verification, real-time trust scoring, and our student/recruiter portals.\n\nYou can also paste any Certificate ID directly here to check its authenticity!",
          action: {
            label: lang === "hi" ? "सत्यापन पोर्टल पर जाएं" : "Go to Verification Portal",
            to: "/check"
          },
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  }, [isOpen, lang, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await processSafarMessage(text, lang);
      const botMessage: ChatMessage = {
        id: "bot-" + (Date.now() + 1),
        sender: "bot",
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "bot-err-" + Date.now(),
          sender: "bot",
          text: lang === "hi"
            ? "क्षमा करें, संदेश प्रोसेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।"
            : "I'm having a brief connection issue. Please try again or visit our verification portal.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-card text-card-foreground text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-elevated border border-primary/20 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Ask Safar AI</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Safar AI Assistant"
            className="group relative p-4 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-elevated hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/30 flex items-center justify-center"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-6" />
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 absolute -top-1.5 -right-1.5 animate-pulse" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[85vh] bg-card text-card-foreground rounded-2xl shadow-elevated flex flex-col z-50 border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-800" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm tracking-tight">Safar</h3>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-medium">AI Guide</span>
                </div>
                <p className="text-[11px] text-white/80">EduProof Credential Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <div className="flex items-center bg-black/20 p-0.5 rounded-lg border border-white/10 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2 py-0.5 rounded transition-all ${lang === "en" ? "bg-white text-emerald-800 shadow-xs" : "text-white/80 hover:text-white"
                    }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  className={`px-2 py-0.5 rounded transition-all ${lang === "hi" ? "bg-white text-emerald-800 shadow-xs" : "text-white/80 hover:text-white"
                    }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Reset History */}
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart Chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="bg-secondary/40 border-b border-border/60 px-3 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border text-[11px] font-medium transition-all duration-150 flex-shrink-0"
              >
                {lang === "hi" ? chip.labelHi : chip.labelEn}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-line ${msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-br-xs font-medium"
                        : "bg-card border border-border text-foreground rounded-bl-xs"
                      }`}
                  >
                    {msg.text}
                  </div>

                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.action!.to)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[11px] font-semibold transition-all duration-200"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  <span className="block text-[9px] text-muted-foreground px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border p-3 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[11px] ml-1 font-medium text-foreground">Safar is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-card border-t border-border flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                lang === "hi"
                  ? "सफर से पूछें या सर्टिफिकेट आईडी लिखें..."
                  : "Ask Safar or paste Certificate ID..."
              }
              disabled={isLoading}
              className="flex-1 bg-secondary/60 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send Message"
              className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}

