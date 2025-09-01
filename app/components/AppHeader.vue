<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between h-16 px-6">
        <div class="flex items-center min-w-0 flex-1">
          <NuxtLink
            to="/"
            class="text-lg font-bold text-gray-900 hover:text-emerald-700 transition-colors flex items-center flex-shrink-0"
            :class="{ 'text-emerald-700': showBreadcrumb }">
            <NuxtImg
              src="/svg/logo.svg"
              alt="Plotchi Logo"
              width="24"
              height="24"
              class="mr-2" />
            <span class="text-accent-content hidden sm:inline">Plotchi</span>
          </NuxtLink>

          <div v-if="showBreadcrumb" class="flex items-center min-w-0 flex-1">
            <Icon
              name="mdi:chevron-right"
              class="w-5 h-5 text-gray-400 mx-3 flex-shrink-0" />
            <h1 class="text-lg font-bold text-gray-900 truncate">
              {{ breadcrumbTitle }}
            </h1>
          </div>
        </div>

        <div class="flex items-center flex-shrink-0">
          <div
            v-if="showStats && healthyPlants > 0"
            class="flex items-center mr-4">
            <div
              class="flex items-center px-2 py-1 bg-emerald-50 rounded-full mr-3">
              <div class="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              <span class="text-emerald-700 font-medium text-sm sm:hidden">
                {{ healthyPlants }}
              </span>
              <span
                class="text-emerald-700 font-medium text-sm hidden sm:inline">
                {{ healthyPlants }} plant{{ healthyPlants === 1 ? "" : "s" }}
              </span>
            </div>
            <div
              v-if="urgentPlants > 0"
              class="flex items-center px-2 py-1 bg-error/50 rounded-full">
              <div
                class="w-2 h-2 bg-error-content rounded-full animate-pulse mr-2"></div>
              <span class="text-error-content font-medium text-sm sm:hidden">
                {{ urgentPlants }}
              </span>
              <span
                class="text-error-content font-medium text-sm hidden sm:inline">
                {{ urgentPlants }} need attention
              </span>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-3 mr-4">
            <div v-if="user" class="dropdown dropdown-end">
              <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                <div class="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  {{ user.name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                <li class="menu-title">
                  <span>{{ user.name }}</span>
                </li>
                <li><button @click="handleLogout">Logout</button></li>
              </ul>
            </div>
          </div>

          <!-- Actions slot -->
          <div class="flex items-center gap-3">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  showBreadcrumb?: boolean;
  breadcrumbTitle?: string;
  showStats?: boolean;
  healthyPlants?: number;
  urgentPlants?: number;
}

withDefaults(defineProps<Props>(), {
  showBreadcrumb: false,
  breadcrumbTitle: "",
  showStats: false,
  healthyPlants: 0,
  urgentPlants: 0,
});

const { user, logout } = useAuth();

onMounted(() => {
  if (user.value === null) {
    const { fetchUser } = useAuth();
    fetchUser();
  }
});

const handleLogout = async () => {
  await logout();
};
</script>
