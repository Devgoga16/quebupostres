// ¡Qué Bu! Postres — filtros de la vitrina + pedido por WhatsApp
import { waLink } from '../data/site';

const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];

interface Info { nombre: string; precio: string; thumb: string }

// Datos de cada producto leídos de su tarjeta (renderizada por Astro)
const productos = new Map<string, Info>(
  $$('[data-product]').map((el) => [el.dataset.product!, {
    nombre: el.dataset.nombre!,
    precio: el.dataset.precio!,
    thumb: $<HTMLImageElement>('img', el).currentSrc || $<HTMLImageElement>('img', el).src,
  }]),
);

// ---------- Pedido (persistencia solo por comodidad) ----------
let cart: Record<string, number> = {};
try { cart = JSON.parse(localStorage.getItem('qb-pedido') || '{}'); } catch { cart = {}; }
const save = () => { try { localStorage.setItem('qb-pedido', JSON.stringify(cart)); } catch {} };

// ---------- Filtros ----------
$$('.chip').forEach((chip) => chip.addEventListener('click', () => {
  $$('.chip').forEach((c) => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', String(c === chip)); });
  const f = chip.dataset.filter;
  $$('.product').forEach((el) => { el.hidden = f !== 'todo' && el.dataset.cat !== f; });
}));

// ---------- Drawer ----------
const drawer = $('#pedido');
const scrim = $('.drawer-scrim');
let lastFocus: HTMLElement | null = null;

function openCart() {
  lastFocus = document.activeElement as HTMLElement;
  scrim.hidden = false;
  requestAnimationFrame(() => { drawer.classList.add('is-open'); scrim.classList.add('is-open'); });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  drawer.focus();
}
function closeCart() {
  drawer.classList.remove('is-open');
  scrim.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  setTimeout(() => { scrim.hidden = true; }, 250);
  lastFocus?.focus();
}
$$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
$$('[data-close-cart]').forEach((b) => b.addEventListener('click', () => {
  closeCart();
  if (b.dataset.goto) document.querySelector(b.dataset.goto)?.scrollIntoView({ behavior: 'smooth' });
}));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCart(); });

function renderCart() {
  const items = Object.entries(cart).filter(([id, q]) => q > 0 && productos.has(id));
  const total = items.reduce((n, [, q]) => n + q, 0);
  $$('[data-cart-count]').forEach((el) => { el.textContent = String(total); el.classList.toggle('has-items', total > 0); });
  $('[data-cart-empty]').hidden = items.length > 0;
  $('[data-order-form]').hidden = items.length === 0;
  $('[data-cart-list]').innerHTML = items.map(([id, q]) => {
    const p = productos.get(id)!;
    return `<li class="cart-item">
      <img src="${p.thumb}" alt="" width="56" height="56">
      <div class="ci-info"><strong>${p.nombre}</strong><span>${p.precio}</span></div>
      <div class="qty" role="group" aria-label="Cantidad de ${p.nombre}">
        <button type="button" data-dec="${id}" aria-label="Quitar uno">−</button>
        <output>${q}</output>
        <button type="button" data-inc="${id}" aria-label="Agregar uno">+</button>
      </div>
    </li>`;
  }).join('');
}

const toastEl = $('[data-toast]');
let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>('[data-add]');
  const inc = t.closest<HTMLElement>('[data-inc]');
  const dec = t.closest<HTMLElement>('[data-dec]');
  if (add) {
    const id = add.dataset.add!;
    cart[id] = (cart[id] || 0) + 1;
    toast(`${productos.get(id)!.nombre} agregado a tu pedido`);
    add.textContent = 'Agregado';
    setTimeout(() => { add.textContent = 'Agregar'; }, 1200);
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  } else if (inc) {
    cart[inc.dataset.inc!]++;
  } else if (dec) {
    const id = dec.dataset.dec!;
    if (--cart[id] <= 0) delete cart[id];
  } else return;
  save();
  renderCart();
});

// Fecha mínima: hoy (hora local)
const fecha = $<HTMLInputElement>('[name="fecha"]');
fecha.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

$<HTMLFormElement>('[data-order-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target as HTMLFormElement);
  const get = (k: string) => String(f.get(k) || '').trim();
  const lines = Object.entries(cart)
    .filter(([id, q]) => q > 0 && productos.has(id))
    .map(([id, q]) => `• ${q} × ${productos.get(id)!.nombre}`);
  let fechaTxt = '';
  if (get('fecha')) {
    const [y, m, d] = get('fecha').split('-');
    fechaTxt = `${d}/${m}/${y}`;
  }
  const msg = [
    `¡Hola Qué Bu! 👋 ${get('nombre') ? `Soy ${get('nombre')}. ` : ''}Quiero hacer este pedido:`,
    '',
    ...lines,
    '',
    fechaTxt && `📅 Fecha de entrega: ${fechaTxt}`,
    get('ocasion') && `🎉 Ocasión: ${get('ocasion')}`,
    get('detalles') && `📝 Detalles: ${get('detalles')}`,
    '',
    '¿Me ayudan con la cotización? Gracias 🫶🏼',
  ].join('\n').replace(/\n{3,}/g, '\n\n');
  window.open(waLink(msg), '_blank', 'noopener');
});

renderCart();
