# ProxMonX Deployment Guide

This guide provides instructions for deploying ProxMonX in a production environment.

## Deployment Options

There are several ways to deploy ProxMonX:

1. **Debian 12 LXC Container** (Recommended)
2. Docker Containers
3. Manual Installation

## Option 1: Debian 12 LXC Container (Recommended)

This is the recommended deployment method as it provides the best performance and isolation.

### Prerequisites

- Proxmox VE 7.x or higher
- Internet access from the Proxmox host

### Deployment Steps

1. Create a new Debian 12 LXC container in Proxmox:

```bash
# On your Proxmox host
pct create 100 local:vztmpl/debian-12-standard_12.0-1_amd64.tar.zst \
  --hostname proxmonx \
  --memory 2048 \
  --swap 512 \
  --cores 2 \
  --rootfs local-lvm:20 \
  --net0 name=eth0,bridge=vmbr0,ip=dhcp \
  --unprivileged 1 \
  --features nesting=1
```

2. Start the container and connect to it:

```bash
pct start 100
pct enter 100
```

3. Update the system and install dependencies:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential mongodb nginx
```

4. Install Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

5. Clone the repository:

```bash
git clone https://github.com/sfnemis/proxmonit.git /opt/proxmonx
cd /opt/proxmonx
```

6. Set up the backend:

```bash
cd /opt/proxmonx/backend
npm install --production
cp .env.example .env
# Edit the .env file with your configuration
nano .env
```

7. Set up the frontend:

```bash
cd /opt/proxmonx/frontend
npm install
npm run build
```

8. Configure Nginx:

```bash
cat > /etc/nginx/sites-available/proxmonx <<EOF
server {
    listen 80;
    server_name _;

    location / {
        root /opt/proxmonx/frontend/dist;
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

ln -s /etc/nginx/sites-available/proxmonx /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

9. Create a systemd service for the backend:

```bash
cat > /etc/systemd/system/proxmonx.service <<EOF
[Unit]
Description=ProxMonX Backend
After=network.target mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/proxmonx/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable proxmonx
systemctl start proxmonx
```

10. Set up automatic updates (optional):

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

## Option 2: Docker Containers

### Prerequisites

- Docker and Docker Compose installed
- Internet access

### Deployment Steps

1. Create a `docker-compose.yml` file:

```yaml
version: '3'

services:
  mongodb:
    image: mongo:4.4
    container_name: proxmonx-mongodb
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

  backend:
    build:
      context: ./backend
    container_name: proxmonx-backend
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/proxmonx
      # Add other environment variables here
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
    container_name: proxmonx-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mongodb_data:
```

2. Create a `Dockerfile` for the backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

3. Create a `Dockerfile` for the frontend:

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

4. Create an `nginx.conf` file:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Deploy with Docker Compose:

```bash
docker-compose up -d
```

## Option 3: Manual Installation

### Prerequisites

- Debian 12 or Ubuntu 22.04 server
- Node.js 18.x or higher
- MongoDB 4.4 or higher
- Nginx

### Deployment Steps

1. Update the system and install dependencies:

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential nginx
```

2. Install MongoDB:

```bash
apt install -y mongodb
systemctl enable mongodb
systemctl start mongodb
```

3. Install Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

4. Clone the repository:

```bash
git clone https://github.com/sfnemis/proxmonit.git /opt/proxmonx
cd /opt/proxmonx
```

5. Set up the backend:

```bash
cd /opt/proxmonx/backend
npm install --production
cp .env.example .env
# Edit the .env file with your configuration
nano .env
```

6. Set up the frontend:

```bash
cd /opt/proxmonx/frontend
npm install
npm run build
```

7. Configure Nginx:

```bash
cat > /etc/nginx/sites-available/proxmonx <<EOF
server {
    listen 80;
    server_name _;

    location / {
        root /opt/proxmonx/frontend/dist;
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

ln -s /etc/nginx/sites-available/proxmonx /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

8. Create a systemd service for the backend:

```bash
cat > /etc/systemd/system/proxmonx.service <<EOF
[Unit]
Description=ProxMonX Backend
After=network.target mongodb.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/proxmonx/backend
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable proxmonx
systemctl start proxmonx
```

## Securing Your Deployment

For production deployments, consider implementing the following security measures:

1. **Enable HTTPS**: Use Let's Encrypt to obtain a free SSL certificate:

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

2. **Firewall Configuration**: Set up a firewall to restrict access:

```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

3. **Regular Updates**: Set up automatic security updates:

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

4. **Database Security**: Secure MongoDB with authentication:

```bash
# Edit MongoDB configuration
nano /etc/mongodb.conf

# Add the following lines
security:
  authorization: enabled
```

## Troubleshooting

### Backend Service Not Starting

Check the logs:

```bash
journalctl -u proxmonx -f
```

### Nginx Configuration Issues

Test the Nginx configuration:

```bash
nginx -t
```

### MongoDB Connection Problems

Check if MongoDB is running:

```bash
systemctl status mongodb
```

## Backup and Restore

### Backup

```bash
# Backup MongoDB
mongodump --out /opt/backups/proxmonx-$(date +%Y%m%d)

# Backup configuration
cp /opt/proxmonx/backend/.env /opt/backups/proxmonx-env-$(date +%Y%m%d)
```

### Restore

```bash
# Restore MongoDB
mongorestore /opt/backups/proxmonx-20230101

# Restore configuration
cp /opt/backups/proxmonx-env-20230101 /opt/proxmonx/backend/.env
```