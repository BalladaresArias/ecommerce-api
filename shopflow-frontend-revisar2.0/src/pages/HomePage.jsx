import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, RefreshCw } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodRes.data.products.slice(0, 4));
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
    setIsOpen(true);
  };

  return (
    <div>
      {/* HERO */}
      <section style={{
        minHeight: '92vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #111108 50%, #0a0a0a 100%)',
      }}>
        {/* Fondo decorativo */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0', left: '0',
          width: '100%', height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '680px' }}>
            <p className="section-subtitle" style={{ marginBottom: '24px' }}>
              ✦ Nueva Colección 2024
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(52px, 8vw, 96px)',
              fontWeight: '300', lineHeight: '1.05',
              letterSpacing: '-1px', marginBottom: '28px',
            }}>
              Compra con <br />
              <span style={{
                background: 'linear-gradient(135deg, var(--gold-dark), var(--gold), var(--gold-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Elegancia</span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)', fontSize: '15px',
              lineHeight: '1.8', marginBottom: '40px', maxWidth: '480px',
            }}>
              Descubre nuestra selección curada de productos premium. Calidad excepcional, experiencia de compra inigualable.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/products">
                <button className="btn-gold" style={{ padding: '16px 40px', fontSize: '12px' }}>
                  Explorar Catálogo
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-outline" style={{ padding: '16px 40px', fontSize: '12px' }}>
                  Crear Cuenta
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div style={{
              display: 'flex', gap: '48px', marginTop: '64px',
              paddingTop: '40px',
              borderTop: '1px solid var(--border)',
            }}>
              {[['500+', 'Productos'], ['10K+', 'Clientes'], ['98%', 'Satisfacción']].map(([num, label]) => (
                <div key={label}>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '32px', color: 'var(--gold)', fontWeight: '400',
                  }}>{num}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '2px' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Elemento decorativo derecha */}
        <div style={{
          position: 'absolute', right: '8%', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: '16px',
          opacity: 0.4,
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: i % 2 === 0 ? '40px' : '24px',
              height: '1px',
              background: 'var(--gold)',
              marginLeft: i % 2 === 0 ? '0' : '8px',
            }} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        padding: '80px 0',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
          }}>
            {[
              { icon: <Truck size={22} />, title: 'Envío Express', desc: 'Entrega en 24-48 horas' },
              { icon: <Shield size={22} />, title: 'Compra Segura', desc: 'Pago 100% protegido' },
              { icon: <RefreshCw size={22} />, title: 'Devoluciones', desc: '30 días sin preguntas' },
              { icon: <Star size={22} />, title: 'Premium Quality', desc: 'Productos seleccionados' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', gap: '20px', alignItems: 'flex-start',
              }}>
                <div style={{
                  color: 'var(--gold)', flexShrink: 0,
                  marginTop: '2px',
                }}>{icon}</div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{title}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <p className="section-subtitle">Explorar por</p>
          <h2 className="section-title">Categorías</h2>
          <div className="divider-gold" />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px', marginTop: '40px',
          }}>
            {categories.map((cat, i) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`}>
                <div style={{
                  padding: '40px 24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative', overflow: 'hidden',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--border-gold)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-gold)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px',
                    background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                    margin: '0 auto 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {['⚡', '👗', '🏠', '💎'][i] || '✦'}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px', marginBottom: '8px',
                  }}>{cat.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section style={{
        padding: '100px 0',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
      }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <p className="section-subtitle">Lo mejor de</p>
              <h2 className="section-title">Productos Destacados</h2>
              <div className="divider-gold" />
            </div>
            <Link to="/products" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--gold)', fontSize: '11px', letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No hay productos aún</p>
              <Link to="/admin"><button className="btn-gold">Agregar productos</button></Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}>
              {products.map(product => (
                <div key={product.id} className="card" onClick={() => navigate(`/products/${product.id}`)} style={{ overflow: 'hidden' }}>
                  {/* Imagen */}
                  <div style={{
                    height: '220px', background: 'var(--bg-primary)',
                    cursor: 'pointer',
                    overflow: 'hidden', position: 'relative',
                  }}>
                    {product.image_url ? (
                      <img src={ product.image_url?.startsWith('/uploads') ? `http://localhost:3000${product.image_url}` : product.image_url} alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-display)', fontSize: '48px',
                      }}>✦</div>
                    )}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: 'var(--gold)', color: '#0a0a0a',
                      padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                    }}>
                      NUEVO
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px' }}>
                      {product.category_name || 'GENERAL'}
                    </p>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '20px', fontWeight: '400', marginBottom: '12px',
                    }}>{product.name}</h3>
                    <p style={{
                      color: 'var(--text-secondary)', fontSize: '12px',
                      lineHeight: '1.6', marginBottom: '16px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>{product.description}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '24px', color: 'var(--gold)',
                      }}>${Number(product.price).toFixed(2)}</span>
                      <button className="btn-gold" style={{ padding: '8px 20px', fontSize: '10px' }}
                        onClick={() => handleAddToCart(product)}>
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        padding: '120px 0', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.05) 0%, transparent 70%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          <p className="section-subtitle">Únete hoy</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: '300', marginBottom: '20px',
          }}>
            Empieza tu experiencia <br />
            <span style={{ color: 'var(--gold)' }}>ShopFlow</span>
          </h2>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '14px',
            marginBottom: '40px', maxWidth: '400px', margin: '0 auto 40px',
          }}>
            Regístrate gratis y accede a productos exclusivos, ofertas y más.
          </p>
          <Link to="/register">
            <button className="btn-gold" style={{ padding: '18px 48px', fontSize: '12px' }}>
              Crear Cuenta Gratis
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;