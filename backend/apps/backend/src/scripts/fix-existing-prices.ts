import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/utils"
import {
  createStockLocationsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function fixExistingPrices({ container }: ExecArgs) {
  const logger: any = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionModuleService: any = container.resolve(Modules.REGION)
  const salesChannelModuleService: any = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModuleService: any = container.resolve(Modules.STOCK_LOCATION)
  const pricingModuleService: any = container.resolve(Modules.PRICING)
  const link: any = container.resolve(ContainerRegistrationKeys.LINK)
  const query: any = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("🔧 Running Fix for Medusa Product Prices & Inventory Levels...")

  // 1. Ensure Region (Nepal - NPR)
  let [region] = await regionModuleService.listRegions({ currency_code: "npr" })
  if (!region) {
    logger.info("Creating Nepal (NPR) region...")
    region = await regionModuleService.createRegions({
      name: "Nepal",
      currency_code: "npr",
      countries: ["np"],
    })
  }

  // 2. Ensure Sales Channel
  let [salesChannel] = await salesChannelModuleService.listSalesChannels()
  if (!salesChannel) {
    salesChannel = await salesChannelModuleService.createSalesChannels({
      name: "Default Sales Channel",
    })
  }

  // 3. Ensure Stock Location
  let [stockLocation] = await stockLocationModuleService.listStockLocations()
  if (!stockLocation) {
    logger.info("Creating Kathmandu Main Warehouse stock location...")
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
    // Non-fatal if already linked
  }

  // 4. Query all product variants
  logger.info("Fetching all product variants...")
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "title", "sku"],
  })

  logger.info(`Found ${variants.length} product variants in DB. Linking price sets...`)

  let countFixed = 0
  for (const variant of variants) {
    try {
      // Check if price set link already exists
      const { data: existingPrices } = await query.graph({
        entity: "product_variant",
        fields: ["id", "price_set.*"],
        filters: { id: variant.id },
      })

      const hasPriceSet = existingPrices?.[0]?.price_set?.id

      if (!hasPriceSet) {
        const priceSet = await pricingModuleService.createPriceSets({
          prices: [
            {
              amount: 4500,
              currency_code: "npr",
            },
          ],
        })

        await link.create({
          [Modules.PRODUCT]: {
            variant_id: variant.id,
          },
          [Modules.PRICING]: {
            price_set_id: priceSet.id,
          },
        })
        countFixed++
      }
    } catch (err: any) {
      logger.warn(`Skipping variant ${variant.id}: ${err.message}`)
    }
  }

  logger.info(`✅ Successfully linked price sets to ${countFixed} variants!`)

  // 5. Ensure inventory levels
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  })

  if (inventoryItems.length > 0) {
    logger.info(`Setting 100 stock units for ${inventoryItems.length} inventory items...`)
    try {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map((item: any) => ({
            location_id: stockLocation.id,
            stocked_quantity: 100,
            inventory_item_id: item.id,
          })),
        },
      })
    } catch (err: any) {
      // Ignore if level already exists
    }
  }

  logger.info("🎉 Fix script completed successfully! Refresh your Medusa Admin page.")
}
