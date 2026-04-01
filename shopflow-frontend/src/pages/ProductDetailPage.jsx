import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, Shield, Truck, Package } from 'lucide-react';
import { getProduct } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data.product);
      } catch (err) {
        toast.error('Producto no encontrado');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
    setIsOpen(true);
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO...</p>
    </div>
  );

  if (!product) return null;

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Breadcrumb */}
        <button onClick={() => navigate('/products')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'none', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: '12px', letterSpacing: '1px',
          marginBottom: '48px', transition: 'color 0.3s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={14} /> Volver a productos
        </button>

        {/* Contenido principal */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'start',
        }}>

          {/* Imagen */}
          <div>
            <div style={{
              aspectRatio: '1',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              overflow: 'hidden', position: 'relative',
            }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '80px',
                  color: 'var(--text-muted)',
                }}>✦</div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  background: '#c0392b', color: '#fff',
                  padding: '6px 14px', fontSize: '11px', fontWeight: '700',
                }}>ÚLTIMAS UNIDADES</div>
              )}
            </div>

            {/* Garantías */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '12px', marginTop: '16px',
            }}>
              {[
                { icon: <Shield size={14} />, text: 'Compra segura' },
                { icon: <Truck size={14} />, text: 'Envío express' },
                { icon: <Package size={14} />, text: '30 días devolución' },
                { icon: <Star size={14} />, text: 'Calidad premium' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  fontSize: '11px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ color: 'var(--gold)' }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p style={{
              fontSize: '10px', letterSpacing: '3px',
              textTransform: 'uppercase', color: 'var(--gold)',
              marginBottom: '12px',
            }}>{product.category_name || 'General'}</p>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px', fontWeight: '300',
              lineHeight: '1.1', marginBottom: '24px',
            }}>{product.name}</h1>

            {/* Precio */}
            <div style={{
              padding: '24px 0',
              borderTop: '1px solid var(--border)',
              borderBottom: '1px solid var(--border)',
              marginBottom: '32px',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '48px', color: 'var(--gold)',
              }}>${Number(product.price).toFixed(2)}</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                IVA incluido
              </p>
            </div>

            {/* Descripción */}
            {product.description && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{
                  fontSize: '10px', letterSpacing: '2px',
                  color: 'var(--text-muted)', marginBottom: '12px',
                }}>DESCRIPCIÓN</p>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.8', fontSize: '14px',
                }}>{product.description}</p>
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{
                fontSize: '10px', letterSpacing: '2px',
                color: 'var(--text-muted)', marginBottom: '8px',
              }}>DISPONIBILIDAD</p>
              <p style={{
                color: product.stock > 0 ? '#2ed573' : '#e74c3c',
                fontSize: '13px', fontWeight: '500',
              }}>
                {product.stock > 0 ? `✓ En stock (${product.stock} unidades)` : '✗ Agotado'}
              </p>
            </div>

            {/* Cantidad */}
            {product.stock > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  fontSize: '10px', letterSpacing: '2px',
                  color: 'var(--text-muted)', marginBottom: '12px',
                }}>CANTIDAD</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '40px', height: '40px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '18px', cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >−</button>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '24px', minWidth: '32px', textAlign: 'center',
                  }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    style={{
                      width: '40px', height: '40px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      fontSize: '18px', cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >+</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Subtotal:{' '}
                    <span style={{ color: 'var(--gold)' }}>
                      ${(product.price * quantity).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-gold"
                style={{ flex: 1, padding: '16px', fontSize: '12px' }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingBag size={14} style={{ marginRight: '8px' }} />
                {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
              </button>
              <button
                className="btn-outline"
                style={{ flex: 1, padding: '16px', fontSize: '12px' }}
                onClick={() => {
                  handleAddToCart();
                  setTimeout(() => navigate('/checkout'), 300);
                }}
                disabled={product.stock === 0}
              >
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;