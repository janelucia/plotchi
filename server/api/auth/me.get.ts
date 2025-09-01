import { getUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = await getUserSession(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated'
    })
  }
  
  return { user }
})