import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle } from 'lucide-react';
import { createOrder } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOrder = async () => {
    if (!user) return navigate('/login');
    if (cartItems.length === 0) return toast.error('Tu carrito está vacío');
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const res = await createOrder({ items });
      clearCart();
      // Redirigir a pagos con el order_id
      navigate('/payment', {
        state: {
          order_id: res.data.order_id,
          total: res.data.total,
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '24px', textAlign: 'center',
      padding: '40px',
    }}>
      <div style={{
        width: '80px', height: '80px',
        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CheckCircle size={40} color="#0a0a0a" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: '300' }}>
        ¡Orden Confirmada!
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '360px', lineHeight: '1.8' }}>
        Tu pedido ha sido procesado exitosamente. Puedes ver el estado en tu historial de órdenes.
      </p>
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
        <button className="btn-gold" onClick={() => navigate('/orders')}>
          Ver mis órdenes
        </button>
        <button className="btn-outline" onClick={() => navigate('/products')}>
          Seguir comprando
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <p className="section-subtitle">Finalizar</p>
        <h1 className="section-title">Tu Pedido</h1>
        <div className="divider-gold" style={{ marginBottom: '48px' }} />

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Tu carrito está vacío</p>
            <button className="btn-gold" style={{ marginTop: '24px' }} onClick={() => navigate('/products')}>
              Ver Productos
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>

            {/* Items */}
            <div>
              {cartItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: '16px', padding: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  marginBottom: '12px',
                }}>
                  <div style={{
                    width: '80px', height: '80px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-muted)',
                      }}>✦</div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '400', marginBottom: '4px' }}>
                      {item.name}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      ${Number(item.price).toFixed(2)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '28px',
              height: 'fit-content',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px', fontWeight: '400',
                marginBottom: '24px',
              }}>Resumen</h3>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {item.name} x{item.quantity}
                    </span>
                    <span style={{ fontSize: '12px' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-gold)',
                paddingTop: '16px', marginTop: '16px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '28px',
              }}>
                <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Total</span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px', color: 'var(--gold)',
                }}>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                className="btn-gold"
                style={{ width: '100%', padding: '14px' }}
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>

              <p style={{
                color: 'var(--text-muted)', fontSize: '11px',
                textAlign: 'center', marginTop: '16px',
              }}>
                Comprando como: <span style={{ color: 'var(--gold)' }}>{user?.name}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;