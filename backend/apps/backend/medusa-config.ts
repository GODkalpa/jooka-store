const { loadEnv, defineConfig } = require('@medusajs/utils')

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://api.jookawear.com",
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
      storeCors: process.env.STORE_CORS || "https://jookawear.com,https://www.jookawear.com,http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "https://api.jookawear.com,https://jookawear.com,https://www.jookawear.com,http://localhost:3000",
      authCors: process.env.AUTH_CORS || "https://jookawear.com,https://www.jookawear.com,https://api.jookawear.com,http://localhost:3000",
      jwtSecret: process.env.JWT_SECRET || "supersecret_jooka_jwt_key",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_jooka_cookie_key",
    }
  }
})
