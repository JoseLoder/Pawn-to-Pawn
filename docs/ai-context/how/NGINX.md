# Nginx en Pawn-to-Pawn

Qué es Nginx, de dónde sale en este proyecto, qué hace y por qué está en el frontend.

Relacionado: [DOCKER-COMPOSE-EXPLICADO.md](./DOCKER-COMPOSE-EXPLICADO.md).

---

## 1. ¿Qué es Nginx?

Un **servidor web**: un programa (escrito en C, muy rápido y ligero) que escucha en un puerto, recibe peticiones HTTP y responde. Puede cumplir varios papeles; en cada proyecto se usa para unos u otros:

| Papel | Qué hace |
|---|---|
| **Servidor de archivos estáticos** | Entrega archivos del disco tal cual (HTML, JS, CSS, imágenes). **← Lo que hace en este proyecto.** |
| **Proxy inverso** (*reverse proxy*) | Recibe la petición y la **reenvía** a otro servidor (p. ej. Express), devolviendo su respuesta al cliente. El cliente solo ve a Nginx. Lo que estudiaste. |
| **Balanceador de carga** | Proxy inverso que reparte las peticiones entre varias copias del backend. |
| **Terminación TLS** | Gestiona el HTTPS (certificados) y habla HTTP normal con lo que hay detrás. |

"Orquestar peticiones" se refiere a los papeles de proxy/balanceador. **Aquí Nginx no hace de proxy**: no reenvía nada a Express.

---

## 2. ¿Lo he instalado yo? ¿Cómo está implementado?

**No es una dependencia de npm** ni está en tu `package.json`. No está instalado en tu Mac. Viene **dentro de la imagen de Docker**:

```dockerfile
# react/Dockerfile — etapa final
FROM nginx:1.25-alpine
```

`nginx:1.25-alpine` es la imagen oficial de Nginx en Docker Hub: Alpine Linux con Nginx 1.25 ya instalado. Docker la descarga al construir. Por eso solo existe dentro del contenedor `pawn-to-pawn-frontend`.

Lo que el proyecto sí aporta son **dos cosas**:

1. **Los archivos a servir**: el resultado de `npm run build` (`dist/`), copiado a la carpeta que Nginx sirve:
   ```dockerfile
   COPY --from=builder /app/react/dist /usr/share/nginx/html
   ```
2. **La configuración**: [`react/nginx.conf`](../../../react/nginx.conf), que sustituye a la de por defecto:
   ```dockerfile
   COPY react/nginx.conf /etc/nginx/conf.d/default.conf
   ```

Y se arranca con:
```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```
(`daemon off` = en primer plano; si Nginx se fuera a segundo plano, el contenedor creería que terminó y se pararía.)

---

### ¿Es necesario `nginx.conf`?

Solo para el camino **Docker**: se añadió con la dockerización (noviembre de 2025). No lo usan ni `npm run dev` (Vite) ni Vercel.
Sin él, Nginx usaría su configuración por defecto: serviría los archivos, pero **recargar una ruta de React** (`/admin/show-orders`) daría **404** y se perderían la compresión, la caché y `/health` (del que depende el healthcheck del compose).

En **Vercel** el problema equivalente se resuelve con un `react/vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
Ahora mismo no existe; si al recargar una ruta interna en la web de Vercel te sale 404, es por esto.

## 3. `nginx.conf` línea a línea

```nginx
server {
    listen 80;                       # escucha en el puerto 80 (HTTP) del contenedor
    server_name localhost;
    root /usr/share/nginx/html;      # carpeta donde busca los archivos (el dist/ de React)
    index index.html;                # archivo por defecto al pedir una carpeta
```

```nginx
    gzip on;  gzip_types ...;        # comprime JS/CSS/JSON antes de enviarlos → descargas más rápidas
```

```nginx
    add_header X-Frame-Options "SAMEORIGIN" always;        # impide meter tu web en un <iframe> de otro dominio (clickjacking)
    add_header X-Content-Type-Options "nosniff" always;    # el navegador no "adivina" tipos de archivo
    add_header X-XSS-Protection "1; mode=block" always;    # cabecera antigua anti-XSS (los navegadores modernos la ignoran)
```

```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
```
**La línea más importante para una SPA.** Para cada petición, prueba: ¿existe ese archivo? ¿esa carpeta? Si no, devuelve `index.html`.
¿Por qué? Rutas como `/admin/show-orders` no son archivos: las gestiona **React Router** en el navegador. Si recargas la página en esa ruta, sin esta regla Nginx buscaría `/admin/show-orders` en disco y daría 404. Con ella, devuelve `index.html`, React arranca, lee la URL y pinta la página correcta.

```nginx
    location ~* \.(?:css|js|jpg|...)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
```
Los JS/CSS que genera Vite llevan un hash en el nombre (`index-CV8PGkMn.js`): si cambian, cambia el nombre. Por eso se pueden cachear **un año** en el navegador sin riesgo.

```nginx
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
```
`index.html` **no** se cachea: es el que apunta a los JS con hash nuevos tras cada despliegue.

```nginx
    location /health {
        return 200 "healthy\n";
    }
}
```
Ruta para el healthcheck de Docker: responde sin tocar disco.

---

## 4. ¿Por qué Nginx está en el frontend, si quien recibe las peticiones es el backend?

Porque en una app React hay **dos tipos de peticiones distintas**:

```
① Descargar la app           ② Usar la app (llamadas a la API)

Navegador                       Navegador (React ya ejecutándose)
   │ GET http://localhost/         │ POST http://localhost:3000/users/login
   ▼                               ▼
 Nginx (contenedor frontend)     Express (contenedor backend)
   │ devuelve index.html, JS, CSS  │ consulta Postgres
   ▼                               ▼
 React se ejecuta EN EL          responde JSON
 NAVEGADOR
```

1. React **no es un servidor**. Tras `npm run build` es solo un puñado de archivos estáticos. **Alguien** tiene que entregarlos al navegador: ese es Nginx. (`npm run dev` usa el servidor de Vite, que es solo para desarrollo.)
2. Después, el JavaScript que corre en el navegador llama **directamente** a Express en `http://localhost:3000` (`VITE_API_URL`). Esas peticiones **no pasan por Nginx**.

Así que Nginx no compite con el backend: sirve la *aplicación*; Express sirve los *datos*.

**En Vercel** pasa lo mismo, pero no ves Nginx: la CDN de Vercel hace el papel de servidor de archivos estáticos para el frontend.

### Alternativa habitual: Nginx también como proxy inverso

Se podría añadir a `nginx.conf`:
```nginx
location /api/ {
    proxy_pass http://backend:3000/;   # "backend" = nombre del servicio en docker-compose
}
```
y usar `VITE_API_URL=/api`. Entonces todo entraría por un único puerto (`localhost`): Nginx serviría la app y reenviaría `/api/...` a Express. Ventajas: frontend y backend en el **mismo origen** (no hace falta CORS y las cookies son más sencillas) y no hay que exponer el puerto 3000. Aquí sí estaría "orquestando" peticiones. En este proyecto todavía no está hecho así.
