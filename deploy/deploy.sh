#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "============================================="
echo " Deploying Logistics OS..."
echo "============================================="

# 1. Update Code
echo "[1/4] Pulling latest code..."
git pull origin v1

# 2. Setup/Update Backend
echo "[2/4] Updating backend environment..."
cd backend
# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
# Install dependencies
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..

# 3. Setup/Update Frontend
echo "[3/4] Building Next.js production bundle..."
npm install
npm run build

# 4. Restart Services
echo "[4/4] Restarting background services..."
sudo systemctl restart backend.service
sudo systemctl restart frontend.service

echo "============================================="
echo " Deployment Complete!"
echo " Monitor backend logs: sudo journalctl -u backend -f"
echo " Monitor frontend logs: sudo journalctl -u frontend -f"
echo "============================================="
