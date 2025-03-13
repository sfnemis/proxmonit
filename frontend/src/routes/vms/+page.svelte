<script lang="ts">
  import Icon from '@iconify/svelte';

  // Sample VM data - would come from API in real implementation
  const virtualMachines = [
    {
      id: 100,
      name: 'web-server-1',
      status: 'running',
      os: 'Debian 12',
      memory: 4,
      cores: 2,
      diskUsed: 22.5,
      diskTotal: 50,
      uptime: '12d 5h 32m',
      ipAddress: '192.168.1.100'
    },
    {
      id: 101,
      name: 'db-server',
      status: 'running',
      os: 'Ubuntu 22.04',
      memory: 8,
      cores: 4,
      diskUsed: 78.2,
      diskTotal: 100,
      uptime: '5d 14h 27m',
      ipAddress: '192.168.1.101'
    },
    {
      id: 102,
      name: 'test-vm',
      status: 'stopped',
      os: 'Windows Server 2022',
      memory: 16,
      cores: 8,
      diskUsed: 45.8,
      diskTotal: 150,
      uptime: '0d 0h 0m',
      ipAddress: '—'
    },
    {
      id: 103,
      name: 'mail-server',
      status: 'running',
      os: 'Rocky Linux 9',
      memory: 4,
      cores: 2,
      diskUsed: 15.7,
      diskTotal: 40,
      uptime: '32d 7h 15m',
      ipAddress: '192.168.1.103'
    },
    {
      id: 104,
      name: 'dev-vm',
      status: 'running',
      os: 'Fedora 38',
      memory: 8,
      cores: 4,
      diskUsed: 34.1,
      diskTotal: 80,
      uptime: '3d 9h 52m',
      ipAddress: '192.168.1.104'
    }
  ];

  // Filter state
  let filterStatus = 'all';
  let searchQuery = '';

  // Filtered VMs
  $: filteredVMs = virtualMachines.filter(vm => {
    // Filter by status
    if (filterStatus !== 'all' && vm.status !== filterStatus) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !vm.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Handle VM action (placeholder)
  function handleVMAction(action: string, vm: any) {
    console.log(`${action} VM with ID ${vm.id}`);
    // In a real app, this would call the API
    alert(`Action '${action}' would be performed on VM '${vm.name}' (ID: ${vm.id})`);
  }
</script>

<div>
  <!-- Page Header -->
  <div class="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-semibold text-gray-800">Virtual Machines</h1>
      <p class="text-gray-600">Manage and monitor your virtual machines</p>
    </div>
    <div class="mt-4 md:mt-0">
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center">
        <Icon icon="mdi:plus" class="mr-1 h-5 w-5" />
        Create VM
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
          placeholder="Search VMs..."
          bind:value={searchQuery}
          class="border-gray-300 rounded-md shadow-sm pl-10 focus:border-indigo-500 focus:ring-indigo-500 block w-full sm:text-sm"
        >
      </div>
    </div>
  </div>

  <!-- VM List -->
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
              OS
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
          {#if filteredVMs.length === 0}
            <tr>
              <td colspan="7" class="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                No virtual machines found matching the current filters.
              </td>
            </tr>
          {:else}
            {#each filteredVMs as vm (vm.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    vm.status === 'running' ? 'bg-green-100 text-green-800' :
                    vm.status === 'stopped' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <span class={`h-2 w-2 rounded-full mr-1 ${
                      vm.status === 'running' ? 'bg-green-400' :
                      vm.status === 'stopped' ? 'bg-gray-400' :
                      'bg-yellow-400'
                    }`}></span>
                    {vm.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-sm font-medium text-gray-900">{vm.name}</div>
                    <div class="ml-2 text-xs text-gray-500">#{vm.id}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vm.os}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">CPU: {vm.cores} cores</div>
                  <div class="text-sm text-gray-900">RAM: {vm.memory} GB</div>
                  <div class="text-sm text-gray-500">
                    Disk: {vm.diskUsed} GB / {vm.diskTotal} GB
                    <div class="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                      <div
                        class={`h-1.5 rounded-full ${(vm.diskUsed / vm.diskTotal) > 0.8 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={`width: ${(vm.diskUsed / vm.diskTotal) * 100}%`}
                      ></div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vm.ipAddress}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vm.uptime}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    {#if vm.status === 'running'}
                      <button
                        on:click={() => handleVMAction('stop', vm)}
                        class="text-gray-400 hover:text-red-500"
                        title="Stop"
                      >
                        <Icon icon="mdi:stop-circle" class="h-5 w-5" />
                      </button>
                      <button
                        on:click={() => handleVMAction('restart', vm)}
                        class="text-gray-400 hover:text-amber-500"
                        title="Restart"
                      >
                        <Icon icon="mdi:restart" class="h-5 w-5" />
                      </button>
                    {:else}
                      <button
                        on:click={() => handleVMAction('start', vm)}
                        class="text-gray-400 hover:text-green-500"
                        title="Start"
                      >
                        <Icon icon="mdi:play-circle" class="h-5 w-5" />
                      </button>
                    {/if}
                    <button
                      on:click={() => handleVMAction('console', vm)}
                      class="text-gray-400 hover:text-blue-500"
                      title="Console"
                    >
                      <Icon icon="mdi:monitor" class="h-5 w-5" />
                    </button>
                    <button
                      on:click={() => handleVMAction('edit', vm)}
                      class="text-gray-400 hover:text-indigo-500"
                      title="Edit"
                    >
                      <Icon icon="mdi:pencil" class="h-5 w-5" />
                    </button>
                    <button
                      on:click={() => handleVMAction('more', vm)}
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