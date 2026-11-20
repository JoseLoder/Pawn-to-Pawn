import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        env: {
            SECRET_JWT_KEY: 'test-access-secret',
            REFRESH_JWT_KEY: 'test-refresh-secret',
            DATABASE_URL: 'postgresql://test:test@127.0.0.1:1/unreachable',
        },
    },
})
