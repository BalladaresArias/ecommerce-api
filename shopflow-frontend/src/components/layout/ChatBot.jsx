import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ShoppingBag, Minimize2, Bot } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const TypingIndicator = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', background: '#1e1e1e', border: '1px solid #2a2420', borderRadius: '2px 12px 12px 12px', width: 'fit-content' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c',
        animation: 'bounce 1.2s infinite', animationDelay: `${i * 0.2}s`,
      }} />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
  </div>
);

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente de ShopFlow. Puedo ayudarte a encontrar productos, agregar cosas al carrito y responder tus preguntas. ¿En qué te ayudo hoy?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { cartItems, addToCart, setIsOpen: openCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          cartItems: cartItems.map(i => ({ name: i.name, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      // Agregar productos al carrito si el bot lo indica
      if (data.addToCart?.length > 0) {
        data.addToCart.forEach(product => {
          addToCart(product);
        });
        openCart(true);
      }

      const botMessage = { role: 'assistant', content: data.message };
      setMessages(prev => [...prev, botMessage]);

      if (!isOpen) setUnread(prev => prev + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ups, tuve un problema de conexión. ¿Puedes intentarlo de nuevo?',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickReplies = [
    '¿Qué productos tienen?',
    'Busco un regalo',
    '¿Cuál es el más vendido?',
    'Ver ofertas',
  ];

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9a84c, #a07830)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            zIndex: 9999, transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={24} color="#0a0a0a" />
          {unread > 0 && (
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              background: '#e74c3c', color: '#fff',
              borderRadius: '50%', width: '20px', height: '20px',
              fontSize: '11px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{unread}</div>
          )}
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '360px',
          height: isMinimized ? 'auto' : '520px',
          background: '#111111',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '12px',
          display: 'flex', flexDirection: 'column',
          zIndex: 9999,
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #1a1500, #161616)',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9a84c, #a07830)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={18} color="#0a0a0a" />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#f0ead6' }}>Asistente ShopFlow</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ed573' }} />
                  <p style={{ fontSize: '10px', color: '#5a5248', letterSpacing: '1px' }}>EN LÍNEA</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setIsMinimized(!isMinimized)}
                style={{ background: 'none', border: 'none', color: '#5a5248', cursor: 'pointer', padding: '4px' }}>
                <Minimize2 size={15} />
              </button>
              <button onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#5a5248', cursor: 'pointer', padding: '4px' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Mensajes */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '12px',
                scrollbarWidth: 'thin', scrollbarColor: '#2a2420 transparent',
              }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end', gap: '8px',
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #c9a84c, #a07830)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Bot size={13} color="#0a0a0a" />
                      </div>
                    )}
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #c9a84c, #a07830)' : '#1e1e1e',
                      color: msg.role === 'user' ? '#0a0a0a' : '#f0ead6',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
                      fontSize: '13px', lineHeight: '1.5',
                      border: msg.role === 'assistant' ? '1px solid #2a2420' : 'none',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #c9a84c, #a07830)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Bot size={13} color="#0a0a0a" />
                    </div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies — solo al inicio */}
              {messages.length === 1 && (
                <div style={{
                  padding: '0 16px 12px',
                  display: 'flex', flexWrap: 'wrap', gap: '6px',
                }}>
                  {quickReplies.map(q => (
                    <button key={q} onClick={() => { setInput(q); setTimeout(sendMessage, 0); }}
                      style={{
                        padding: '5px 10px', fontSize: '11px',
                        background: 'transparent', border: '1px solid rgba(201,168,76,0.3)',
                        color: '#c9a84c', borderRadius: '99px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #2a2420',
                display: 'flex', gap: '8px', alignItems: 'flex-end',
                flexShrink: 0,
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  rows={1}
                  style={{
                    flex: 1, padding: '10px 12px',
                    background: '#1e1e1e',
                    border: '1px solid #2a2420',
                    color: '#f0ead6', fontSize: '13px',
                    borderRadius: '8px', outline: 'none',
                    resize: 'none', fontFamily: 'Montserrat, sans-serif',
                    lineHeight: '1.4', maxHeight: '80px', overflowY: 'auto',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(201,168,76,0.4)'}
                  onBlur={e => e.target.style.borderColor = '#2a2420'}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  style={{
                    width: '38px', height: '38px', borderRadius: '8px', flexShrink: 0,
                    background: input.trim() && !loading ? 'linear-gradient(135deg, #c9a84c, #a07830)' : '#2a2420',
                    border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Send size={15} color={input.trim() && !loading ? '#0a0a0a' : '#5a5248'} />
                </button>
              </div>

              {/* Carrito rápido */}
              {cartItems.length > 0 && (
                <div
                  onClick={() => openCart(true)}
                  style={{
                    padding: '8px 16px', borderTop: '1px solid #2a2420',
                    background: 'rgba(201,168,76,0.05)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
                >
                  <ShoppingBag size={13} color="#c9a84c" />
                  <span style={{ fontSize: '11px', color: '#c9a84c', letterSpacing: '1px' }}>
                    {cartItems.length} producto{cartItems.length !== 1 ? 's' : ''} en el carrito — Ver carrito →
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;