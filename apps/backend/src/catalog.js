export const products = Object.freeze([
  {
    id: "headphones",
    name: "Headphone Orbit",
    category: "Áudio",
    description: "Seu foco em outra frequência.",
    priceCents: 18990,
    originalPriceCents: 29990,
    illustration: "headphones",
    color: "lavender",
  },
  {
    id: "keyboard",
    name: "Teclado Flow",
    category: "Setup",
    description: "Uma boa ideia começa com um toque.",
    priceCents: 24990,
    originalPriceCents: 39990,
    illustration: "keyboard",
    color: "mint",
  },
  {
    id: "monitor",
    name: "Monitor Horizon",
    category: "Setup",
    description: "Mais espaço para o próximo projeto.",
    priceCents: 89990,
    originalPriceCents: 129990,
    illustration: "monitor",
    color: "peach",
  },
  {
    id: "backpack",
    name: "Mochila Deploy",
    category: "Essenciais",
    description: "Leve suas ideias para qualquer lugar.",
    priceCents: 15990,
    originalPriceCents: 22990,
    illustration: "backpack",
    color: "sky",
  },
  {
    id: "mouse",
    name: "Mouse Vector",
    category: "Setup",
    description: "Precisão para explorar novos caminhos.",
    priceCents: 9990,
    originalPriceCents: 16990,
    illustration: "mouse",
    color: "peach",
  },
  {
    id: "speaker",
    name: "Speaker Echo",
    category: "Áudio",
    description: "O som que acompanha o seu ritmo.",
    priceCents: 12990,
    originalPriceCents: 19990,
    illustration: "speaker",
    color: "mint",
  },
]);

export function validateOrder(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !Array.isArray(body.items) ||
    body.items.length < 1 ||
    body.items.length > 20
  ) {
    throw new Error("Informe de 1 a 20 itens no pedido.");
  }
  const seen = new Set();
  const items = body.items.map((item) => {
    if (!item || typeof item !== "object") throw new Error("Item inválido.");
    const product = products.find((p) => p.id === item.productId);
    if (
      !product ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10 ||
      seen.has(item.productId)
    ) {
      throw new Error(
        "Produto inexistente, repetido ou quantidade fora de 1–10.",
      );
    }
    seen.add(item.productId);
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
    };
  });
  return {
    items,
    totalCents: items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0,
    ),
    status: "confirmed",
    fictional: true,
  };
}
