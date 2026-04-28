import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const starterMessage = {
  role: 'ai',
  text: 'Namaste. I am Krishi-Mitra. Ask me about crop prices, disease signs, MSP, or how ZK proofs protect your data.',
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/ai/chat', { prompt });
      setMessages((prev) => [...prev, { role: 'ai', text: data.text || 'I could not generate a reply just now.' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: error.response?.data?.error || 'Sorry, I could not connect to Krishi-Mitra right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = {
    width: 340,
    maxWidth: 'calc(100vw - 32px)',
    height: 480,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
    border: '1px solid rgba(148,163,184,0.35)',
    borderRadius: 22,
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.22)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(18px)',
  };

  const bubbleStyle = (role) => ({
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'rgba(226, 232, 240, 0.9)',
    color: role === 'user' ? '#fff' : '#0f172a',
    padding: '10px 12px',
    borderRadius: role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    maxWidth: '88%',
    fontSize: 14,
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
      {isOpen ? (
        <div style={panelStyle}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0f766e, #2563eb)',
              color: 'white',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>Krishi-Mitra AI</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Farm help, price guidance, and ZK explanations</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI assistant"
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                border: 'none',
                background: 'rgba(255,255,255,0.16)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} style={bubbleStyle(message.role)}>
                {message.text}
              </div>
            ))}
            {loading ? <div style={bubbleStyle('ai')}>Thinking...</div> : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ padding: 12, borderTop: '1px solid rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.92)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about crops or ZK proofs..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: '1px solid rgba(148,163,184,0.45)',
                  borderRadius: 14,
                  padding: '10px 12px',
                  outline: 'none',
                  fontSize: 14,
                  background: 'white',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: 'none',
                  borderRadius: 14,
                  padding: '10px 14px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #0f766e)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI assistant"
          style={{
            width: 60,
            height: 60,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            fontSize: 24,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #0f766e)',
            boxShadow: '0 16px 40px rgba(37,99,235,0.35)',
          }}
        >
          💬
        </button>
      ) : null}
    </div>
  );
}