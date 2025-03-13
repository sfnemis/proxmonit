# ProxMonX User Guide

This guide provides instructions for using ProxMonX, a comprehensive monitoring tool for Proxmox environments.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Virtual Machines](#virtual-machines)
4. [Containers](#containers)
5. [Nodes](#nodes)
6. [Settings](#settings)
7. [User Management](#user-management)
8. [Notifications](#notifications)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### First Login

When you first access ProxMonX, you'll be prompted to log in. The default admin credentials are:

- Username: `admin`
- Password: `Admin@123`

For security reasons, you should change the default password immediately after your first login.

### Changing Your Password

1. Click on your username in the top-right corner
2. Select "Profile"
3. Click "Change Password"
4. Enter your current password and your new password
5. Click "Update Password"

### Setting Up Two-Factor Authentication

1. Click on your username in the top-right corner
2. Select "Profile"
3. Click "Enable Two-Factor Authentication"
4. Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy)
5. Enter the verification code from your app
6. Click "Verify and Enable"

## Dashboard

The dashboard provides an overview of your Proxmox environment, including:

- Cluster health status
- Node status and resource usage
- VM and container counts
- Recent alerts and notifications
- Resource usage trends

### Dashboard Widgets

- **Cluster Overview**: Shows the status of all configured clusters
- **Node Status**: Displays the status and resource usage of all nodes
- **VM/Container Count**: Shows the total number of VMs and containers
- **Resource Usage**: Displays CPU, memory, and storage usage across all nodes
- **Recent Alerts**: Shows the most recent alerts and notifications

## Virtual Machines

The Virtual Machines page displays all VMs across all clusters and nodes.

### Viewing VM Details

1. Click on a VM in the list to view its details
2. The details page shows:
   - Current status
   - Resource usage (CPU, memory, disk, network)
   - Historical performance graphs
   - Configuration details

### Managing VMs

From the VM details page, you can:

- Start/stop the VM
- View real-time resource usage
- View historical performance data
- Configure alerts for the VM

## Containers

The Containers page displays all LXC containers across all clusters and nodes.

### Viewing Container Details

1. Click on a container in the list to view its details
2. The details page shows:
   - Current status
   - Resource usage (CPU, memory, disk, network)
   - Historical performance graphs
   - Configuration details

### Managing Containers

From the container details page, you can:

- Start/stop the container
- View real-time resource usage
- View historical performance data
- Configure alerts for the container

## Nodes

The Nodes page displays all Proxmox nodes across all clusters.

### Viewing Node Details

1. Click on a node in the list to view its details
2. The details page shows:
   - Current status
   - Resource usage (CPU, memory, disk, network)
   - Historical performance graphs
   - List of VMs and containers on the node

### Managing Nodes

From the node details page, you can:

- View real-time resource usage
- View historical performance data
- Configure alerts for the node

## Settings

The Settings page allows you to configure ProxMonX.

### Configuring Proxmox Clusters

1. Go to Settings > Proxmox Clusters
2. Click "Add Cluster"
3. Enter the cluster details:
   - Name: A friendly name for the cluster
   - Host: The hostname or IP address of the Proxmox API
   - User: The Proxmox API user (e.g., `monitoring@pam`)
   - Token Name: The API token name
   - Token Value: The API token value
   - Verify SSL: Whether to verify SSL certificates
4. Click "Save"

### Configuring Metrics Collection

1. Go to Settings > Metrics
2. Configure the following settings:
   - Collection Interval: How often to collect metrics (in minutes)
   - Retention Period: How long to keep metrics (in days)
3. Click "Save"

## User Management

The User Management page allows administrators to manage users.

### Adding a New User

1. Go to User Management
2. Click "Add User"
3. Enter the user details:
   - Username
   - Email
   - Password
   - Role (Admin or User)
4. Click "Create User"

### Editing a User

1. Go to User Management
2. Click the edit icon next to the user
3. Update the user details
4. Click "Save"

### Deleting a User

1. Go to User Management
2. Click the delete icon next to the user
3. Confirm the deletion

## Notifications

ProxMonX supports various notification channels for alerts.

### Configuring Email Notifications

1. Go to Settings > Notifications
2. Enable Email Notifications
3. Configure the SMTP settings:
   - Host: The SMTP server hostname
   - Port: The SMTP server port
   - Secure: Whether to use SSL/TLS
   - Username: The SMTP username
   - Password: The SMTP password
   - From: The sender email address
   - Recipients: Comma-separated list of recipient email addresses
4. Click "Save"
5. Click "Test" to send a test email

### Configuring Discord Notifications

1. Go to Settings > Notifications
2. Enable Discord Notifications
3. Enter the Discord Webhook URL
4. Click "Save"
5. Click "Test" to send a test notification

### Configuring Telegram Notifications

1. Go to Settings > Notifications
2. Enable Telegram Notifications
3. Enter the Telegram Bot Token and Chat ID
4. Click "Save"
5. Click "Test" to send a test notification

### Configuring Gotify Notifications

1. Go to Settings > Notifications
2. Enable Gotify Notifications
3. Enter the Gotify Server URL and App Token
4. Click "Save"
5. Click "Test" to send a test notification

### Setting Up Alert Rules

1. Go to Settings > Alerts
2. Click "Add Alert Rule"
3. Configure the alert rule:
   - Name: A friendly name for the rule
   - Type: The resource type (VM, Container, Node)
   - Resource: The specific resource or * for all
   - Metric: The metric to monitor (CPU, Memory, Disk, Network)
   - Condition: The condition (>, <, =, !=)
   - Threshold: The threshold value
   - Duration: How long the condition must be true before alerting
   - Severity: The alert severity (Info, Warning, Error)
   - Channels: The notification channels to use
4. Click "Save"

## Troubleshooting

### Common Issues

#### No Data Showing in Graphs

If no data is showing in the graphs, check the following:

1. Ensure metrics collection is enabled in Settings > Metrics
2. Check that the Proxmox API credentials are correct
3. Verify that the backend service is running
4. Check the browser console for any JavaScript errors

#### Authentication Issues

If you're having trouble logging in:

1. Ensure you're using the correct username and password
2. If you've enabled 2FA, ensure you're entering the correct verification code
3. Check that the backend service is running
4. If you've forgotten your password, ask an administrator to reset it

#### Notification Issues

If notifications aren't being sent:

1. Ensure the notification channel is enabled
2. Verify that the notification settings are correct
3. Check the backend logs for any errors
4. Try sending a test notification

### Getting Help

If you're still having issues, you can:

1. Check the backend logs for errors
2. Contact your system administrator
3. Visit the ProxMonX GitHub repository for support