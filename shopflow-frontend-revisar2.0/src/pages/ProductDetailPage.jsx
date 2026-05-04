import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Star, Shield, Truck, Package, Heart } from 'lucide-react';
import { getProduct, getReviews, createReview, updateReview, deleteReview,
         addToWishlist, removeFromWishlist, checkWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast'; 

/* ── Estrellas ─────────────────────────────────────────── */
const Stars = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={20}
        fill={n <= value ? 'var(--gold)' : 'none'}
        color={n <= value ? 'var(--gold)' : 'var(--border)'}
        style={{ cursor: onChange ? 'pointer' : 'default', transition: 'all 0.2s' }}
        onClick={() => onChange && onChange(n)}
      />
    ))}
  </div>
);

/* ── Sección de reseñas ────────────────────────────────── */
const ReviewsSection = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await getReviews(productId);
      setReviews(res.data.reviews);
      setAvgRating(res.data.avg_rating);
      setTotal(res.data.total);
      // Detectar si el usuario ya tiene reseña
      if (user) {
        const mine = res.data.reviews.find(r => r.user_name === user.name);
        if (mine) { setMyReview(mine); setRating(mine.rating); setComment(mine.comment); }
      }
    } catch { /* silencio */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [productId]);

  const handleSubmit = async () => {
    if (!rating) return toast.error('Selecciona una calificación');
    try {
      if (myReview) {
        await updateReview(productId, { rating, comment });
        toast.success('Reseña actualizada');
      } else {
        await createReview(productId, { rating, comment });
        toast.success('Reseña publicada');
      }
      setEditing(false);
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar reseña');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(productId);
      setMyReview(null); setRating(5); setComment('');
      toast.success('Reseña eliminada');
      fetchReviews();
    } catch { toast.error('Error al eliminar reseña'); }
  };

  return (
    <div style={{ marginTop: '80px', paddingTop: '48px', borderTop: '1px solid var(--border)' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '300', marginBottom: '8px' }}>
            Reseñas
          </h2>
          {total > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Stars value={Math.round(avgRating)} />
              <span style={{ color: 'var(--gold)', fontSize: '20px', fontFamily: 'var(--font-display)' }}>{avgRating}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({total} reseña{total !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {/* Botón escribir reseña */}
        {user && !myReview && (
          <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '11px' }}
            onClick={() => setEditing(true)}>
            Escribir reseña
          </button>
        )}
      </div>

      {/* Formulario */}
      {user && (editing || myReview) && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          padding: '24px', marginBottom: '32px',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            {myReview && !editing ? 'TU RESEÑA' : 'CALIFICA ESTE PRODUCTO'}
          </p>

          {(!myReview || editing) ? (
            <>
              <div style={{ marginBottom: '16px' }}>
                <Stars value={rating} onChange={setRating} />
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Cuéntanos tu experiencia con este producto..."
                rows={4}
                style={{
                  width: '100%', background: 'var(--bg-primary)',
                  border: '1px solid var(--border)', color: 'var(--text-primary)',
                  padding: '12px', fontSize: '14px', resize: 'vertical',
                  fontFamily: 'inherit', marginBottom: '16px', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-gold" style={{ padding: '10px 24px', fontSize: '11px' }}
                  onClick={handleSubmit}>
                  {myReview ? 'Actualizar' : 'Publicar reseña'}
                </button>
                <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '11px' }}
                  onClick={() => { setEditing(false); if (myReview) { setRating(myReview.rating); setComment(myReview.comment); } }}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            /* Vista de mi reseña ya publicada */
            <>
              <Stars value={myReview.rating} />
              {myReview.comment && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '12px 0', lineHeight: '1.7' }}>
                  {myReview.comment}
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn-outline" style={{ padding: '8px 16px', fontSize: '11px' }}
                  onClick={() => setEditing(true)}>Editar</button>
                <button style={{
                  padding: '8px 16px', fontSize: '11px', background: 'none',
                  border: '1px solid #c0392b', color: '#c0392b', cursor: 'pointer',
                }}
                  onClick={handleDelete}>Eliminar</button>
              </div>
            </>
          )}
        </div>
      )}

      {!user && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
          <a href="/login" style={{ color: 'var(--gold)' }}>Inicia sesión</a> para dejar una reseña.
        </p>
      )}

      {/* Lista de reseñas */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cargando reseñas...</p>
      ) : reviews.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Aún no hay reseñas. ¡Sé el primero en opinar!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(r => (
            <div key={r.id} style={{
              padding: '20px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{r.user_name}</p>
                  <Stars value={r.rating} />
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                  {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {r.comment && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', marginTop: '8px' }}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Página principal ──────────────────────────────────── */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const { addToCart, setIsOpen } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProduct(id);
        setProduct(res.data.product);
      } catch {
        toast.error('Producto no encontrado');
        navigate('/products');
      } finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  // Verificar si está en wishlist al cargar
  useEffect(() => {
    if (!user || !id) return;
    checkWishlist(id)
      .then(res => setInWishlist(res.data.inWishlist))
      .catch(() => {});
  }, [user, id]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
    setIsOpen(true);
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Inicia sesión para guardar favoritos'); return; }
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
        setInWishlist(false);
        toast.success('Eliminado de favoritos');
      } else {
        await addToWishlist(id);
        setInWishlist(true);
        toast.success('Agregado a favoritos ❤️');
      }
    } catch { toast.error('Error al actualizar favoritos'); }
    finally { setWishlistLoading(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

        {/* Grid principal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

          {/* Imagen */}
          <div>
            <div style={{
              aspectRatio: '1', background: 'var(--bg-card)',
              border: '1px solid var(--border)', overflow: 'hidden', position: 'relative',
            }}>
              {product.image_url ? (
                <img src={product.image_url?.startsWith('/uploads')? `http://localhost:3000${product.image_url}`: product.image_url}alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: '80px', color: 'var(--text-muted)',
                }}>✦</div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  background: '#c0392b', color: '#fff',
                  padding: '6px 14px', fontSize: '11px', fontWeight: '700',
                }}>ÚLTIMAS UNIDADES</div>
              )}

              {/* Botón wishlist sobre la imagen */}
              <button onClick={handleWishlist} disabled={wishlistLoading}
                style={{
                  position: 'absolute', top: '16px', right: '16px',
                  width: '40px', height: '40px',
                  background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border)',
                  borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
              >
                <Heart size={16}
                  fill={inWishlist ? '#e74c3c' : 'none'}
                  color={inWishlist ? '#e74c3c' : 'var(--text-muted)'}
                />
              </button>
            </div>

            {/* Garantías */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
              {[
                { icon: <Shield size={14} />, text: 'Compra segura' },
                { icon: <Truck size={14} />, text: 'Envío express' },
                { icon: <Package size={14} />, text: '30 días devolución' },
                { icon: <Star size={14} />, text: 'Calidad premium' },
              ].map(({ icon, text }) => (
                <div key={text} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', background: 'var(--bg-card)',
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
              textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px',
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
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '48px', color: 'var(--gold)' }}>
                ${Number(product.price).toFixed(2)}
              </span>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>IVA incluido</p>
            </div>

            {/* Descripción */}
            {product.description && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  DESCRIPCIÓN
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '14px' }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                DISPONIBILIDAD
              </p>
              <p style={{ color: product.stock > 0 ? '#2ed573' : '#e74c3c', fontSize: '13px', fontWeight: '500' }}>
                {product.stock > 0 ? `✓ En stock (${product.stock} unidades)` : '✗ Agotado'}
              </p>
            </div>

            {/* Cantidad */}
            {product.stock > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  CANTIDAD
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{
                      width: '40px', height: '40px', background: 'var(--bg-card)',
                      border: '1px solid var(--border)', color: 'var(--text-primary)',
                      fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >−</button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', minWidth: '32px', textAlign: 'center' }}>
                    {quantity}
                  </span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    style={{
                      width: '40px', height: '40px', background: 'var(--bg-card)',
                      border: '1px solid var(--border)', color: 'var(--text-primary)',
                      fontSize: '18px', cursor: 'pointer', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >+</button>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Subtotal:{' '}
                    <span style={{ color: 'var(--gold)' }}>${(product.price * quantity).toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-gold" style={{ flex: 1, padding: '16px', fontSize: '12px' }}
                onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingBag size={14} style={{ marginRight: '8px' }} />
                {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
              </button>
              <button className="btn-outline" style={{ flex: 1, padding: '16px', fontSize: '12px' }}
                onClick={() => { handleAddToCart(); setTimeout(() => navigate('/checkout'), 300); }}
                disabled={product.stock === 0}>
                Comprar ahora
              </button>
            </div>

            {/* Wishlist debajo de botones */}
            <button onClick={handleWishlist} disabled={wishlistLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '16px', background: 'none', border: 'none',
                cursor: 'pointer', color: inWishlist ? '#e74c3c' : 'var(--text-muted)',
                fontSize: '12px', letterSpacing: '1px', transition: 'color 0.3s',
              }}>
              <Heart size={14} fill={inWishlist ? '#e74c3c' : 'none'} color={inWishlist ? '#e74c3c' : 'var(--text-muted)'} />
              {inWishlist ? 'EN TUS FAVORITOS' : 'AGREGAR A FAVORITOS'}
            </button>
          </div>
        </div>

        {/* Reseñas */}
        <ReviewsSection productId={id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;