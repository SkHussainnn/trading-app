import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, ArrowRight, ShieldAlert, TrendingUp } from "lucide-react";

const AICopilot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "👋 Welcome to Nexus AI Copilot! I am your real-time crypto trading intelligence assistant. Ask me about market sentiment, technical indicators (RSI, MACD), coin fundamentals, or order execution strategies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    "What is the market outlook for Bitcoin?",
    "How to manage risk with stop-losses?",
    "Explain RSI and MACD for trading",
    "How do limit orders differ from market orders?",
  ];

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("bitcoin") || lower.includes("btc")) {
        reply =
          "📊 **Bitcoin (BTC) Technical Telemetry**:\n- **Trend**: Macro bullish with consolidation above key moving averages.\n- **Key Support**: $65,200 | **Key Resistance**: $69,500.\n- **Sentiment**: High institutional accumulation through spot ETFs. Watch for volume confirmation upon breaking $70k.";
      } else if (lower.includes("risk") || lower.includes("stop-loss")) {
        reply =
          "🛡️ **Risk Management Rules for Traders**:\n1. Never risk more than 1-2% of total portfolio balance on a single trade.\n2. Always place a stop-loss order below the recent swing low.\n3. Keep a cash/stablecoin reserve (15-25%) in your wallet for dips.";
      } else if (lower.includes("rsi") || lower.includes("macd")) {
        reply =
          "📈 **Momentum Indicators Decoded**:\n- **RSI (Relative Strength Index)**: Above 70 suggests overbought (potential pullback); Below 30 suggests oversold (potential reversal).\n- **MACD**: When the MACD line crosses above the signal line, it signals an upward momentum trigger.";
      } else if (lower.includes("limit") || lower.includes("market order")) {
        reply =
          "⚡ **Order Types Explained**:\n- **Market Order**: Executes immediately at the best current available market price. Highest speed, but subject to spread/slippage.\n- **Limit Order**: Sets an exact price target. Executes only when market price reaches your specified price or better.";
      } else {
        reply =
          `🤖 **Nexus AI Analysis** on *"${textToSend}"*:\nBased on current market liquidity and high 24h trading volume across top cryptocurrencies, maintain diversified exposure across Layer-1 assets (BTC, ETH, SOL) while utilizing strict dollar-cost averaging (DCA).`;
      }

      setMessages((prev) => [...prev, { sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Copilot Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Nexus AI Copilot</h3>
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Trading Intel
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-cyan-950 border border-cyan-800 text-cyan-400"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`p-3 rounded-2xl text-xs max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                m.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-neutral-800/90 text-neutral-200 border border-neutral-700/60 rounded-tl-none font-sans"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 italic">
            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            Analyzing telemetry...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 border-t border-neutral-800/80 bg-neutral-950/40 overflow-x-auto no-scrollbar flex gap-2">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="shrink-0 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-lg border border-neutral-700/60 transition truncate max-w-[190px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Copilot anything..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-cyan-500 transition"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AICopilot;
