const orderConfirmationEmail = (user, order, items) => ({
  subject: `✅ Orden #${order.id} confirmada — ShopFlow`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f0ead6; padding: 0;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #a07830, #c9a84c); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 4px; color: #0a0a0a;">
          SHOP<strong>FLOW</strong>
        </h1>
      </div>

      <!-- Body -->
      <div style="padding: 48px 40px;">
        <h2 style="font-size: 24px; font-weight: 300; color: #c9a84c; margin-bottom: 8px;">
          ¡Orden Confirmada!
        </h2>
        <p style="color: #9a9080; font-size: 14px; margin-bottom: 32px;">
          Hola <strong style="color: #f0ead6;">${user.name}</strong>, hemos recibido tu pedido exitosamente.
        </p>

        <!-- Orden info -->
        <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">
            DETALLE DE LA ORDEN
          </p>
          <p style="color: #9a9080; font-size: 13px; margin: 0 0 8px;">
            Orden: <strong style="color: #f0ead6;">#${order.id}</strong>
          </p>
          <p style="color: #9a9080; font-size: 13px; margin: 0 0 8px;">
            Estado: <strong style="color: #c9a84c;">Pendiente</strong>
          </p>
          <p style="color: #9a9080; font-size: 13px; margin: 0;">
            Fecha: <strong style="color: #f0ead6;">${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </p>
        </div>

        <!-- Productos -->
        <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">
            PRODUCTOS
          </p>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2a2420;">
              <span style="color: #f0ead6; font-size: 13px;">${item.product_name} × ${item.quantity}</span>
              <span style="color: #c9a84c; font-size: 13px;">$${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="padding-top: 16px; text-align: right;">
            <span style="font-size: 11px; color: #9a9080; letter-spacing: 2px;">TOTAL </span>
            <span style="font-size: 24px; color: #c9a84c;">$${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        <p style="color: #9a9080; font-size: 13px; line-height: 1.8;">
          Te notificaremos por este correo cuando el estado de tu orden cambie. 
          Puedes ver tus órdenes en cualquier momento desde tu cuenta.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #111111; border-top: 1px solid #2a2420; padding: 24px 40px; text-align: center;">
        <p style="color: #5a5248; font-size: 11px; letter-spacing: 1px; margin: 0;">
          © 2024 ShopFlow · Todos los derechos reservados
        </p>
      </div>
    </div>
  `,
});

const orderStatusEmail = (user, order) => {
  const statusLabels = {
    pendiente: { label: 'Pendiente', color: '#c9a84c', msg: 'Tu orden está siendo procesada.' },
    pagado: { label: 'Pago Confirmado ✅', color: '#2ed573', msg: 'Tu pago fue confirmado exitosamente.' },
    enviado: { label: 'En Camino 🚚', color: '#1e90ff', msg: 'Tu pedido está en camino.' },
    entregado: { label: 'Entregado 🎉', color: '#2ed573', msg: '¡Tu pedido fue entregado!' },
    cancelado: { label: 'Cancelado', color: '#e74c3c', msg: 'Tu orden fue cancelada.' },
  };

  const s = statusLabels[order.status] || statusLabels.pendiente;

  return {
    subject: `📦 Tu orden #${order.id} — ${s.label} — ShopFlow`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f0ead6; padding: 0;">
        
        <div style="background: linear-gradient(135deg, #a07830, #c9a84c); padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 4px; color: #0a0a0a;">
            SHOP<strong>FLOW</strong>
          </h1>
        </div>

        <div style="padding: 48px 40px;">
          <h2 style="font-size: 24px; font-weight: 300; color: ${s.color}; margin-bottom: 8px;">
            ${s.label}
          </h2>
          <p style="color: #9a9080; font-size: 14px; margin-bottom: 32px;">
            Hola <strong style="color: #f0ead6;">${user.name}</strong>, ${s.msg}
          </p>

          <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin-bottom: 24px;">
            <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">ORDEN</p>
            <p style="color: #9a9080; font-size: 13px; margin: 0 0 8px;">
              Número: <strong style="color: #f0ead6;">#${order.id}</strong>
            </p>
            <p style="color: #9a9080; font-size: 13px; margin: 0 0 8px;">
              Estado: <strong style="color: ${s.color};">${s.label}</strong>
            </p>
            <p style="color: #9a9080; font-size: 13px; margin: 0;">
              Total: <strong style="color: #c9a84c;">$${Number(order.total).toFixed(2)}</strong>
            </p>
          </div>

          <p style="color: #9a9080; font-size: 13px;">
            Visita tu cuenta para más detalles.
          </p>
        </div>

        <div style="background: #111111; border-top: 1px solid #2a2420; padding: 24px 40px; text-align: center;">
          <p style="color: #5a5248; font-size: 11px; margin: 0;">
            © 2024 ShopFlow · Todos los derechos reservados
          </p>
        </div>
      </div>
    `,
  };
};

const newOrderAdminEmail = (order, user, items) => ({
  subject: `🛒 Nueva orden #${order.id} — ShopFlow Admin`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f0ead6;">
      
      <div style="background: linear-gradient(135deg, #a07830, #c9a84c); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 4px; color: #0a0a0a;">
          SHOP<strong>FLOW</strong>
        </h1>
        <p style="color: #0a0a0a; margin: 8px 0 0; font-size: 12px; letter-spacing: 2px;">PANEL ADMIN</p>
      </div>

      <div style="padding: 48px 40px;">
        <h2 style="font-size: 24px; font-weight: 300; color: #c9a84c;">
          Nueva Orden Recibida
        </h2>

        <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">CLIENTE</p>
          <p style="color: #f0ead6; font-size: 14px; margin: 0 0 4px;">${user.name}</p>
          <p style="color: #9a9080; font-size: 13px; margin: 0;">${user.email}</p>
        </div>

        <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin-bottom: 24px;">
          <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">PRODUCTOS</p>
          ${items.map(item => `
            <div style="padding: 8px 0; border-bottom: 1px solid #2a2420;">
              <span style="color: #f0ead6; font-size: 13px;">${item.product_name} × ${item.quantity}</span>
              <span style="color: #c9a84c; font-size: 13px; float: right;">$${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          <div style="padding-top: 16px; text-align: right;">
            <span style="font-size: 24px; color: #c9a84c;">$${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="background: #111111; border-top: 1px solid #2a2420; padding: 24px 40px; text-align: center;">
        <p style="color: #5a5248; font-size: 11px; margin: 0;">© 2024 ShopFlow Admin</p>
      </div>
    </div>
  `,
});

const shippingEmail = (user, order, shipping) => ({
  subject: `🚚 Tu orden #${order.id} está en camino — ShopFlow`,
  html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f0ead6;">
      <div style="background: linear-gradient(135deg, #a07830, #c9a84c); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 300; letter-spacing: 4px; color: #0a0a0a;">
          SHOP<strong>FLOW</strong>
        </h1>
      </div>
      <div style="padding: 48px 40px;">
        <h2 style="color: #1e90ff; font-weight: 300;">🚚 Tu pedido está en camino</h2>
        <p style="color: #9a9080;">Hola <strong style="color: #f0ead6;">${user.name}</strong>, tu orden ya fue despachada.</p>

        <div style="background: #161616; border: 1px solid #2a2420; padding: 24px; margin: 24px 0;">
          <p style="font-size: 11px; letter-spacing: 3px; color: #c9a84c; margin: 0 0 16px;">INFO DE ENVÍO</p>
          <p style="color: #9a9080; margin: 0 0 8px;">Transportadora: <strong style="color: #f0ead6;">${shipping.shipping_company}</strong></p>
          <p style="color: #9a9080; margin: 0 0 8px;">Tracking: <strong style="color: #c9a84c;">${shipping.shipping_tracking}</strong></p>
          ${shipping.shipping_estimated ? `<p style="color: #9a9080; margin: 0 0 8px;">Entrega estimada: <strong style="color: #f0ead6;">${new Date(shipping.shipping_estimated).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>` : ''}
          ${shipping.shipping_notes ? `<p style="color: #9a9080; margin: 0;">Notas: <strong style="color: #f0ead6;">${shipping.shipping_notes}</strong></p>` : ''}
        </div>
      </div>
      <div style="background: #111111; border-top: 1px solid #2a2420; padding: 24px 40px; text-align: center;">
        <p style="color: #5a5248; font-size: 11px; margin: 0;">© 2024 ShopFlow</p>
      </div>
    </div>
  `,
});

module.exports = { orderConfirmationEmail, orderStatusEmail, newOrderAdminEmail, shippingEmail };