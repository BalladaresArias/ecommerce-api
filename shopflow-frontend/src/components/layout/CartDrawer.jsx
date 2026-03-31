import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const { cartItems, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para comprar');
      setIsOpen(false);
      navigate('/login');
      return;
    }
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1998,
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '420px', maxWidth: '100vw',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border)',
        zIndex: 1999,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShoppingBag size={20} color="var(--gold)" />
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '20px',
            }}>
              Tu Carrito
            </span>
            {totalItems > 0 && (
              <span style={{
                background: 'var(--gold)', color: '#0a0a0a',
                padding: '2px 8px', fontSize: '11px', fontWeight: '700',
              }}>{totalItems}</span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} style={{
            background: 'none', border: 'none',
            color: 'var(--text-secondary)', padding: '4px',
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '300px', gap: '16px',
            }}>
              <ShoppingBag size={48} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '1px' }}>
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} style={{
                display: 'flex', gap: '16px',
                padding: '16px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                {/* Imagen */}
                <div style={{
                  width: '70px', height: '70px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ShoppingBag size={20} color="var(--text-muted)" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', marginBottom: '4px' }}>{item.name}</p>
                  <p style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '600' }}>
                    ${Number(item.price).toFixed(2)}
                  </p>

                  {/* Cantidad */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '12px', marginTop: '10px',
                  }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', width: '26px', height: '26px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '13px', minWidth: '20px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', width: '26px', height: '26px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)}
                      style={{
                        background: 'none', border: 'none',
                        color: 'var(--text-muted)', marginLeft: 'auto',
                        transition: 'color 0.3s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '1px' }}>
                TOTAL
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px', color: 'var(--gold)',
              }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button className="btn-gold" style={{ width: '100%', padding: '14px' }}
              onClick={handleCheckout}>
              Proceder al Pago
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;