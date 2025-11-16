# Fly.io Deployment Guide

This guide covers deploying the MagPie Event Registration Platform to fly.io as a unified application where FastAPI serves the React frontend as static files.

## Architecture Overview

**Unified Deployment Model:**
- Single fly.io app
- FastAPI backend serves the built React frontend
- Frontend uses relative URLs (`/api`) for API calls
- No CORS issues (same domain)
- Simpler management and lower cost than separate deployments

**Components:**
- Multi-stage Docker build (Node.js → Python)
- FastAPI with static file serving
- Health checks on `/health` endpoint
- Auto-scaling with fly.io machines

## Prerequisites

1. **Install flyctl CLI:**
   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign up and authenticate:**
   ```bash
   fly auth signup  # Create account
   # or
   fly auth login   # Login to existing account
   ```

3. **Prepare environment variables:**
   - Turso database credentials
   - Clerk authentication keys
   - Twilio credentials (for WhatsApp)
   - Resend API key (for email)

## Deployment Steps

### 1. Create Fly.io Application

```bash
# Navigate to project root
cd /path/to/b2l_registration

# Create app (choose a unique name if b2l-registration is taken)
fly apps create b2l-registration

# Or let fly.io generate a name
fly apps create
```

### 2. Set Environment Secrets

**Set all secrets in one command:**
```bash
fly secrets set \
  TURSO_DATABASE_URL="libsql://b2lregistration-pandawhocodes.aws-ap-south-1.turso.io" \
  TURSO_AUTH_TOKEN="your_turso_auth_token" \
  CLERK_SECRET_KEY="sk_test_..." \
  TWILIO_ACCOUNT_SID="ACxxxxxxxxx" \
  TWILIO_AUTH_TOKEN="your_twilio_token" \
  TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886" \
  RESEND_API_KEY="re_..." \
  RESEND_FROM_EMAIL="onboarding@resend.dev" \
  VITE_CLERK_PUBLISHABLE_KEY="pk_test_..." \
  FRONTEND_URL="https://b2l-registration.fly.dev"
```

**Or set them individually:**
```bash
fly secrets set TURSO_DATABASE_URL="libsql://..."
fly secrets set TURSO_AUTH_TOKEN="your_token"
fly secrets set CLERK_SECRET_KEY="sk_test_..."
fly secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxx"
fly secrets set TWILIO_AUTH_TOKEN="your_token"
fly secrets set TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
fly secrets set RESEND_API_KEY="re_..."
fly secrets set RESEND_FROM_EMAIL="onboarding@resend.dev"
fly secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
fly secrets set FRONTEND_URL="https://b2l-registration.fly.dev"
```

**View all secrets:**
```bash
fly secrets list
```

### 3. Deploy Application

**Deploy with build secret:**
```bash
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY
```

This command will:
1. Build the Docker image with multi-stage build
2. Build the React frontend with Vite
3. Copy built frontend to Python image
4. Deploy to fly.io
5. Run health checks
6. Start serving traffic

**Monitor deployment:**
```bash
fly logs
```

### 4. Verify Deployment

**Check app status:**
```bash
fly status
```

**Open app in browser:**
```bash
fly open
```

**Check health endpoint:**
```bash
curl https://b2l-registration.fly.dev/health
```

Expected response:
```json
{"status": "healthy"}
```

**Test API endpoints:**
```bash
curl https://b2l-registration.fly.dev/api/branding/
curl https://b2l-registration.fly.dev/api/events/active
```

### 5. Update Clerk Allowed Origins

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys** → **Allowed Origins**
4. Add your fly.io URL:
   - `https://b2l-registration.fly.dev`
   - `https://*.fly.dev` (wildcard for all fly.dev domains)

## Configuration Files

### fly.toml
Located at project root. Key configurations:
- **App name**: `b2l-registration`
- **Region**: `sin` (Singapore)
- **Port**: 8080
- **Memory**: 512MB
- **Health checks**: `/health` every 30s
- **Auto-scaling**: Stop/start machines based on traffic

### Dockerfile
Multi-stage build:
1. **Stage 1**: Node.js 18 Alpine
   - Build React frontend with Vite
   - Use build secret for `VITE_CLERK_PUBLISHABLE_KEY`
2. **Stage 2**: Python 3.11 Slim
   - Install backend dependencies
   - Copy backend code and built frontend
   - Run as non-root user
   - Uvicorn with 2 workers

## Management Commands

### View Logs
```bash
# Tail logs in real-time
fly logs

# View last 100 lines
fly logs -a b2l-registration
```

### Scale Resources
```bash
# Scale to 1GB memory
fly scale memory 1024

# Scale to 2 CPUs
fly scale vm shared-cpu-2x

# Set minimum machines
fly scale count 1
```

### SSH into Container
```bash
fly ssh console
```

### Restart Application
```bash
fly apps restart
```

### View Metrics
```bash
fly dashboard
# Opens web dashboard with metrics
```

## Environment Variables

### Required Secrets (fly secrets set)
| Variable | Description | Example |
|----------|-------------|---------|
| `TURSO_DATABASE_URL` | Turso database URL | `libsql://...` |
| `TURSO_AUTH_TOKEN` | Turso authentication token | `eyJ...` |
| `CLERK_SECRET_KEY` | Clerk backend secret key | `sk_test_...` |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | `ACxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `your_token` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | `whatsapp:+14155238886` |
| `RESEND_API_KEY` | Resend email API key | `re_...` |
| `RESEND_FROM_EMAIL` | Sender email address | `onboarding@resend.dev` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key (build secret) | `pk_test_...` |
| `FRONTEND_URL` | Your app's URL | `https://b2l-registration.fly.dev` |

### Public Environment Variables (fly.toml)
| Variable | Value | Description |
|----------|-------|-------------|
| `IS_LOCAL` | `false` | Use remote Turso database |

## Cost Estimation

**Fly.io Free Tier:**
- Up to 3 shared-cpu-1x VMs with 256MB RAM
- 160GB outbound data transfer
- SSL certificates included

**Estimated Monthly Cost (Hobby/Production):**
- **Free tier**: $0/month (sufficient for testing)
- **Paid tier**: ~$5-10/month for 512MB RAM, 1 shared CPU
- Additional costs for higher traffic/resources

**Cost Optimization:**
- Enable auto-stop/auto-start (saves money during low traffic)
- Use shared CPUs instead of dedicated
- Monitor with `fly dashboard`

## Updating the Application

### Deploy New Changes
```bash
# Make your changes locally
git add .
git commit -m "Your changes"

# Deploy updated version
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY
```

### Rollback to Previous Version
```bash
# List releases
fly releases

# Rollback to specific version
fly releases rollback v2
```

## Troubleshooting

### Check Application Health
```bash
fly checks list
```

### View Detailed Logs
```bash
# Filter by level
fly logs --level error

# Filter by region
fly logs --region sin
```

### Common Issues

#### 1. Build Fails with "Secret not found"
**Solution:** Ensure you run deploy with build secret:
```bash
fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY
```

#### 2. Frontend Shows 404
**Solution:** Check that frontend dist exists and static routes are configured:
```bash
fly ssh console
ls -la frontend/dist/
```

#### 3. API Calls Fail with CORS
**Solution:** Since frontend and backend are same domain, CORS shouldn't be an issue. Check:
- Frontend uses relative URLs (`/api`)
- CORS middleware allows same origin

#### 4. Database Connection Fails
**Solution:** Verify Turso credentials:
```bash
fly secrets list
# Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set
```

#### 5. Health Check Fails
**Solution:** Check logs for errors:
```bash
fly logs
# Look for startup errors or database connection issues
```

### Debug Mode
```bash
# SSH into container
fly ssh console

# Check environment variables (secrets are hidden)
env | grep -v SECRET | grep -v TOKEN

# Check if frontend files exist
ls -la frontend/dist/

# Test health endpoint from inside container
curl localhost:8080/health

# Check Uvicorn logs
ps aux | grep uvicorn
```

## Custom Domain Setup

### Add Custom Domain
```bash
# Add your domain
fly certs create yourdomain.com

# View certificate status
fly certs show yourdomain.com
```

### DNS Configuration
Add these DNS records to your domain:
```
A     @    <your-app-ip>
AAAA  @    <your-app-ipv6>
```

Get IPs with:
```bash
fly ips list
```

## Monitoring and Alerts

### Built-in Monitoring
```bash
# View dashboard
fly dashboard

# View metrics
fly metrics
```

### Set Up Alerts
- Configure in fly.io dashboard
- Alerts for: downtime, memory usage, CPU usage
- Notifications: email, Slack, PagerDuty

## Security Best Practices

1. **Secrets Management:**
   - Never commit secrets to git
   - Use `fly secrets` for all sensitive data
   - Rotate secrets regularly

2. **Network Security:**
   - Force HTTPS (enabled by default)
   - Use firewall rules if needed
   - Restrict SSH access

3. **Application Security:**
   - Run as non-root user (configured in Dockerfile)
   - Keep dependencies updated
   - Monitor security advisories

4. **Database Security:**
   - Use Turso authentication tokens
   - Enable encryption at rest
   - Regular backups

## Backup and Recovery

### Database Backups
Turso handles backups automatically. To export data:
```bash
# SSH into app
fly ssh console

# Export from Turso (if needed)
# Turso provides automatic backups and point-in-time recovery
```

### Application Backups
- Git repository is your source of truth
- Container images stored in fly.io registry
- Can rollback to any previous release

## Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [Turso Documentation](https://docs.turso.tech/)
- [Clerk Documentation](https://clerk.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## Support

**Fly.io Support:**
- Community Forum: https://community.fly.io/
- Discord: https://fly.io/discord
- Email: support@fly.io

**Project Issues:**
- GitHub: https://github.com/PandaWhoCodes/b2l_registration/issues

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Configure custom domain (optional)
3. ✅ Set up monitoring and alerts
4. ✅ Update Clerk allowed origins
5. ✅ Test WhatsApp integration
6. ✅ Test email notifications
7. ✅ Run load testing
8. ✅ Document production URL for team

**Your app is live at:** `https://b2l-registration.fly.dev` 🎉
