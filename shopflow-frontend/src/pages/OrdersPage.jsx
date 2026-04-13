import { useState, useEffect } from 'react';
import { Package, Clock, FileText } from 'lucide-react';
import { getMyOrders } from '../services/api';
import { getInvoiceUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  pendiente: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold)', label: 'Pendiente' },
  pagado: { bg: 'rgba(46,213,115,0.1)', color: '#2ed573', label: 'Pagado' },
  enviado: { bg: 'rgba(30,144,255,0.1)', color: '#1e90ff', label: 'Enviado' },
  entregado: { bg: 'rgba(46,213,115,0.15)', color: '#2ed573', label: 'Entregado' },
  cancelado: { bg: 'rgba(231,76,60,0.1)', color: '#e74c3c', label: 'Cancelado' },
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate('/login');
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleDownloadInvoice = (orderId) => {
    const token = localStorage.getItem('token');
    const url = getInvoiceUrl(orderId);
    // Abre en nueva pestaña — el usuario puede imprimir o guardar como PDF desde el navegador
    const win = window.open('', '_blank');
    win.document.write(`
      <script>
        fetch('${url}', { headers: { 'Authorization': 'Bearer ${token}' } })
          .then(r => r.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
            setTimeout(() => window.print(), 800);
          });
      </script>
    `);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <p className="section-subtitle">Historial de</p>
        <h1 className="section-title">Mis Órdenes</h1>
        <div className="divider-gold" style={{ marginBottom: '48px' }} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            Cargando órdenes...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Package size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>No tienes órdenes aún</p>
            <button className="btn-gold" onClick={() => navigate('/products')}>Explorar Productos</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const status = statusColors[order.status] || statusColors.pendiente;
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              return (
                <div key={order.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  padding: '24px', transition: 'border-color 0.3s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-gold)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Package size={16} color="var(--gold)" />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Orden #{order.id}</span>
                      <span style={{ padding: '3px 10px', fontSize: '10px', letterSpacing: '1px', fontWeight: '600', background: status.bg, color: status.color }}>
                        {status.label.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span style={{ fontSize: '11px' }}>
                          {new Date(order.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      {/* Botón factura */}
                      {['pagado', 'enviado', 'entregado'].includes(order.status) && (
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', fontSize: '10px', letterSpacing: '1px',
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.3s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                          <FileText size={12} /> FACTURA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
                    {items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{item.product_name} × {item.quantity}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>${(item.unit_price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '2px' }}>TOTAL </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', marginLeft: '12px' }}>
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.status === 'enviado' && order.shipping_tracking && (
                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(30,144,255,0.05)', border: '1px solid rgba(30,144,255,0.2)' }}>
                      <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#1e90ff', marginBottom: '10px' }}>INFORMACIÓN DE ENVÍO</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px' }}>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>TRANSPORTADORA</p>
                          <p style={{ fontSize: '13px', fontWeight: '500' }}>{order.shipping_company}</p>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>NÚMERO DE TRACKING</p>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#1e90ff', fontFamily: 'monospace' }}>{order.shipping_tracking}</p>
                        </div>
                        {order.shipping_estimated && (
                          <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>ENTREGA ESTIMADA</p>
                            <p style={{ fontSize: '13px' }}>
                              {new Date(order.shipping_estimated + 'T12:00:00').toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        )}
                        {order.shipping_notes && (
                          <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '10px', marginBottom: '2px' }}>NOTAS</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.shipping_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;