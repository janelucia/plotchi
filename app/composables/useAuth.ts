import type { User } from "~/types/database"

const globalUser = ref<User | null>(null)
const isLoading = ref(false)
const isHydrated = ref(false)

export const useAuth = () => {
  const isLoggedIn = computed(() => !!globalUser.value)
  
  const fetchUser = async () => {
    if (isLoading.value) return
    isLoading.value = true
    
    try {
      const response = await $fetch<{ user: User }>('/api/auth/me')
      globalUser.value = response.user
    } catch (error) {
      globalUser.value = null
    } finally {
      isLoading.value = false
      isHydrated.value = true
    }
  }
  
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      globalUser.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const requireAuth = async () => {
    if (!globalUser.value) {
      await fetchUser()
    }
    if (!isLoggedIn.value) {
      await navigateTo('/login')
      return false
    }
    return true
  }
  
  return {
    user: readonly(globalUser),
    isLoggedIn,
    isHydrated: readonly(isHydrated),
    fetchUser,
    logout,
    requireAuth
  }
}