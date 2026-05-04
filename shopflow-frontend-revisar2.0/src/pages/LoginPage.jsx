import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      toast.success(`Bienvenido, ${res.data.user.name}`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al iniciar sesión');
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
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '400' }}>
            Shop<span style={{ color: 'var(--gold)' }}>Flow</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '3px', marginTop: '8px' }}>
            ACCEDE A TU CUENTA
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '40px',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '8px',
              }}>Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                required
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '8px',
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: '28px', paddingTop: '24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--gold)' }}>Regístrate</Link>
            </p>
          </div>
        </div>

        {/* Hint admin */}
        <div style={{
          marginTop: '24px', padding: '16px',
          border: '1px solid var(--border)',
          background: 'rgba(201,168,76,0.03)',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Admin demo: <span style={{ color: 'var(--gold)' }}>admin@ecommerce.com</span> / <span style={{ color: 'var(--gold)' }}>password</span>
            Cliente demo: <span style={{ color: 'var(--gold)' }}>prueba@gmail.com</span> / <span style={{ color: 'var(--gold)' }}>13142131u</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;