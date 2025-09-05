export type UserSession = {
  id: string
  email: string
  name: string
}

export async function getUserSession(event: any): Promise<UserSession | null> {
  const session = getCookie(event, 'user-session')
  if (!session) return null
  
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString())
  } catch {
    return null
  }
}

export async function setUserSession(event: any, user: UserSession) {
  const sessionData = Buffer.from(JSON.stringify(user)).toString('base64')
  setCookie(event, 'user-session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearUserSession(event: any) {
  deleteCookie(event, 'user-session')
}

export async function requireUserSession(event: any): Promise<UserSession> {
  const session = await getUserSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in'
    })
  }
  return session
}