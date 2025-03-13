#!/bin/bash

# ProxMonX LXC Deployment Script
# This script deploys ProxMonX to a Debian 12 LXC container

# Exit on error
set -e

# Configuration
CONTAINER_ID=${1:-100}
CONTAINER_HOSTNAME="proxmonx"
CONTAINER_MEMORY=2048
CONTAINER_SWAP=512
CONTAINER_CORES=2
CONTAINER_STORAGE=20
CONTAINER_NETWORK="name=eth0,bridge=vmbr0,ip=dhcp"
CONTAINER_FEATURES="nesting=1"
GITHUB_REPO="https://github.com/sfnemis/proxmonit.git"
INSTALL_DIR="/opt/proxmonx"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Proxmox
if [ ! -f /usr/bin/pct ]; then
    log_error "This script must be run on a Proxmox host."
    exit 1
fi

# Check if container already exists
if pct status $CONTAINER_ID &>/dev/null; then
    log_warning "Container $CONTAINER_ID already exists."
    read -p "Do you want to destroy it and create a new one? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Stopping container $CONTAINER_ID..."
        pct stop $CONTAINER_ID &>/dev/null || true
        log_info "Destroying container $CONTAINER_ID..."
        pct destroy $CONTAINER_ID
    else
        log_error "Deployment aborted."
        exit 1
    fi
fi

# Create container
log_info "Creating Debian 12 LXC container (ID: $CONTAINER_ID)..."
pct create $CONTAINER_ID local:vztmpl/debian-12-standard_12.0-1_amd64.tar.zst \
    --hostname $CONTAINER_HOSTNAME \
    --memory $CONTAINER_MEMORY \
    --swap $CONTAINER_SWAP \
    --cores $CONTAINER_CORES \
    --rootfs local-lvm:$CONTAINER_STORAGE \
    --net0 $CONTAINER_NETWORK \
    --unprivileged 1 \
    --features $CONTAINER_FEATURES

# Start container
log_info "Starting container..."
pct start $CONTAINER_ID
sleep 5 # Wait for container to start

# Check if container is running
if ! pct status $CONTAINER_ID | grep -q running; then
    log_error "Container failed to start."
    exit 1
fi

# Get container IP
CONTAINER_IP=$(pct exec $CONTAINER_ID -- ip -4 addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
if [ -z "$CONTAINER_IP" ]; then
    log_error "Failed to get container IP address."
    exit 1
fi
log_info "Container IP: $CONTAINER_IP"

# Update container
log_info "Updating container..."
pct exec $CONTAINER_ID -- bash -c "apt update && apt upgrade -y"

# Install dependencies
log_info "Installing dependencies..."
pct exec $CONTAINER_ID -- bash -c "apt install -y curl git build-essential mongodb nginx"

# Install Node.js
log_info "Installing Node.js..."
pct exec $CONTAINER_ID -- bash -c "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
pct exec $CONTAINER_ID -- bash -c "apt install -y nodejs"

# Clone repository
log_info "Cloning repository..."
pct exec $CONTAINER_ID -- bash -c "git clone $GITHUB_REPO $INSTALL_DIR"

# Set up backend
log_info "Setting up backend..."
pct exec $CONTAINER_ID -- bash -c "cd $INSTALL_DIR/backend && npm install --production"
pct exec $CONTAINER_ID -- bash -c "cp $INSTALL_DIR/backend/.env.example $INSTALL_DIR/backend/.env"

# Configure backend
log_info "Configuring backend..."
cat > /tmp/configure_backend.sh <<EOF
#!/bin/bash
# Generate a random JWT secret
JWT_SECRET=\$(openssl rand -hex 32)

# Update .env file
sed -i "s/your_jwt_secret_key_here/\$JWT_SECRET/g" $INSTALL_DIR/backend/.env
sed -i "s/NODE_ENV=development/NODE_ENV=production/g" $INSTALL_DIR/backend/.env

# Set default admin password
DEFAULT_ADMIN_PASSWORD=\$(openssl rand -base64 12)
sed -i "s/DEFAULT_ADMIN_PASSWORD=Admin@123/DEFAULT_ADMIN_PASSWORD=\$DEFAULT_ADMIN_PASSWORD/g" $INSTALL_DIR/backend/.env

echo "Default admin credentials:"
echo "Username: admin"
echo "Password: \$DEFAULT_ADMIN_PASSWORD"
echo "Please save these credentials and change the password after first login."
EOF

pct push $CONTAINER_ID /tmp/configure_backend.sh /tmp/configure_backend.sh
pct exec $CONTAINER_ID -- bash -c "chmod +x /tmp/configure_backend.sh && /tmp/configure_backend.sh"
pct exec $CONTAINER_ID -- bash -c "rm /tmp/configure_backend.sh"

# Build frontend
log_info "Building frontend..."
pct exec $CONTAINER_ID -- bash -c "cd $INSTALL_DIR/frontend && npm install && npm run build"

# Configure Nginx
log_info "Configuring Nginx..."
cat > /tmp/nginx.conf <<EOF
server {
    listen 80;
    server_name _;

    location / {
        root $INSTALL_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

pct push $CONTAINER_ID /tmp/nginx.conf /etc/nginx/sites-available/proxmonx
pct exec $CONTAINER_ID -- bash -c "ln -sf /etc/nginx/sites-available/proxmonx /etc/nginx/sites-enabled/"
pct exec $CONTAINER_ID -- bash -c "rm -f /etc/nginx/sites-enabled/default"
pct exec $CONTAINER_ID -- bash -c "nginx -t && systemctl restart nginx"

# Create systemd service
log_info "Creating systemd service..."
cat > /tmp/proxmonx.service <<EOF
[Unit]
Description=ProxMonX Backend
After=network.target mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

pct push $CONTAINER_ID /tmp/proxmonx.service /etc/systemd/system/proxmonx.service
pct exec $CONTAINER_ID -- bash -c "systemctl daemon-reload && systemctl enable proxmonx && systemctl start proxmonx"

# Set up automatic updates
log_info "Setting up automatic updates..."
pct exec $CONTAINER_ID -- bash -c "apt install -y unattended-upgrades && dpkg-reconfigure -plow unattended-upgrades"

# Clean up
rm -f /tmp/nginx.conf /tmp/proxmonx.service

# Final message
log_success "ProxMonX has been successfully deployed!"
log_success "You can access it at http://$CONTAINER_IP"
log_info "Please check the container logs for the default admin credentials."
log_info "To view the logs, run: pct enter $CONTAINER_ID"

exit 0