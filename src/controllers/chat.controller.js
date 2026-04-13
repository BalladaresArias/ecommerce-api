const pool = require('../config/db');

const chat = async (req, res) => {
  try {
    const { messages, cartItems = [] } = req.body;

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock > 0
       ORDER BY p.name ASC
       LIMIT 100`
    );

    const catalog = products.map(p =>
      `ID:${p.id} | ${p.name} | $${Number(p.price).toLocaleString('es-CO')} | Stock:${p.stock} | Categoría:${p.category || 'General'} | ${p.description || ''}`
    ).join('\n');

    const cartSummary = cartItems.length > 0
      ? cartItems.map(i => `${i.name} x${i.quantity}`).join(', ')
      : 'vacío';

    const systemPrompt = `Eres el asistente de ventas de ShopFlow, una tienda online. Tu rol es ayudar a los clientes a encontrar productos, resolver dudas y guiarlos hasta la compra.

CATÁLOGO ACTUAL (solo productos disponibles):
${catalog}

CARRITO ACTUAL DEL CLIENTE: ${cartSummary}

INSTRUCCIONES:
- Responde siempre en español, de forma amigable y concisa (máximo 3 párrafos)
- Cuando el cliente quiera agregar un producto al carrito, responde con un JSON especial al final de tu mensaje:
  <<<ADD_TO_CART:{"id":123,"name":"Nombre","price":99900,"stock":10}>>>
- Puedes agregar VARIOS productos a la vez separando los JSON:
  <<<ADD_TO_CART:{"id":1,"name":"X","price":100,"stock":5}>>><<<ADD_TO_CART:{"id":2,"name":"Y","price":200,"stock":3}>>>
- Si el cliente pide recomendaciones, sugiere máximo 3 productos relevantes del catálogo
- Si un producto no existe en el catálogo, dilo claramente
- Si el cliente pregunta por precio, stock o categoría, usa el catálogo
- Para ir al checkout di: "puedes ir a /checkout para finalizar tu compra"
- No inventes productos que no están en el catálogo
- Si el carrito tiene productos, puedes hacer referencia a ellos
- Sé proactivo: si el cliente menciona una necesidad, recomienda productos`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
       },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await response.json();

    if (!response.ok)
      return res.status(500).json({ error: 'Error de IA', detail: data });

    const text = data.content[0].text;

    // Extraer comandos ADD_TO_CART
    const cartCommands = [];
    const regex = /<<<ADD_TO_CART:({.*?})>>>/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      try { cartCommands.push(JSON.parse(match[1])); } catch {}
    }

    // Limpiar el texto de los comandos
    const cleanText = text.replace(/<<<ADD_TO_CART:{.*?}>>>/g, '').trim();

    res.json({ message: cleanText, addToCart: cartCommands });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Error en el chat', detail: err.message });
  }
};

module.exports = { chat };