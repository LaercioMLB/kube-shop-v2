import React, { useCallback, useEffect, useRef, useState } from "react";
import { request } from "./api.js";
import ProductArt from "./ProductArt.jsx";

export const money = (cents) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

export default function App() {
  const [tab, setTab] = useState("catalog");
  const [category, setCategory] = useState("Todos");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [online, setOnline] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const cartRef = useRef(null);
  const refreshHealth = useCallback(async () => {
    try {
      await request("/health/ready");
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [catalog, history] = await Promise.all([
        request("/products"),
        request("/orders"),
      ]);
      setProducts(catalog.products);
      setOrders(history.orders);
    } catch (err) {
      setError(err.message || "Não foi possível carregar a loja.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshHealth();
    refreshData();
    const interval = setInterval(refreshHealth, 5000);
    return () => clearInterval(interval);
  }, [refreshHealth, refreshData]);
  const cartItems = products
    .filter((p) => cart[p.id])
    .map((p) => ({ ...p, quantity: cart[p.id] }));
  const count = cartItems.reduce((n, p) => n + p.quantity, 0);
  const total = cartItems.reduce((n, p) => n + p.quantity * p.priceCents, 0);
  async function checkout() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { order } = await request("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((p) => ({
            productId: p.id,
            quantity: p.quantity,
          })),
        }),
      });
      setCart({});
      setOrders((previous) => [order, ...previous]);
      setNotice(
        `Pedido #${order.id.slice(-6)} confirmado e salvo. Obrigado por participar!`,
      );
      await refreshHealth();
    } catch (err) {
      setError(
        err.message || "Não foi possível confirmar o pedido. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="announcement">
        <span>BLACK FRIDAY</span>
        <p>Grandes ofertas. Boas escolhas.</p>
        <span className="fictional">100% fictício · 0 pagamentos reais</span>
      </div>
      <header className="header wrap">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setTab("catalog");
          }}
          aria-label="KubeShop início"
        >
          <span className="brand-mark">k</span>kube<span>shop</span>
        </a>
        <nav aria-label="Navegação principal">
          {[
            ["catalog", "Catálogo"],
            ["orders", "Meus pedidos"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "nav active" : "nav"}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <button
          className="cart-toggle"
          onClick={() =>
            cartRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            })
          }
        >
          Sacola <span>{count}</span>
        </button>
      </header>
      <main className="wrap">
        <section className="hero">
          <div>
            <div className="eyebrow">
              <span className="small-line" /> A PRÓXIMA IDEIA COMEÇA AQUI
            </div>
            <h1>
              Seu próximo setup.
              <br />
              <em>Um novo mundo de possibilidades.</em>
            </h1>
            <p>
              Uma seleção para criar, conectar e ir além.
              <br />
              Encontre o próximo upgrade para o seu dia.
            </p>
            <a
              href="#collection"
              className="button hero-button"
              onClick={() => setTab("catalog")}
            >
              Explorar ofertas <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-k">k</div>
            <div className="floating-label top-label">
              ideias em movimento <span>✦</span>
            </div>
            <div className="floating-label bottom-label">
              <span className="live-dot" /> feito para inspirar
            </div>
          </div>
        </section>
        <div className="status-strip">
          <div>
            <span
              className={`live-dot ${online === false ? "offline" : online === null ? "waiting" : ""}`}
            />
            <strong>
              {online === null
                ? "Conectando à loja"
                : online
                  ? "Loja disponível"
                  : "Loja indisponível"}
            </strong>

          </div>
          <button
            className="text-button"
            onClick={() => {
              refreshHealth();
              refreshData();
            }}
          >
            Atualizar loja <span aria-hidden="true">→</span>
          </button>
        </div>
        {error && (
          <div role="alert" className="message error">
            {error}
            <button onClick={refreshData}>Tentar novamente</button>
          </div>
        )}
        {notice && (
          <div role="status" className="message success">
            {notice}
            <button onClick={() => setTab("orders")}>Ver pedidos</button>
          </div>
        )}
        <div className="shop-layout" id="collection">
          <section className="content">
            {tab === "catalog" && (
              <>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">ESCOLHIDOS PARA VOCÊ</p>
                    <h2>Pequenos upgrades. Grandes ideias.</h2>
                  </div>
                  <span className="muted">{products.length} produtos</span>
                </div>
                <div className="categories" aria-label="Filtrar categoria">
                  {["Todos", "Setup", "Áudio", "Essenciais"].map((item) => (
                    <button
                      key={item}
                      aria-pressed={category === item}
                      onClick={() => setCategory(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                {loading ? (
                  <p role="status" className="empty-state">
                    Carregando ofertas…
                  </p>
                ) : products.length === 0 ? (
                  <p className="empty-state">
                    As ofertas aparecerão quando a API estiver disponível.
                  </p>
                ) : (
                  <div className="product-grid">
                    {products
                      .filter(
                        (p) => category === "Todos" || p.category === category,
                      )
                      .map((product) => (
                        <article className="product" key={product.id}>
                          <div className={`product-visual ${product.color}`}>
                            <span className="discount">
                              −
                              {Math.round(
                                (1 -
                                  product.priceCents /
                                    product.originalPriceCents) *
                                  100,
                              )}
                              %
                            </span>
                            <ProductArt type={product.illustration} />
                          </div>
                          <div className="product-details">
                            <span className="product-category">
                              {product.category}
                            </span>
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <div className="product-bottom">
                              <div>
                                <del>{money(product.originalPriceCents)}</del>
                                <strong>{money(product.priceCents)}</strong>
                              </div>
                              <button
                                className="add-button"
                                disabled={
                                  busy ||
                                  (cart[product.id] || 0) >= 10 ||
                                  (!(product.id in cart) &&
                                    cartItems.length >= 20)
                                }
                                aria-label={`Adicionar ${product.name}`}
                                onClick={() => {
                                  setCart((previous) => ({
                                    ...previous,
                                    [product.id]: Math.min(
                                      10,
                                      (previous[product.id] || 0) + 1,
                                    ),
                                  }));
                                  setNotice("");
                                }}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                  </div>
                )}
              </>
            )}
            {tab === "orders" && (
              <>
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">SUAS ESCOLHAS, SALVAS</p>
                    <h2>Meus pedidos</h2>
                  </div>
                  <button className="text-button" onClick={refreshData}>
                    Atualizar ↻
                  </button>
                </div>
                <p className="muted">
                  Pedidos fictícios compartilhados nesta loja. Consulte aqui suas
                  últimas escolhas.
                </p>
                {loading ? (
                  <p role="status">Consultando pedidos…</p>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    Sua próxima ideia ainda está na sacola.
                    <br />
                    <button
                      className="text-button"
                      onClick={() => setTab("catalog")}
                    >
                      Explorar catálogo →
                    </button>
                  </div>
                ) : (
                  <div className="orders">
                    {orders.map((order) => (
                      <article className="order" key={order.id}>
                        <div className="order-heading">
                          <strong>Pedido #{order.id.slice(-6)}</strong>
                          <span className="order-tag">Confirmado</span>
                        </div>
                        <p className="muted">
                          {new Date(order.createdAt).toLocaleString("pt-BR")}
                        </p>
                        <ul>
                          {order.items.map((item) => (
                            <li key={item.productId}>
                              {item.quantity} × {item.name}
                              <span>
                                {money(item.quantity * item.unitPriceCents)}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="order-total">
                          Total fictício{" "}
                          <strong>{money(order.totalCents)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
          <aside className="bag" ref={cartRef} aria-label="Sua sacola">
            <div className="bag-title">
              <h2>Sua sacola</h2>
              <span>{count}</span>
            </div>
            <p className="muted">Um bom começo para a próxima ideia.</p>
            {cartItems.length ? (
              <ul className="cart-items">
                {cartItems.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.quantity} × {money(item.priceCents)}
                      </small>
                    </div>
                    <button
                      disabled={busy}
                      aria-label={`Remover ${item.name}`}
                      onClick={() =>
                        setCart((previous) => {
                          const next = { ...previous };
                          if (next[item.id] > 1) next[item.id]--;
                          else delete next[item.id];
                          return next;
                        })
                      }
                    >
                      −
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-bag">
                <span aria-hidden="true">↗</span>
                <p>
                  Sua sacola está esperando
                  <br />
                  por boas escolhas.
                </p>
              </div>
            )}
            <div className="cart-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>
            <button
              className="button checkout"
              disabled={!count || busy}
              onClick={checkout}
            >
              {busy ? "Confirmando…" : "Confirmar pedido fictício"}{" "}
              <span aria-hidden="true">→</span>
            </button>
            <p className="bag-footnote">
              Sem cobrança. Sem dados pessoais.
              <br />
              Explore suas próximas escolhas.
            </p>
            <div className="persistence-note">
              <span aria-hidden="true">◇</span>
              <div>
                <strong>Salvo de verdade.</strong>
                <p>
                  Seus pedidos continuam salvos para você consultar depois.
                </p>
              </div>
            </div>
          </aside>
        </div>
        <section className="closing">
          <span className="brand-mark">k</span>
          <div>
            <strong>Boas ideias merecem um novo começo.</strong>
            <p>Escolha os detalhes que fazem parte do seu dia.</p>
          </div>
          <span className="closing-label">
            KUBESHOP · EDIÇÃO BLACK FRIDAY
          </span>
        </section>
      </main>
      <footer className="wrap footer">
        <span>
          kubeshop <span className="muted">/ loja demonstrativa</span>
        </span>
        <span>Produtos e valores fictícios. Explore suas próximas escolhas.</span>
      </footer>
    </>
  );
}
