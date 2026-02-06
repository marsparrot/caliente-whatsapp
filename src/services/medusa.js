// src/services/medusa.js
// Medusa.js API Client for Caliente WhatsApp Bot

import Medusa from "@medusajs/medusa-js"

class MedusaService {
  constructor() {
    this.client = null
    this.adminClient = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // Regular client for store operations
    this.client = new Medusa({ baseUrl: backendUrl, maxRetries: 3 })

    // Admin client for order/customer operations
    const adminToken = process.env.MEDUSA_ADMIN_TOKEN
    if (adminToken) {
      this.adminClient = new Medusa({ baseUrl: backendUrl, maxRetries: 3 })
      this.adminClient.authenticatedHeaders = {
        Authorization: `Bearer ${adminToken}`
      }
    }

    this.initialized = true
    console.log("✅ Medusa service initialized")
  }

  // ============ PRODUCTS ============

  async listProducts(query = {}) {
    await this.init()
    return await this.client.products.list(query)
  }

  async getProduct(productId) {
    await this.init()
    return await this.client.products.retrieve(productId)
  }

  async searchProducts(searchTerm, limit = 10) {
    await this.init()
    return await this.client.products.list({
      q: searchTerm,
      limit
    })
  }

  async getProductsByCategory(categoryId) {
    await this.init()
    return await this.client.products.list({
      category_id: [categoryId]
    })
  }

  async getProductCategories() {
    await this.init()
    return await this.client.productCategories.list()
  }

  // ============ ORDERS (Admin) ============

  async getOrder(orderId) {
    await this.init()
    if (!this.adminClient) {
      throw new Error("Admin token not configured")
    }
    return await this.adminClient.orders.retrieve(orderId)
  }

  async searchOrdersByPhone(phone) {
    await this.init()
    if (!this.adminClient) {
      throw new Error("Admin token not configured")
    }
    return await this.adminClient.orders.list({
      filters: { shipping_address: { phone } }
    })
  }

  async searchOrdersByEmail(email) {
    await this.init()
    if (!this.adminClient) {
      throw new Error("Admin token not configured")
    }
    return await this.adminClient.orders.list({
      filters: { email }
    })
  }

  // ============ CUSTOMERS (Admin) ============

  async getCustomer(customerId) {
    await this.init()
    if (!this.adminClient) {
      throw new Error("Admin token not configured")
    }
    return await this.adminClient.customers.retrieve(customerId)
  }

  async searchCustomersByPhone(phone) {
    await this.init()
    if (!this.adminClient) {
      throw new Error("Admin token not configured")
    }
    return await this.adminClient.customers.list({
      filters: { phone }
    })
  }

  // ============ HELPER METHODS ============

  formatProductForWhatsApp(product) {
    const { title, description, thumbnail, variants, price } = product
    
    let text = `*${title}*\n\n`
    
    if (description) {
      text += `${description.substring(0, 200)}...\n\n`
    }
    
    if (price) {
      text += `💰 Precio: ${price.calculated_price || "Consultar"}\n`
    }
    
    if (variants && variants.length > 0) {
      text += `\n📦 Variantes: ${variants.length}`
    }
    
    if (thumbnail) {
      text += `\n🖼️ ${thumbnail}`
    }
    
    return text
  }

  formatOrderForWhatsApp(order) {
    const { id, status, created_at, total, items, shipping_address } = order
    
    let text = `📦 *Pedido #${id.slice(-8)}*\n\n`
    text += `📍 Estado: ${this.formatOrderStatus(status)}\n`
    text += `📅 Fecha: ${new Date(created_at).toLocaleDateString("es-ES")}\n`
    text += `💰 Total: ${total.calculated_total || total} €\n`
    
    if (items && items.length > 0) {
      text += `\n📋 Items:\n`
      items.forEach(item => {
        text += `• ${item.quantity}x ${item.title}\n`
      })
    }
    
    if (shipping_address) {
      const { city, country } = shipping_address
      text += `\n📮 Envío: ${city}, ${country}`
    }
    
    return text
  }

  formatOrderStatus(status) {
    const statusMap = {
      pending: "⏳ Pendiente",
      confirmed: "✅ Confirmado",
      shipped: "🚚 Enviado",
      delivered: "📦 Entregado",
      canceled: "❌ Cancelado",
      requires_action: "⚠️ Requiere acción"
    }
    return statusMap[status] || status
  }
}

export default new MedusaService()
