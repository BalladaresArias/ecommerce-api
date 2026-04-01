import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart, setIsOpen } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prodRes.data.products);
        setFiltered(prodRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = products;
    if (selectedCategory !== 'all')
      result = result.filter(p => p.category_id === parseInt(selectedCategory));
    if (search)
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [search, selectedCategory, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} agregado`);
    setIsOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '60px' }}>
          <p className="section-subtitle">Nuestro</p>
          <h1 className="section-title">Catálogo</h1>
          <div className="divider-gold" />
        </div>

        {/* Filtros */}
        <div style={{
          display: 'flex', gap: '16px',
          marginBottom: '48px', flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={14} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 40px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '13px', outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Categorías */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              style={{
                padding: '10px 20px', fontSize: '11px',
                letterSpacing: '1px', border: '1px solid',
                borderColor: selectedCategory === 'all' ? 'var(--gold)' : 'var(--border)',
                background: selectedCategory === 'all' ? 'var(--gold)' : 'transparent',
                color: selectedCategory === 'all' ? '#0a0a0a' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.3s',
              }}>
              Todos
            </button>
            {categories.map(cat => (
              <button key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                style={{
                  padding: '10px 20px', fontSize: '11px',
                  letterSpacing: '1px', border: '1px solid',
                  borderColor: selectedCategory === String(cat.id) ? 'var(--gold)' : 'var(--border)',
                  background: selectedCategory === String(cat.id) ? 'var(--gold)' : 'transparent',
                  color: selectedCategory === String(cat.id) ? '#0a0a0a' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '32px', letterSpacing: '1px' }}>
          {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
            <ShoppingBag size={40} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ letterSpacing: '2px', fontSize: '12px' }}>CARGANDO...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No se encontraron productos</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((product, i) => (
              <div key={product.id} className="card" onClick={() => navigate(`/products/${product.id}`)} style={{
                overflow: 'hidden',
                cursor: 'pointer',
                animation: 'fadeInUp 0.5s ease forwards',
                animationDelay: `${i * 0.05}s`,
                opacity: 0,
              }}>
                {/* Imagen */}
                <div style={{
                  height: '240px', background: 'var(--bg-primary)',
                  overflow: 'hidden', position: 'relative',
                }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-display)', fontSize: '56px',
                    }}>✦</div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: '#c0392b', color: '#fff',
                      padding: '4px 10px', fontSize: '10px', fontWeight: '700',
                    }}>ÚLTIMAS UNIDADES</div>
                  )}
                  {product.stock === 0 && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: 'var(--text-muted)', letterSpacing: '3px', fontSize: '12px' }}>AGOTADO</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '20px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '2px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    {product.category_name || 'General'}
                  </p>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px', fontWeight: '400', marginBottom: '8px',
                  }}>{product.name}</h3>
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '12px',
                    lineHeight: '1.6', marginBottom: '20px',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{product.description}</p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '26px', color: 'var(--gold)',
                      }}>${Number(product.price).toFixed(2)}</span>
                      <p style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        Stock: {product.stock}
                      </p>
                    </div>
                    <button
                      className="btn-gold"
                      style={{ padding: '10px 20px', fontSize: '10px' }}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? 'Agotado' : 'Agregar'}
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

export default ProductsPage;