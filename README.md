# ¡Qué Bu! Postres — web

Sitio en [Astro](https://astro.build). Vitrina de productos + pedido armado que se envía por WhatsApp.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera /dist listo para subir (Netlify, Vercel, Hostinger…)
```

## Dónde editar

| Qué | Archivo |
| --- | --- |
| Productos, descripciones, precios | `src/data/productos.ts` (agrega `precio: 'S/ 85'`) |
| WhatsApp y redes | `src/data/site.ts` |
| Secciones | `src/components/*.astro` |
| Colores y estilos | `src/styles/global.css` (variables en `:root`) |
| Fotos | `src/assets/img/` (Astro las optimiza a WebP) |
| Dominio final | `astro.config.mjs` → `site` |

`_version-html/` guarda la versión anterior en HTML plano, solo como respaldo.
