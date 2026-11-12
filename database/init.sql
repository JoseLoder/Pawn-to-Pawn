-- Pawn-to-Pawn database schema
-- Executed automatically the first time the PostgreSQL container starts.
-- Column names match the SQL in express/src/models and the types in shared/types.
-- Numeric columns use DOUBLE PRECISION so that `pg` returns JS numbers (NUMERIC is returned as a string).

-- Users
CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR(36)  PRIMARY KEY,
    id_number   VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(10)  NOT NULL DEFAULT 'client'
                CHECK (role IN ('client', 'operator', 'admin')),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
    id          VARCHAR(36)  PRIMARY KEY,
    type        VARCHAR(255) NOT NULL,
    weight      DOUBLE PRECISION NOT NULL CHECK (weight > 0),
    price       DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
    id            VARCHAR(36)  PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    max_widht     DOUBLE PRECISION NOT NULL CHECK (max_widht > 0),
    max_weight    DOUBLE PRECISION NOT NULL CHECK (max_weight > 0),
    max_velocity  DOUBLE PRECISION NOT NULL CHECK (max_velocity > 0),
    price         DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Products (configured from one machine and one material)
CREATE TABLE IF NOT EXISTS products (
    id                VARCHAR(36) PRIMARY KEY,
    id_machine        VARCHAR(36) NOT NULL REFERENCES machines(id),
    id_material       VARCHAR(36) NOT NULL REFERENCES materials(id),
    base              VARCHAR(10) NOT NULL CHECK (base IN ('iron', 'pvc', 'cardboard')),
    cover             VARCHAR(10) NOT NULL CHECK (cover IN ('white', 'black', 'golden')),
    length            DOUBLE PRECISION NOT NULL CHECK (length > 0),
    widht             DOUBLE PRECISION NOT NULL CHECK (widht > 0),
    estimated_weight  DOUBLE PRECISION NOT NULL CHECK (estimated_weight > 0),
    estimated_time    DOUBLE PRECISION NOT NULL CHECK (estimated_time >= 0),
    price             DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders: draft -> inHold -> inProgress -> done
CREATE TABLE IF NOT EXISTS orders (
    id            VARCHAR(36) PRIMARY KEY,
    id_client     VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_product    VARCHAR(36) NOT NULL REFERENCES products(id),
    id_operator   VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0),
    price         DOUBLE PRECISION NOT NULL CHECK (price >= 0),
    status        VARCHAR(12) NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'inHold', 'inProgress', 'done')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_at TIMESTAMPTZ,
    completed_at  TIMESTAMPTZ
);

-- Refresh tokens (revoked is stored as 0/1, as the model expects)
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id           VARCHAR(36) PRIMARY KEY,
    id_user      VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token        TEXT        NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    revoked      SMALLINT    NOT NULL DEFAULT 0 CHECK (revoked IN (0, 1)),
    device_info  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for the most common lookups
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_material        ON products(id_material);
CREATE INDEX IF NOT EXISTS idx_orders_client            ON orders(id_client);
CREATE INDEX IF NOT EXISTS idx_orders_operator          ON orders(id_operator);
CREATE INDEX IF NOT EXISTS idx_orders_status            ON orders(status);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user      ON user_refresh_tokens(id_user);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires   ON user_refresh_tokens(expires_at);
