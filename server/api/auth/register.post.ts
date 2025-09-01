import { createUser } from '~/server/utils/auth'
import { setUserSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const { email, name, password } = await readBody(event)
  
  if (!email || !name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, name, and password are required'
    })
  }
  
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 6 characters long'
    })
  }
  
  try {
    const user = await createUser(email, name, password)
    
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name
    }
    
    await setUserSession(event, userSession)
    
    return {
      user: userSession,
      message: 'Registration successful'
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists'
      })
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Registration failed'
    })
  }
})