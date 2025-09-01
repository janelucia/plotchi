import { clearUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  
  return {
    message: 'Logout successful'
  }
})