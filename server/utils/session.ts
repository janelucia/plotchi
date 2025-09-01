import type { H3Event } from 'h3'

export interface UserSession {
  id: string
  email: string
  name: string
}

export async function getUserSession(event: H3Event): Promise<UserSession | null> {
  return await getServerSession(event, {
    password: useRuntimeConfig().sessionSecret
  })
}

export async function setUserSession(event: H3Event, user: UserSession) {
  await setServerSession(event, {
    password: useRuntimeConfig().sessionSecret
  }, user)
}

export async function clearUserSession(event: H3Event) {
  await clearServerSession(event, {
    password: useRuntimeConfig().sessionSecret
  })
}

export async function requireUserSession(event: H3Event): Promise<UserSession> {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in'
    })
  }
  return session
}