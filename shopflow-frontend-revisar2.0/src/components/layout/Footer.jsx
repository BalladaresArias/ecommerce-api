import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      padding: '60px 0 30px',
      marginTop: '100px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '48px',
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px', fontWeight: '400',
              marginBottom: '16px',
            }}>
              Shop<span style={{ color: 'var(--gold)' }}>Flow</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.8' }}>
              Experiencia de compra premium. Calidad y elegancia en cada producto.
            </p>
          </div>

          {/* Links */}
          <div>
            <p style={{
              fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--gold)',
              marginBottom: '20px',
            }}>Navegación</p>
            {[['/', 'Inicio'], ['/products', 'Productos'], ['/login', 'Mi cuenta']].map(([path, label]) => (
              <Link key={path} to={path} style={{
                display: 'block', color: 'var(--text-secondary)',
                fontSize: '12px', marginBottom: '10px',
                transition: 'color 0.3s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{label}</Link>
            ))}
          </div>

          {/* Contacto */}
          <div>
            <p style={{
              fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--gold)',
              marginBottom: '20px',
            }}>Contacto</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '2' }}>
              contacto@shopflow.com<br />
              +57 300 000 0000<br />
              Colombia
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            © 2024 ShopFlow. Todos los derechos reservados.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
            Construido con <span style={{ color: 'var(--gold)' }}>Node.js + React</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;