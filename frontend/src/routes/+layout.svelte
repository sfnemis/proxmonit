<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import '../app.css';

	let sidebarOpen = false;
	let isMobile = false;

	// Toggle sidebar on mobile
	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	// Check if device is mobile
	onMount(() => {
		const checkScreenSize = () => {
			isMobile = window.innerWidth < 768;
			sidebarOpen = !isMobile;
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);

		return () => {
			window.removeEventListener('resize', checkScreenSize);
		};
	});

	// Navigation items
	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard', href: '/' },
		{ id: 'vms', label: 'Virtual Machines', icon: 'mdi:server', href: '/vms' },
		{ id: 'containers', label: 'Containers', icon: 'mdi:docker', href: '/containers' },
		{ id: 'storage', label: 'Storage', icon: 'mdi:harddisk', href: '/storage' },
		{ id: 'network', label: 'Network', icon: 'mdi:network', href: '/network' },
		{ id: 'alerts', label: 'Alerts', icon: 'mdi:alert', href: '/alerts' },
		{ id: 'settings', label: 'Settings', icon: 'mdi:cog', href: '/settings' }
	];
</script>

<div class="flex h-screen bg-gray-100">
	<!-- Sidebar -->
	<aside
		class={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-indigo-700 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
	>
		<!-- Logo -->
		<div class="flex h-16 items-center justify-center border-b border-indigo-800">
			<h1 class="text-xl font-bold">ProxMonX</h1>
		</div>

		<!-- Navigation Menu -->
		<nav class="mt-6 px-4">
			<ul class="space-y-2">
				{#each navItems as item}
					<li>
						<a
							href={item.href}
							class={`flex items-center rounded-md px-4 py-2 ${$page.url.pathname === item.href ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
						>
							<Icon icon={item.icon} class="mr-3 h-5 w-5" />
							<span>{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- User Profile -->
		<div class="absolute bottom-0 w-full border-t border-indigo-800 p-4">
			<div class="flex items-center">
				<div class="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
					<Icon icon="mdi:account" class="h-6 w-6" />
				</div>
				<div class="ml-3">
					<p class="font-medium">Admin User</p>
					<button class="text-sm text-indigo-200 hover:text-white">Log out</button>
				</div>
			</div>
		</div>
	</aside>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- Top Header -->
		<header class="bg-white shadow h-16 flex items-center justify-between px-6">
			<!-- Mobile Menu Button -->
			<button
				class="md:hidden text-gray-500 focus:outline-none"
				on:click={toggleSidebar}
			>
				<Icon icon={sidebarOpen ? 'mdi:close' : 'mdi:menu'} class="h-6 w-6" />
			</button>

			<!-- Search Bar -->
			<div class="flex-1 max-w-md ml-4 md:ml-0">
				<div class="relative">
					<span class="absolute inset-y-0 left-0 flex items-center pl-3">
						<Icon icon="mdi:magnify" class="h-5 w-5 text-gray-400" />
					</span>
					<input
						type="text"
						placeholder="Search..."
						class="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
					>
				</div>
			</div>

			<!-- Header Right Icons -->
			<div class="flex items-center space-x-4">
				<button class="text-gray-500 hover:text-gray-700">
					<Icon icon="mdi:bell" class="h-6 w-6" />
				</button>
				<button class="text-gray-500 hover:text-gray-700">
					<Icon icon="mdi:help-circle" class="h-6 w-6" />
				</button>
			</div>
		</header>

		<!-- Page Content -->
		<main class="flex-1 overflow-y-auto bg-gray-100 p-6">
			<slot />
		</main>
	</div>
</div>
