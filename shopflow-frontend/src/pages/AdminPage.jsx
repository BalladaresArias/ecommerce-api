import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Package, Tag, ShoppingBag, X, Check } from 'lucide-react';
import {
  getProducts, createProduct, deleteProduct, updateProduct,
  getCategories, createCategory, deleteCategory,
  getAllOrders, updateOrderStatus, importProducts
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { validateCoupon, getCoupons, createCoupon, toggleCoupon, deleteCoupon } from '../services/api';

const statusColors = {
  pendiente: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold)' },
  pagado: { bg: 'rgba(46,213,115,0.1)', color: '#2ed573' },
  enviado: { bg: 'rgba(30,144,255,0.1)', color: '#1e90ff' },
  entregado: { bg: 'rgba(46,213,115,0.15)', color: '#2ed573' },
  cancelado: { bg: 'rgba(231,76,60,0.1)', color: '#e74c3c' },
};

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', stock: '', category_id: '', image_url: '', image: null
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [coupons, setCoupons] = useState([]);
  const [shippingModal, setShippingModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [shippingForm, setShippingForm] = useState({
    shipping_company: '', shipping_tracking: '', shipping_estimated: '', shipping_notes: ''
  });
  const [importing, setImporting] = useState(false);

  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }
    fetchAll();
  }, [user]);

  useEffect(() => {
    console.log('Categorías cargadas:', categories);
  }, [categories]);

  const fetchAll = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts(), getCategories()
      ]);
      setProducts(prodRes.data.products);
      setCategories(catRes.data.categories);

      // Orders por separado para que no rompa todo
      try {
        const ordRes = await getAllOrders({ page: 1, limit: 20 });
        setOrders(ordRes.data.orders);
        setOrderTotalPages(ordRes.data.pages || 1);
        setOrderTotal(ordRes.data.total || 0);
      } catch (ordErr) {
        console.error('Error orders:', ordErr.message);
        setOrders([]);
      }
        const couponRes = await getCoupons();
        setCoupons(couponRes.data.coupons);
    } catch (err) {
      console.error('fetchAll error:', err);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders({ page: orderPage, limit: 20, status: orderStatus, search: orderSearch });
      setOrders(res.data.orders);
      setOrderTotalPages(res.data.pages || 1);
      setOrderTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error orders:', err.message);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [orderPage, orderSearch, orderStatus, activeTab]);

  // Productos
  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        image: null
      });
    } else {
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '', image: null });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price)
      return toast.error('Nombre y precio son obligatorios');

    try {
      const formData = new FormData();

      formData.append('name', productForm.name);
      formData.append('description', productForm.description || '');
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock || 0);
      formData.append('category_id', productForm.category_id || '');

      if (productForm.image_url) {
        formData.append('image_url', productForm.image_url);
      }

      if (productForm.image) {
        formData.append('image', productForm.image);
      }


      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        toast.success('Producto actualizado');
      } else {
        await createProduct(productForm);
        toast.success('Producto creado');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
      toast.success('Producto eliminado');
      fetchAll();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  // Categorías
  const handleCreateCategory = async () => {
    if (!categoryForm.name) return toast.error('El nombre es obligatorio');
    try {
      await createCategory(categoryForm);
      toast.success('Categoría creada');
      setCategoryForm({ name: '', description: '' });
      fetchAll();
    } catch (err) {
      toast.error('Error al crear categoría');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await deleteCategory(id);
      toast.success('Categoría eliminada');
      fetchAll();
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  // Órdenes
  const handleStatusChange = async (orderId, status) => {
    if (status === 'enviado') {
      setPendingOrder(orderId);
      setShippingForm({ shipping_company: '', shipping_tracking: '', shipping_estimated: '', shipping_notes: '' });
      setShippingModal(true);
      return;
    }
    try {
      await updateOrderStatus(orderId, { status });
      toast.success('Estado actualizado');
      fetchAll();
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleConfirmShipping = async () => {
    if (!shippingForm.shipping_company || !shippingForm.shipping_tracking)
      return toast.error('Transportadora y tracking son obligatorios');
    try {
      await updateOrderStatus(pendingOrder, { status: 'enviado', ...shippingForm });
      toast.success('Estado actualizado');
      setShippingModal(false);
      fetchAll();
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    fontSize: '13px', outline: 'none',
  };

  const tabs = [
    { id: 'products', label: 'Productos', icon: <Package size={16} /> },
    { id: 'categories', label: 'Categorías', icon: <Tag size={16} /> },
    { id: 'orders', label: 'Órdenes', icon: <ShoppingBag size={16} /> },
  ];

  const downloadTemplate = () => {
    const csv = [
      'name,description,price,stock,category_id,image_url',
      'Camiseta Negra,Camiseta 100% algodón,29900,10,1,https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'Zapatos Deportivos,Zapatillas running,89900,5,2,https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'template-productos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean);
      const headers = lines[0].replace(/^\uFEFF/, '').split(',');
      const products = lines.slice(1).map(line => {
        const vals = line.split(',');
        return headers.reduce((obj, h, i) => ({ ...obj, [h.trim()]: vals[i]?.trim() }), {});
      }).filter(p => p.name && p.price);

      if (products.length === 0) return toast.error('El CSV no tiene productos válidos');

      setImporting(true);
      try {
        const res = await importProducts(products);
        toast.success(res.data.message);
        if (res.data.errors?.length) toast.error(`${res.data.errors.length} filas con error`);
        fetchAll();
      } catch (err) {
        toast.error('Error al importar');
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-muted)', letterSpacing: '3px' }}>CARGANDO...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '60px 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <p className="section-subtitle">Panel de</p>
          <h1 className="section-title">Administración</h1>
          <div className="divider-gold" />
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '48px',
        }}>
          {[
            { label: 'Productos', value: products.length, icon: <Package size={20} /> },
            { label: 'Categorías', value: categories.length, icon: <Tag size={20} /> },
            { label: 'Órdenes', value: orders.length, icon: <ShoppingBag size={20} /> },
            {
              label: 'Ingresos',
              value: `$${orders.reduce((s, o) => s + Number(o.total), 0).toFixed(2)}`,
              icon: <span style={{ fontSize: '18px' }}>💰</span>
            },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '24px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ color: 'var(--gold)' }}>{icon}</div>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--gold)' }}>
                  {value}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '1px' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0',
          borderBottom: '1px solid var(--border)',
          marginBottom: '40px',
        }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', background: 'none',
                border: 'none', borderBottom: '2px solid',
                borderBottomColor: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '12px', letterSpacing: '1px',
                cursor: 'pointer', transition: 'all 0.3s',
                marginBottom: '-1px',
              }}>
              {tab.icon} {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* importar CSV */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {/*<button onClick={downloadTemplate}
            style={{ padding: '10px 20px', fontSize: '11px', letterSpacing: '1px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            ↓ DESCARGAR TEMPLATE CSV
          </button>*/}
          <label style={{ padding: '10px 20px', fontSize: '11px', letterSpacing: '1px', border: '1px solid var(--gold)', color: 'var(--gold)', cursor: 'pointer', display: 'inline-block' }}>
            {importing ? 'IMPORTANDO...' : '↑ IMPORTAR CSV'}
            <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
          </label>
        </div>

        {/* TAB: Productos */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button className="btn-gold" onClick={() => handleOpenModal()}>
                <Plus size={14} style={{ marginRight: '8px' }} />
                Nuevo Producto
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['ID', 'Nombre', 'Precio', 'Stock', 'Categoría', 'Acciones'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '10px', letterSpacing: '2px',
                        color: 'var(--text-muted)', fontWeight: '600',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>#{product.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {product.image_url && (
                            <img src={product.image_url?.startsWith('/uploads')? `http://localhost:3000${product.image_url}`: product.image_url} alt={product.name}
                              style={{ width: '36px', height: '36px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                          )}
                          <span style={{ fontSize: '13px' }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '16px' }}>
                        ${Number(product.price).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        <span style={{
                          color: product.stock <= 5 ? '#e74c3c' : 'var(--text-primary)',
                        }}>{product.stock}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {product.category_name || '—'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenModal(product)}
                            style={{
                              background: 'none', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', padding: '6px 10px',
                              cursor: 'pointer', transition: 'all 0.3s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--gold)';
                              e.currentTarget.style.color = 'var(--gold)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}>
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)}
                            style={{
                              background: 'none', border: '1px solid var(--border)',
                              color: 'var(--text-secondary)', padding: '6px 10px',
                              cursor: 'pointer', transition: 'all 0.3s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#e74c3c';
                              e.currentTarget.style.color = '#e74c3c';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Categorías */}
        {activeTab === 'categories' && (
          <div>
            {/* Formulario */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '28px', marginBottom: '32px',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px', fontWeight: '400', marginBottom: '20px',
              }}>Nueva Categoría</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    NOMBRE
                  </label>
                  <input
                    type="text" placeholder="Ej: Deportes"
                    value={categoryForm.name}
                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    DESCRIPCIÓN
                  </label>
                  <input
                    type="text" placeholder="Descripción de la categoría"
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <button className="btn-gold" onClick={handleCreateCategory} style={{ padding: '10px 24px' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Lista */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map(cat => (
                <div key={cat.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Tag size={16} color="var(--gold)" />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '500' }}>{cat.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.description}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    style={{
                      background: 'none', border: '1px solid var(--border)',
                      color: 'var(--text-muted)', padding: '6px 10px',
                      cursor: 'pointer', transition: 'all 0.3s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#e74c3c';
                      e.currentTarget.style.color = '#e74c3c';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Órdenes */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Búsqueda y filtro */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Buscar por cliente, email o # orden..."
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                style={{ flex: 1, minWidth: '220px', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
              />
              <select
                value={orderStatus}
                onChange={e => { setOrderStatus(e.target.value); setOrderPage(1); }}
                style={{ padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{orderTotal} órdenes</span>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px' }}>
                No hay órdenes aún
              </p>
            ) : orders.map(order => {
              const status = statusColors[order.status] || statusColors.pendiente;
              const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
              return (
                <div key={order.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  padding: '24px',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>Orden #{order.id}</span>
                      <span style={{
                        padding: '3px 10px', fontSize: '10px', fontWeight: '600',
                        background: status.bg, color: status.color,
                      }}>{order.status?.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {order.customer_name} · {order.email}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px', color: 'var(--gold)',
                      }}>${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '12px', marginBottom: '16px',
                  }}>
                    {items?.map((item, i) => (
                      <span key={i} style={{
                        display: 'inline-block',
                        background: 'var(--bg-hover)',
                        border: '1px solid var(--border)',
                        padding: '4px 10px', fontSize: '11px',
                        color: 'var(--text-secondary)', marginRight: '8px', marginBottom: '6px',
                      }}>
                        {item.product_name} ×{item.quantity}
                      </span>
                    ))}
                  </div>

                  {/* Cambiar estado */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '1px' }}>
                      ESTADO:
                    </span>
                    {['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'].map(s => (
                      <button key={s} onClick={() => handleStatusChange(order.id, s)}
                        style={{
                          padding: '5px 12px', fontSize: '10px', letterSpacing: '1px',
                          border: '1px solid',
                          borderColor: order.status === s ? statusColors[s]?.color : 'var(--border)',
                          background: order.status === s ? statusColors[s]?.bg : 'transparent',
                          color: order.status === s ? statusColors[s]?.color : 'var(--text-muted)',
                          cursor: 'pointer', transition: 'all 0.3s',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}>
                        {order.status === s && <Check size={10} />}
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {orderTotalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
            <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1}
              style={{ padding: '8px 20px', fontSize: '11px', letterSpacing: '1px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', opacity: orderPage === 1 ? 0.4 : 1 }}>
              ← Anterior
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', padding: '0 16px' }}>
              Página {orderPage} de {orderTotalPages}
            </span>
            <button onClick={() => setOrderPage(p => Math.min(orderTotalPages, p + 1))} disabled={orderPage === orderTotalPages}
              style={{ padding: '8px 20px', fontSize: '11px', letterSpacing: '1px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', opacity: orderPage === orderTotalPages ? 0.4 : 1 }}>
              Siguiente →
            </button>
          </div>
        )}
      </div>
      {/* TAB: Cupones */}
      {activeTab === 'coupons' && (
        <div>
          {/* Formulario crear cupón */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '28px', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '400', marginBottom: '20px' }}>
              Nuevo Cupón
            </h3>
            <CouponForm onCreated={fetchAll} />
          </div>

          {/* Lista cupones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {coupons.map(coupon => (
              <div key={coupon.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
                flexWrap: 'wrap', gap: '12px',
                opacity: coupon.active ? 1 : 0.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <Tag size={16} color="var(--gold)" />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '600', letterSpacing: '1px', color: 'var(--gold)' }}>
                      {coupon.code}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {coupon.type === 'percentage' ? `${coupon.value}% descuento` : `$${coupon.value} fijo`}
                      {coupon.min_order > 0 && ` · mín. $${coupon.min_order}`}
                      {coupon.max_uses && ` · ${coupon.uses}/${coupon.max_uses} usos`}
                      {coupon.expires_at && ` · expira ${new Date(coupon.expires_at).toLocaleDateString('es-CO')}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{
                    padding: '3px 10px', fontSize: '10px', fontWeight: '600',
                    background: coupon.active ? 'rgba(46,213,115,0.1)' : 'rgba(231,76,60,0.1)',
                    color: coupon.active ? '#2ed573' : '#e74c3c',
                  }}>
                    {coupon.active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                  <button
                    onClick={async () => {
                      await toggleCoupon(coupon.id, coupon.active ? 0 : 1);
                      fetchAll();
                    }}
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '6px 12px', cursor: 'pointer', fontSize: '11px' }}
                  >
                    {coupon.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('¿Eliminar cupón?')) return;
                      await deleteCoupon(coupon.id);
                      toast.success('Cupón eliminado');
                      fetchAll();
                    }}
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.3s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* MODAL Producto */}
      {showModal && (
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 2000,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%', maxWidth: '540px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-gold)',
            padding: '40px', zIndex: 2001,
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '400' }}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'name', label: 'Nombre', type: 'text', placeholder: 'Nombre del producto' },
                { key: 'price', label: 'Precio', type: 'number', placeholder: '0.00' },
                { key: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
                { key: 'image_url', label: 'URL de imagen', type: 'text', placeholder: 'https://...' },
                { key: 'image', label: 'Subir Imagen', type: 'file'},
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    {label.toUpperCase()}
                  </label>
                  <input
                    type={type} placeholder={placeholder}
                    {...(type !== 'file' ? { value: productForm[key] || '' } : {})}
                    onChange={e =>setProductForm({...productForm,[key]:type === 'file'? e.target.files[0]: e.target.value})}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}

              {/* Categoría */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  CATEGORÍA
                </label>
                <select
                  value={productForm.category_id}
                  onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Sin categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  DESCRIPCIÓN
                </label>
                <textarea
                  placeholder="Descripción del producto"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-gold)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <button className="btn-gold" style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                onClick={handleSaveProduct}>
                {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
              </button>
            </div>
          </div>
        </>
      )}
      {/* Modal envio */}
      {shippingModal && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '32px', width: '420px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '400', marginBottom: '20px' }}>Info de envío</h3>
          {['shipping_company', 'shipping_tracking', 'shipping_estimated', 'shipping_notes'].map(field => (
            <input key={field} placeholder={field.replace('shipping_', '')}
              value={shippingForm[field]}
              onChange={e => setShippingForm(p => ({ ...p, [field]: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', marginBottom: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={handleConfirmShipping} style={{ flex: 1, padding: '12px', background: '#1e90ff', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: '1px', fontSize: '12px' }}>CONFIRMAR ENVÍO</button>
            <button onClick={() => setShippingModal(false)} style={{ flex: 1, padding: '12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '12px' }}>CANCELAR</button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
const CouponForm = ({ onCreated }) => {
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: '' });

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-primary)',
    border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  };

  const handleCreate = async () => {
    if (!form.code || !form.value) return toast.error('Código y valor son obligatorios');
    try {
      await createCoupon(form);
      toast.success('Cupón creado');
      setForm({ code: '', type: 'percentage', value: '', min_order: '', max_uses: '', expires_at: '' });
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al crear cupón');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
      {[
        { key: 'code', label: 'CÓDIGO', placeholder: 'PROMO20' },
        { key: 'value', label: 'VALOR', placeholder: '10', type: 'number' },
        { key: 'min_order', label: 'MÍNIMO ($)', placeholder: '0', type: 'number' },
        { key: 'max_uses', label: 'USOS MÁX.', placeholder: 'Ilimitado', type: 'number' },
      ].map(({ key, label, placeholder, type = 'text' }) => (
        <div key={key}>
          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</label>
          <input type={type} placeholder={placeholder} value={form[key]}
            onChange={e => setForm({ ...form, [key]: key === 'code' ? e.target.value.toUpperCase() : e.target.value })}
            style={inputStyle} />
        </div>
      ))}
      <div>
        <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>TIPO</label>
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="percentage">Porcentaje (%)</option>
          <option value="fixed">Fijo ($)</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '6px' }}>EXPIRACIÓN</label>
        <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} style={inputStyle} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <button className="btn-gold" onClick={handleCreate} style={{ width: '100%', padding: '10px' }}>
          <Plus size={14} style={{ marginRight: '6px' }} /> Crear
        </button>
      </div>
    </div>
  );
};

export default AdminPage;