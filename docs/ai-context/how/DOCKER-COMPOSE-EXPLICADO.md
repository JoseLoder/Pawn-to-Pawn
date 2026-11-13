# Cómo funciona Docker y el `docker-compose.yml` de Pawn-to-Pawn

Guía conceptual: qué es Docker, y qué hace cada línea de [`docker-compose.yml`](../../../docker-compose.yml), de dónde sale y por qué está ahí.
Para los comandos de uso del día a día, ver [DOCKER.md](./DOCKER.md).

---

## 1. ¿Qué es Docker?

Docker empaqueta una aplicación **junto con todo lo que necesita para ejecutarse** (sistema operativo mínimo, Node, librerías, archivos) en una unidad aislada. Así "en mi máquina funciona" pasa a ser "funciona igual en cualquier máquina con Docker".

Cuatro conceptos clave:

| Concepto | Qué es | Analogía |
|---|---|---|
| **Imagen** | Plantilla de solo lectura con el SO + dependencias + tu código. Se construye a partir de un `Dockerfile` o se descarga de Docker Hub. | La receta / el molde |
| **Contenedor** | Una instancia en ejecución de una imagen. Es un proceso aislado con su propio sistema de archivos y red. | El pastel hecho con el molde |
| **Volumen** | Almacenamiento que vive *fuera* del contenedor. Si borras el contenedor, los datos del volumen sobreviven. | Un disco externo |
| **Red** | Una red virtual que conecta contenedores entre sí; se encuentran por nombre. | Un router privado |

Un contenedor **no es una máquina virtual**: comparte el kernel del sistema anfitrión, por eso arranca en segundos y pesa poco.

### ¿Y Docker Compose?

Este proyecto necesita **tres** contenedores (base de datos, backend, frontend). Levantarlos a mano exigiría tres `docker run` larguísimos con puertos, redes, variables… **Docker Compose** permite describirlos todos en un único archivo YAML y arrancarlos con:

```bash
docker compose up -d     # construye (si hace falta) y arranca todo en segundo plano
docker compose down      # para y elimina los contenedores (los volúmenes se conservan)
```

---

## 2. Visión general

```
                  Tu navegador
         http://localhost      http://localhost:3000
                │                      │
   ┌────────────┼──────────────────────┼────────────────────┐
   │  red: pawn-to-pawn-network        │                    │
   │            ▼                      ▼                    │
   │   ┌──────────────┐       ┌────────────────┐            │
   │   │  frontend    │       │   backend      │            │
   │   │  nginx :80   │       │  express :3000 │            │
   │   └──────────────┘       └───────┬────────┘            │
   │                                  │ postgres:5432       │
   │                                  ▼                     │
   │                          ┌────────────────┐            │
   │                          │   postgres     │──► volumen │
   │                          │   :5432        │  postgres_data
   │                          └────────────────┘            │
   └────────────────────────────────────────────────────────┘
```

Orden de arranque: `postgres` → (cuando está *healthy*) `backend` → `frontend`.

---

## 3. El archivo línea por línea

### `version: '3.8'`

Indicaba la versión del formato de Compose. **Hoy está obsoleta**: Docker Compose v2 la ignora y muestra un aviso. Se puede borrar sin consecuencias.

### `services:`

Lista de contenedores. Cada clave (`postgres`, `backend`, `frontend`) es un servicio, y **ese nombre se convierte en el nombre de host dentro de la red**. Por eso el backend se conecta a `postgres:5432` y no a `localhost:5432`.

---

### 3.1 Servicio `postgres` (base de datos)

```yaml
postgres:
  image: postgres:16-alpine
```
- **`image`**: no se construye nada; se descarga la imagen oficial de [Docker Hub](https://hub.docker.com/_/postgres).
- `16` = versión de PostgreSQL. `alpine` = variante basada en Alpine Linux (~80 MB frente a ~400 MB de la basada en Debian).

```yaml
  container_name: pawn-to-pawn-db
```
Nombre fijo del contenedor (si no, Compose genera algo como `pawn-to-pawn-postgres-1`). Sirve para comandos como `docker logs pawn-to-pawn-db`.

```yaml
  restart: unless-stopped
```
Política de reinicio: si el contenedor se cae o reinicias Docker/el ordenador, vuelve a arrancar solo; **salvo** que lo hayas parado tú con `docker stop`. Otras opciones: `no`, `always`, `on-failure`.

```yaml
  environment:
    POSTGRES_DB: ${POSTGRES_DB:-pawnshop}
    POSTGRES_USER: ${POSTGRES_USER:-postgres}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
```
- Estas tres variables **las define la imagen oficial de Postgres**: en el primer arranque crea esa base de datos, ese usuario y esa contraseña.
- Sintaxis `${VAR:-defecto}`: Compose busca `VAR` en tu shell o en el archivo **`.env` de la raíz** (lo lee automáticamente). Si no existe o está vacía, usa el valor tras `:-`. La plantilla está en [`.env.example`](../../../.env.example).

```yaml
  ports:
    - "5432:5432"
```
Formato `"PUERTO_HOST:PUERTO_CONTENEDOR"`. Expone Postgres en tu máquina para conectarte con DBeaver, TablePlus, `psql`… Los otros contenedores **no necesitan** este mapeo: dentro de la red se ven directamente. (Si ya tienes un Postgres local en el 5432, cambia el de la izquierda, p. ej. `"5433:5432"`.)

```yaml
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```
- **Línea 1 — volumen con nombre**: `/var/lib/postgresql/data` es donde Postgres guarda los datos. Al montarlo en el volumen `postgres_data` (declarado al final del archivo) los datos **persisten** aunque borres el contenedor.
- **Línea 2 — bind mount**: monta tu archivo local [`database/init.sql`](../../../database/init.sql) dentro del contenedor. La imagen oficial ejecuta todo lo que haya en `/docker-entrypoint-initdb.d/` **solo la primera vez**, cuando el directorio de datos está vacío. Así se crean las tablas automáticamente.
  - `:ro` = *read-only*, el contenedor no puede modificar tu archivo.
  - ⚠️ Si cambias `init.sql` después, no se vuelve a ejecutar. Hay que borrar el volumen: `docker compose down -v` (borra los datos).

```yaml
  networks:
    - pawn-to-pawn-network
```
Conecta el contenedor a la red declarada al final.

```yaml
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
    interval: 10s
    timeout: 5s
    retries: 5
```
- Que el contenedor esté "corriendo" no significa que Postgres acepte conexiones (tarda unos segundos en iniciar). El healthcheck lo comprueba.
- `pg_isready` es una utilidad que viene con Postgres; devuelve 0 si el servidor acepta conexiones.
- `CMD-SHELL` ejecuta el comando a través de una shell (`/bin/sh -c`); `CMD` lo ejecuta directamente.
- Cada 10 s, máximo 5 s de espera, 5 fallos seguidos → estado `unhealthy`.
- Esto es lo que permite que el backend espere (ver `depends_on` abajo).

---

### 3.2 Servicio `backend` (Express)

```yaml
backend:
  build:
    context: .
    dockerfile: express/Dockerfile
```
- **`build`** en lugar de `image`: la imagen se construye a partir de tu código.
- **`context: .`** = la carpeta que se envía a Docker para construir es **la raíz del repo**, no `express/`. ¿Por qué? Porque el backend depende de `shared/` (`file:../shared`), y un Dockerfile solo puede copiar archivos que estén dentro del contexto. Si el contexto fuera `express/`, `shared/` sería inaccesible.
- **`dockerfile`**: ruta al Dockerfile, relativa al contexto → [`express/Dockerfile`](../../../express/Dockerfile).

Resumen de lo que hace ese Dockerfile (*multi-stage build*):
1. **Etapa `builder`** (`node:20-alpine`): copia `shared/`, instala dependencias, copia el código de `express/` y compila TypeScript → `build/`.
2. **Etapa final**: parte de una imagen limpia y copia solo `build/`, `node_modules` y `package.json`. El código TypeScript y las herramientas de compilación se quedan fuera → imagen más pequeña.
3. Crea un usuario sin privilegios `nodejs` y ejecuta la app con él (si alguien explota la app, no es *root*).
4. `CMD ["npm", "start"]` → `node build/index.js`.

```yaml
  container_name: pawn-to-pawn-backend
  restart: unless-stopped
```
Igual que en postgres.

```yaml
  ports:
    - "${BACKEND_PORT:-3000}:3000"
```
Dentro del contenedor la app escucha siempre en el 3000; en tu máquina puedes elegir otro puerto con `BACKEND_PORT` en `.env`.

```yaml
  environment:
    NODE_ENV: ${NODE_ENV:-production}
    PORT: 3000
    DATABASE_URL: ${DATABASE_URL:-postgresql://postgres:postgres@postgres:5432/pawnshop?sslmode=disable}
    SECRET_JWT_KEY: ${SECRET_JWT_KEY}
    FRONTEND_URL: ${FRONTEND_URL:-http://localhost}
    ADMIN_ID_NUMBER: ${ADMIN_ID_NUMBER}
    ADMIN_NAME: ${ADMIN_NAME}
    ADMIN_EMAIL: ${ADMIN_EMAIL}
    ADMIN_DEFAULT_PASSWORD: ${ADMIN_DEFAULT_PASSWORD}
```
Son **las mismas variables que el backend lee de `express/.env`** en desarrollo normal (ver CLAUDE.md → *Environment Configuration*). Se inyectan aquí en tiempo de ejecución porque meter secretos dentro de una imagen es mala práctica. (⚠️ Ver sección 5: ahora mismo el `.dockerignore` no está funcionando y `express/.env` sí acaba dentro de la imagen.)
- `PORT: 3000` fijo, porque tiene que coincidir con el lado derecho de `ports`.
- `DATABASE_URL` por defecto apunta a **`@postgres:5432`**: `postgres` es el nombre del servicio, resuelto por el DNS interno de la red de Docker.
  - `sslmode=disable`: el Postgres local del contenedor no tiene SSL (Supabase sí lo requiere). Para usar Supabase en vez del Postgres local, basta con poner su URL en `DATABASE_URL` del `.env`.
- `SECRET_JWT_KEY` y `ADMIN_*` **no tienen valor por defecto** a propósito: son secretos y deben venir de tu `.env`. Si faltan, Compose avisa y quedan vacíos.
- `FRONTEND_URL` se usa para CORS; `http://localhost` porque el frontend de Docker sale por el puerto 80.

```yaml
  depends_on:
    postgres:
      condition: service_healthy
```
No arranca el backend hasta que el healthcheck de postgres diga `healthy`. Sin esto, el backend arrancaría antes que la BD, fallaría `AdminManager.initializeAdmin()` y el proceso haría `process.exit(1)`.

```yaml
  networks:
    - pawn-to-pawn-network
  healthcheck:
    test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```
- Hace una petición a la ruta `GET /health` definida en [`express/src/index.ts`](../../../express/src/index.ts).
- Se usa `node -e` en vez de `curl` porque la imagen alpine de Node **no trae curl**, pero Node sí está.
- `start_period: 40s`: periodo de gracia al arrancar; los fallos durante ese tiempo no cuentan.
- Este healthcheck **sobrescribe** el `HEALTHCHECK` que también está en el Dockerfile.

---

### 3.3 Servicio `frontend` (React + Nginx)

```yaml
frontend:
  build:
    context: .
    dockerfile: react/Dockerfile
    args:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3000}
```
- Mismo motivo para `context: .` (necesita `shared/`).
- **`args`** son *build arguments*: se pasan **al construir la imagen**, no al ejecutarla. El Dockerfile los recibe con `ARG VITE_API_URL`.
- ¿Por qué un build arg y no `environment`? Porque React no se ejecuta en el servidor: Vite **incrusta** las variables `VITE_*` en el JavaScript durante `npm run build`. Después, el resultado son archivos estáticos que se ejecutan en el navegador del usuario y ya no pueden leer variables de entorno del contenedor.
  - Consecuencia: si cambias `VITE_API_URL`, hay que **reconstruir**: `docker compose up -d --build frontend`.
- Vale `http://localhost:3000` (y no `http://backend:3000`) porque quien hace las peticiones es **tu navegador**, que está fuera de la red de Docker y no conoce el nombre `backend`.

[`react/Dockerfile`](../../../react/Dockerfile) también es multi-stage:
1. **Etapa `builder`** (Node): `npm ci` + `npm run build` → carpeta `dist/` con HTML/JS/CSS estáticos.
2. **Etapa final** (`nginx:1.25-alpine`): copia solo `dist/` a la carpeta que sirve Nginx. Node desaparece por completo de la imagen final; un servidor web es mucho más ligero y rápido sirviendo archivos estáticos.
3. Usa [`react/nginx.conf`](../../../react/nginx.conf), que entre otras cosas:
   - `try_files $uri $uri/ /index.html;` → cualquier ruta (`/admin/orders`) devuelve `index.html` para que React Router la gestione. Sin esto, recargar la página en una ruta daría 404.
   - Define `location /health` que responde 200, usado por el healthcheck.

```yaml
  container_name: pawn-to-pawn-frontend
  restart: unless-stopped
  ports:
    - "${FRONTEND_PORT:-80}:80"
```
Nginx escucha en el 80 dentro del contenedor. En tu máquina, `http://localhost` (el 80 es el puerto HTTP por defecto, por eso no hace falta escribirlo).

```yaml
  depends_on:
    - backend
```
Forma corta: solo espera a que el contenedor del backend **se haya iniciado**, no a que esté *healthy*. Es suficiente porque Nginx no necesita al backend para arrancar; es el navegador quien llamará a la API más tarde.

```yaml
  networks:
    - pawn-to-pawn-network
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```
Aquí se usa `wget` porque la imagen de Nginx alpine trae BusyBox con `wget` (pero no Node ni curl). `--spider` = comprobar que la URL responde sin descargar el contenido.

---

### 3.4 Redes y volúmenes (nivel superior)

```yaml
networks:
  pawn-to-pawn-network:
    driver: bridge
```
Declara la red. `bridge` es el driver estándar para contenedores en una misma máquina: crea una red privada virtual con **DNS interno** (por eso funcionan nombres como `postgres`). Compose crearía una red por defecto aunque no la declararas; declararla explícitamente le da un nombre claro y deja claro qué servicios se comunican.

```yaml
volumes:
  postgres_data:
    driver: local
```
Declara el volumen con nombre usado por postgres. `local` = se guarda en el disco de la máquina anfitriona (gestionado por Docker). Comandos útiles:
```bash
docker volume ls                   # listar volúmenes
docker compose down -v             # parar todo Y borrar volúmenes (pierdes la BD)
```

---

## 4. ¿De dónde sale cada cosa? (resumen)

| Elemento | Origen |
|---|---|
| `services`, `image`, `build`, `ports`, `volumes`, `networks`, `depends_on`, `healthcheck`, `restart`, `environment` | Especificación de Docker Compose ([docs](https://docs.docker.com/reference/compose-file/)) |
| `POSTGRES_DB/USER/PASSWORD`, `/docker-entrypoint-initdb.d/`, `/var/lib/postgresql/data` | Documentación de la imagen oficial `postgres` en Docker Hub |
| `pg_isready` | Utilidad incluida en PostgreSQL |
| `DATABASE_URL`, `SECRET_JWT_KEY`, `FRONTEND_URL`, `ADMIN_*`, `PORT` | Las variables que lee el código del backend (`express/src`) |
| `VITE_API_URL` | Convención de Vite: solo las variables con prefijo `VITE_` llegan al código del navegador |
| `/health` | Rutas definidas por el proyecto: `express/src/index.ts` y `react/nginx.conf` |
| `${VAR:-defecto}` | Interpolación de Compose, leyendo el `.env` de la raíz |

---

## 5. Cosas a tener en cuenta / mejoras pendientes

1. **`version: '3.8'` sobra** — se puede eliminar para quitar el aviso.
2. **`.dockerignore` en la raíz (arreglado).** Docker solo lee el `.dockerignore` de la **raíz del contexto**; como el contexto es la raíz del repo (`context: .`), los antiguos `express/.dockerignore` y `react/.dockerignore` no se aplicaban y se colaban en la imagen los `node_modules` de macOS (rompiendo binarios nativos como `bcrypt`, `esbuild` o `@swc` en Alpine) y `express/.env` con secretos reales. Ahora hay un único [`.dockerignore`](../../../.dockerignore) en la raíz con patrones `**/node_modules`, `**/.env*`, `**/build`, `**/dist`…, y se eliminaron los de cada carpeta. Los patrones llevan `**/` porque se evalúan relativos a la raíz del contexto: `node_modules` a secas solo excluiría `./node_modules`.
3. **No cambies `NODE_ENV` a `development` en Docker sin más.** El backend pone las cookies con `sameSite: 'none'` y `secure: NODE_ENV === 'production'`. Los navegadores rechazan `SameSite=None` sin `Secure`, así que con `development` el login no guardaría las cookies. Con `production` funciona en `http://localhost` porque los navegadores tratan `localhost` como contexto seguro.
4. **`init.sql` solo se ejecuta la primera vez** — tras cambiar el esquema, `docker compose down -v`.
5. **Dependencias del backend (arreglado).** Antes se hacía `npm ci --only=production && npm ci --only=development`: `npm ci` borra `node_modules` antes de instalar y en npm ≥ 7 `--only=development` no es un valor reconocido, así que se instalaba todo y la imagen final llevaba TypeScript, ts-node-dev, etc. Ahora el builder hace `npm ci` (necesita TypeScript para compilar) y la etapa final hace su propio `npm ci --omit=dev`.

---

## 6. Los Dockerfile: cómo se construye cada imagen

Un **Dockerfile** es la receta para construir una imagen propia. Cada instrucción crea una *capa*; Docker guarda en caché las capas y solo rehace desde la primera que cambie.

Instrucciones que aparecen:

| Instrucción | Qué hace |
|---|---|
| `FROM imagen AS nombre` | Imagen de partida. Con `AS` se le da nombre a una etapa. |
| `WORKDIR /ruta` | Directorio de trabajo (como `cd`; lo crea si no existe). |
| `COPY origen destino` | Copia archivos **del contexto** (tu repo) a la imagen. |
| `COPY --from=etapa ...` | Copia archivos de **otra etapa** del mismo Dockerfile. |
| `RUN comando` | Ejecuta un comando **al construir** (instalar, compilar). |
| `ARG` / `ENV` | Variable solo de construcción / variable que queda en la imagen. |
| `USER` | Usuario con el que se ejecuta lo siguiente y el contenedor. |
| `EXPOSE` | Documenta el puerto que usa la app (no lo publica; eso lo hace `ports` en Compose). |
| `HEALTHCHECK` | Comprobación de salud por defecto (Compose la puede sobrescribir). |
| `CMD` | Comando que se ejecuta **al arrancar el contenedor**. |

### Multi-stage build (los dos Dockerfile lo usan)

Hay dos `FROM`: la primera etapa (`builder`) tiene todo lo necesario para **compilar**; la segunda empieza de cero y solo copia el **resultado**. Todo lo de la etapa 1 que no se copie se descarta → imagen final más pequeña y con menos superficie de ataque.

### `express/Dockerfile`

**Etapa 1 — builder (`node:20-alpine`)**
1. `COPY shared/ ./shared/` + `npm install` → prepara el paquete de tipos compartidos, porque `express/package.json` lo referencia como `file:../shared`. Por eso queda en `/app/shared` y el backend en `/app/express`: se mantiene la misma estructura relativa (`../shared`) que en tu repo.
2. `COPY express/package*.json ./` **antes** del código y luego `npm ci` → truco de caché: si solo cambias código y no dependencias, Docker reutiliza la capa de `npm ci` y no reinstala todo.
3. `COPY express/ ./` → copia el código fuente.
4. `RUN npm run tsc` → compila TypeScript a `build/`.

**Etapa 2 — producción (`node:20-alpine` limpia)**
1. Copia `shared` y `package*.json` desde el builder, ejecuta `npm ci --omit=dev` (solo dependencias de producción) y copia `build/`. Ni el código `.ts` ni las devDependencies llegan a la imagen final.
2. `addgroup`/`adduser` + `chown` + `USER nodejs` → la app no corre como *root*.
3. `EXPOSE 3000`, `HEALTHCHECK` contra `/health`.
4. `CMD ["npm", "start"]` → `node build/index.js`.

### `react/Dockerfile`

**Etapa 1 — builder (`node:20-alpine`)**
1. Igual: `shared/`, luego `package*.json` + `npm ci`, luego el código.
2. `ARG VITE_API_URL` + `ENV VITE_API_URL=$VITE_API_URL` → recibe el valor de `build.args` del compose y lo deja como variable de entorno para que Vite lo vea.
3. `RUN npm run build` → reinstala `../shared`, ejecuta `tsc -b` (comprobación de tipos) y `vite build`, que genera `dist/`: HTML, JS y CSS estáticos con la URL de la API ya incrustada.

**Etapa 2 — producción (`nginx:1.25-alpine`)**
1. `COPY react/nginx.conf /etc/nginx/conf.d/default.conf` → sustituye la configuración por defecto de Nginx por la del proyecto.
2. `COPY --from=builder /app/react/dist /usr/share/nginx/html` → la carpeta que Nginx sirve.
3. Usuario sin privilegios y `chown` de las carpetas que Nginx necesita escribir (caché, logs, pid).
4. `CMD ["nginx", "-g", "daemon off;"]` → Nginx en primer plano. Un contenedor vive mientras viva su proceso principal; si Nginx se fuera a segundo plano (daemon), el contenedor se pararía al instante.

Node no existe en la imagen final del frontend: React compilado son solo archivos estáticos.

### ¿Por qué `postgres` no tiene Dockerfile?

Un Dockerfile solo hace falta cuando hay que **meter tu código** en una imagen. Postgres es software ya hecho, que no se modifica: la imagen oficial `postgres:16-alpine` ya está construida y publicada en Docker Hub, así que basta con `image:`. Todo lo que se personaliza se hace **desde fuera**, sin reconstruir:

- Usuario, contraseña y nombre de la BD → variables `POSTGRES_*` en `environment`.
- Esquema inicial → montar `init.sql` en `/docker-entrypoint-initdb.d/` (la imagen oficial ejecuta esos scripts en el primer arranque).
- Datos → volumen `postgres_data`.

Solo se escribiría un Dockerfile para Postgres si hiciera falta algo que la imagen no trae (p. ej. instalar una extensión como PostGIS): `FROM postgres:16-alpine` + `RUN ...`.

Resumen: **`build:`** = "constrúyeme una imagen con mi código" (backend, frontend); **`image:`** = "usa una imagen que ya existe" (postgres).
