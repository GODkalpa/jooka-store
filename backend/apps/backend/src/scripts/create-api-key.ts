import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/utils"

export default async function createPublishableKey({ container }: ExecArgs) {
  const logger: any = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apiKeyModule: any = container.resolve(Modules.API_KEY)

  logger.info("🔑 Creating Publishable API Key for JOOKA Storefront...")

  const [existingKey] = await apiKeyModule.listApiKeys({ type: "publishable" })

  if (existingKey) {
    logger.info(`Publishable Key already exists: ${existingKey.token}`)
    console.log(`MEDUSA_PUBLISHABLE_KEY=${existingKey.token}`)
    return
  }

  const apiKey = await apiKeyModule.createApiKeys({
    title: "JOOKA Next.js Storefront Key",
    type: "publishable",
    created_by: "system",
  })

  logger.info(`✅ Created Publishable API Key: ${apiKey.token}`)
  console.log(`MEDUSA_PUBLISHABLE_KEY=${apiKey.token}`)
}
