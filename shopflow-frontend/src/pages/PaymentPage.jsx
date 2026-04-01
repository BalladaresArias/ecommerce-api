import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Lock } from 'lucide-react';
import { createTransaction } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '', name: '', expiry: '', cvv: '', installments: '1'
  });

  const orderId = location.state?.order_id;
  const total = location.state?.total;

  useEffect(() => {
    if (!orderId) navigate('/');
    // Cargar script de Wompi
    const script = document.createElement('script');
    script.src = 'https://js.wompi.co/v1/';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.Wompi) return toast.error('Error al cargar Wompi');

    setLoading(true);
    try {
      const cardNumber = cardData.number.replace(/\s/g, '');
      const [expMonth, expYear] = cardData.expiry.split('/');

      // Tokenizar tarjeta con Wompi
      const tokenRes = await fetch('https://sandbox.wompi.co/v1/tokens/cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_WOMPI_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: cardNumber,
          cvc: cardData.cvv,
          exp_month: expMonth,
          exp_year: `20${expYear}`,
          card_holder: cardData.name,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.data?.id)
        throw new Error(tokenData.error?.reason || 'Error al tokenizar tarjeta');

      // Procesar pago en tu backend
      const res = await createTransaction({
        order_id: orderId,
        token: tokenData.data.id,
        card_holder: cardData.name,
        installments: parseInt(cardData.installments),
      });

      if (res.data.status === 'APPROVED') {
        toast.success('¡Pago aprobado!');
        navigate('/orders');
      } else {
        toast.error('Pago declinado, intenta de nuevo');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Error al procesar pago');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none',
    transition: 'border-color 0.3s',
  };

  return (
    <div style={{
      minHeight: '100vh', padding: '60px 0',
      background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 60%)',
    }}>
      <div className="container" style={{ maxWidth: '520px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock size={24} color="#0a0a0a" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '400' }}>
            Pago Seguro
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '8px' }}>
            Procesado por <span style={{ color: 'var(--gold)' }}>Wompi</span> — PCI DSS Certificado
          </p>
        </div>

        {/* Total */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-gold)',
          padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '24px',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '2px' }}>
            TOTAL A PAGAR
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px', color: 'var(--gold)',
          }}>${Number(total).toFixed(2)}</span>
        </div>

        {/* Formulario */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '32px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '24px',
          }}>
            <CreditCard size={16} color="var(--gold)" />
            <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'var(--text-muted)' }}>
              DATOS DE TARJETA
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '10px', letterSpacing: '2px',
                color: 'var(--text-muted)', marginBottom: '6px',
              }}>NÚMERO DE TARJETA</label>
              <input
                type="text" placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={e => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                style={inputStyle} maxLength={19} required
                onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '10px', letterSpacing: '2px',
                color: 'var(--text-muted)', marginBottom: '6px',
              }}>NOMBRE EN LA TARJETA</label>
              <input
                type="text" placeholder="JUAN PEREZ"
                value={cardData.name}
                onChange={e => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                style={inputStyle} required
                onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '10px', letterSpacing: '2px',
                  color: 'var(--text-muted)', marginBottom: '6px',
                }}>VENCIMIENTO</label>
                <input
                  type="text" placeholder="MM/AA"
                  value={cardData.expiry}
                  onChange={e => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  style={inputStyle} maxLength={5} required
                  onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '10px', letterSpacing: '2px',
                  color: 'var(--text-muted)', marginBottom: '6px',
                }}>CVV</label>
                <input
                  type="password" placeholder="•••"
                  value={cardData.cvv}
                  onChange={e => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  style={inputStyle} maxLength={4} required
                  onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '10px', letterSpacing: '2px',
                color: 'var(--text-muted)', marginBottom: '6px',
              }}>CUOTAS</label>
              <select
                value={cardData.installments}
                onChange={e => setCardData({ ...cardData, installments: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {[1, 3, 6, 12, 24].map(n => (
                  <option key={n} value={n}>
                    {n === 1 ? 'Pago de contado' : `${n} cuotas`}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', padding: '16px', fontSize: '12px' }}
              disabled={loading}
            >
              {loading ? 'Procesando...' : `Pagar $${Number(total).toFixed(2)}`}
            </button>
          </form>

          {/* Seguridad */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', marginTop: '20px',
            color: 'var(--text-muted)', fontSize: '11px',
          }}>
            <Shield size={12} />
            <span>Tus datos están protegidos con encriptación SSL</span>
          </div>
        </div>

        {/* Aviso sandbox */}
        <div style={{
          marginTop: '20px', padding: '16px',
          border: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.03)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            🧪 Modo prueba — Tarjeta test:{' '}
            <span style={{ color: 'var(--gold)' }}>4242 4242 4242 4242</span>
            {' '}· CVV: <span style={{ color: 'var(--gold)' }}>123</span>
            {' '}· Venc: <span style={{ color: 'var(--gold)' }}>12/29</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;