# Comandos del proyecto Pawn-to-Pawn

Guía de estudio con los comandos que necesitas para trabajar con el proyecto (Docker + Node + Express + PostgreSQL + React), qué hace cada uno y cuándo usarlo.

Relacionado: [DOCKER-COMPOSE-EXPLICADO.md](./DOCKER-COMPOSE-EXPLICADO.md) (qué hace cada línea de `docker-compose.yml` y de los Dockerfile).

> **Convención:** todos los comandos `docker compose` se ejecutan desde la **raíz del repo** (donde está `docker-compose.yml`). Los comandos `npm` se ejecutan dentro de `express/`, `react/` o `shared/` según se indique.
>
> Los ejemplos de base de datos usan el usuario `postgres` y la base `pawnshop`, que son los valores por defecto. Si los cambiaste en `.env` (`POSTGRES_USER`, `POSTGRES_DB`), sustitúyelos.

---

## 0. Anatomía de un comando `docker compose`

```bash
docker compose  <subcomando>  [opciones]  [servicio...]
#   │              │              │            └─ postgres | backend | frontend (si no pones ninguno: todos)
#   │              │              └─ -d, -f, --build...
#   │              └─ up, down, logs, exec...
#   └─ la herramienta (Compose v2 viene integrada en Docker Desktop)
```

Los **nombres de servicio** son las claves de `services:` en `docker-compose.yml`: `postgres`, `backend`, `frontend`. Casi todos los subcomandos aceptan uno o varios.

> Si ves tutoriales con `docker-compose` (con guion): es la versión antigua (v1). Hoy se usa `docker compose` (con espacio).

---

## 1. Primera vez

```bash
cp .env.example .env
```
Crea tu archivo de configuración a partir de la plantilla. **Edítalo** después: como mínimo `SECRET_JWT_KEY`, `POSTGRES_PASSWORD` (y la misma contraseña dentro de `DATABASE_URL`) y `ADMIN_DEFAULT_PASSWORD`. Compose lee este `.env` automáticamente.

```bash
openssl rand -hex 32
```
Genera una cadena aleatoria segura; úsala como `SECRET_JWT_KEY`.

```bash
docker compose up -d --build
```
Construye las imágenes y arranca los tres contenedores. Ver sección 2.

```bash
cd shared  && npm install
cd express && npm install
cd react   && npm install
```
**Solo si vas a desarrollar fuera de Docker** (con `npm run dev`) o para que el editor encuentre tipos e imports. Docker no lo necesita: las imágenes instalan sus propias dependencias.

---

## 2. Arrancar y parar

| Comando | Qué hace | Cuándo |
|---|---|---|
| `docker compose up -d` | Crea y arranca los contenedores en segundo plano. Si la imagen no existe, la construye. | Arranque normal cuando no ha cambiado el código. |
| `docker compose up -d --build` | Igual, pero **reconstruye** las imágenes antes. | Después de cambiar código, `package.json`, un Dockerfile o `VITE_API_URL`. |
| `docker compose up --build` | Sin `-d`: se queda en primer plano mostrando los logs de todos. `Ctrl+C` lo para todo. | Para ver qué pasa al arrancar. |
| `docker compose up -d backend` | Arranca solo ese servicio (y los que estén en su `depends_on`: aquí, `postgres`). | Trabajar solo con la API. |
| `docker compose stop` | Para los contenedores **sin borrarlos**. | Pausa rápida; `docker compose start` los reanuda. |
| `docker compose start` | Vuelve a arrancar contenedores parados. | Tras un `stop`. |
| `docker compose down` | Para **y borra** los contenedores y la red. **Los volúmenes (datos de la BD) se conservan.** | Al terminar de trabajar. |
| `docker compose down -v` | ⚠️ Igual + **borra los volúmenes**: pierdes toda la base de datos. | Empezar de cero o volver a ejecutar `init.sql`. |
| `docker compose restart backend` | Reinicia el proceso del contenedor. | Si se quedó colgado. ⚠️ **No** aplica cambios de código ni de `.env`. |

**Opciones clave:**
- `-d` (*detached*): en segundo plano, te devuelve la terminal.
- `--build`: reconstruye las imágenes.
- `--force-recreate`: vuelve a crear los contenedores aunque nada haya cambiado.

> **¿Cambié el `.env`, qué hago?** `docker compose up -d`: Compose detecta que la configuración cambió y recrea solo los contenedores afectados. `restart` no basta, porque reutiliza la configuración antigua.
>
> **¿Cambié `VITE_API_URL`?** Hay que **reconstruir** el frontend: `docker compose up -d --build frontend`. Vite mete esa URL dentro del JavaScript al construir.

---

## 3. Ver qué está pasando

| Comando | Qué hace |
|---|---|
| `docker compose ps` | Lista los contenedores del proyecto: estado (`running`, `exited`), salud (`healthy`, `unhealthy`, `starting`) y puertos. **El primer comando cuando algo falla.** |
| `docker compose logs` | Muestra los logs de todos los servicios. |
| `docker compose logs -f backend` | `-f` (*follow*): sigue mostrando los logs del backend en directo. `Ctrl+C` para salir (el contenedor sigue corriendo). |
| `docker compose logs --tail=50 backend` | Solo las últimas 50 líneas. |
| `docker compose logs -f backend postgres` | Varios servicios a la vez, intercalados. |
| `docker stats` | CPU, memoria y red de cada contenedor en directo. `--no-stream` para una sola foto. |
| `docker compose config` | Muestra el `docker-compose.yml` **ya resuelto** con los valores de tu `.env`. Útil para comprobar que una variable llega bien. |
| `docker inspect pawn-to-pawn-backend` | Todo el detalle de un contenedor en JSON (red, variables, healthcheck…). |

### Comprobar la salud a mano

```bash
curl http://localhost:3000/health        # Backend → {"status":"ok",...}
curl http://localhost/health             # Frontend (Nginx) → healthy
docker compose exec postgres pg_isready -U postgres   # BD → accepting connections
```

- `curl` hace una petición HTTP desde tu terminal. Añade `-i` para ver también el código de estado y las cabeceras.
- `pg_isready` es la misma comprobación que usa el healthcheck de Postgres.

---

## 4. Entrar en un contenedor

```bash
docker compose exec backend sh
```
Abre una terminal **dentro** del contenedor del backend. `exec` ejecuta un comando en un contenedor que ya está corriendo; `sh` es la shell (las imágenes Alpine no traen `bash`). Escribe `exit` para salir.

Una vez dentro puedes, por ejemplo:
```bash
ls build/                  # ver el JavaScript compilado
env | grep DATABASE        # ver qué variables de entorno recibió
wget -qO- localhost:3000/health
```

```bash
docker compose exec backend env
```
Ejecuta un único comando sin quedarte dentro (aquí, listar las variables de entorno).

```bash
docker compose exec frontend sh
docker compose exec postgres sh
```
Lo mismo para los otros servicios. En el frontend no hay Node, solo Nginx y los archivos estáticos (`/usr/share/nginx/html`).

```bash
docker compose run --rm backend sh
```
Diferencia con `exec`: `run` crea un contenedor **nuevo** y temporal (aunque el servicio esté parado); `--rm` lo borra al salir.

---

## 5. Base de datos (PostgreSQL)

### Conectarse con `psql`

```bash
docker compose exec postgres psql -U postgres -d pawnshop
```
Abre el cliente de línea de comandos de PostgreSQL dentro del contenedor. `-U` = usuario, `-d` = base de datos.

Comandos dentro de `psql` (los que empiezan por `\` son de `psql`, no SQL):

| Comando | Qué hace |
|---|---|
| `\dt` | Lista las tablas. |
| `\d users` | Estructura de una tabla (columnas, tipos, índices). |
| `\l` | Lista las bases de datos. |
| `\du` | Lista los usuarios/roles. |
| `\x` | Alterna vista expandida (útil con filas anchas). |
| `\q` | Salir. |
| `SELECT id, email, role FROM users;` | SQL normal. **Termina siempre con `;`**. |

```bash
docker compose exec postgres psql -U postgres -d pawnshop -c "SELECT email, role FROM users;"
```
Ejecuta una sola consulta sin entrar (`-c` = *command*).

### Desde tu máquina (DBeaver, TablePlus, VS Code…)

Como el compose publica el puerto `5432:5432`, conecta con: host `localhost`, puerto `5432`, usuario `postgres`, base `pawnshop` y la contraseña de tu `.env`.

### Copias de seguridad

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump -U postgres pawnshop > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```
- `pg_dump` exporta la base de datos completa (estructura + datos) como SQL.
- `-T` desactiva la terminal interactiva de `exec`; sin ella, la salida redirigida con `>` puede corromperse.
- `>` guarda la salida en un archivo **de tu máquina**.
- `$(date +%Y%m%d_%H%M%S)` inserta la fecha y hora actuales en el nombre del archivo.

```bash
docker compose exec -T postgres psql -U postgres -d pawnshop < backups/backup_20261112_190000.sql
```
Restaura: `<` envía el contenido del archivo como entrada a `psql`, que lo ejecuta.

### Reiniciar la base de datos desde cero

```bash
docker compose down -v
docker compose up -d
```
⚠️ Borra todos los datos. Al no existir el volumen, Postgres vuelve a ejecutar `database/init.sql` y el backend vuelve a crear el admin.

Alternativa más precisa (solo el volumen de la BD):
```bash
docker compose down
docker volume rm pawn-to-pawn_postgres_data
docker compose up -d
```
El nombre del volumen es `<proyecto>_<volumen>`; el proyecto es el nombre de la carpeta en minúsculas.

---

## 6. Imágenes, volúmenes y limpieza

| Comando | Qué hace |
|---|---|
| `docker compose build` | Construye las imágenes sin arrancar nada. |
| `docker compose build backend` | Solo una. |
| `docker compose build --no-cache` | Construye desde cero ignorando la caché de capas. Úsalo si sospechas que la caché tiene algo viejo. |
| `docker images` | Lista las imágenes de tu máquina (las del proyecto: `pawn-to-pawn-backend`, `pawn-to-pawn-frontend`, `postgres`). |
| `docker volume ls` | Lista los volúmenes (verás `pawn-to-pawn_postgres_data`). |
| `docker network ls` | Lista las redes (verás `pawn-to-pawn_pawn-to-pawn-network`). |
| `docker rmi pawn-to-pawn-backend pawn-to-pawn-frontend` | Borra las imágenes del proyecto (tienen que estar paradas). |
| `docker system df` | Cuánto disco ocupa Docker (imágenes, contenedores, volúmenes, caché). |
| `docker image prune` | Borra imágenes "huérfanas" (`<none>`) que quedan tras reconstruir. |
| `docker builder prune` | Borra la caché de construcción. |
| `docker system prune` | ⚠️ Borra **de todos tus proyectos** los contenedores parados, redes sin usar, imágenes huérfanas y caché. Pide confirmación (salvo con `-f`). No borra volúmenes salvo con `--volumes`. |

---

## 7. Desarrollo sin Docker (con recarga automática)

Las imágenes de Docker son de **producción**: si cambias código tienes que reconstruir. Para programar con cambios al instante, ejecuta las apps directamente con Node.

### Backend (`express/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | `ts-node-dev src/index.ts`: ejecuta TypeScript directamente y **reinicia al guardar**. Lee `express/.env`. |
| `npm run tsc` | Compila TypeScript → `build/`. También sirve para comprobar errores de tipos. |
| `npx tsc --noEmit` | Comprueba tipos **sin** generar archivos. |
| `npm start` | `node build/index.js`: ejecuta lo compilado (es lo que hace el contenedor). |

Truco: puedes usar el Postgres de Docker con el backend fuera de Docker. Arranca solo la BD:
```bash
docker compose up -d postgres
```
y en `express/.env` pon `DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/pawnshop?sslmode=disable`. Desde tu máquina el host es **`localhost`** (no `postgres`, que solo existe dentro de la red de Docker).

### Frontend (`react/`)

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de Vite en `http://localhost:5173` con recarga instantánea. Usa la API de Vercel (`API_LOCAL` en `config.ts`), porque en modo dev `import.meta.env.PROD` es `false`. |
| `npm run build` | Instala `shared`, comprueba tipos (`tsc -b`) y genera `dist/` (es lo que hace el Dockerfile). |
| `npm run preview` | Sirve `dist/` en local para probar el build de producción. |
| `npm run lint` | Pasa ESLint por el código. |

### npm en general

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias según `package.json` y actualiza `package-lock.json` si hace falta. |
| `npm ci` | Instalación **limpia y exacta** según `package-lock.json` (borra `node_modules` antes). Es lo que usan los Dockerfile y los CI. |
| `npm install paquete@^2` | Añade o actualiza una dependencia. `--save-dev` (o `-D`) para las de desarrollo. |
| `npm ls paquete` | Qué versión hay instalada y quién la pide. |
| `npm outdated` | Qué dependencias tienen versiones más nuevas. |
| `npm audit` | Busca vulnerabilidades conocidas. ⚠️ Cuidado con `npm audit fix --force`: puede subir o **bajar** versiones mayores y romper cosas. |

---

## 8. Flujos típicos

**Empezar el día**
```bash
docker compose up -d
docker compose ps
```

**He cambiado código del backend y quiero verlo en Docker**
```bash
docker compose up -d --build backend
docker compose logs -f backend
```

**Algo no funciona**
```bash
docker compose ps                     # ¿está corriendo? ¿healthy?
docker compose logs --tail=100 backend   # ¿qué error da?
docker compose config                 # ¿llegan bien las variables del .env?
docker compose exec backend env       # ¿qué variables tiene realmente?
```

**Cambié `database/init.sql`**
```bash
docker compose exec -T postgres pg_dump -U postgres pawnshop > backups/antes.sql   # por si acaso
docker compose down -v
docker compose up -d
```

**Terminar el día**
```bash
docker compose down
```

**Construcción desde cero (cuando nada tiene sentido)**
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```
