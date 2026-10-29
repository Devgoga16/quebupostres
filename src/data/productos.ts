import type { ImageMetadata } from 'astro';
import tortaFlores from '../assets/img/torta-flores.jpg';
import tortaFresas from '../assets/img/torta-fresas.jpg';
import tortaVintage from '../assets/img/torta-vintage.jpg';
import tortaPapelArroz from '../assets/img/torta-papel-arroz.jpg';
import tortaTematica from '../assets/img/torta-tematica.jpg';
import fudge from '../assets/img/fudge-de-olla.jpg';
import miniBox from '../assets/img/mini-box-bocaditos.jpg';
import floresAmarillas from '../assets/img/flores-amarillas.jpg';

export type Categoria = 'tortas' | 'postres' | 'bocaditos' | 'regalos';

export interface Producto {
  id: string;
  cat: Categoria;
  nombre: string;
  desc: string;
  img: ImageMetadata;
  badge?: string;
  /** Precios no publicados aún → "A cotizar". Ej.: precio: 'S/ 85' */
  precio?: string;
}

export const CATEGORIAS: { id: Categoria | 'todo'; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'tortas', label: 'Tortas personalizadas' },
  { id: 'postres', label: 'Postres' },
  { id: 'bocaditos', label: 'Bocaditos' },
  { id: 'regalos', label: 'Para regalar' },
];

// Productos tomados de las publicaciones de @quebupostres.
export const PRODUCTOS: Producto[] = [
  { id: 'torta-flores', cat: 'tortas', nombre: 'Torta con flores', img: tortaFlores,
    desc: 'Elegante y divertida, con flores y tu mensaje. De los diseños más pedidos.', badge: 'Más pedida' },
  { id: 'torta-fresas', cat: 'tortas', nombre: 'Torta de fresas', img: tortaFresas,
    desc: 'Pétalos de buttercream blanco coronados con fresas frescas. Elegancia y frescura.' },
  { id: 'torta-vintage', cat: 'tortas', nombre: 'Torta vintage', img: tortaVintage,
    desc: 'Decoración clásica en buttercream con guirnaldas y perlas.' },
  { id: 'torta-papel-arroz', cat: 'tortas', nombre: 'Torta en papel de arroz', img: tortaPapelArroz,
    desc: 'Técnica en papel de arroz empastada en buttercream para realzar tu diseño.' },
  { id: 'torta-tematica', cat: 'tortas', nombre: 'Torta temática', img: tortaTematica,
    desc: 'Tu personaje, tu estilo, tu chiste interno. Nada de tortas sin personalidad.' },
  { id: 'fudge-de-olla', cat: 'postres', nombre: 'Fudge de olla', img: fudge,
    desc: 'Full fudge de olla y bien húmeda. Para los que aman el chocolate de verdad.', badge: 'Chocolate' },
  { id: 'mini-box', cat: 'bocaditos', nombre: 'Mini box de bocaditos', img: miniBox,
    desc: 'Arma la tuya con tus favoritos de la carta. Ideal para tus invitados.' },
  { id: 'ramo-postre', cat: 'regalos', nombre: 'Ramo + postre', img: floresAmarillas,
    desc: 'Ramo de flores con postre(s) a elección y nota dedicatoria. Disponible en campañas.', badge: 'Campaña' },
];
