<script lang="ts">
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';

  // Sample data - this would come from API in real application
  const clusterHealth = {
    status: 'Healthy',
    uptime: '99.98%',
    nodes: 3,
    vms: 15,
    containers: 8,
    cpu: 35,
    memory: 45,
    storage: 62
  };

  // Resources
  const resources = [
    { name: 'CPU', usage: clusterHealth.cpu, icon: 'mdi:cpu-64-bit', color: 'blue' },
    { name: 'Memory', usage: clusterHealth.memory, icon: 'mdi:memory', color: 'green' },
    { name: 'Storage', usage: clusterHealth.storage, icon: 'mdi:harddisk', color: 'amber' }
  ];

  // Recent alerts - sample data
  const recentAlerts = [
    { id: 1, level: 'warning', message: 'High CPU usage on VM102', time: '10 min ago', icon: 'mdi:alert' },
    { id: 2, level: 'critical', message: 'Storage pool nearly full', time: '25 min ago', icon: 'mdi:alert-circle' },
    { id: 3, level: 'info', message: 'Container backup completed', time: '1 hour ago', icon: 'mdi:information' }
  ];

  // Mock data for charts
  let cpuChartData: any;
  let memoryChartData: any;

  onMount(async () => {
    // In a real application, this data would come from the API
    try {
      // We would initialize charts here
      console.log('Charts would be initialized here');
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  });
</script>

<div>
  <!-- Page Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-semibold text-gray-800">Dashboard</h1>
    <p class="text-gray-600">Overview of your Proxmox environment</p>
  </div>

  <!-- Status Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <!-- Cluster Status -->
    <div class="bg-white rounded-lg shadow p-5">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-500">Cluster Status</p>
          <h2 class="text-xl font-semibold text-gray-800 flex items-center">
            <span class="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            {clusterHealth.status}
          </h2>
        </div>
        <div class="rounded-full p-3 bg-blue-50">
          <Icon icon="mdi:server-network" class="h-6 w-6 text-blue-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-600">Uptime: {clusterHealth.uptime}</p>
    </div>

    <!-- Nodes -->
    <div class="bg-white rounded-lg shadow p-5">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-500">Nodes</p>
          <h2 class="text-xl font-semibold text-gray-800">{clusterHealth.nodes}</h2>
        </div>
        <div class="rounded-full p-3 bg-purple-50">
          <Icon icon="mdi:server" class="h-6 w-6 text-purple-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-600">All nodes online</p>
    </div>

    <!-- VMs -->
    <div class="bg-white rounded-lg shadow p-5">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-500">Virtual Machines</p>
          <h2 class="text-xl font-semibold text-gray-800">{clusterHealth.vms}</h2>
        </div>
        <div class="rounded-full p-3 bg-indigo-50">
          <Icon icon="mdi:desktop-classic" class="h-6 w-6 text-indigo-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-600">13 running, 2 stopped</p>
    </div>

    <!-- Containers -->
    <div class="bg-white rounded-lg shadow p-5">
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-500">Containers</p>
          <h2 class="text-xl font-semibold text-gray-800">{clusterHealth.containers}</h2>
        </div>
        <div class="rounded-full p-3 bg-green-50">
          <Icon icon="mdi:docker" class="h-6 w-6 text-green-500" />
        </div>
      </div>
      <p class="mt-2 text-sm text-gray-600">8 running, 0 stopped</p>
    </div>
  </div>

  <!-- Resource Usage -->
  <div class="mb-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Resource Usage</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {#each resources as resource}
        <div class="bg-white rounded-lg shadow p-5">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <Icon icon={resource.icon} class="h-5 w-5 mr-2 text-{resource.color}-500" />
              <h3 class="font-medium">{resource.name}</h3>
            </div>
            <span class="text-lg font-semibold">{resource.usage}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-{resource.color}-500 h-2.5 rounded-full" style="width: {resource.usage}%"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Charts Section (Placeholder) -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
    <div class="bg-white rounded-lg shadow p-5">
      <h3 class="font-medium mb-4">CPU Usage (24h)</h3>
      <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
        <p class="text-gray-500">CPU Chart will be displayed here</p>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-5">
      <h3 class="font-medium mb-4">Memory Usage (24h)</h3>
      <div class="h-64 bg-gray-100 rounded flex items-center justify-center">
        <p class="text-gray-500">Memory Chart will be displayed here</p>
      </div>
    </div>
  </div>

  <!-- Recent Alerts -->
  <div>
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Recent Alerts</h2>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h3 class="font-medium">System Alerts</h3>
          <a href="/alerts" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">View All</a>
        </div>
      </div>
      <div class="divide-y divide-gray-200">
        {#each recentAlerts as alert}
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-center">
              <div class={`flex-shrink-0 mr-3 rounded-full p-2 ${
                alert.level === 'critical' ? 'bg-red-100 text-red-500' :
                alert.level === 'warning' ? 'bg-yellow-100 text-yellow-500' :
                'bg-blue-100 text-blue-500'
              }`}>
                <Icon icon={alert.icon} class="h-5 w-5" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{alert.message}</p>
                <p class="text-xs text-gray-500">{alert.time}</p>
              </div>
              <div>
                <button class="text-gray-400 hover:text-gray-500">
                  <Icon icon="mdi:dots-vertical" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
