import React, { useState, useRef, useEffect } from "react";
import { chatWithAnalyst } from "../services/api";

function AnalystChat({ currentResult }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const companyName = currentResult?.analysis?.company;

  // Initialize welcome message when a new company is loaded
  useEffect(() => {
    if (companyName) {
      setMessages([
        {
          role: "assistant",
          content: `Hello! I am your Senior Investment Analyst. I've finished reviewing ${companyName}'s financial reports and news sentiment. Ask me anything about their metrics, competitor profile, or risk stance!`,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [companyName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!currentResult) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Map the messages state to match the backend history parameter format
      const history = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithAnalyst(
        userMessage.content,
        history,
        companyName,
        currentResult.marketData,
        currentResult.latestNews,
        currentResult.analysis
      );

      if (response.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an issue analyzing that question. Let me know if you want to try again." },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to AI Analyst. Please check your connection." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <button 
        className="chat-floating-btn animate-fade-in-up" 
        onClick={() => setIsOpen(!isOpen)}
        title="Ask AI Analyst follow-up questions"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-title">
              <span>🤖</span>
              <div>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-heading)' }}>AI Investment Analyst</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Context: {companyName}</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-message ${msg.role === "user" ? "user" : "analyst"}`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="chat-message analyst" style={{ display: 'flex', gap: '4px' }}>
                <span className="dot-pulse">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${companyName || 'this stock'}...`}
              disabled={loading}
            />
            <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
              ✈️
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default AnalystChat;
