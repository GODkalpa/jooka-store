const { loadEnv, defineConfig } = require('@medusajs/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isProduction = process.env.NODE_ENV === 'production'
const defaultBackendUrl = isProduction ? 'https://api.jookawear.com' : 'http://localhost:9000'

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || defaultBackendUrl,
    path: "/app",
    disable: false,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      connection: {
        ssl: false,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000,https://jookawear.com,https://www.jookawear.com",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:3000,https://api.jookawear.com,https://jookawear.com,https://www.jookawear.com",
      authCors: process.env.AUTH_CORS || "http://localhost:9000,http://localhost:3000,https://jookawear.com,https://www.jookawear.com,https://api.jookawear.com",
      jwtSecret: process.env.JWT_SECRET || "supersecret_jooka_jwt_key",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_jooka_cookie_key",
    }
  }
})
