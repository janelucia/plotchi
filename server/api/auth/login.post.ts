import { authenticateUser } from '../../utils/auth'
import { setUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }
  
  const user = await authenticateUser(email, password)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password'
    })
  }
  
  await setUserSession(event, user)
  
  return {
    user,
    message: 'Login successful'
  }
})