# ProxMonX Backend

This is the backend API for ProxMonX, a comprehensive monitoring tool for Proxmox environments.

## Features

- Real-time metrics collection from VMs, LXCs, and hosts
- 90-day data retention
- Multi-cluster support
- User management with 2FA
- Notifications via Gotify, Email, Discord, and Telegram

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Proxmox API integration

## Prerequisites

- Node.js 18.x or higher
- MongoDB 4.4 or higher
- Proxmox VE 7.x or higher with API access

## Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

5. Edit the `.env` file with your configuration

## Configuration

The application is configured using environment variables in the `.env` file:

- **Server Configuration**: Port and environment settings
- **MongoDB Connection**: Database connection string
- **JWT Authentication**: Secret key and token expiration
- **Default Admin User**: Initial admin account credentials
- **Proxmox API Configuration**: Connection details for your Proxmox clusters
- **Notification Settings**: Configuration for email, Discord, Telegram, and Gotify
- **Metrics Collection**: Collection interval and retention period

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password` - Reset password with token

### Users

- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create a new user (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `PUT /api/users/profile/update` - Update own profile
- `PUT /api/users/profile/two-factor` - Toggle 2FA

### Proxmox

- `GET /api/proxmox/clusters` - Get all configured clusters
- `GET /api/proxmox/clusters/:id/nodes` - Get all nodes in a cluster
- `GET /api/proxmox/clusters/:id/nodes/:node/vms` - Get all VMs on a node
- `GET /api/proxmox/clusters/:id/nodes/:node/containers` - Get all containers on a node
- `GET /api/proxmox/clusters/:id/nodes/:node/vms/:vmid/status` - Get VM status
- `GET /api/proxmox/clusters/:id/nodes/:node/containers/:vmid/status` - Get container status
- `POST /api/proxmox/clusters/:id/nodes/:node/vms/:vmid/start` - Start VM
- `POST /api/proxmox/clusters/:id/nodes/:node/vms/:vmid/stop` - Stop VM
- `POST /api/proxmox/clusters/:id/nodes/:node/containers/:vmid/start` - Start container
- `POST /api/proxmox/clusters/:id/nodes/:node/containers/:vmid/stop` - Stop container

### Metrics

- `GET /api/metrics` - Get metrics
- `GET /api/metrics/aggregated` - Get aggregated metrics
- `GET /api/metrics/latest` - Get latest metrics
- `GET /api/metrics/historical` - Get historical metrics
- `POST /api/metrics/start` - Start metrics collection (admin only)
- `POST /api/metrics/stop` - Stop metrics collection (admin only)
- `POST /api/metrics/collect` - Trigger immediate collection (admin only)

### Notifications

- `POST /api/notifications/send` - Send notification (admin only)
- `POST /api/notifications/test/:channel` - Test notification channel (admin only)
- `GET /api/notifications/settings` - Get notification settings

## License

ISC