# Caliente.pt WhatsApp Chatbot

WhatsApp chatbot for Caliente.pt e-commerce store.

## 🔗 Data Sources

### Medusa.js API
The bot connects to the existing Medusa.js backend:

- **Products:** `/store/products`
- **Orders:** `/admin/orders` (requires auth)
- **Customers:** `/admin/customers` (requires auth)

```
Backend: http://localhost:9000 (dev)
         https://api.caliente.pt (prod)
```

## 📞 Features

- ✅ Order status lookup
- ✅ Product search
- ✅ AI-powered responses (optional)
- ✅ Multi-language (ES/PT)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the bot
npm start
```

## 📁 Structure

```
src/
├── webhook.js         # WhatsApp webhook
├── handlers/          # Message handlers
├── services/          # API integrations
└── utils/
```

## 📚 Documentation

See: [Obsidian-Vault/Projects/caliente-whatsapp.md](./Obsidian-Vault/Projects/caliente-whatsapp.md)

---

**Built for Caliente.pt** 💕
