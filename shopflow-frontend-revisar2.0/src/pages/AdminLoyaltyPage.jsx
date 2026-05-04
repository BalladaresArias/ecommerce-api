import { useState, useEffect } from 'react';
import { Star, Heart, MessageSquare, TrendingUp, Users } from 'lucide-react';
import api from '../services/api';

// Llamadas directas a la API (admin)
const getTopWishlisted  = () => api.get('/wishlist/admin/top');
const getAllReviews      = (params) => api.get('/reviews/admin/all', { params });
const getTopPoints      = () => api.get('/points/admin/top');

const AdminLoyaltyPage = () => {
  const [tab, setTab] = useState('puntos');
  const [pointsData, setPointsData]   = useState([]);
  const [wishlistData, setWishlistData] = useState([]);
  const [reviewsData, setReviewsData]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p, w, r] = await Promise.all([
        getTopPoints(),
        getTopWishlisted(),
        getAllReviews({ limit: 50 }),
      ]);
      setPointsData(p.data.users   || []);
      setWishlistData(w.data.products || []);
      setReviewsData(r.data.reviews   || []);
    } catch (err) {
      console.error('Error cargando datos de fidelización:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    padding: '10px 24px',
    fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
    background: active ? 'var(--gold)' : 'none',
    color: active ? '#0a0a0a' : 'var(--text-muted)',
    border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
    cursor: 'pointer', transition: 'all 0.3s',
  });

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '300', marginBottom: '8px' }}>
            Fidelización
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Resumen de puntos, favoritos y reseñas de tus clientes
          </p>
        </div>

        {/* Tarjetas resumen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          {[
            { icon: <Star size={20} />, label: 'Clientes con puntos', value: pointsData.length },
            { icon: <Heart size={20} />, label: 'Productos en wishlists', value: wishlistData.length },
            { icon: <MessageSquare size={20} />, label: 'Reseñas totales', value: reviewsData.length },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              padding: '28px', display: 'flex', alignItems: 'center', gap: '20px',
            }}>
              <div style={{
                width: '48px', height: '48px', background: 'rgba(212,175,55,0.1)',
                border: '1px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', flexShrink: 0,
              }}>{icon}</div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', lineHeight: '1' }}>{value}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
          {[
            { key: 'puntos',    label: 'Puntos',    icon: <Star size={12} /> },
            { key: 'favoritos', label: 'Favoritos', icon: <Heart size={12} /> },
            { key: 'resenas',   label: 'Reseñas',   icon: <MessageSquare size={12} /> },
          ].map(({ key, label, icon }) => (
            <button key={key} style={tabStyle(tab === key)} onClick={() => setTab(key)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {icon} {label}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO...</p>
          </div>
        ) : (
          <>
            {/* Tab: Puntos */}
            {tab === 'puntos' && (
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  CLIENTES CON MÁS PUNTOS
                </p>
                {pointsData.length === 0 ? (
                  <EmptyState text="Ningún cliente tiene puntos aún. Los puntos se acumulan al marcar órdenes como entregadas." />
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['#', 'Cliente', 'Email', 'Puntos', 'Valor COP'].map(h => (
                          <th key={h} style={{
                            padding: '12px 16px', textAlign: 'left',
                            fontSize: '10px', letterSpacing: '2px',
                            color: 'var(--text-muted)', fontWeight: '400',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pointsData.map((u, i) => (
                        <tr key={u.user_id} style={{
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.2s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>{i + 1}</td>
                          <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '13px' }}>{u.name}</td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{u.email}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--gold)',
                            }}>{u.total}</span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            ${(u.total * 100).toLocaleString('es-CO')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab: Favoritos */}
            {tab === 'favoritos' && (
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  PRODUCTOS MÁS GUARDADOS EN FAVORITOS
                </p>
                {wishlistData.length === 0 ? (
                  <EmptyState text="Ningún cliente ha guardado favoritos aún." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {wishlistData.map((p, i) => (
                      <div key={p.product_id} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        padding: '20px', display: 'flex', gap: '16px', alignItems: 'center',
                      }}>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: '28px',
                          color: i < 3 ? 'var(--gold)' : 'var(--text-muted)',
                          minWidth: '32px',
                        }}>#{i + 1}</span>
                        <div>
                          <p style={{ fontWeight: '500', fontSize: '13px', marginBottom: '4px' }}>{p.name}</p>
                          <p style={{ color: 'var(--gold)', fontSize: '12px' }}>
                            ❤️ {p.total} guardado{p.total !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reseñas */}
            {tab === 'resenas' && (
              <div>
                <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  ÚLTIMAS RESEÑAS DE CLIENTES
                </p>
                {reviewsData.length === 0 ? (
                  <EmptyState text="No hay reseñas aún. Aparecen cuando un cliente con orden entregada califica un producto." />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviewsData.map(r => (
                      <div key={r.id} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        padding: '20px 24px',
                        display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                        gap: '16px', alignItems: 'center',
                      }}>
                        <div>
                          <p style={{ fontWeight: '500', fontSize: '13px', marginBottom: '2px' }}>{r.user_name}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{r.product_name}</p>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                          {r.comment || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin comentario</span>}
                        </p>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                            {[1,2,3,4,5].map(n => (
                              <Star key={n} size={14}
                                fill={n <= r.rating ? 'var(--gold)' : 'none'}
                                color={n <= r.rating ? 'var(--gold)' : 'var(--border)'}
                              />
                            ))}
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(r.created_at).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div style={{
    padding: '60px', textAlign: 'center',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
  }}>
    <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '400px', margin: '0 auto', lineHeight: '1.7' }}>
      {text}
    </p>
  </div>
);

export default AdminLoyaltyPage;
