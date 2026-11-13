# Vite y despliegue serverless (Vercel vs Cloudflare)

Qué papel tiene Vite en el frontend, qué significa *serverless* y en qué se diferencian Vercel y Cloudflare.

Relacionado: [NGINX.md](./NGINX.md), [DOCKER-COMPOSE-EXPLICADO.md](./DOCKER-COMPOSE-EXPLICADO.md).

---

## 1. Vite

Vite es una **herramienta de desarrollo y construcción** (*build tool*). Es una `devDependency`: **no forma parte de la app en producción**. Tiene dos modos:

### `npm run dev` → servidor de desarrollo
- Arranca al instante: no empaqueta todo el proyecto, sirve cada archivo cuando el navegador lo pide, usando los **módulos ES nativos** del navegador (`import`).
- **HMR** (*Hot Module Replacement*): al guardar, sustituye solo el módulo cambiado en el navegador, **sin recargar la página ni perder el estado**.
- Transforma TSX → JS sobre la marcha. En este proyecto usa **SWC** (`@vitejs/plugin-react-swc`), un compilador escrito en Rust, más rápido que Babel.
- No comprueba tipos (eso lo hace `tsc -b` en `npm run build` o tu editor).

### `npm run build` → archivos para producción (`dist/`)
- **Empaqueta** todos los módulos en pocos archivos (con Rollup) → menos peticiones.
- **Minifica** (quita espacios, acorta nombres) y hace **tree-shaking** (elimina el código que no se usa).
- Pone un **hash** en los nombres (`index-CV8PGkMn.js`) → se pueden cachear para siempre (ver `nginx.conf`).
- Sustituye `import.meta.env.*` por sus valores **en ese momento**.

### Implicaciones en este proyecto
1. **En producción no hay Vite ni Node**: solo `dist/` (HTML + JS + CSS). Por eso hace falta *algo* que sirva esos archivos: Nginx en Docker, la CDN en Vercel.
2. **Las variables `VITE_*` se fijan al compilar.** Cambiar `VITE_API_URL` exige volver a construir (en Docker, `--build`; en Vercel, redesplegar).
3. Solo las variables con prefijo `VITE_` llegan al navegador; además existen `import.meta.env.MODE`, `DEV` y `PROD`. **Todo lo que esté en el bundle es público**: nunca metas secretos en variables `VITE_`.
4. `npm run dev` (Vite) y producción no se comportan exactamente igual: por ejemplo, el servidor de Vite hace solo el *fallback* a `index.html` para las rutas de React Router; en producción hay que configurarlo (`try_files` en Nginx, `rewrites` en Vercel).

---

## 2. ¿Qué es *serverless*?

"Sin servidor" no significa que no haya servidores: significa que **tú no gestionas ninguno**.

| | Servidor tradicional (Express con `app.listen`, Docker, una VPS) | Serverless (funciones) |
|---|---|---|
| Proceso | Uno que **vive siempre**, esperando peticiones | Se **crea cuando llega una petición** y puede desaparecer después |
| Escalado | Tú decides cuántas copias | Automático: una petición → una instancia; 0 peticiones → 0 instancias |
| Pago | Por tiempo encendido (aunque nadie lo use) | Por uso (peticiones / tiempo de ejecución) |
| Mantenimiento | SO, actualizaciones, reinicios… | Ninguno |
| Arranque en frío (*cold start*) | No (ya está arrancado) | Sí: la primera petición tras un rato inactivo tarda más |
| Estado en memoria | Persiste entre peticiones | **No es fiable**: cada instancia puede ser nueva |
| Tareas en segundo plano, WebSockets largos | Sin problema | Limitados o no permitidos |

### Por qué importa para este backend
El código de Express está pensado como servidor tradicional, y eso choca con serverless:
- **Trabajo pesado al arrancar**: `initializeApp()` consulta la BD (crear admin) y si falla hace `process.exit(1)`. En serverless esto ocurre en cada arranque en frío, y si falla, mata la función → todas las peticiones dan 500 (lo que está pasando ahora).
- **`app.listen()`**: en serverless no eres tú quien escucha en un puerto; la plataforma llama a tu código. Lo habitual es **exportar la app** (`export default app`) para que la plataforma la use como manejador.
- **Conexiones a la BD**: cada instancia abre las suyas. Con muchas instancias se agotan las conexiones de Postgres. Por eso se usa un **pooler** (el `DATABASE_URL` actual ya usa el *pooler* de Supabase, puerto `6543`).

---

## 3. Vercel vs Cloudflare

Las dos son plataformas para desplegar webs desde Git, con CDN para estáticos y funciones serverless. La gran diferencia está en **cómo ejecutan el backend**.

| | **Vercel** | **Cloudflare** |
|---|---|---|
| Frontend estático | CDN de Vercel | **Cloudflare Pages / Workers Static Assets** |
| Backend | **Vercel Functions**: Node.js real, en una región concreta (p. ej. EE. UU. Este) | **Cloudflare Workers**: se ejecutan en el *edge* (cientos de centros de datos, cerca del usuario) |
| Motor | Contenedor ligero con Node.js completo | **Aislamientos V8** (el motor JS de Chrome), no un proceso Node completo |
| Arranque en frío | Puede notarse (cientos de ms) | Prácticamente nulo (ms) |
| Compatibilidad npm | Casi total (incluidos módulos nativos como `bcrypt`) | Parcial: APIs web estándar + parte de Node (`nodejs_compat`). **Módulos nativos no funcionan** (habría que usar `bcryptjs`); Express necesita adaptación (lo normal es usar Hono u otro framework pensado para Workers) |
| Límites | Más tiempo de ejecución y memoria | CPU por petición más limitada (sobre todo en el plan gratis) |
| Bases de datos | Externas (Supabase, Neon…) | Propias: **D1** (SQLite), **KV**, **R2** (archivos), **Durable Objects**; Postgres externo vía **Hyperdrive** |
| Punto fuerte | Experiencia de desarrollo, Next.js, *previews* por cada PR | Rendimiento global, plan gratuito generoso, sin coste por tráfico saliente |
| Plan gratuito | *Hobby*: solo uso personal / no comercial | Workers: cuota diaria de peticiones gratis, uso comercial permitido |

Resumen:
- **Vercel** ≈ "tu Node de siempre, sin gestionar el servidor". Fácil de llevar un Express existente (con los ajustes de la sección 2).
- **Cloudflare Workers** ≈ "JavaScript ejecutándose en la red de la CDN". Más rápido y barato a escala, pero no es Node completo: suele implicar escribir el backend pensando ya en Workers desde el principio.

> Los límites y precios de ambos cambian a menudo: consulta su web antes de decidir.
