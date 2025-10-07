# Deployment Guide - MagPie Event Registration Platform

Guide for deploying the application to production on Render or other platforms.

## Table of Contents
- [Render Deployment (Recommended)](#render-deployment-recommended)
- [Manual Deployment](#manual-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

---

## Render Deployment (Recommended)

Render provides automatic deployments with a simple `render.yaml` configuration.

### Prerequisites

- GitHub/GitLab repository
- Render account (free tier available)
- Turso database (free tier available)

### Step 1: Prepare Repository

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin master
   ```

2. **Verify** `render.yaml` exists in root

### Step 2: Create Turso Database

1. **Sign up** at https://turso.tech
2. **Create database**:
   ```bash
   turso db create b2l-registration
   ```
3. **Get credentials**:
   ```bash
   turso db show b2l-registration --url
   turso db tokens create b2l-registration
   ```
4. **Save** URL and token for later

### Step 3: Deploy to Render

1. **Go to** https://dashboard.render.com
2. **Click** "New +" → "Blueprint"
3. **Connect** your GitHub repository
4. **Render detects** `render.yaml` automatically
5. **Add environment variables**:
   - `TURSO_DATABASE_URL`: Your Turso database URL
   - `TURSO_AUTH_TOKEN`: Your Turso auth token
   - `FRONTEND_URL`: Your frontend URL (will be provided after frontend deploys)
   - `TWILIO_ACCOUNT_SID`: (Optional) Twilio account SID
   - `TWILIO_AUTH_TOKEN`: (Optional) Twilio auth token
   - `TWILIO_WHATSAPP_NUMBER`: (Optional) Twilio WhatsApp number

6. **Click** "Apply"
7. **Wait** for deployment (5-10 minutes)

### Step 4: Update Frontend URL

1. **After deployment**, Render provides URLs
2. **Copy backend URL** (e.g., `https://your-app.onrender.com`)
3. **Update frontend** `.env`:
   ```env
   VITE_API_URL=https://your-app.onrender.com
   ```
4. **Update backend** `FRONTEND_URL` env var to frontend URL
5. **Redeploy** if needed

---

## Manual Deployment

### Backend Deployment

#### Docker (Recommended)

**Create** `Dockerfile` in backend/:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run**:
```bash
docker build -t b2l-backend .
docker run -p 8000:8000 --env-file .env b2l-backend
```

#### Traditional Server

**Install dependencies**:
```bash
pip install -r requirements.txt
```

**Run with Gunicorn** (production ASGI server):
```bash
pip install gunicorn uvicorn[standard]
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Systemd service** (`/etc/systemd/system/b2l-backend.service`):
```ini
[Unit]
Description=MagPie Backend
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/var/www/b2l_registration/backend
Environment="PATH=/var/www/b2l_registration/backend/venv/bin"
ExecStart=/var/www/b2l_registration/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Frontend Deployment

#### Build for Production

```bash
cd frontend
npm run build
```

This creates `dist/` folder with optimized static files.

#### Deploy to Static Host

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Vercel**:
```bash
npm install -g vercel
vercel --prod
```

**AWS S3 + CloudFront**:
```bash
aws s3 sync dist/ s3://your-bucket-name/
```

**Nginx**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/b2l_registration/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Environment Variables

### Backend

**Required**:
```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_auth_token
FRONTEND_URL=https://your-frontend-domain.com
```

**Optional** (WhatsApp):
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Frontend

```env
VITE_API_URL=https://your-backend-domain.com
```

---

## Database Setup

### Turso (Recommended)

**Advantages**:
- Free tier (500MB, 1B row reads/month)
- Global edge network
- Automatic backups
- Zero-downtime migrations

**Setup**:
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create b2l-registration

# Get connection details
turso db show b2l-registration

# Create auth token
turso db tokens create b2l-registration
```

### Alternative: PostgreSQL

**Install** `psycopg2` and update database code:
```bash
pip install psycopg2-binary
```

**Connection string**:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

---

## Post-Deployment

### Health Checks

**Backend**:
```bash
curl https://your-backend-domain.com/health
```

**Frontend**:
- Visit `https://your-frontend-domain.com`
- Check browser console for errors

### DNS Configuration

**Point domain to Render**:
```
Type: CNAME
Name: @
Value: your-app.onrender.com
```

### SSL Certificate

Render provides automatic SSL certificates via Let's Encrypt.

For custom domains:
1. Add custom domain in Render
2. Update DNS records
3. Wait for SSL provisioning (few minutes)

### Monitoring

**Render Dashboard**:
- View logs
- Monitor resource usage
- Check deployment status

**External Monitoring**:
- UptimeRobot
- Pingdom
- StatusCake

### Backups

**Turso**:
- Automatic backups enabled
- Point-in-time recovery

**Manual Backups**:
```bash
# Export database
turso db shell b2l-registration .dump > backup.sql

# Import database
turso db shell b2l-registration < backup.sql
```

---

## Performance Optimization

### Backend

**Caching**:
- Redis for session storage
- CDN for static assets

**Database**:
- Connection pooling
- Query optimization
- Index optimization

### Frontend

**Build Optimization**:
- Code splitting
- Tree shaking
- Minification (automatic with Vite)

**CDN**:
- Cloudflare
- AWS CloudFront
- Fastly

**Image Optimization**:
- WebP format
- Lazy loading
- Responsive images

---

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] Database credentials rotated
- [ ] Backups tested
- [ ] Monitoring setup
- [ ] Error logging configured
- [ ] Security headers set

---

## Troubleshooting

### Deployment Fails

**Check**:
- Build logs in Render/platform dashboard
- Environment variables set correctly
- Dependencies in requirements.txt
- Python version matches (3.11+)

### Database Connection Errors

**Check**:
- Turso credentials correct
- Database URL format
- Network connectivity
- Token not expired

### CORS Errors

**Check**:
- `FRONTEND_URL` matches actual frontend domain
- Include protocol (https://)
- No trailing slash

### WhatsApp Not Working

**Check**:
- Twilio credentials set
- Sandbox activated
- Recipients joined sandbox
- Account has credits

---

## Rollback Procedure

### Render

1. Go to **Deployments** tab
2. Click **"Rollback"** on previous deployment
3. Confirm rollback

### Manual

1. **Checkout previous commit**:
   ```bash
   git checkout <previous-commit-hash>
   ```
2. **Redeploy**
3. **Update DNS** if needed

---

## Cost Estimation

### Free Tier (Development)

- **Render**: Free (with cold starts)
- **Turso**: Free (500MB, 1B reads)
- **Total**: $0/month

### Production (Small Scale)

- **Render**: $7/month (Starter plan)
- **Turso**: Free (within limits)
- **Twilio**: Pay-per-message (~₹0.75/msg)
- **Total**: ~$7/month + message costs

### Production (Medium Scale)

- **Render**: $25/month (Standard plan)
- **Turso**: $29/month (Scaler plan)
- **CDN**: $5/month
- **Total**: ~$60/month + message costs

---

## Next Steps

- [Setup Guide](SETUP.md)
- [Features Documentation](FEATURES.md)
- [API Documentation](API.md)
- [WhatsApp Setup](WHATSAPP_SETUP.md)

---

## Support

For deployment issues:
- Check Render documentation
- Review error logs
- Contact support
- Open GitHub issue
