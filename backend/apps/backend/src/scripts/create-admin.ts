import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/utils"

export default async function createAdminUser({ container }: ExecArgs) {
  const logger: any = container.resolve(ContainerRegistrationKeys.LOGGER)
  const userModuleService: any = container.resolve(Modules.USER)

  const email = process.env.ADMIN_EMAIL || "admin@jookawear.com"
  const password = process.env.ADMIN_PASSWORD || "JookaAdmin2026!"

  logger.info(`🔑 Creating Admin User for email: ${email}...`)

  const [existingUser] = await userModuleService.listUsers({ email })

  if (existingUser) {
    logger.info(`Admin user ${email} already exists.`)
    return
  }

  const user = await userModuleService.createUsers({
    email,
    first_name: "JOOKA",
    last_name: "Admin",
  })

  logger.info(`✅ Admin user created successfully! ID: ${user.id}`)
}
