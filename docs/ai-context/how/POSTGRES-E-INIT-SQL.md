# PostgreSQL y `database/init.sql`

Qué es PostgreSQL, qué hace cada instrucción de [`database/init.sql`](../../../database/init.sql) y en qué no coincide con el código real.

Relacionado: [DOCKER-COMPOSE-EXPLICADO.md](./DOCKER-COMPOSE-EXPLICADO.md) (cómo y cuándo se ejecuta `init.sql` en Docker).

---

## 1. ¿Qué es PostgreSQL?

Una **base de datos relacional** (SGBD relacional, *RDBMS*) de código abierto:

- Los datos se guardan en **tablas** con **columnas** de tipo fijo (texto, número, fecha…) y **filas**.
- Las tablas se **relacionan** entre sí mediante claves: un pedido guarda el `id` del cliente que lo hizo. La base de datos puede **garantizar** que ese cliente existe (*integridad referencial*).
- Se consulta con **SQL** (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`…).
- Es **ACID**: las operaciones son atómicas (todo o nada), consistentes, aisladas y duraderas (no se pierden al reiniciar). Por ejemplo, con una transacción se puede restar stock y crear el pedido a la vez, sin quedarse a medias.
- Además de lo relacional, admite **JSON/JSONB** (documentos dentro de una columna), arrays, búsqueda de texto, extensiones…

Comparación rápida:

| | Relacional (PostgreSQL, MySQL) | Documental (MongoDB) |
|---|---|---|
| Estructura | Esquema fijo, definido antes (`CREATE TABLE`) | Documentos JSON flexibles |
| Relaciones | Claves foráneas + `JOIN` | Normalmente se anidan datos o se resuelven en código |
| Garantías | Fuertes (tipos, `NOT NULL`, `UNIQUE`, `FOREIGN KEY`) | Más laxas por defecto |

**Supabase** = PostgreSQL alojado en la nube + panel web + extras (auth, API…). Tu backend solo usa la parte PostgreSQL, a través de la librería `pg`.

---

## 2. Qué hace `init.sql`, instrucción por instrucción

> Un `.sql` es una lista de instrucciones SQL separadas por `;`. Las líneas que empiezan por `--` son comentarios.
> - **Docker**: la imagen oficial de Postgres lo ejecuta **una sola vez**, cuando el volumen de datos está vacío.
> - **Supabase**: se pega en el *SQL Editor* y se ejecuta a mano.
>
> Todas las instrucciones usan `IF NOT EXISTS`, así que ejecutarlo dos veces no da error ni borra datos.

**Fuente de verdad:** el esquema sale de las consultas de `express/src/models/*.ts` y de los tipos de `shared/types/*.ts`. Si cambias un modelo o un tipo, actualiza también `init.sql`.

### 2.1 Crear una tabla (`users` como ejemplo)

```sql
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(255) PRIMARY KEY,
    id_number   VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'operator', 'admin')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

| Pieza | Significado |
|---|---|
| `CREATE TABLE IF NOT EXISTS users (...)` | Crea la tabla `users` si no existe. |
| `id VARCHAR(255)` | Columna `id` de tipo texto de hasta 255 caracteres. El backend genera el valor con `crypto.randomUUID()`. |
| `PRIMARY KEY` | **Clave primaria**: identifica cada fila; implica `UNIQUE` + `NOT NULL` y crea un índice. |
| `UNIQUE` | No puede haber dos filas con el mismo valor (dos usuarios con el mismo email → error). |
| `NOT NULL` | Obligatorio. Sin él (como `phone`), la columna admite `NULL`; el admin se crea con `phone = NULL`. |
| `DEFAULT 'client'` | Valor si el `INSERT` no lo indica. |
| `CHECK (role IN (...))` | Restricción: solo esos valores. Cualquier otro → error. Es la "validación" a nivel de BD. |
| `TIMESTAMPTZ DEFAULT NOW()` | Fecha y hora **con zona horaria**; por defecto, el momento de la inserción. |

Otros tipos que aparecen:

| Tipo | Para qué | Dónde |
|---|---|---|
| `TEXT` | Texto sin límite de longitud. | `token`, `device_info` |
| `INTEGER` | Número entero. | `orders.quantity` |
| `SMALLINT` | Entero pequeño. | `user_refresh_tokens.revoked` (0/1) |
| `DOUBLE PRECISION` | Número decimal (coma flotante). | Precios y medidas |

**¿Por qué `DOUBLE PRECISION` y no `NUMERIC` para los precios?** Para dinero lo ideal es `NUMERIC(12,2)` (decimal exacto, sin errores de redondeo). Pero la librería `pg` de Node devuelve las columnas `NUMERIC` como **texto** (`"12.50"`) para no perder precisión, y los tipos de `shared/types` dicen que `price` es `number`. Con `NUMERIC`, cosas como `a.price + b.price` concatenarían textos. Se eligió `DOUBLE PRECISION` para respetar el contrato actual; pasar a `NUMERIC` exigiría convertir en el backend.

**¿Por qué `revoked` es `SMALLINT` y no `BOOLEAN`?** El modelo guarda `revoked ? 1 : 0` y filtra con `revoked = 0`. Postgres no compara `BOOLEAN` con números, así que con `BOOLEAN` esas consultas fallarían. (Lo más limpio a futuro: `BOOLEAN` + cambiar el modelo a `true/false`.)

### 2.2 Restricciones `CHECK` con los valores del código

```sql
status VARCHAR(20) NOT NULL DEFAULT 'draft'
       CHECK (status IN ('draft', 'inHold', 'inProgress', 'done')),
```
Los valores salen de `StatusOrder` en `shared/types/orders.types.ts`. Igual con `base` (`iron`, `pvc`, `cardboard`) y `cover` (`white`, `black`, `golden`) de `products`. Si añades un valor nuevo en el tipo, hay que añadirlo aquí también.

### 2.3 Claves foráneas (relaciones)

```sql
id_client    VARCHAR(255) NOT NULL REFERENCES users (id)    ON DELETE CASCADE,
id_operator  VARCHAR(255)          REFERENCES users (id)    ON DELETE SET NULL,
id_product   VARCHAR(255) NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
```
- `REFERENCES users (id)` = **clave foránea**: el valor debe existir en `users.id`. Insertar un pedido con un cliente inexistente → error.
- `ON DELETE CASCADE`: si borras el cliente, se borran **también** sus pedidos (y sus refresh tokens).
- `ON DELETE SET NULL`: si borras el operador, el pedido se queda, con `id_operator = NULL`.
- `ON DELETE RESTRICT`: **impide** borrar un producto que tenga pedidos, o una máquina/material que use algún producto. El backend recibirá un error y no borrará nada.

Relaciones del esquema:
```
users ─┬─< orders >── products >─┬── machines
       │  (id_client,             └── materials
       │   id_operator)
       └─< user_refresh_tokens
```

### 2.4 Índices

```sql
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
```
Un índice es como el índice de un libro: permite encontrar filas por esa columna sin recorrer toda la tabla. Acelera `WHERE status = 'inHold'`, pero ocupa espacio y hace algo más lentas las escrituras. Se crean en las columnas por las que filtran los modelos (`id_client`, `id_operator`, `status`, `id_user`…). Las columnas `PRIMARY KEY` y `UNIQUE` ya tienen índice propio.

### 2.5 Row Level Security (RLS)

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```
Supabase publica automáticamente una **API REST** para cada tabla del esquema `public`, accesible con la clave pública (*anon key*) del proyecto. Sin RLS, cualquiera con esa clave podría leer `users` (con los hashes de contraseña).

Activar RLS **sin definir políticas** bloquea esa API por completo. Tu backend no se ve afectado: se conecta como `postgres`, el dueño de las tablas, que se salta RLS. En el Postgres de Docker no tiene ningún efecto práctico.

---

## 3. Historial: la versión anterior no coincidía con el código

La primera versión de `init.sql` (creada al dockerizar el proyecto) se basó en la descripción de `CLAUDE.md` en lugar de en los modelos: solo `users` encajaba, y tablas como `refresh_tokens` (en vez de `user_refresh_tokens`) o los estados `pending`/`preparation`/`completed` (en vez de `draft`/`inHold`/`inProgress`/`done`) hacían fallar el login y el resto de funcionalidades. Se reescribió a partir de `express/src/models/` y `shared/types/`, y se probó ejecutando las consultas de los modelos contra un PostgreSQL embebido.
