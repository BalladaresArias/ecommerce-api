import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, exportOrders } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, ShoppingBag, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

const PERIODS = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
];

const statusLabels = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const statusColors = {
  pendiente: '#c9a84c',
  pagado: '#2ed573',
  enviado: '#1e90ff',
  entregado: '#7bed9f',
  cancelado: '#e74c3c',
};

const chartDefaults = {
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#5a5248', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#5a5248', font: { size: 11 } } },
  },
  maintainAspectRatio: false,
};

const AnalyticsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('/'); return; }
  }, [user]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getAnalytics(period);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [period]);

  if (loading || !data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO ANALYTICS...</p>
    </div>
  );

  const { summary, sales_by_day, top_products, orders_by_status, top_categories, coupon_stats } = data;

  const salesChartData = {
    labels: sales_by_day.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Ingresos',
        data: sales_by_day.map(d => Number(d.revenue)),
        borderColor: '#c9a84c',
        backgroundColor: 'rgba(201,168,76,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#c9a84c',
        pointRadius: 3,
      },
    ],
  };

  const ordersChartData = {
    labels: sales_by_day.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Órdenes',
        data: sales_by_day.map(d => Number(d.orders)),
        backgroundColor: 'rgba(201,168,76,0.6)',
        borderRadius: 4,
      },
    ],
  };

  const statusChartData = {
    labels: orders_by_status.map(s => statusLabels[s.status] || s.status),
    datasets: [{
      data: orders_by_status.map(s => s.count),
      backgroundColor: orders_by_status.map(s => statusColors[s.status] || '#888'),
      borderWidth: 0,
    }],
  };

  const handleExport = async () => {
    try {
        const res = await exportOrders(period);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = `ordenes-${period}dias.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        toast.error('Error al exportar');
    }
  };

  const statCard = (icon, label, value, sub, color = 'var(--gold)') => (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ color }}>{icon}</div>
        <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</p>
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color, marginBottom: '4px' }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p className="section-subtitle">Panel de</p>
            <h1 className="section-title">Analytics</h1>
            <div className="divider-gold" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)}
                style={{
                  padding: '8px 20px', fontSize: '11px', letterSpacing: '1px', border: '1px solid',
                  borderColor: period === p.value ? 'var(--gold)' : 'var(--border)',
                  background: period === p.value ? 'var(--gold)' : 'transparent',
                  color: period === p.value ? '#0a0a0a' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {/* Exportar CSV/Excel */}
        <button onClick={handleExport}
            style={{
                padding: '8px 20px', fontSize: '11px', letterSpacing: '1px',
                border: '1px solid var(--gold)',
                background: 'transparent',
                color: 'var(--gold)',
                cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            ↓ EXPORTAR CSV
        </button>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {statCard(<TrendingUp size={20} />, 'Ingresos brutos', `$${Number(summary.revenue).toLocaleString('es-CO')}`, `Neto: $${Number(summary.net_revenue).toLocaleString('es-CO')}`)}
          {statCard(<ShoppingBag size={20} />, 'Total órdenes', summary.total_orders, `Últimos ${period} días`)}
          {statCard(<Users size={20} />, 'Nuevos usuarios', summary.new_users, `Últimos ${period} días`)}
          {statCard(<RefreshCw size={20} />, 'Reembolsado', `$${Number(summary.refunded).toLocaleString('es-CO')}`, 'Órdenes canceladas', '#e74c3c')}
        </div>

        {/* Gráficas principales */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>INGRESOS POR DÍA</p>
            <div style={{ height: '220px' }}>
              {sales_by_day.length > 0
                ? <Line data={salesChartData} options={chartDefaults} />
                : <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', paddingTop: '80px' }}>Sin datos en este período</p>
              }
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>ÓRDENES POR DÍA</p>
            <div style={{ height: '220px' }}>
              {sales_by_day.length > 0
                ? <Bar data={ordersChartData} options={chartDefaults} />
                : <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', paddingTop: '80px' }}>Sin datos en este período</p>
              }
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '24px' }}>
          {/* Top productos */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>PRODUCTOS MÁS VENDIDOS</p>
            {top_products.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin ventas en este período</p>
              : top_products.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: i < top_products.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--text-muted)', minWidth: '24px' }}>
                    {i + 1}
                  </span>
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', marginBottom: '2px' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.total_sold} unidades vendidas</p>
                  </div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--gold)' }}>
                    ${Number(p.revenue).toLocaleString('es-CO')}
                  </p>
                </div>
              ))
            }
          </div>

          {/* Estado de órdenes */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>ESTADO DE ÓRDENES</p>
            {orders_by_status.length > 0 ? (
              <>
                <div style={{ height: '160px', marginBottom: '16px' }}>
                  <Doughnut data={statusChartData} options={{ ...chartDefaults, scales: undefined, plugins: { legend: { display: false } }, cutout: '65%' }} />
                </div>
                {orders_by_status.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[s.status] || '#888' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{statusLabels[s.status] || s.status}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{s.count}</span>
                  </div>
                ))}
              </>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin datos</p>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Top categorías */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>CATEGORÍAS MÁS VENDIDAS</p>
            {top_categories.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin ventas en este período</p>
              : top_categories.map((cat, i) => {
                const maxRevenue = Math.max(...top_categories.map(c => Number(c.revenue)));
                const pct = maxRevenue > 0 ? (Number(cat.revenue) / maxRevenue) * 100 : 0;
                return (
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px' }}>{cat.category}</span>
                      <span style={{ fontSize: '12px', color: 'var(--gold)' }}>${Number(cat.revenue).toLocaleString('es-CO')}</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })
            }
          </div>

          {/* Cupones usados */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--gold)', marginBottom: '20px' }}>CUPONES MÁS USADOS</p>
            {coupon_stats.filter(c => c.times_used > 0).length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin cupones usados en este período</p>
              : coupon_stats.filter(c => c.times_used > 0).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < coupon_stats.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: '600', letterSpacing: '1px' }}>{c.code}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`} · {c.times_used} usos
                    </p>
                  </div>
                  <p style={{ fontSize: '13px', color: '#e74c3c' }}>-${Number(c.total_discount || 0).toFixed(2)}</p>
                </div>
              ))
            }
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;