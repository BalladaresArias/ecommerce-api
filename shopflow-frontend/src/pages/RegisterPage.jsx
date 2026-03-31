import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm)
      return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 6)
      return toast.error('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      const { loginUser } = await import('../services/api');
      const res = await loginUser({ email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success(`Bienvenido, ${res.data.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrarse');
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

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '400' }}>
            Shop<span style={{ color: 'var(--gold)' }}>Flow</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '3px', marginTop: '8px' }}>
            CREA TU CUENTA
          </p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '40px',
        }}>
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'tu@email.com' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block', fontSize: '10px',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  color: 'var(--text-muted)', marginBottom: '8px',
                }}>{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  required
                />
              </div>
            ))}

            {/* Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '8px',
              }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Confirmar */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-muted)', marginBottom: '8px',
              }}>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: '28px', paddingTop: '24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--gold)' }}>Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;