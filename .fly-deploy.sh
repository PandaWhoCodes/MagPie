#!/bin/bash

# Fly.io Deployment Helper Script
# This script helps you deploy the MagPie Event Registration Platform to fly.io

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MagPie Event Registration - Fly.io Deployment Helper    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if flyctl is installed
if ! command -v fly &> /dev/null; then
    echo -e "${RED}✗ flyctl is not installed${NC}"
    echo -e "${YELLOW}Install it with: brew install flyctl${NC}"
    exit 1
fi

echo -e "${GREEN}✓ flyctl is installed${NC}"

# Check if authenticated
if ! fly auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ Not authenticated with fly.io${NC}"
    echo -e "${BLUE}Authenticating...${NC}"
    fly auth login
fi

echo -e "${GREEN}✓ Authenticated with fly.io${NC}"
echo ""

# Menu
echo "What would you like to do?"
echo ""
echo "1. Create new app (first time setup)"
echo "2. Set secrets"
echo "3. Deploy application"
echo "4. View logs"
echo "5. Check status"
echo "6. Open app in browser"
echo "7. SSH into container"
echo "8. Exit"
echo ""
read -p "Choose an option (1-8): " choice

case $choice in
    1)
        echo -e "${BLUE}Creating new fly.io app...${NC}"
        fly apps create b2l-registration
        echo -e "${GREEN}✓ App created${NC}"
        echo -e "${YELLOW}Next step: Set secrets (option 2)${NC}"
        ;;
    2)
        echo -e "${BLUE}Setting secrets...${NC}"
        echo ""
        echo "You'll need these values from your .env files:"
        echo "- TURSO_DATABASE_URL"
        echo "- TURSO_AUTH_TOKEN"
        echo "- CLERK_SECRET_KEY"
        echo "- TWILIO_ACCOUNT_SID"
        echo "- TWILIO_AUTH_TOKEN"
        echo "- TWILIO_WHATSAPP_NUMBER"
        echo "- RESEND_API_KEY"
        echo "- RESEND_FROM_EMAIL"
        echo "- VITE_CLERK_PUBLISHABLE_KEY"
        echo ""
        read -p "Press Enter to continue..."

        fly secrets set \
          TURSO_DATABASE_URL="$(grep TURSO_DATABASE_URL backend/.env | cut -d '=' -f2-)" \
          TURSO_AUTH_TOKEN="$(grep TURSO_AUTH_TOKEN backend/.env | cut -d '=' -f2-)" \
          CLERK_SECRET_KEY="$(grep CLERK_SECRET_KEY backend/.env | cut -d '=' -f2-)" \
          TWILIO_ACCOUNT_SID="$(grep TWILIO_ACCOUNT_SID backend/.env | cut -d '=' -f2-)" \
          TWILIO_AUTH_TOKEN="$(grep TWILIO_AUTH_TOKEN backend/.env | cut -d '=' -f2-)" \
          TWILIO_WHATSAPP_NUMBER="$(grep TWILIO_WHATSAPP_NUMBER backend/.env | cut -d '=' -f2-)" \
          RESEND_API_KEY="$(grep RESEND_API_KEY backend/.env | cut -d '=' -f2-)" \
          RESEND_FROM_EMAIL="$(grep RESEND_FROM_EMAIL backend/.env | cut -d '=' -f2-)" \
          VITE_CLERK_PUBLISHABLE_KEY="$(grep VITE_CLERK_PUBLISHABLE_KEY frontend/.env | cut -d '=' -f2-)" \
          FRONTEND_URL="https://b2l-registration.fly.dev"

        echo -e "${GREEN}✓ Secrets set${NC}"
        echo -e "${YELLOW}Next step: Deploy application (option 3)${NC}"
        ;;
    3)
        echo -e "${BLUE}Deploying application...${NC}"
        echo -e "${YELLOW}⚠ Build secrets need actual values, extracting from frontend/.env...${NC}"

        # Extract Clerk publishable key from .env file
        CLERK_PUB_KEY=$(grep VITE_CLERK_PUBLISHABLE_KEY frontend/.env | cut -d '=' -f2-)

        if [ -z "$CLERK_PUB_KEY" ]; then
            echo -e "${RED}✗ VITE_CLERK_PUBLISHABLE_KEY not found in frontend/.env${NC}"
            echo -e "${YELLOW}Please add it to frontend/.env or pass it manually:${NC}"
            echo -e "${YELLOW}fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key${NC}"
            exit 1
        fi

        echo -e "${GREEN}✓ Found Clerk key, deploying...${NC}"
        fly deploy --build-secret VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PUB_KEY
        echo -e "${GREEN}✓ Deployment complete${NC}"
        echo -e "${YELLOW}Your app is live at: https://b2l-registration.fly.dev${NC}"
        ;;
    4)
        echo -e "${BLUE}Viewing logs (Ctrl+C to exit)...${NC}"
        fly logs
        ;;
    5)
        echo -e "${BLUE}Checking app status...${NC}"
        fly status
        ;;
    6)
        echo -e "${BLUE}Opening app in browser...${NC}"
        fly open
        ;;
    7)
        echo -e "${BLUE}Opening SSH console...${NC}"
        fly ssh console
        ;;
    8)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
