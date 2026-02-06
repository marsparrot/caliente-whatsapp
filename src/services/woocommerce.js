// src/services/woocommerce.js
// WooCommerce REST API Client for Caliente WhatsApp Bot

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

class WooCommerceService {
  constructor() {
    this.api = null
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    this.api = new WooCommerceRestApi({
      url: process.env.WOOCOMMERCE_URL || "https://caliente.pt",
      consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
      version: "wc/v3"
    })

    this.initialized = true
    console.log("✅ WooCommerce service initialized")
  }

  // ============ PRODUCTS ============

  async listProducts(query = {}) {
    await this.init()
    return await this.api.get("products", query)
  }

  async getProduct(productId) {
    await this.init()
    return await this.api.get(`products/${productId}`)
  }

  async searchProducts(searchTerm, limit = 10) {
    await this.init()
    return await this.api.get("products", {
      search: searchTerm,
      per_page: limit
    })
  }

  async getProductsByCategory(categoryId) {
    await this.init()
    return await this.api.get("products", {
      category: categoryId,
      per_page: 20
    })
  }

  async getProductCategories() {
    await this.init()
    return await this.api.get("products/categories", { per_page: 50 })
  }

  // ============ ORDERS ============

  async getOrder(orderId) {
    await this.init()
    return await this.api.get(`orders/${orderId}`)
  }

  async searchOrdersByEmail(email) {
    await this.init()
    return await this.api.get("orders", {
      email: email,
      per_page: 10
    })
  }

  async searchOrdersByPhone(phone) {
    await this.init()
    return await this.api.get("orders", {
      billing_phone: phone,
      per_page: 10
    })
  }

  async getCustomerOrders(customerId) {
    await this.init()
    return await this.api.get("orders", {
      customer: customerId,
      per_page: 20
    })
  }

  // ============ CUSTOMERS ============

  async getCustomer(customerId) {
    await this.init()
    return await this.api.get(`customers/${customerId}`)
  }

  async searchCustomersByEmail(email) {
    await this.init()
    const customers = await this.api.get("customers", {
      email: email
    })
    return customers[0] || null
  }

  async searchCustomersByPhone(phone) {
    await this.init()
    const customers = await this.api.get("customers", {
      billing_phone: phone
    })
    return customers[0] || null
  }

  // ============ COUPONS ============

  async getCoupons() {
    await this.init()
    return await this.api.get("coupons", { per_page: 50 })
  }

  async getCoupon(code) {
    await this.init()
    const coupons = await this.api.get("coupons", {
      code: code.toLowerCase()
    })
    return coupons[0] || null
  }

  // ============ HELPER METHODS ============

  formatProductForWhatsApp(product) {
    let text = `*${product.name}*\n\n`
    
    if (product.short_description) {
      text += `${product.short_description.replace(/<[^>]*>/g, '').substring(0, 200)}...\n\n`
    }
    
    if (product.price) {
      text += `💰 Precio: ${product.price} ${product.currency_symbol || '€'}\n`
    }
    
    if (product.sku) {
      text += `🏷️ SKU: ${product.sku}\n`
    }
    
    if (product.stock_status === 'instock') {
      text += `✅ En stock\n`
    } else if (product.stock_status === 'outofstock') {
      text += `❌ Agotado\n`
    }
    
    if (product.images && product.images.length > 0) {
      text += `\n🖼️ ${product.images[0].src}`
    }
    
    if (product.permalink) {
      text += `\n🔗 ${product.permalink}`
    }
    
    return text
  }

  formatOrderForWhatsApp(order) {
    let text = `📦 *Pedido #${order.id}*\n\n`
    
    text += `📍 Estado: ${this.formatOrderStatus(order.status)}\n`
    text += `📅 Fecha: ${new Date(order.date_created).toLocaleDateString('es-ES')}\n`
    text += `💰 Total: ${order.total} ${order.currency}\n`
    
    if (order.line_items && order.line_items.length > 0) {
      text += `\n📋 Items:\n`
      order.line_items.forEach(item => {
        text += `• ${item.quantity}x ${item.name}`
        if (item.price) {
          text += ` - ${item.total} ${order.currency}`
        }
        text += `\n`
      })
    }
    
    if (order.shipping_address) {
      const { city, state, country } = order.shipping_address
      text += `\n📮 Envío: ${city}, ${state}, ${country}`
    }
    
    if (order.payment_method_title) {
      text += `\n💳 Pago: ${order.payment_method_title}`
    }
    
    if (order.shipping_lines && order.shipping_lines.length > 0) {
      text += `\n🚚 Envío: ${order.shipping_lines[0].method_title}`
    }
    
    return text
  }

  formatOrderStatus(status) {
    const statusMap = {
      pending: "⏳ Pendiente",
      processing: "🔄 Procesando",
      on_hold: "⏸️ En espera",
      completed: "✅ Completado",
      cancelled: "❌ Cancelado",
      refunded: "↩️ Reembolsado",
      failed: "❌ Fallido",
      checkout_draft: "📝 Borrador"
    }
    return statusMap[status] || status
  }

  formatCouponForWhatsApp(coupon) {
    let text = `🏷️ *Cupón: ${coupon.code}*\n\n`
    
    if (coupon.description) {
      text += `${coupon.description}\n\n`
    }
    
    if (coupon.discount_type === 'percent') {
      text += `💰 ${coupon.amount}% de descuento`
    } else {
      text += `💰 ${coupon.amount} ${coupon.currency_symbol || '€'} de descuento`
    }
    
    if (coupon.minimum_amount) {
      text += `\n📦 Mínimo: ${coupon.minimum_amount}`
    }
    
    if (coupon.usage_count_limit) {
      const remaining = coupon.usage_limit - coupon.usage_count
      if (remaining > 0) {
        text += `\n📊 Restantes: ${remaining}`
      }
    }
    
    if (coupon.date_expires) {
      const expiry = new Date(coupon.date_expires)
      text += `\n⏰ Vence: ${expiry.toLocaleDateString('es-ES')}`
    }
    
    return text
  }

  // ============ BULK OPERATIONS ============

  async getAllProducts(page = 1, perPage = 100) {
    await this.init()
    return await this.api.get("products", {
      page,
      per_page: perPage,
      orderby: 'date',
      order: 'desc'
    })
  }

  async getRecentOrders(days = 7) {
    await this.init()
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)
    
    return await this.api.get("orders", {
      after: dateFrom.toISOString(),
      per_page: 50,
      orderby: 'date',
      order: 'desc'
    })
  }
}

export default new WooCommerceService()
