# Strapi CMS Deployment Guide

## Quick Deploy to Railway (Recommended)

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Sign up with GitHub (free $5 credit, no credit card required)

### Step 2: Deploy Strapi
1. Click "New Project"
2. Select "Deploy from Template"
3. Search for "Strapi" or use this direct link: https://railway.app/template/strapi
4. Click "Deploy Now"
5. Configure the following:
   - **Project Name**: `ganggreen-cms`
   - **Region**: Choose closest to your users (US East recommended)
   - Railway will automatically provision PostgreSQL database

### Step 3: Get Your Strapi URL
1. Once deployed (takes ~5 minutes), click on your Strapi service
2. Go to "Settings" tab
3. Under "Networking", click "Generate Domain"
4. Your Strapi URL will be something like: `https://ganggreen-cms-production.up.railway.app`
5. Save this URL - you'll need it for environment variables

### Step 4: Access Strapi Admin
1. Visit your Strapi URL + `/admin` (e.g., `https://ganggreen-cms-production.up.railway.app/admin`)
2. Create your admin account:
   - Username: (your choice)
   - Email: (your email)
   - Password: (strong password - save it!)

### Step 5: Configure Environment Variables in Railway
1. In Railway dashboard, click on your Strapi service
2. Go to "Variables" tab
3. Add these variables:
   ```
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=<generate-random-string>
   API_TOKEN_SALT=<generate-random-string>
   ADMIN_JWT_SECRET=<generate-random-string>
   TRANSFER_TOKEN_SALT=<generate-random-string>
   JWT_SECRET=<generate-random-string>
   ```
   
   To generate random strings, use: https://generate-secret.vercel.app/32

4. Railway automatically sets DATABASE_URL for PostgreSQL

### Step 6: Get API Token for Frontend
1. In Strapi Admin, go to "Settings" → "API Tokens"
2. Click "Create new API Token"
3. Configure:
   - Name: `Frontend Token`
   - Token type: `Read-only`
   - Token duration: `Unlimited`
4. Click "Save"
5. Copy the token (you won't see it again!)
6. Save this token for your frontend `.env` file

---

## Alternative: Deploy to Render

### Step 1: Sign Up for Render
1. Go to https://render.com
2. Sign up with GitHub (free tier available)

### Step 2: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   - Name: `ganggreen-cms-db`
   - Database: `strapi`
   - User: `strapi`
   - Region: Choose closest to your users
   - Plan: Free
3. Click "Create Database"
4. Copy the "Internal Database URL" (starts with `postgresql://`)

### Step 3: Deploy Strapi
1. Fork this Strapi starter: https://github.com/strapi/strapi-starter-next-blog
2. In Render, click "New +" → "Web Service"
3. Connect your forked repository
4. Configure:
   - Name: `ganggreen-cms`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Plan: Free (or Starter for better performance)

### Step 4: Add Environment Variables in Render
1. In your web service settings, go to "Environment"
2. Add these variables:
   ```
   NODE_ENV=production
   HOST=0.0.0.0
   PORT=10000
   DATABASE_URL=<your-internal-database-url>
   APP_KEYS=<generate-random-string>
   API_TOKEN_SALT=<generate-random-string>
   ADMIN_JWT_SECRET=<generate-random-string>
   TRANSFER_TOKEN_SALT=<generate-random-string>
   JWT_SECRET=<generate-random-string>
   ```

3. Click "Save Changes" and wait for redeploy

### Step 5: Access Strapi Admin
1. Visit your Render URL + `/admin`
2. Create admin account as described above

---

## Post-Deployment Configuration

### 1. Configure CORS
In Strapi Admin:
1. Go to "Settings" → "Global Settings" → "CORS"
2. Add your frontend domains:
   - `https://gg.lochtech.africa`
   - `http://localhost:3000` (for development)
3. Save

### 2. Set Up Public Permissions
1. Go to "Settings" → "Users & Permissions Plugin" → "Roles"
2. Click "Public"
3. Enable these permissions:
   - **Legal-document**: `find`, `findOne`
   - **Blog-post**: `find`, `findOne`
   - **Partner**: `find`, `findOne`
   - **Faq**: `find`, `findOne`
4. Save

### 3. Configure Media Library
1. Go to "Settings" → "Media Library"
2. Enable responsive images
3. Set image optimization quality to 80%

---

## Frontend Environment Variables

Once Strapi is deployed, add these to your `.env` file:

```bash
# Strapi CMS Configuration
VITE_STRAPI_URL=https://your-strapi-url.railway.app
VITE_STRAPI_API_TOKEN=your-read-only-api-token
```

Replace:
- `your-strapi-url.railway.app` with your actual Strapi URL
- `your-read-only-api-token` with the token you created

---

## Costs

### Railway
- Free tier: $5 credit/month (enough for small projects)
- Hobby plan: $5/month for 500 hours
- Estimated cost: $10-20/month for production

### Render
- Free tier: Available but with limitations (spins down after inactivity)
- Starter plan: $7/month for web service + $7/month for database
- Estimated cost: $14/month minimum

---

## Next Steps

Once Strapi is deployed:
1. ✅ Save your Strapi URL and API token
2. ✅ Update your `.env` file with the values
3. ✅ Let me know when ready, and we'll start implementing the frontend integration!

---

## Troubleshooting

### Deployment fails
- Check Railway/Render logs for errors
- Ensure all environment variables are set correctly
- Verify PostgreSQL database is running

### Can't access admin panel
- Make sure you're using `/admin` path
- Check if service is fully deployed (not building)
- Try clearing browser cache

### CORS errors
- Verify your frontend domain is added to CORS settings
- Check that public permissions are enabled
- Ensure API token has correct permissions

### Database connection issues
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure database credentials are valid
