import type { User } from "~/types/database"

export const useAuth = () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  
  const fetchUser = async () => {
    try {
      const response = await $fetch<{ user: User }>('/api/auth/me')
      user.value = response.user
    } catch (error) {
      user.value = null
    }
  }
  
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      await navigateTo('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const requireAuth = async () => {
    await fetchUser()
    if (!isLoggedIn.value) {
      await navigateTo('/login')
      return false
    }
    return true
  }
  
  return {
    user: readonly(user),
    isLoggedIn,
    fetchUser,
    logout,
    requireAuth
  }
}