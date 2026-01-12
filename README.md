# Enisi Center - E-commerce Platform

Complete free e-commerce solution with real-time POS integration.

## 🌟 Features

- ✅ **Completely Free Hosting** - Netlify + Supabase
- ✅ **Real-time POS Sync** - Bi-directional with ASP.NET Core
- ✅ **Live Inventory Updates** - No refresh needed
- ✅ **PostgreSQL Database** - Enterprise-grade, free tier
- ✅ **Serverless Functions** - Auto-scaling API
- ✅ **PayPal Integration** - Secure payments
- ✅ **Email Notifications** - Order confirmations
- ✅ **Instagram Integration** - Product imports
- ✅ **Admin Dashboard** - Manage products and orders

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- GitHub account
- Netlify account (free)
- Supabase account (free)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm start
```

### Deploy to Production

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment guide.

## 📁 Project Structure

```
dyqani/
├── assets/              # Images and icons
├── components/          # Reusable HTML components
├── css/                 # Stylesheets
├── database/            # Supabase SQL schemas
├── js/                  # Frontend JavaScript
│   ├── supabase-products.js    # Real-time product sync
│   ├── supabase-orders.js      # Order management
│   └── shopping-cart.js        # Cart functionality
├── netlify/
│   └── functions/       # Serverless API endpoints
│       ├── pos-webhook.js      # Receive POS updates
│       ├── sync-pos-products.js # Manual POS sync
│       └── create-pos-order.js  # Send orders to POS
├── pages/               # HTML pages
├── pos-integration/     # ASP.NET Core integration code
├── .env                 # Environment variables (local)
├── netlify.toml         # Netlify configuration
└── package.json         # Dependencies

```

## 🔧 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Webpack for bundling
- Real-time updates via Supabase

### Backend
- Netlify Serverless Functions (Node.js)
- Supabase (PostgreSQL + Real-time)
- ASP.NET Core POS API

### Services
- **Hosting**: Netlify (Free tier)
- **Database**: Supabase (Free tier: 500MB)
- **CDN**: Netlify Edge Network
- **Payments**: PayPal
- **Email**: Gmail API

## 🔌 POS Integration

### Architecture

```
ASP.NET POS → Webhook → Netlify Functions → Supabase → Real-time → Website
Website → Order → Netlify Functions → POS API → POS Database
```

### Setup Your ASP.NET POS

1. Copy `pos-integration/EcommerceWebhookController.cs` to your POS
2. Configure `appsettings.json` with webhook URL
3. Call webhooks when products/inventory change
4. Receive orders via `/api/webhooks/receive-order`

See **[POS_INTEGRATION.md](./POS_INTEGRATION.md)** for detailed guide.

## 📊 Database Schema

- **products** - Product catalog with stock levels
- **orders** - Customer orders and payment info
- **customers** - Customer database
- **inventory_sync** - POS inventory tracking
- **pos_webhook_log** - Webhook audit trail

See `database/schema.sql` for complete schema.

## 🌐 Environment Variables

Required environment variables (set in Netlify dashboard):

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# POS Integration
POS_API_URL=
POS_API_KEY=
POS_WEBHOOK_SECRET=

# Admin
ADMIN_USERNAME=
ADMIN_PASSWORD=

# Email
EMAIL_SERVICE_URL=
GMAIL_APP_PASSWORD=
STORE_EMAIL=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYPAL_CURRENCY=

# Instagram (optional)
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_APP_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```

See `.env` for all variables with example values.

## 💰 Cost Analysis

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Netlify | 100GB bandwidth | **$0** |
| Supabase | 500MB database | **$0** |
| PayPal | Transaction fees | 2.9% + $0.30 |
| **Total Fixed Cost** | | **$0/month** |

**Upgrade when**:
- Netlify Pro ($19/mo): >100GB bandwidth
- Supabase Pro ($25/mo): >500MB database

## 📈 Scaling Limits (Free Tier)

- **Database**: 500MB (~100K products, 500K orders)
- **Bandwidth**: 100GB (~1M page views/month)
- **Real-time**: 50K concurrent connections
- **Functions**: 125K invocations/month

## 🛠️ Development Scripts

```bash
# Development server
npm start

# Production build
npm run build

# Watch mode
npm run dev

# Local Netlify dev (with functions)
netlify dev
```

## 📱 Features Overview

### Customer Features
- Browse products with real-time inventory
- Shopping cart with persistence
- Multiple payment options (Cash on Delivery, PayPal)
- Order tracking
- Email confirmations

### Admin Features
- Product management
- Order management
- Inventory sync with POS
- Analytics dashboard

## 🔒 Security

- ✅ Row Level Security (Supabase)
- ✅ Webhook signature verification
- ✅ Environment variable protection
- ✅ HTTPS everywhere
- ✅ CORS protection
- ✅ Input validation

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[POS_INTEGRATION.md](./POS_INTEGRATION.md)** - POS integration architecture
- **[pos-integration/README.md](./pos-integration/README.md)** - ASP.NET setup guide

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Function Errors
```bash
# Check Netlify function logs
netlify functions:log pos-webhook

# Test locally
netlify dev
```

### Database Connection
- Verify `SUPABASE_URL` and keys in Netlify
- Check Supabase project status
- Review RLS policies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Support

- **Issues**: GitHub Issues
- **Email**: center.enisi@gmail.com
- **Netlify**: https://answers.netlify.com
- **Supabase**: https://discord.supabase.com

---

**Built with ❤️ for small businesses**

*Free, scalable, and production-ready e-commerce platform*
