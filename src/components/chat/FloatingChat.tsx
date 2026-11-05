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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 animate-float">
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-card text-card-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-primary/30 animate-in fade-in slide-in-from-right-6 duration-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-bold">Ask Safar AI ✨</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Safar AI Assistant"
            className="group relative p-4 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-[0_10px_30px_-5px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_35px_-5px_rgba(16,185,129,0.7)] hover:scale-115 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/40 flex items-center justify-center before:absolute before:-inset-1.5 before:rounded-full before:bg-emerald-500/25 before:animate-ping before:-z-10"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 transition-transform group-hover:rotate-12 duration-300" />
              <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-2 -right-2 animate-bounce [animation-duration:1.5s]" />
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-[400px] max-w-[calc(100vw-2rem)] h-[585px] max-h-[85vh] bg-card text-card-foreground rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col z-50 border border-primary/25 overflow-hidden animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-8 duration-300 ease-out backdrop-blur-sm">

          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 text-white px-5 py-4 flex items-center justify-between shadow-sm rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white animate-pulse [animation-duration:3s]" />
                <span className="absolute bottom-0 right-0 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border-2 border-emerald-900" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm tracking-tight">Safar</h3>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium shadow-xs">AI Guide</span>
                </div>
                <p className="text-[11px] text-white/80">EduProof Credential Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <div className="flex items-center bg-black/20 p-1 rounded-full border border-white/10 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-0.5 rounded-full transition-all duration-200 ${lang === "en" ? "bg-white text-emerald-800 shadow-xs scale-105 font-bold" : "text-white/80 hover:text-white"
                    }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  className={`px-2.5 py-0.5 rounded-full transition-all duration-200 ${lang === "hi" ? "bg-white text-emerald-800 shadow-xs scale-105 font-bold" : "text-white/80 hover:text-white"
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
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all hover:rotate-180 duration-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all hover:scale-110 duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs animate-in zoom-in-50 duration-200">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed shadow-sm whitespace-pre-line transition-all duration-200 ${msg.sender === "user"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm font-medium shadow-md"
                      : "bg-card border border-border/80 text-foreground rounded-bl-sm hover:border-primary/20"
                      }`}
                  >
                    {msg.text}
                  </div>

                  {msg.action && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(msg.action!.to)}
                      className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[11px] font-semibold hover:scale-105 active:scale-95 hover:shadow-sm transition-all duration-200"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{msg.action.label}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  )}

                  <span className="block text-[9px] text-muted-foreground px-2">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs animate-in zoom-in-50 duration-200">
                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-primary/20 p-3.5 rounded-3xl w-fit shadow-xs animate-in fade-in-0 duration-200">
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
                <span className="text-[11px] ml-1 font-semibold text-foreground">Safar is thinking...</span>
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
            className="p-3.5 bg-card/95 backdrop-blur-md border-t border-border flex items-center gap-2 rounded-b-3xl"
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
              className="flex-1 bg-secondary/60 border border-border rounded-full px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/25 focus:border-primary transition-all duration-200"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send Message"
              className="group p-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 hover:scale-110 active:scale-90 disabled:opacity-40 disabled:hover:scale-100 transition-all duration-200 flex-shrink-0 shadow-md"
            >
              <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}

