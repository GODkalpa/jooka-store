import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/utils"
import {
  createProductsWorkflow,
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

export default async function seedJookaData({ container }: ExecArgs) {
  const logger: any = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModuleService: any = container.resolve(Modules.REGION)
  const salesChannelModuleService: any = container.resolve(Modules.SALES_CHANNEL)
  const storeModuleService: any = container.resolve(Modules.STORE)
  const stockLocationModuleService: any = container.resolve(Modules.STOCK_LOCATION)
  const query: any = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🌱 Starting JOOKA product seed migration with Medusa v2 Workflows...")

  // 1. Ensure Store
  let [store] = await storeModuleService.listStores()
  if (!store) {
    logger.info("Creating default store...")
    store = await storeModuleService.createStores({
      name: "JOOKA - Natural Elegance",
      supported_currencies: [{ currency_code: "npr", is_default: true }],
      default_currency_code: "npr",
    })
  }

  // 2. Ensure Region (Nepal - NPR)
  let [region] = await regionModuleService.listRegions({ currency_code: "npr" })
  if (!region) {
    logger.info("Creating Nepal (NPR) region...")
    region = await regionModuleService.createRegions({
      name: "Nepal",
      currency_code: "npr",
      countries: ["np"],
    })
  }

  // 3. Ensure Sales Channel
  let [salesChannel] = await salesChannelModuleService.listSalesChannels()
  if (!salesChannel) {
    logger.info("Creating default sales channel...")
    salesChannel = await salesChannelModuleService.createSalesChannels({
      name: "Default Sales Channel",
    })
  }

  // 4. Ensure Stock Location & Link to Sales Channel
  let [stockLocation] = await stockLocationModuleService.listStockLocations()
  if (!stockLocation) {
    logger.info("Creating Stock Location: Kathmandu Main Warehouse...")
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: "Kathmandu Main Warehouse",
            address: {
              city: "Kathmandu",
              country_code: "NP",
              address_1: "Kathmandu Valley",
            },
          },
        ],
      },
    })
    stockLocation = result[0]
  }

  // Link Stock Location to Sales Channel
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [salesChannel.id],
      },
    })
  } catch (err: any) {
    // Already linked or non-fatal
  }

  // 5. Read exported Firestore products JSON
  const candidatePaths = [
    path.join(__dirname, "..", "..", "scripts", "mock-products-export.json"),
    path.join(process.cwd(), "scripts", "mock-products-export.json"),
    "/app/scripts/mock-products-export.json",
    path.join(__dirname, "..", "..", "..", "..", "scripts", "mock-products-export.json"),
    path.join(process.cwd(), "..", "..", "scripts", "mock-products-export.json"),
    "D:\\cursor projects\\jooka-ecommerce\\scripts\\mock-products-export.json",
  ]

  let exportPath = ""
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      exportPath = p
      break
    }
  }

  if (!exportPath) {
    logger.error(`Export file not found at candidate paths: ${JSON.stringify(candidatePaths)}`)
    return
  }

  logger.info(`Loading product export from: ${exportPath}`)
  const fileData = fs.readFileSync(exportPath, "utf-8")
  const { products: firestoreProducts } = JSON.parse(fileData)

  logger.info(`Found ${firestoreProducts.length} exported products to seed into Medusa.`)

  const timestamp = Date.now().toString().slice(-4)
  const productsToCreate: any[] = []

  for (let idx = 0; idx < firestoreProducts.length; idx++) {
    const item = firestoreProducts[idx]
    const baseHandle = item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    const handle = `${baseHandle}-${idx}-${timestamp}`

    const images = (item.images || []).map((img: any) => (typeof img === "string" ? img : img.secure_url)).filter(Boolean)
    const thumbnail = images[0] || undefined

    const colors = item.colors && item.colors.length > 0 ? item.colors : ["Default Color"]
    const sizes = item.sizes && item.sizes.length > 0 ? item.sizes : ["Standard"]

    const options = [
      { title: "Color", values: colors },
      { title: "Size", values: sizes },
    ]

    const priceAmount = Number(item.price) || 4500

    const variants: any[] = []
    for (const color of colors) {
      for (const size of sizes) {
        variants.push({
          title: `${color} / ${size}`,
          sku: `${baseHandle.toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size.toUpperCase()}-${idx}-${timestamp}`,
          options: {
            Color: color,
            Size: size,
          },
          prices: [
            {
              currency_code: "npr",
              amount: priceAmount,
            },
          ],
        })
      }
    }

    productsToCreate.push({
      title: item.name || "Untitled Product",
      handle,
      description: item.description || item.short_description || "Luxury fashion item by JOOKA.",
      thumbnail,
      images: images.map((url: string) => ({ url })),
      status: ProductStatus.PUBLISHED,
      options,
      variants,
      sales_channels: [
        {
          id: salesChannel.id,
        },
      ],
    })
  }

  // Create products with full Medusa v2 workflows
  logger.info(`Running createProductsWorkflow for ${productsToCreate.length} products...`)
  await createProductsWorkflow(container).run({
    input: {
      products: productsToCreate,
    },
  })

  // 6. Set Inventory Levels for all created inventory items
  try {
    logger.info("Setting stock quantity (100 units) for all product variants...")
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })

    if (inventoryItems.length > 0) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map((item: any) => ({
            location_id: stockLocation.id,
            stocked_quantity: 100,
            inventory_item_id: item.id,
          })),
        },
      })
    }
  } catch (err: any) {
    logger.info("Inventory levels already configured or skipped.")
  }

  logger.info("🎉 JOOKA Medusa Product, Pricing & Inventory Seeding Completed Successfully!")
}
