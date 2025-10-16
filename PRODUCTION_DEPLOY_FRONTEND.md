# MagPie Frontend - Production Deployment Guide

## Quick Start (Copy & Paste)

### Prerequisites
```bash
# Node.js 18+ and npm should be installed
node --version  # Should be v18+
npm --version
```

---

## 🚀 Basic Deployment (5 Minutes)

### Step 1: Clone & Install
```bash
git clone https://github.com/PandaWhoCodes/MagPie.git
cd MagPie/frontend
npm install
```

### Step 2: Configure Environment
```bash
cat > .env << 'EOF'
VITE_API_URL=https://your-backend-domain.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_key_here
EOF
```

### Step 3: Build
```bash
npm run build
```

### Step 4: Serve
```bash
# Option A: Quick test (temporary)
npx serve -s dist -l 3000

# Option B: Production with PM2 (recommended)
npm install -g pm2
pm2 serve dist 3000 --name magpie-frontend --spa
pm2 save
pm2 startup
```

---

## 📦 Deployment Options

### Option 1: Nginx (Best for VPS/Dedicated Servers)

```bash
# Install Nginx
sudo apt update && sudo apt install nginx -y

# Copy built files
sudo mkdir -p /var/www/magpie
sudo cp -r dist/* /var/www/magpie/

# Create Nginx config
sudo nano /etc/nginx/sites-available/magpie
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/magpie;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/magpie /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL (recommended)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

### Option 2: PM2 (Simple & Fast)

```bash
# Install PM2
npm install -g pm2

# Serve with PM2
cd MagPie/frontend
npm run build
pm2 serve dist 3000 --name magpie-frontend --spa

# Auto-restart on boot
pm2 save
pm2 startup

# View logs
pm2 logs magpie-frontend

# Restart
pm2 restart magpie-frontend
```

---

### Option 3: Docker (Containerized)

**Create `Dockerfile`:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `nginx.conf`:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Build & Run:**
```bash
docker build -t magpie-frontend .
docker run -d -p 3000:80 --name magpie-frontend magpie-frontend
```

---

### Option 4: Cloud Platforms (Easiest)

#### Render.com (Recommended)
1. Push code to GitHub
2. Go to https://render.com → New Static Site
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Environment Variables:**
     - `VITE_API_URL`: Your backend URL
     - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk key
5. Deploy! 🚀

#### Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## ⚙️ Environment Variables

Create `.env` file in `frontend/` directory:

```bash
# Backend API URL (REQUIRED)
VITE_API_URL=https://api.yourdomain.com/api

# Clerk Authentication (REQUIRED)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
```

**Important:**
- All variables must start with `VITE_` to be accessible in the app
- Change `pk_test_` to `pk_live_` for production
- Ensure backend CORS allows your frontend domain

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] `VITE_API_URL` points to production backend
- [ ] Backend CORS allows frontend domain
- [ ] Clerk authentication works (test sign in)
- [ ] SSL certificate installed (HTTPS enabled)
- [ ] DNS records configured
- [ ] Firewall allows HTTP/HTTPS traffic
- [ ] Test all pages and features
- [ ] Monitor logs for errors

---

## 🔧 Common Issues & Solutions

### Frontend shows "Cannot connect to server"
```bash
# Check VITE_API_URL in .env
# Verify backend is running
# Check CORS settings on backend
```

### Clerk authentication not working
```bash
# Verify VITE_CLERK_PUBLISHABLE_KEY is correct
# Ensure using pk_live_ key (not pk_test_)
# Check Clerk dashboard → Domains → Add your domain
# Ensure HTTPS is enabled (Clerk requires it)
```

### Blank page after deployment
```bash
# Check browser console for errors (F12)
# Verify dist folder has files
# Check web server is serving index.html
# Verify SPA routing is configured (try_files)
```

### 404 on page refresh
```bash
# Configure SPA routing in web server
# For Nginx: use try_files $uri $uri/ /index.html;
# For PM2: use --spa flag
```

---

## 📊 Monitoring

### PM2
```bash
pm2 status                    # Process status
pm2 logs magpie-frontend     # View logs
pm2 monit                     # Real-time monitoring
```

### Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Docker
```bash
docker logs -f magpie-frontend
docker stats magpie-frontend
```

---

## 🔄 Update Deployment

```bash
# Pull latest code
cd MagPie/frontend
git pull origin main

# Rebuild
npm install
npm run build

# PM2
pm2 restart magpie-frontend

# Nginx
sudo cp -r dist/* /var/www/magpie/
sudo systemctl reload nginx

# Docker
docker stop magpie-frontend
docker rm magpie-frontend
docker build -t magpie-frontend .
docker run -d -p 3000:80 --name magpie-frontend magpie-frontend
```

---

## 📈 Performance Optimization

1. **Enable HTTP/2** in Nginx
2. **Setup CDN** (Cloudflare, AWS CloudFront)
3. **Enable Brotli compression**
4. **Add service workers** for offline support
5. **Use preconnect** for API domain:
   ```html
   <link rel="preconnect" href="https://api.yourdomain.com">
   ```

---

## 🆘 Support

- **Documentation:** https://github.com/PandaWhoCodes/MagPie
- **Backend Setup:** See `PRODUCTION_DEPLOY_BACKEND.md`
- **Clerk Docs:** https://clerk.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

---

## 📝 Notes

- **Memory Usage:** Frontend is static files (~5 MB)
- **Build Time:** ~30 seconds
- **Bundle Size:** ~200-300 KB (gzipped)
- **Production Optimizations:** Automatic with Vite
- **Browser Support:** Modern browsers (ES2020+)

---

**Generated for MagPie Event Registration Platform**
Last Updated: 2025-10-14
