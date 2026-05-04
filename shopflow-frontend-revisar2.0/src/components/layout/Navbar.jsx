import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Shield, TrendingUp, Heart, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '70px'
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#0a0a0a', fontWeight: '700', fontSize: '14px' }}>S</span>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '22px',
            fontWeight: '600', letterSpacing: '2px',
          }}>
            Shop<span style={{ color: 'var(--gold)' }}>Flow</span>
          </span>
        </Link>

        {/* Links centro */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="nav-links">
          {['/', '/products'].map((path, i) => (
            <Link key={path} to={path} style={{
              fontSize: '11px', letterSpacing: '2px',
              textTransform: 'uppercase', color: 'var(--text-secondary)',
              transition: 'color 0.3s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              {i === 0 ? 'Inicio' : 'Productos'}
            </Link>
          ))}

          {/* Links solo para clientes logueados */}
          {user && !isAdmin() && (
            <>
              <Link to="/wishlist" style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-secondary)', transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Heart size={12} /> Favoritos
              </Link>
              <Link to="/points" style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--text-secondary)', transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <Star size={12} /> Puntos
              </Link>
            </>
          )}

          {/* Links solo para admin */}
          {isAdmin() && (
            <>
              <Link to="/admin" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--gold)',
              }}>
                <Shield size={12} /> Admin
              </Link>
              <Link to="/analytics" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--gold)',
              }}>
                <TrendingUp size={12} /> Analytics
              </Link>
              {/* Admin también puede ver el resumen de puntos y wishlist del sistema */}
              <Link to="/admin/loyalty" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--gold)',
              }}>
                <Star size={12} /> Fidelización
              </Link>
            </>
          )}
        </div>

        {/* Acciones derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {/* Carrito */}
          <button onClick={() => setIsOpen(true)} style={{
            background: 'none', border: 'none',
            color: 'var(--text-secondary)', position: 'relative',
            padding: '8px', transition: 'color 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: 'var(--gold)', color: '#0a0a0a',
                width: '16px', height: '16px', borderRadius: '50%',
                fontSize: '9px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{totalItems}</span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link to="/orders" style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', letterSpacing: '1px',
                color: 'var(--text-secondary)',
              }}>
                <User size={16} />
                {/* Fix: fallback si name es undefined */}
                <span>{user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuario'}</span>
              </Link>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid var(--border)',
                color: 'var(--text-muted)', padding: '6px 12px',
                fontSize: '10px', letterSpacing: '1px',
                transition: 'all 0.3s', cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--gold)';
                  e.currentTarget.style.color = 'var(--gold)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login"><button className="btn-outline" style={{ padding: '8px 20px' }}>Entrar</button></Link>
              <Link to="/register"><button className="btn-gold" style={{ padding: '8px 20px' }}>Registro</button></Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;