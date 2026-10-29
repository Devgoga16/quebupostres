// ¡Qué Bu! Postres — vitrina + pedido por WhatsApp
const WHATSAPP = '51970752530';

// Productos tomados de las publicaciones de @quebupostres.
// Precios: no publicados → "A cotizar". Para mostrar un precio, agrega `precio: 'S/ 00'`.
const PRODUCTOS = [
  { id: 'torta-flores', cat: 'tortas', nombre: 'Torta con flores', img: 'torta-flores.jpg',
    desc: 'Elegante y divertida, con flores y tu mensaje. De los diseños más pedidos.', badge: 'Más pedida' },
  { id: 'torta-fresas', cat: 'tortas', nombre: 'Torta de fresas', img: 'torta-fresas.jpg',
    desc: 'Pétalos de buttercream blanco coronados con fresas frescas. Elegancia y frescura.' },
  { id: 'torta-vintage', cat: 'tortas', nombre: 'Torta vintage', img: 'torta-vintage.jpg',
    desc: 'Decoración clásica en buttercream con guirnaldas y perlas.' },
  { id: 'torta-papel-arroz', cat: 'tortas', nombre: 'Torta en papel de arroz', img: 'torta-papel-arroz.jpg',
    desc: 'Técnica en papel de arroz empastada en buttercream para realzar tu diseño.' },
  { id: 'torta-tematica', cat: 'tortas', nombre: 'Torta temática', img: 'torta-tematica.jpg',
    desc: 'Tu personaje, tu estilo, tu chiste interno. Nada de tortas sin personalidad.' },
  { id: 'fudge-de-olla', cat: 'postres', nombre: 'Fudge de olla', img: 'fudge-de-olla.jpg',
    desc: 'Full fudge de olla y bien húmeda. Para los que aman el chocolate de verdad.', badge: 'Chocolate' },
  { id: 'mini-box', cat: 'bocaditos', nombre: 'Mini box de bocaditos', img: 'mini-box-bocaditos.jpg',
    desc: 'Arma la tuya con tus favoritos de la carta. Ideal para tus invitados.' },
  { id: 'ramo-postre', cat: 'regalos', nombre: 'Ramo + postre', img: 'flores-amarillas.jpg',
    desc: 'Ramo de flores con postre(s) a elección y nota dedicatoria. Disponible en campañas.', badge: 'Campaña' },
];

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Enlaces directos a WhatsApp
$$('[data-wa]').forEach((a) => {
  a.href = waLink(a.dataset.wa);
  a.target = '_blank';
  a.rel = 'noopener';
});
$('[data-year]').textContent = new Date().getFullYear();

// ---------- Pedido (persistencia solo por comodidad) ----------
let cart = {};
try { cart = JSON.parse(localStorage.getItem('qb-pedido') || '{}'); } catch (e) { cart = {}; }
const save = () => { try { localStorage.setItem('qb-pedido', JSON.stringify(cart)); } catch (e) {} };

// ---------- Catálogo ----------
const catalogEl = $('[data-catalog]');
catalogEl.innerHTML = PRODUCTOS.map((p) => `
  <article class="product" data-cat="${p.cat}">
    <div class="product-media">
      <img src="assets/img/${p.img}" alt="${p.nombre}" loading="lazy" width="480" height="640">
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
    </div>
    <div class="product-body">
      <h3>${p.nombre}</h3>
      <p>${p.desc}</p>
      <div class="product-foot">
        <span class="price">${p.precio || 'A cotizar'}</span>
        <div class="product-actions">
          <a class="icon-btn wa" href="${waLink(`Hola Qué Bu! Quiero consultar por: ${p.nombre}`)}" target="_blank" rel="noopener" aria-label="Consultar ${p.nombre} por WhatsApp">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z"/></svg>
          </a>
          <button type="button" class="btn btn-ink btn-sm" data-add="${p.id}">Agregar</button>
        </div>
      </div>
    </div>
  </article>`).join('');

$$('.chip').forEach((chip) => chip.addEventListener('click', () => {
  $$('.chip').forEach((c) => { c.classList.toggle('is-active', c === chip); c.setAttribute('aria-pressed', c === chip); });
  const f = chip.dataset.filter;
  $$('.product').forEach((el) => { el.hidden = f !== 'todo' && el.dataset.cat !== f; });
}));

// ---------- Drawer ----------
const drawer = $('#pedido');
const scrim = $('.drawer-scrim');
let lastFocus = null;

function openCart() {
  lastFocus = document.activeElement;
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
  if (lastFocus) lastFocus.focus();
}
$$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
$$('[data-close-cart]').forEach((b) => b.addEventListener('click', () => {
  closeCart();
  if (b.dataset.goto) document.querySelector(b.dataset.goto).scrollIntoView({ behavior: 'smooth' });
}));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeCart(); });

function renderCart() {
  const items = Object.entries(cart).filter(([, q]) => q > 0);
  const total = items.reduce((n, [, q]) => n + q, 0);
  $$('[data-cart-count]').forEach((el) => { el.textContent = total; el.classList.toggle('has-items', total > 0); });
  $('[data-cart-empty]').hidden = items.length > 0;
  $('[data-order-form]').hidden = items.length === 0;
  $('[data-cart-list]').innerHTML = items.map(([id, q]) => {
    const p = PRODUCTOS.find((x) => x.id === id);
    if (!p) return '';
    return `<li class="cart-item">
      <img src="assets/img/${p.img}" alt="" width="56" height="56">
      <div class="ci-info"><strong>${p.nombre}</strong><span>${p.precio || 'A cotizar'}</span></div>
      <div class="qty" role="group" aria-label="Cantidad de ${p.nombre}">
        <button type="button" data-dec="${id}" aria-label="Quitar uno">−</button>
        <output>${q}</output>
        <button type="button" data-inc="${id}" aria-label="Agregar uno">+</button>
      </div>
    </li>`;
  }).join('');
}

const toastEl = $('[data-toast]');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
}

document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  if (add) {
    const id = add.dataset.add;
    cart[id] = (cart[id] || 0) + 1;
    const p = PRODUCTOS.find((x) => x.id === id);
    toast(`${p.nombre} agregado a tu pedido`);
    add.textContent = 'Agregado';
    setTimeout(() => { add.textContent = 'Agregar'; }, 1200);
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  } else if (inc) {
    cart[inc.dataset.inc]++;
  } else if (dec) {
    cart[dec.dataset.dec]--;
    if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec];
  } else return;
  save();
  renderCart();
});

// Fecha mínima: hoy
const fecha = $('[name="fecha"]');
fecha.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

$('[data-order-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const lines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => {
    const p = PRODUCTOS.find((x) => x.id === id);
    return `• ${q} × ${p.nombre}`;
  });
  let fechaTxt = '';
  if (f.get('fecha')) {
    const [y, m, d] = f.get('fecha').split('-');
    fechaTxt = `${d}/${m}/${y}`;
  }
  const msg = [
    `¡Hola Qué Bu! 👋 ${f.get('nombre') ? `Soy ${f.get('nombre')}. ` : ''}Quiero hacer este pedido:`,
    '',
    ...lines,
    '',
    fechaTxt && `📅 Fecha de entrega: ${fechaTxt}`,
    f.get('ocasion') && `🎉 Ocasión: ${f.get('ocasion')}`,
    f.get('detalles') && `📝 Detalles: ${f.get('detalles')}`,
    '',
    '¿Me ayudan con la cotización? Gracias 🫶🏼',
  ].filter((l) => typeof l === 'string').join('\n').replace(/\n{3,}/g, '\n\n');
  window.open(waLink(msg), '_blank', 'noopener');
});

renderCart();
