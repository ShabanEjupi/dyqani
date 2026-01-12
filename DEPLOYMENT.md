# 🚀 Free E-commerce Deployment Guide

## Complete Free Hosting Solution

Your e-commerce website is now configured for **completely free hosting** using:
- ✅ **Netlify** - Frontend hosting, serverless functions, CDN
- ✅ **Supabase** - PostgreSQL database with real-time sync
- ✅ **Real-time POS Integration** - Bi-directional sync with ASP.NET Core

## Prerequisites

1. GitHub account
2. Netlify account (free): https://netlify.com
3. Supabase account (free): https://supabase.com

## Step-by-Step Deployment

### Phase 1: Supabase Setup (10 minutes)

#### 1. Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `enisi-center-db`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
4. Click "Create new project" (takes 2-3 minutes)

#### 2. Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy contents of `database/schema.sql` and paste
4. Click "Run" (takes 5-10 seconds)
5. Create another query
6. Copy contents of `database/functions.sql` and paste
7. Click "Run"

#### 3. Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: Long JWT token
   - **service_role key**: Long JWT token (keep secret!)

### Phase 2: GitHub Setup (5 minutes)

#### 1. Create Repository

```bash
# Initialize git if not already
cd "C:\Users\shaban.ejupi\Desktop\Projektet\dyqani"
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/dyqani.git
git branch -M main
git push -u origin main
```

### Phase 3: Netlify Deployment (10 minutes)

#### 1. Connect to Netlify

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Click "GitHub" and authorize
4. Select your `dyqani` repository
5. Configure build settings:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `.`
   - **Functions directory**: `netlify/functions`

#### 2. Add Environment Variables

Click "Site settings" → "Environment variables" → "Add a variable"

Add ALL these variables (use values from your `.env` file):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

ADMIN_USERNAME=admin
ADMIN_PASSWORD=qabibani2002

EMAIL_SERVICE_URL=https://script.google.com/macros/s/AKfycbz8m00j69wKmI9cduO3TCgAqCLInxy4YNoc7x6FWagCRD_s47yXKhzELBrU3wj5i7k/exec
EMAIL_API_KEY=361672263:AAH4Z70G953dXb46c3m9b0HJN17sQ
GMAIL_APP_PASSWORD=wuzf eksy qvbg mohg

STORE_NAME=Enisi Center
STORE_EMAIL=center.enisi@gmail.com
STORE_SHIPPING_COST=2.00

PAYPAL_CLIENT_ID=AZtrRB6jra0YEO0fUBsmT5Hpnv7BQ-wZtGpxHGgVwWE8XOcJBOV8StGCm8b1g7E4l9OSLyXYhzXpGwIy
PAYPAL_SECRET=ELN8v8zjpy845SyczkT1FIGUI1bIhrAJpubrY9atudvT95EroI6UeBuELWuSX7F0o22VcapOzZzATaEi
PAYPAL_CURRENCY=EUR

INSTAGRAM_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
INSTAGRAM_APP_ID=13793385634912263
INSTAGRAM_APP_SECRET=1c7fcd744246ce8e955741af85f4c145
INSTAGRAM_BUSINESS_ACCOUNT_ID=969075465412836
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=601487530896654

POS_API_URL=https://your-pos-api.com/api
POS_API_KEY=your-pos-api-key
POS_WEBHOOK_SECRET=your-webhook-secret-here
```

**Important**: For each variable, set scope to "All scopes" for Production, Deploy Previews, and Branch deploys

#### 3. Deploy

1. Click "Deploy site"
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://random-name-12345.netlify.app`

#### 4. Custom Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### Phase 4: POS Integration Setup

#### Option 1: Your POS is Already Running

1. Copy the C# controller from `pos-integration/EcommerceWebhookController.cs` to your POS project
2. Update `appsettings.json` in your POS:
   ```json
   {
     "EcommerceWebhook": {
       "Url": "https://your-site.netlify.app/webhooks/pos",
       "Secret": "your-webhook-secret-matching-env"
     }
   }
   ```
3. Add `services.AddHttpClient();` to your `Program.cs`
4. Deploy your POS
5. Test by updating a product in POS

#### Option 2: Testing Without POS

1. Use the manual sync function:
   ```javascript
   // In browser console on your site
   await supabaseProducts.syncFromPOS();
   ```

2. Or call the Netlify function directly:
   ```bash
   curl -X POST https://your-site.netlify.app/.netlify/functions/sync-pos-products
   ```

### Phase 5: Verify Everything Works

#### 1. Test Database Connection

1. Go to your deployed site
2. Open browser console (F12)
3. Run:
   ```javascript
   await supabaseProducts.loadProductsFromSupabase()
   ```
4. You should see sample products

#### 2. Test Real-time Updates

1. Go to Supabase dashboard
2. Open **Table Editor** → `products`
3. Edit a product (change price or name)
4. Watch your website update in real-time! 🎉

#### 3. Test Order Creation

1. Add products to cart on your site
2. Complete checkout
3. Check Supabase **Table Editor** → `orders`
4. Verify order was created

## Monitoring & Maintenance

### Netlify Dashboard

- **Deploys**: See build history and logs
- **Functions**: View function invocations and errors
- **Analytics**: Track bandwidth usage

### Supabase Dashboard

- **Table Editor**: View/edit data directly
- **SQL Editor**: Run custom queries
- **Database**: Monitor size and connections
- **Logs**: View real-time database logs

## Cost Breakdown

| Service | Free Tier Limits | Enough For |
|---------|-----------------|------------|
| **Netlify** | 100GB bandwidth, 300 build mins | ~1M page views/month |
| **Supabase** | 500MB database, 50K users | ~100K products, 500K orders |
| **Total Cost** | **$0/month** | Small to medium business |

## When to Upgrade

### Netlify Pro ($19/month) - Upgrade when:
- Using >100GB bandwidth/month
- Need background functions
- Want analytics

### Supabase Pro ($25/month) - Upgrade when:
- Database >500MB
- Need >50K active users
- Want point-in-time recovery

**Most businesses won't need to upgrade for years!**

## Troubleshooting

### Build fails on Netlify
- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure `package.json` dependencies are correct

### Functions not working
- Check function logs: Netlify dashboard → Functions
- Verify environment variables
- Test locally: `netlify dev`

### Real-time not updating
- Check browser console for errors
- Verify Supabase connection
- Check Row Level Security policies in Supabase

### Orders not syncing to POS
- Verify POS webhook URL is correct
- Check POS is accessible (not localhost)
- Review Netlify function logs

## Local Development

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run local dev server with functions
netlify dev

# Your site runs at: http://localhost:8888
# Functions at: http://localhost:8888/.netlify/functions/
```

## Updating Your Site

```bash
# Make changes
# Commit and push to GitHub
git add .
git commit -m "Update feature X"
git push

# Netlify auto-deploys! 🚀
```

## Security Checklist

✅ Environment variables set in Netlify (not hardcoded)
✅ Supabase RLS policies enabled
✅ Webhook signatures verified
✅ HTTPS everywhere
✅ Service role key kept secret

## Next Steps

1. ✅ **Test thoroughly** - Place test orders, update products
2. ✅ **Configure custom domain** - Make it professional
3. ✅ **Set up POS webhooks** - Enable real-time sync
4. ✅ **Monitor analytics** - Track usage and performance
5. ✅ **Add more products** - Populate your inventory

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Community**: https://answers.netlify.com
- **Supabase Discord**: https://discord.supabase.com

---

## 🎉 Congratulations!

Your e-commerce site is now:
- ✅ Hosted for FREE
- ✅ Using enterprise-grade database
- ✅ Real-time sync capable
- ✅ Auto-scaling with traffic
- ✅ Globally distributed CDN
- ✅ POS integration ready

**Total setup cost: $0**
**Monthly cost: $0**
**Total time: ~30 minutes**

Enjoy your fully-featured, production-ready e-commerce platform! 🚀
