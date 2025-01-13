#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting build process..."

# Update package lists and install Chromium
echo "Installing Chromium..."
apt-get update
apt-get install -y chromium

# Install Puppeteer Chrome binaries (if not already installed)
echo "Installing Puppeteer browser binaries..."
npx puppeteer browsers install chrome

echo "Build process completed!"
