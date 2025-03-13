<script lang="ts">
  import Icon from '@iconify/svelte';

  // Sample container data - would come from API in real implementation
  const containers = [
    {
      id: 201,
      name: 'web-01',
      status: 'running',
      template: 'Debian 12',
      memory: 2,
      cores: 2,
      diskUsed: 1.5,
      diskTotal: 8,
      uptime: '15d 8h 45m',
      ipAddress: '192.168.1.201'
    },
    {
      id: 202,
      name: 'db-01',
      status: 'running',
      template: 'Ubuntu 22.04',
      memory: 4,
      cores: 2,
      diskUsed: 5.2,
      diskTotal: 10,
      uptime: '15d 8h 25m',
      ipAddress: '192.168.1.202'
    },
    {
      id: 203,
      name: 'dev-01',
      status: 'running',
      template: 'Alpine 3.18',
      memory: 1,
      cores: 1,
      diskUsed: 0.5,
      diskTotal: 4,
      uptime: '8d 12h 33m',
      ipAddress: '192.168.1.203'
    },
    {
      id: 204,
      name: 'test-01',
      status: 'stopped',
      template: 'Rocky Linux 9',
      memory: 2,
      cores: 2,
      diskUsed: 2.1,
      diskTotal: 8,
      uptime: '0d 0h 0m',
      ipAddress: '—'
    },
    {
      id: 205,
      name: 'haproxy',
      status: 'running',
      template: 'Debian 12',
      memory: 1,
      cores: 1,
      diskUsed: 0.7,
      diskTotal: 4,
      uptime: '22d 5h 17m',
      ipAddress: '192.168.1.205'
    }
  ];

  // Filter state
  let filterStatus = 'all';
  let searchQuery = '';

  // Filtered containers
  $: filteredContainers = containers.filter(container => {
    // Filter by status
    if (filterStatus !== 'all' && container.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !container.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Handle container action (placeholder)
  function handleContainerAction(action: string, container: any) {
    console.log(`${action} container with ID ${container.id}`);
    // In a real app, this would call the API
    alert(`Action '${action}' would be performed on container '${container.name}' (ID: ${container.id})`);
  }
</script>

<div>
  <!-- Page Header -->
  <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-gray-800">LXC Containers</h1>
      <p class="text-gray-600">Manage and monitor your containers</p>
    </div>
    <div class="mt-4 md:mt-0">
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
        <Icon icon="mdi:plus" class="mr-1 h-5 w-5" />
        Create Container
      </button>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white p-4 rounded-lg shadow mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between">
      <div class="flex items-center mb-4 md:mb-0">
        <div class="mr-4">
          <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="statusFilter"
            bind:value={filterStatus}
            class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
          >
            <option value="all">All</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search containers..."
          bind:value={searchQuery}
          class="border-gray-300 rounded-md shadow-sm pl-10 focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
        >
      </div>
    </div>
  </div>

  <!-- Container List -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Template
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resources
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Uptime
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#if filteredContainers.length === 0}
            <tr>
              <td colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                No containers found matching the current filters.
              </td>
            </tr>
          {:else}
            {#each filteredContainers as container (container.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    container.status === 'running' ? 'bg-green-100 text-green-800' :
                    container.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <span class={`h-2 w-2 rounded-full mr-1 ${
                      container.status === 'running' ? 'bg-green-400' :
                      container.status === 'stopped' ? 'bg-gray-400' :
                      'bg-yellow-400'
                    }`}></span>
                    {container.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">{container.name}</div>
                    <div class="ml-2 text-xs text-gray-500">#{container.id}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.template}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">CPU: {container.cores} cores</div>
                  <div class="text-sm text-gray-900">RAM: {container.memory} GB</div>
                  <div class="text-sm text-gray-500">
                    Disk: {container.diskUsed} GB / {container.diskTotal} GB
                    <div class="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div
                        class={`h-1.5 rounded-full ${(container.diskUsed / container.diskTotal) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={`width: ${(container.diskUsed / container.diskTotal) * 100}%`}
                      ></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.ipAddress}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {container.uptime}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    {#if container.status === 'running'}
                      <button
                        on:click={() => handleContainerAction('stop', container)}
                        class="text-gray-400 hover:text-red-500"
                        title="Stop"
                      >
                        <Icon icon="mdi:stop-circle" class="h-5 w-5" />
                      </button>
                      <button
                        on:click={() => handleContainerAction('restart', container)}
                        class="text-gray-400 hover:text-amber-500"
                        title="Restart"
                      >
                        <Icon icon="mdi:restart" class="h-5 w-5" />
                      </button>
                    {:else}
                      <button
                        on:click={() => handleContainerAction('start', container)}
                        class="text-gray-400 hover:text-green-500"
                        title="Start"
                      >
                        <Icon icon="mdi:play-circle" class="h-5 w-5" />
                      </button>
                    {/if}
                    <button
                      on:click={() => handleContainerAction('console', container)}
                      class="text-gray-400 hover:text-blue-500"
                      title="Console"
                    >
                      <Icon icon="mdi:console" class="h-5 w-5" />
                    </button>
                    <button
                      on:click={() => handleContainerAction('edit', container)}
                      class="text-gray-400 hover:text-indigo-500"
                      title="Edit"
                    >
                      <Icon icon="mdi:pencil" class="h-5 w-5" />
                    </button>
                    <button
                      on:click={() => handleContainerAction('more', container)}
                      class="text-gray-400 hover:text-gray-500"
                      title="More options"
                    >
                      <Icon icon="mdi:dots-vertical" class="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>