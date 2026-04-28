import { useEffect, useRef, useState } from 'react';
import API from '../services/api';

const starterMessage = {
  role: 'ai',
  text: 'Namaste. I am Krishi-Mitra. Ask me about crop prices, disease signs, MSP, or how ZK proofs protect your data.',
};

const quickPrompts = [
  'What is MSP?',
  'How does ZK protect farmer data?',
  'What disease signs should I check?',
];

const buildFallbackReply = (value = '') => {
  const text = value.toLowerCase();

  if (text.includes('zk') || text.includes('zero-knowledge') || text.includes('proof')) {
    return 'ZK proofs hide sensitive details while still proving the data is valid. In KrishiChain, this means auditors can verify harvest integrity without exposing private farmer information.';
  }

  if (text.includes('msp') || text.includes('minimum support price')) {
    return 'MSP is the minimum price promised by the government for selected crops. It protects farmers from selling below a fair floor price.';
  }

  if (text.includes('disease') || text.includes('pest') || text.includes('leaf')) {
    return 'Check for spots, curling, yellowing, or holes. Share crop name and symptoms, and I can suggest likely causes and safe next steps.';
  }

  if (text.includes('price') || text.includes('market')) {
    return 'Market price depends on crop type, quality, moisture, location, and demand. Share crop and grade for a better estimate.';
  }

  return 'I can help with crop prices, MSP, disease signs, and ZK privacy. Ask a short question and I will guide you.';
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [messages, setMessages] = useState([starterMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const openAssistant = () => {
    window.clearTimeout(closeTimerRef.current);
    setIsMounted(true);
    setIsOpen(true);
    setIsSettled(false);
    openTimerRef.current = window.setTimeout(() => setIsSettled(true), 120);
  };

  const closeAssistant = () => {
    window.clearTimeout(openTimerRef.current);
    setIsSettled(false);
    setIsOpen(false);
    closeTimerRef.current = window.setTimeout(() => setIsMounted(false), 180);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => () => {
    window.clearTimeout(openTimerRef.current);
    window.clearTimeout(closeTimerRef.current);
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await API.post('/ai/chat', { prompt });
      setMessages((prev) => [...prev, { role: 'ai', text: data.text || 'I could not generate a reply just now.' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: error.response?.data?.error || buildFallbackReply(prompt),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const panelStyle = {
    width: 334,
    maxWidth: 'calc(100vw - 32px)',
    height: 490,
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,250,248,0.96))',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: 24,
    boxShadow: '0 24px 58px rgba(15, 23, 42, 0.22)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(18px)',
    transform: isSettled ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.98)',
    opacity: isSettled ? 1 : 0,
    transition: 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
    pointerEvents: isSettled ? 'auto' : 'none',
  };

  const bubbleStyle = (role, delayMs = 0) => ({
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    background: role === 'user' ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(238, 242, 246, 0.96)',
    color: role === 'user' ? '#fff' : '#12212b',
    padding: '10px 11px',
    borderRadius: role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    maxWidth: '88%',
    fontSize: 13,
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    boxShadow: role === 'user' ? '0 10px 20px rgba(37, 99, 235, 0.16)' : '0 8px 16px rgba(15, 23, 42, 0.06)',
    transform: 'translateY(0)',
    animation: isSettled ? `assistant-message-in 300ms cubic-bezier(0.22, 1, 0.36, 1) ${delayMs}ms both` : 'none',
  });

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
      {isMounted ? (
        <div style={panelStyle}>
          <div
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #135e55 48%, #2563eb 100%)',
              color: 'white',
              padding: '12px 14px 13px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 13,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                  border: '1px solid rgba(255,255,255,0.18)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                  fontSize: 18,
                  boxShadow: '0 10px 18px rgba(15, 23, 42, 0.12)',
                  animation: isSettled ? 'assistant-farmer-float 2.4s ease-in-out infinite' : 'none',
                }}
              >
                👨‍🌾
              </div>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: '0.01em' }}>Krishi-Mitra AI</div>
                <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 4, maxWidth: 210 }}>
                  Fast crop guidance, MSP help, and simple ZK explanations.
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10.5, padding: '4px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
                    Online
                  </span>
                  <span style={{ fontSize: 10.5, padding: '4px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.16)' }}>
                    Private by design
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAssistant}
              aria-label="Close AI assistant"
              style={{
                width: 30,
                height: 30,
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

          <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, background: 'linear-gradient(180deg, rgba(246,250,248,0.98), rgba(250,252,249,0.9))' }}>
            <div style={{ display: 'grid', gap: 6, marginBottom: 2 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#627067', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Ask something quick
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    style={{
                      border: '1px solid rgba(148,163,184,0.3)',
                      background: 'rgba(255,255,255,0.88)',
                      color: '#21313a',
                      borderRadius: 999,
                      padding: '7px 9px',
                      fontSize: 12,
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px rgba(15, 23, 42, 0.05)',
                      animation: isSettled ? `assistant-chip-in 260ms cubic-bezier(0.22, 1, 0.36, 1) ${80 + index * 70}ms both` : 'none',
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} style={bubbleStyle(message.role, 120 + index * 70)}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 3 }}>
                  {message.role === 'user' ? 'You' : 'Krishi-Mitra'}
                </div>
                {message.text}
              </div>
            ))}
            {loading ? (
              <div style={{ ...bubbleStyle('ai'), display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d7d58', animation: 'assistant-pulse 1s ease-in-out infinite' }} />
                Thinking...
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ padding: 11, borderTop: '1px solid rgba(148,163,184,0.22)', background: 'rgba(255,255,255,0.96)' }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about crops or ZK proofs..."
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: '1px solid rgba(148,163,184,0.42)',
                  borderRadius: 14,
                  padding: '10px 12px',
                  outline: 'none',
                  fontSize: 13,
                  background: 'white',
                  boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  border: 'none',
                  borderRadius: 14,
                  padding: '10px 13px',
                  background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8, #0f766e)',
                  color: 'white',
                  fontWeight: 700,
                  cursor: loading ? 'default' : 'pointer',
                  boxShadow: loading ? 'none' : '0 12px 22px rgba(37, 99, 235, 0.2)',
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
          onClick={openAssistant}
          aria-label="Open AI assistant"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            fontSize: 24,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb, #0f766e)',
            boxShadow: '0 16px 40px rgba(37,99,235,0.35)',
            transition: 'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
          }}
        >
          <span style={{ display: 'grid', placeItems: 'center', lineHeight: 1 }}>
            <span style={{ display: 'block', fontSize: 22, animation: isSettled ? 'assistant-farmer-float 2.4s ease-in-out infinite' : 'none' }}>
              👨‍🌾
            </span>
          </span>
        </button>
      ) : null}
    </div>
  );
}