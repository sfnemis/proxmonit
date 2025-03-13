<script lang="ts">
  import { api } from '$lib/api';
  import Icon from '@iconify/svelte';
  import { toast } from '@zerodevx/svelte-toast';
  import { onMount } from 'svelte';
 // Import API client

  // Tab management
  const tabs = [
    { id: 'general', label: 'General', icon: 'mdi:cog-outline' },
    { id: 'proxmox', label: 'Proxmox API', icon: 'mdi:server' },
    { id: 'notifications', label: 'Notifications', icon: 'mdi:bell-outline' },
    { id: 'security', label: 'Security', icon: 'mdi:security' },
  ];

  let activeTab = 'proxmox';

  // Initial form data (will be overridden when loading from API)
  let formData = {
    general: {
      appName: 'ProxMonX',
      dataRetention: 90,
      refreshInterval: 30,
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD'
    },
    proxmox: {
      clusters: []
    },
    notifications: {
      email: {
        enabled: true,
        server: 'smtp.example.com',
        port: 587,
        username: 'alerts@example.com',
        password: '********',
        recipients: 'admin@example.com',
        useTLS: true
      },
      discord: {
        enabled: false,
        webhookUrl: ''
      },
      telegram: {
        enabled: false,
        botToken: '',
        chatId: ''
      },
      gotify: {
        enabled: true,
        url: 'https://gotify.example.com',
        appToken: '********'
      }
    }
  };

  let loading = true;
  let saving = false;
  let error = null;

  // Load settings on component mount
  onMount(async () => {
    try {
      const response = await api.get('/settings');
      if (response.data && response.data.status === 'success') {
        // Update Proxmox clusters from API
        if (response.data.data.proxmox && response.data.data.proxmox.clusters) {
          formData.proxmox.clusters = response.data.data.proxmox.clusters;
        }
        // In a real app, you would also load other settings sections
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      error = 'Failed to load settings. Please try refreshing the page.';
    } finally {
      loading = false;
    }
  });

  // Form submission handler
  async function handleSubmit() {
    saving = true;
    error = null;

    try {
      const response = await api.put('/settings/proxmox', {
        clusters: formData.proxmox.clusters
      });

      if (response.data && response.data.status === 'success') {
        toast.push({
          title: 'Success',
          message: 'Settings saved successfully',
          theme: {
            '--toastBackground': '#48BB78',
            '--toastBarBackground': '#2F855A'
          }
        });
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      error = 'Failed to save settings. Please try again.';
      toast.push({
        title: 'Error',
        message: 'Failed to save settings',
        theme: {
          '--toastBackground': '#F56565',
          '--toastBarBackground': '#C53030'
        }
      });
    } finally {
      saving = false;
    }
  }

  // Add cluster handler
  function addCluster() {
    formData.proxmox.clusters = [
      ...formData.proxmox.clusters,
      {
        id: formData.proxmox.clusters.length + 1,
        name: 'New Cluster',
        url: 'https://',
        username: '',
        apiToken: '',
        verifySSL: false
      }
    ];
  }

  // Remove cluster handler
  function removeCluster(index) {
    formData.proxmox.clusters = formData.proxmox.clusters.filter((_, i) => i !== index);
  }

  // Test connection handler
  async function testConnection(cluster) {
    try {
      // Find the cluster ID that matches this cluster
      const clusterId = cluster.id;

      // Test the connection using the API
      const response = await api.get(`/proxmox/clusters/${clusterId}/test`);

      if (response.data && response.data.status === 'success') {
        toast.push({
          title: 'Success',
          message: `Connection to ${cluster.name} successful`,
          theme: {
            '--toastBackground': '#48BB78',
            '--toastBarBackground': '#2F855A'
          }
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      toast.push({
        title: 'Error',
        message: `Failed to connect to ${cluster.name}: ${err.response?.data?.message || 'Unknown error'}`,
        theme: {
          '--toastBackground': '#F56565',
          '--toastBarBackground': '#C53030'
        }
      });
    }
  }
</script>

<div>
  <!-- Page Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-gray-800">Settings</h1>
    <p class="text-gray-600">Configure application settings and integrations</p>
  </div>

  <!-- Settings Tabs and Content -->
  <div class="bg-white rounded-lg shadow">
    <!-- Tab Navigation -->
    <div class="border-b border-gray-200">
      <nav class="flex overflow-x-auto">
        {#each tabs as tab}
          <button
            class={`px-4 py-3 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'} flex items-center whitespace-nowrap`}
            on:click={() => activeTab = tab.id}
          >
            <Icon icon={tab.icon} class="mr-2 h-5 w-5" />
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- General Settings Tab -->
      {#if activeTab === 'general'}
        <form on:submit|preventDefault={handleSubmit}>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label for="appName" class="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input
                id="appName"
                type="text"
                bind:value={formData.general.appName}
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
              >
            </div>
            <div>
              <label for="dataRetention" class="block text-sm font-medium text-gray-700 mb-1">Data Retention (days)</label>
              <input
                id="dataRetention"
                type="number"
                bind:value={formData.general.dataRetention}
                min="1"
                max="365"
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
              >
            </div>
            <div>
              <label for="refreshInterval" class="block text-sm font-medium text-gray-700 mb-1">Dashboard Refresh Interval (seconds)</label>
              <input
                id="refreshInterval"
                type="number"
                bind:value={formData.general.refreshInterval}
                min="5"
                max="3600"
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
              >
            </div>
            <div>
              <label for="timezone" class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                id="timezone"
                bind:value={formData.general.timezone}
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div>
              <label for="dateFormat" class="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
              <select
                id="dateFormat"
                bind:value={formData.general.dateFormat}
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY.MM.DD">YYYY.MM.DD</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      {/if}

      <!-- Proxmox API Settings Tab -->
      {#if activeTab === 'proxmox'}
        <form on:submit|preventDefault={handleSubmit}>
          <h3 class="text-lg font-medium text-gray-900 mb-4">Proxmox Clusters</h3>

          {#each formData.proxmox.clusters as cluster, index}
            <div class="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
              <div class="flex justify-between items-center mb-4">
                <h4 class="font-medium text-gray-900">Cluster #{index + 1}</h4>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800"
                  on:click={() => removeCluster(index)}
                >
                  <Icon icon="mdi:delete" class="h-5 w-5" />
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cluster Name</label>
                  <input
                    type="text"
                    bind:value={cluster.name}
                    class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Proxmox API URL</label>
                  <input
                    type="text"
                    bind:value={cluster.url}
                    placeholder="https://your-proxmox-server:8006"
                    class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    bind:value={cluster.username}
                    placeholder="user@pam or user@pve"
                    class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">API Token</label>
                  <input
                    type="password"
                    bind:value={cluster.apiToken}
                    class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
                  >
                </div>
                <div class="sm:col-span-2">
                  <div class="flex items-center">
                    <input
                      id={`verifySSL-${index}`}
                      type="checkbox"
                      bind:checked={cluster.verifySSL}
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    >
                    <label for={`verifySSL-${index}`} class="ml-2 block text-sm text-gray-700">
                      Verify SSL Certificate
                    </label>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <button
                  type="button"
                  class="text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md text-sm"
                  on:click={() => testConnection(cluster)}
                >
                  Test Connection
                </button>
              </div>
            </div>
          {/each}

          <button
            type="button"
            class="mb-6 flex items-center text-indigo-600 hover:text-indigo-800"
            on:click={addCluster}
          >
            <Icon icon="mdi:plus-circle" class="mr-1 h-5 w-5" />
            Add Another Cluster
          </button>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      {/if}

      <!-- Notifications Tab -->
      {#if activeTab === 'notifications'}
        <form on:submit|preventDefault={handleSubmit}>
          <!-- Email Notifications -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Email Notifications</h3>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.notifications.email.enabled}
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Enable</span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
                <input
                  type="text"
                  bind:value={formData.notifications.email.server}
                  disabled={!formData.notifications.email.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  bind:value={formData.notifications.email.port}
                  disabled={!formData.notifications.email.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                <input
                  type="text"
                  bind:value={formData.notifications.email.username}
                  disabled={!formData.notifications.email.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                <input
                  type="password"
                  bind:value={formData.notifications.email.password}
                  disabled={!formData.notifications.email.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                <input
                  type="text"
                  bind:value={formData.notifications.email.recipients}
                  disabled={!formData.notifications.email.enabled}
                  placeholder="Comma separated emails"
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div class="flex items-center">
                <input
                  id="useTLS"
                  type="checkbox"
                  bind:checked={formData.notifications.email.useTLS}
                  disabled={!formData.notifications.email.enabled}
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:text-gray-400"
                >
                <label for="useTLS" class="ml-2 block text-sm text-gray-700">
                  Use TLS
                </label>
              </div>
            </div>
          </div>

          <!-- Discord Notifications -->
          <div class="mb-8 border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Discord Notifications</h3>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.notifications.discord.enabled}
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Enable</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
              <input
                type="text"
                bind:value={formData.notifications.discord.webhookUrl}
                disabled={!formData.notifications.discord.enabled}
                class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
              >
            </div>
          </div>

          <!-- Telegram Notifications -->
          <div class="mb-8 border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Telegram Notifications</h3>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.notifications.telegram.enabled}
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Enable</span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
                <input
                  type="text"
                  bind:value={formData.notifications.telegram.botToken}
                  disabled={!formData.notifications.telegram.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
                <input
                  type="text"
                  bind:value={formData.notifications.telegram.chatId}
                  disabled={!formData.notifications.telegram.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
            </div>
          </div>

          <!-- Gotify Notifications -->
          <div class="mb-8 border-t pt-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Gotify Notifications</h3>
              <label class="inline-flex items-center">
                <input
                  type="checkbox"
                  bind:checked={formData.notifications.gotify.enabled}
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <span class="ml-2 text-sm text-gray-700">Enable</span>
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
                <input
                  type="text"
                  bind:value={formData.notifications.gotify.url}
                  disabled={!formData.notifications.gotify.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">App Token</label>
                <input
                  type="password"
                  bind:value={formData.notifications.gotify.appToken}
                  disabled={!formData.notifications.gotify.enabled}
                  class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      {/if}

      <!-- Placeholder for other tabs -->
      {#if activeTab === 'security'}
        <div class="text-center py-8">
          <div class="inline-flex rounded-full bg-indigo-100 p-4 mb-4">
            <Icon icon="mdi:construction" class="h-8 w-8 text-indigo-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Under Construction</h3>
          <p class="text-gray-500">This section is currently being developed and will be available soon.</p>
        </div>
      {/if}
    </div>
  </div>
</div>