# ProxMonX - Proxmox Monitoring Web App

A comprehensive monitoring, reporting, and alerting solution for Proxmox virtualization environments.

## Features

- Real-time metrics collection from VMs, LXCs, and hosts
- 90-day data retention of metrics and performance data
- Multi-cluster support for managing multiple Proxmox installations
- User management with two-factor authentication (2FA)
- Customizable notifications via:
  - Gotify
  - Email
  - Discord
  - Telegram
- Responsive design that works on desktop and mobile devices

## Technical Stack

- **Frontend**: Svelte with TailwindCSS
- **Backend**: Node.js running on Debian 12
- **Data Storage**: Database for 90-day metrics retention
- **Security**: Secure encrypted connections

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn package manager
- Git

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

A deployment script is included that will:
1. Create a Debian 12 LXC container
2. Install all necessary dependencies
3. Configure the application
4. Set up automatic updates

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.