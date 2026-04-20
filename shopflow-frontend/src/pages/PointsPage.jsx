import { useState, useEffect } from 'react';
import { Star, TrendingUp, Gift, Clock } from 'lucide-react';
import { getMyPoints, getPointsHistory, redeemPoints } from '../services/api';
import toast from 'react-hot-toast';

const PointsPage = () => {
  const [points, setPoints] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [toRedeem, setToRedeem] = useState('');

  const fetchData = async () => {
    try {
      const [pointsRes, historyRes] = await Promise.all([
        getMyPoints(),
        getPointsHistory(),
      ]);
      setPoints(pointsRes.data);
      setHistory(historyRes.data.history);
    } catch {
      toast.error('Error al cargar puntos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRedeem = async () => {
    const amount = parseInt(toRedeem);
    if (!amount || amount <= 0) return toast.error('Ingresa una cantidad válida');
    if (amount > points.points) return toast.error('No tienes suficientes puntos');
    setRedeeming(true);
    try {
      const res = await redeemPoints(amount);
      toast.success(`¡Canjeaste ${amount} puntos! Descuento: $${res.data.discount_applied.toLocaleString('es-CO')}`);
      setToRedeem('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al canjear');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Star size={20} color="var(--gold)" fill="var(--gold)" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '300' }}>
              Mis Puntos
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Programa de fidelización ShopFlow
          </p>
        </div>

        {/* Tarjeta principal de puntos */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(212,175,55,0.08) 100%)',
          border: '1px solid var(--gold)',
          padding: '40px',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              TUS PUNTOS DISPONIBLES
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '72px', color: 'var(--gold)', lineHeight: '1' }}>
              {points?.points || 0}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
              Equivale a{' '}
              <span style={{ color: 'var(--gold)', fontWeight: '600' }}>
                ${(points?.value_in_pesos || 0).toLocaleString('es-CO')} COP
              </span>
              {' '}de descuento
            </p>
          </div>

          {/* Canjear */}
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              CANJEAR PUNTOS
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="number"
                value={toRedeem}
                onChange={e => setToRedeem(e.target.value)}
                placeholder="Cantidad"
                min="1"
                max={points?.points || 0}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <button className="btn-gold"
                style={{ padding: '10px 20px', fontSize: '11px', whiteSpace: 'nowrap' }}
                onClick={handleRedeem}
                disabled={redeeming || !points?.points}>
                {redeeming ? '...' : 'Canjear'}
              </button>
            </div>
            {toRedeem && parseInt(toRedeem) > 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                = ${(parseInt(toRedeem) * 100).toLocaleString('es-CO')} COP de descuento
              </p>
            )}
          </div>
        </div>

        {/* Cómo funciona */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px', marginBottom: '48px',
        }}>
          {[
            { icon: <ShoppingBag />, title: 'Compra', desc: 'Gana 1 punto por cada $10.000 COP en tus órdenes entregadas' },
            { icon: <TrendingUp />, title: 'Acumula', desc: 'Tus puntos se suman automáticamente al recibir tu pedido' },
            { icon: <Gift />, title: 'Canjea', desc: 'Cada punto vale $100 COP de descuento en tu próxima compra' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              padding: '24px', background: 'var(--bg-card)',
              border: '1px solid var(--border)', textAlign: 'center',
            }}>
              <div style={{ color: 'var(--gold)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                {icon}
              </div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px' }}>{title}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6' }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Historial */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Clock size={16} color="var(--text-muted)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '300' }}>
              Historial de movimientos
            </h2>
          </div>

          {history.length === 0 ? (
            <div style={{
              padding: '48px', textAlign: 'center',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Aún no tienes movimientos. ¡Completa tu primera compra para ganar puntos!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.map(h => (
                <div key={h.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 20px', background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{h.description}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    color: h.delta > 0 ? '#2ed573' : '#e74c3c',
                    fontWeight: '600',
                  }}>
                    {h.delta > 0 ? '+' : ''}{h.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Ícono que faltaba en el import
const ShoppingBag = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

export default PointsPage;