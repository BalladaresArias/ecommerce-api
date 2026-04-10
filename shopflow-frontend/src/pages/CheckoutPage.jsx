import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CheckCircle, Tag, X } from 'lucide-react';
import { createOrder, validateCoupon } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const finalTotal = appliedCoupon
    ? Math.max(0, totalPrice - Number(appliedCoupon.discount))
    : totalPrice;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon({ code: couponCode, order_total: totalPrice });
      setAppliedCoupon(res.data);
      toast.success(`Cupón aplicado — ahorras $${Number(res.data.discount).toFixed(2)}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cupón inválido');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleOrder = async () => {
    if (!user) return navigate('/login');
    if (cartItems.length === 0) return toast.error('Tu carrito está vacío');
    setLoading(true);
    try {
      const items = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const res = await createOrder({
        items,
        coupon_code: appliedCoupon?.code || null,
      });
      clearCart();
      navigate('/payment', {
        state: {
          order_id: res.data.order_id,
          total: res.data.total,
          discount: res.data.discount,
          original_total: res.data.original_total,
        }
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar la orden');
    } finally {
      setLoading(false);
    }
  };

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
                  background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '12px',
                }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--bg-primary)', border: '1px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-muted)' }}>✦</div>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '400', marginBottom: '4px' }}>{item.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Cantidad: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)' }}>${(item.price * item.quantity).toFixed(2)}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>${Number(item.price).toFixed(2)} c/u</p>
                  </div>
                </div>
              ))}

              {/* Cupón */}
              <div style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', marginTop: '8px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={12} /> CUPÓN DE DESCUENTO
                </p>
                {appliedCoupon ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border-gold)' }}>
                    <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: '600' }}>
                      {appliedCoupon.code} — {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% OFF` : `$${appliedCoupon.value} OFF`}
                    </span>
                    <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="SHOPFLOW10"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      style={{
                        flex: 1, padding: '10px 14px',
                        background: 'var(--bg-primary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
                        letterSpacing: '1px',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                    <button
                      className="btn-outline"
                      style={{ padding: '10px 20px', fontSize: '11px' }}
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '28px', height: 'fit-content' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '400', marginBottom: '24px' }}>Resumen</h3>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.name} x{item.quantity}</span>
                    <span style={{ fontSize: '12px' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', color: '#2ed573' }}>
                  <span style={{ fontSize: '12px' }}>Descuento ({appliedCoupon.code})</span>
                  <span style={{ fontSize: '12px' }}>-${Number(appliedCoupon.discount).toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-gold)', paddingTop: '16px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  {appliedCoupon && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: '2px' }}>
                      ${totalPrice.toFixed(2)}
                    </p>
                  )}
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--gold)' }}>
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="btn-gold" style={{ width: '100%', padding: '14px' }} onClick={handleOrder} disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>

              <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
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