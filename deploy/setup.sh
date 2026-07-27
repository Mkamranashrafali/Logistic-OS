#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo " Starting Logistics OS Server Provisioning..."
echo "============================================="

# 1. Update and Upgrade Packages
echo "[1/6] Updating system packages..."
sudo apt update
sudo apt upgrade -y

# 2. Install Required System Dependencies
echo "[2/6] Installing Nginx, Python, Certbot, and utilities..."
sudo apt install -y nginx python3 python3-pip python3-venv certbot python3-certbot-nginx curl git

# 3. Install Node.js (v20 LTS recommended for Next.js 14/15)
echo "[3/6] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Copy Nginx Configuration
# Assuming this script is run from the project root inside the cloned repository
echo "[4/6] Configuring Nginx..."
sudo cp deploy/nginx/logistics-os.conf /etc/nginx/sites-available/logistics-os.conf
# Enable site if not already enabled
if [ ! -L /etc/nginx/sites-enabled/logistics-os.conf ]; then
    sudo ln -s /etc/nginx/sites-available/logistics-os.conf /etc/nginx/sites-enabled/
fi
# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Restart Nginx to load configuration
sudo systemctl restart nginx

# 5. Setup Systemd Services
echo "[5/6] Setting up Systemd Services..."
sudo cp deploy/systemd/frontend.service /etc/systemd/system/
sudo cp deploy/systemd/backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable frontend.service
sudo systemctl enable backend.service

# 6. Reminder for SSL
echo "[6/6] Setup Complete!"
echo "============================================="
echo " IMPORTANT NEXT STEPS:"
echo "1. Configure your DNS to point kamran.downlabs.co and api.kamran.downlabs.co to this server's IP."
echo "2. Run this command to generate free SSL certificates:"
echo "   sudo certbot --nginx -d kamran.downlabs.co -d api.kamran.downlabs.co"
echo "3. Update your .env files in the project root and backend folder."
echo "4. Run ./deploy/deploy.sh to build and launch the application."
echo "============================================="
