import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { addToCart, setIsOpen } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await getWishlist();
      setItems(res.data.wishlist);
    } catch {
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (productId, name) => {
    try {
      await removeFromWishlist(productId);
      setItems(prev => prev.filter(i => i.product_id !== productId));
      toast.success(`${name} eliminado de favoritos`);
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.product_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      stock: item.stock,
    });
    toast.success(`${item.name} agregado al carrito`);
    setIsOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Heart size={20} color="var(--gold)" fill="var(--gold)" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '300' }}>
              Mis Favoritos
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO...</p>
          </div>
        ) : items.length === 0 ? (
          /* Estado vacío */
          <div style={{
            textAlign: 'center', padding: '100px 0',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}>
            <Heart size={48} color="var(--border)" style={{ marginBottom: '24px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '300', marginBottom: '12px' }}>
              No tienes favoritos aún
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
              Guarda los productos que te interesen para encontrarlos fácilmente
            </p>
            <button className="btn-gold" style={{ padding: '14px 32px', fontSize: '11px' }}
              onClick={() => navigate('/products')}>
              Explorar productos
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'border-color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Imagen */}
                <div style={{ aspectRatio: '1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => navigate(`/products/${item.product_id}`)}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--text-muted)',
                    }}>✦</div>
                  )}
                  {item.stock === 0 && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: '#fff', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}>
                        AGOTADO
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px', lineHeight: '1.4' }}>
                    {item.name}
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--gold)', marginBottom: '16px' }}>
                    ${Number(item.price).toFixed(2)}
                  </p>

                  {/* Botones */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-gold"
                      style={{ flex: 1, padding: '10px 8px', fontSize: '11px' }}
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}>
                      <ShoppingBag size={12} style={{ marginRight: '6px' }} />
                      {item.stock === 0 ? 'Agotado' : 'Al carrito'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.product_id, item.name)}
                      style={{
                        padding: '10px 12px',
                        background: 'none',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        color: '#e74c3c',
                        transition: 'all 0.3s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;