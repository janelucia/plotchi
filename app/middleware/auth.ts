export default defineNuxtRouteMiddleware((to) => {
  const { requireAuth } = useAuth()
  
  if (process.client) {
    return requireAuth()
  }
})