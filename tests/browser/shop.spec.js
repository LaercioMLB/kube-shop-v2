import { test, expect } from '@playwright/test';

test('catálogo, compra fictícia, histórico e layout responsivo', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByText('Loja disponível', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Laboratório', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Headphone Orbit' })).toBeVisible();
  await page.getByRole('button', { name: 'Adicionar Headphone Orbit' }).click();
  await page.getByRole('button', { name: 'Confirmar pedido fictício' }).click();
  const notice = page.getByRole('status');
  await expect(notice).toContainText('confirmado e salvo');
  const id = (await notice.textContent()).match(/Pedido #(\w+)/)[1];
  await page.getByRole('button', { name: 'Meus pedidos' }).click();
  await expect(page.getByText('Pedido #' + id, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Meus pedidos' }).click();
  await expect(page.getByText('Pedido #' + id, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
