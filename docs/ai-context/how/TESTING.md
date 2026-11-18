# Testing en Pawn-to-Pawn: hoja de ruta

Plan de aprendizaje para introducir tests en el proyecto por bloques, desde el primer test hasta el despliegue continuo (CD).

**Filosofía:** el código de los tests y de la configuración lo escribe la persona que aprende; esta guía explica el qué, el porqué y el orden. Cada bloque termina con algo que funciona y se fusiona en `main` mediante PR.

**Decisiones tomadas:**
- Runner: **Vitest** (backend y frontend).
- Orden: **backend primero**; el frontend llega en el bloque 5.

Relacionado: [COMANDOS.md](./COMANDOS.md), [DOCKER-COMPOSE-EXPLICADO.md](./DOCKER-COMPOSE-EXPLICADO.md).

---

## 1. Vocabulario

| Término | Qué es |
|---|---|
| **Test** | Código que ejecuta tu código y comprueba que el resultado es el esperado. |
| **Aserción** (*assertion*) | La comprobación en sí: `expect(precio).toBe(87)`. |
| **Test runner** | Herramienta que encuentra los tests, los ejecuta e informa de cuáles fallan (Vitest, Jest). |
| **Suite** | Grupo de tests relacionados (`describe(...)`). |
| **Mock / stub / spy** | Sustitutos falsos de una dependencia (BD, `fetch`, el reloj) para aislar lo que se prueba. |
| **Fixture** | Datos preparados para un test (un usuario de prueba, un producto…). |
| **Cobertura** (*coverage*) | Qué porcentaje del código se ejecuta durante los tests. Es una pista, no un objetivo. |

Estructura de casi cualquier test, **AAA**:

```
Arrange  → preparo los datos
Act      → ejecuto lo que quiero probar
Assert   → compruebo el resultado
```

---

## 2. Tipos de tests

De más baratos y rápidos a más caros y lentos:

| Tipo | Qué prueba | Velocidad | Ejemplo en este proyecto |
|---|---|---|---|
| **Estáticos** | Errores sin ejecutar nada | Instantáneo | Ya existen: TypeScript (`tsc`) y ESLint |
| **Unitarios** | Una función o pieza aislada | Milisegundos | Cálculo del precio de un producto, esquemas de zod |
| **Integración** | Varias piezas juntas, de verdad | Segundos | `POST /users/login` contra Express + Postgres real |
| **Componentes** (frontend) | Un componente React como lo usaría una persona | Milisegundos | Rellenar el formulario de login y ver el error |
| **End-to-End (E2E)** | La app completa en un navegador real | Segundos-minutos | Un cliente crea un pedido y un operador lo completa |

Otros que conviene conocer de nombre (no ahora): contrato, carga/rendimiento, seguridad, mutación, *snapshot*.

### Proporción: el "testing trophy"

```
        E2E          ← pocos, los flujos críticos
   ┌─────────────┐
   │ INTEGRACIÓN │   ← la mayor parte: es lo que más confianza da
   └─────────────┘
     Unitarios       ← para la lógica pura
     Estáticos       ← TypeScript + ESLint
```

En una API Express la mayoría de los fallos reales están en la **unión entre piezas** (ruta → middleware de roles → controlador → SQL). Por eso los tests de integración son los más valiosos aquí.

---

## 3. Herramientas

| Para | Herramienta | Por qué |
|---|---|---|
| Runner (backend y frontend) | **Vitest** | TypeScript sin configuración; mismo ecosistema que Vite; API casi idéntica a Jest (`describe`, `it`, `expect`; `vi.fn()` ↔ `jest.fn()`) |
| Peticiones HTTP a Express | **Supertest** | Lanza peticiones a la `app` sin abrir un puerto |
| BD de tests | Postgres de `docker-compose.dev.yml` con una base de datos separada (más adelante: Testcontainers) | Ya está montado |
| Componentes React | **React Testing Library** + `user-event` | Prueba lo que ve la persona, no detalles internos |
| Simular la API en el frontend | **MSW** (Mock Service Worker) | Intercepta las peticiones de axios sin tocar el código |
| E2E | **Playwright** | Navegadores reales, buen depurador, estándar actual |
| CI/CD | **GitHub Actions** | El repositorio ya está en GitHub |

---

## 4. TDD, BDD, CI y CD

- **TDD**: escribir el test **antes** que el código, en ciclos cortos: 🔴 *Red* (test que falla) → 🟢 *Green* (código mínimo para que pase) → 🔵 *Refactor* (mejorar con los tests como red de seguridad).
- **BDD**: describir **comportamientos** en lenguaje de negocio con *Given / When / Then* ("Dado un cliente con un pedido en borrador, cuando lo envía, entonces queda pendiente"). Se empieza escribiendo los nombres de los tests en ese estilo con Vitest; herramientas como Cucumber, solo si hacen falta más adelante.
- **CI** (*Continuous Integration*): cada push/PR ejecuta lint, tipos y tests automáticamente; si algo falla, la PR no se puede fusionar.
- **CD** (*Continuous Delivery / Deployment*): si todo pasa, el despliegue queda listo (*delivery*) o se hace solo (*deployment*).

---

## 5. Puntos de partida del código

**Cosas que dificultan testear** (resolverlas es parte del aprendizaje):
- `express/src/index.ts` no exporta la `app` y llama a `app.listen()` directamente → Supertest necesita la `app` sin servidor. Solución clásica: separar `app.ts` (crea la app) y `server.ts` (la arranca).
- `express/src/database/connect.ts` se conecta a la BD **al importarse** → cualquier test que lo importe abre una conexión.
- Los controladores mezclan cálculo y BD (el precio de un producto se calcula dentro de `ProductsController.create`) → extraer funciones puras las hace triviales de testear.
- `tsconfig.json` compila todo `src/**/*.ts` → un `*.test.ts` dentro de `src/` acabaría en `build/` (y en Vercel).

**Bugs reales, buenos para practicar TDD** (bloque 4):
- Un cliente que entra en una ruta de admin recibe **400** en vez de **403 Forbidden**.
- El **logout no revoca** el refresh token (código comentado en `UsersController.logout`).
- `processing_at` / `completed_at` de los pedidos **nunca se rellenan**.

---

## 6. Hoja de ruta por bloques

| Bloque | Qué se aprende | Resultado |
|---|---|---|
| **0. Onboarding** | Instalar Vitest en `express/`, primer test, `npm test` y modo *watch* | Primer test en verde |
| **1. Unitarios** | AAA, aserciones, tests de esquemas zod, extraer lógica pura de los controladores | Lógica de negocio cubierta |
| **2. Mocks** | `vi.fn()`, `vi.mock()`, testear el middleware `auth` con `req`/`res` falsos; cuándo **no** usar mocks | Entender aislamiento y su coste |
| **3. Integración API** | Separar `app.ts`/`server.ts`, Supertest, BD de tests, limpiar datos entre tests, matriz de permisos por rol | **La red de seguridad principal** |
| **4. TDD con bugs reales** | Red-green-refactor con 400→403, logout, fechas de pedidos | Bugs arreglados guiados por tests |
| **5. Componentes React** | Testing Library, `user-event`, MSW | Login y pantallas clave cubiertos |
| **6. E2E + BDD** | Playwright, escenarios *Given/When/Then* de los flujos de negocio | Flujos críticos probados de punta a punta |
| **7. CI** | GitHub Actions: lint + tipos + tests con Postgres en cada PR; proteger `main` | Nada roto entra en `main` |
| **8. CD** | Desplegar solo si CI pasa, *previews* por PR con E2E, Vercel compilando el backend, **migraciones de BD** | Despliegue continuo de verdad |

Notas de orden:
- Los refactors pendientes (arranque de la BD, código muerto como `database/admin.ts`, unificar los dos pools) van **después del bloque 3**, con tests que avisen si algo se rompe (*characterization tests*).
- Para el bloque 8 hace falta un **sistema de migraciones**: hoy los cambios de esquema en Supabase son manuales, y sin migraciones el código nuevo podría llegar a producción antes que su esquema.

---

## 7. Progreso

| Bloque | Estado | PR |
|---|---|---|
| 0. Onboarding | hecho | |
| 1. Unitarios | En curso | |
| 2. Mocks | Pendiente | |
| 3. Integración API | Pendiente | |
| 4. TDD con bugs reales | Pendiente | |
| 5. Componentes React | Pendiente | |
| 6. E2E + BDD | Pendiente | |
| 7. CI | Pendiente | |
| 8. CD | Pendiente | |
