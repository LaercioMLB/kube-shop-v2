import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App, { money } from "./App.jsx";

const product = {
  id: "headphones",
  name: "Headphone Orbit",
  category: "Áudio",
  description: "Seu foco.",
  priceCents: 18990,
  originalPriceCents: 29990,
  illustration: "headphones",
  color: "lavender",
};
const order = {
  id: "abc123456",
  items: [
    {
      productId: product.id,
      name: product.name,
      quantity: 1,
      unitPriceCents: product.priceCents,
    },
  ],
  totalCents: product.priceCents,
  createdAt: "2026-10-19T10:00:00Z",
};
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url, options) => ({
      ok: true,
      json: async () =>
        url.endsWith("/products")
          ? { products: [product] }
          : url.endsWith("/info")
            ? {
                version: "v1",
                instanceId: "instance-test",
                timestamp: new Date().toISOString(),
              }
            : options?.method === "POST"
              ? { order }
              : { orders: [] },
    })),
  );
});
afterEach(() => vi.unstubAllGlobals());
describe("loja", () => {
  it("exibe dados reais da API, filtra catálogo e formata centavos", async () => {
    render(<App />);
    expect(await screen.findByText("Headphone Orbit")).toBeInTheDocument();
    expect(await screen.findByText("Loja disponível")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Setup", exact: true }));
    expect(screen.queryByText("Headphone Orbit")).not.toBeInTheDocument();
    expect(money(18990)).toMatch(/189,90/);
  });
  it("cria pedido, esvazia sacola e mostra histórico retornado", async () => {
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Adicionar Headphone Orbit" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar pedido fictício/ }),
    );
    expect(
      await screen.findByText(/Pedido #123456 confirmado/),
    ).toBeInTheDocument();
    const post = fetch.mock.calls.find(
      ([, options]) => options.method === "POST",
    );
    expect(JSON.parse(post[1].body)).toEqual({
      items: [{ productId: "headphones", quantity: 1 }],
    });
    fireEvent.click(screen.getByRole("button", { name: "Meus pedidos" }));
    expect(await screen.findByText("Pedido #123456")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Confirmar pedido fictício/ }),
    ).toBeDisabled();
  });
  it("exibe indisponibilidade e permite nova tentativa", async () => {
    fetch.mockRejectedValue(new Error("Loja indisponível no teste."));
    render(<App />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Loja indisponível no teste.",
    );
    expect(await screen.findByText("Loja indisponível")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeEnabled();
  });
  it("preserva sacola após falha de confirmação", async () => {
    render(<App />);
    fireEvent.click(
      await screen.findByRole("button", { name: "Adicionar Headphone Orbit" }),
    );
    fetch.mockImplementation(async (url, options) => {
      if (options?.method === "POST")
        return {
          ok: false,
          json: async () => ({ error: "Banco indisponível." }),
        };
      return {
        ok: true,
        json: async () => ({
          version: "v1",
          timestamp: new Date().toISOString(),
        }),
      };
    });
    fireEvent.click(
      screen.getByRole("button", { name: /Confirmar pedido fictício/ }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Banco indisponível.",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Confirmar pedido fictício/ }),
      ).toBeEnabled(),
    );
  });
});
