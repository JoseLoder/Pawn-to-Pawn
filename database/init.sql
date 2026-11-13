-- =============================================================================
-- Pawn-to-Pawn - Database schema
-- =============================================================================
-- Source of truth: the SQL in express/src/models/*.ts and the types in
-- shared/types/*.ts. If you change a model or a shared type, update this file.
--
-- Usage:
--   * Docker: executed automatically the first time the postgres container
--     starts with an empty volume (docker compose down -v to run it again).
--   * Supabase: paste it into the SQL Editor and run it.
--
-- Safe to run more than once: every statement uses IF NOT EXISTS.
--
-- Numeric columns use DOUBLE PRECISION because the shared types declare them as
-- `number`. node-postgres returns NUMERIC/DECIMAL columns as strings, which
-- would break that contract.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- users  (user.model.ts, AdminManager.ts, shared/types/users.types.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(255) PRIMARY KEY,                 -- crypto.randomUUID()
    id_number   VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),                              -- NULL for the admin
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,                    -- bcrypt hash
    role        VARCHAR(20)  NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'operator', 'admin')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);


-- -----------------------------------------------------------------------------
-- machines  (machine.model.ts, shared/types/machines.types.ts)
-- Note: "max_widht" (sic) is the spelling used by the code.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machines (
    id            VARCHAR(255)     PRIMARY KEY,
    name          VARCHAR(255)     NOT NULL,
    max_widht     DOUBLE PRECISION NOT NULL,
    max_weight    DOUBLE PRECISION NOT NULL,
    max_velocity  DOUBLE PRECISION NOT NULL,
    price         DOUBLE PRECISION NOT NULL,
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- materials  (material.model.ts, shared/types/materials.types.ts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS materials (
    id          VARCHAR(255)     PRIMARY KEY,
    type        VARCHAR(255)     NOT NULL,
    weight      DOUBLE PRECISION NOT NULL,
    price       DOUBLE PRECISION NOT NULL,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);


-- -----------------------------------------------------------------------------
-- products  (product.model.ts, shared/types/products.types.ts)
-- estimated_time, estimated_weight and price are computed by
-- products.controller.ts from the machine and the material.
-- Note: "widht" (sic) is the spelling used by the code.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                VARCHAR(255)     PRIMARY KEY,
    id_machine        VARCHAR(255)     NOT NULL
                      REFERENCES machines (id) ON DELETE RESTRICT,
    id_material       VARCHAR(255)     NOT NULL
                      REFERENCES materials (id) ON DELETE RESTRICT,
    base              VARCHAR(20)      NOT NULL
                      CHECK (base IN ('iron', 'pvc', 'cardboard')),
    cover             VARCHAR(20)      NOT NULL
                      CHECK (cover IN ('white', 'black', 'golden')),
    length            DOUBLE PRECISION NOT NULL,
    estimated_time    DOUBLE PRECISION NOT NULL,
    estimated_weight  DOUBLE PRECISION NOT NULL,
    widht             DOUBLE PRECISION NOT NULL,
    price             DOUBLE PRECISION NOT NULL,
    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_machine  ON products (id_machine);
CREATE INDEX IF NOT EXISTS idx_products_material ON products (id_material);


-- -----------------------------------------------------------------------------
-- orders  (order.model.ts, shared/types/orders.types.ts)
-- Lifecycle: draft -> inHold -> inProgress -> done
-- processing_at / completed_at are read by the frontend (OrdersTable.tsx).
-- The code that fills them is currently commented out in order.model.ts,
-- so for now they stay NULL.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id             VARCHAR(255)     PRIMARY KEY,
    id_client      VARCHAR(255)     NOT NULL
                   REFERENCES users (id) ON DELETE CASCADE,
    id_operator    VARCHAR(255)
                   REFERENCES users (id) ON DELETE SET NULL,
    id_product     VARCHAR(255)     NOT NULL
                   REFERENCES products (id) ON DELETE RESTRICT,
    quantity       INTEGER          NOT NULL CHECK (quantity >= 1),
    price          DOUBLE PRECISION NOT NULL,
    status         VARCHAR(20)      NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'inHold', 'inProgress', 'done')),
    created_at     TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    processing_at  TIMESTAMPTZ,
    completed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_client   ON orders (id_client);
CREATE INDEX IF NOT EXISTS idx_orders_operator ON orders (id_operator);
CREATE INDEX IF NOT EXISTS idx_orders_status   ON orders (status);


-- -----------------------------------------------------------------------------
-- user_refresh_tokens  (refreshToken.model.ts, shared/types/tokens.types.ts)
-- "revoked" is stored as 0/1 because the model writes `revoked ? 1 : 0` and
-- filters with `revoked = 0`; a BOOLEAN column would reject those queries.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id           VARCHAR(255) PRIMARY KEY,
    id_user      VARCHAR(255) NOT NULL
                 REFERENCES users (id) ON DELETE CASCADE,
    token        TEXT         NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ  NOT NULL,
    revoked      SMALLINT     NOT NULL DEFAULT 0 CHECK (revoked IN (0, 1)),
    device_info  TEXT,                                    -- request user-agent
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user    ON user_refresh_tokens (id_user);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON user_refresh_tokens (expires_at);


-- -----------------------------------------------------------------------------
-- Row Level Security
-- Supabase exposes every table in the "public" schema through its REST API
-- (anon key). Enabling RLS without policies blocks that API completely.
-- The Express backend connects as the table owner (postgres), which bypasses
-- RLS, so it is not affected. In plain PostgreSQL (Docker) this is harmless.
-- -----------------------------------------------------------------------------
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_refresh_tokens ENABLE ROW LEVEL SECURITY;
