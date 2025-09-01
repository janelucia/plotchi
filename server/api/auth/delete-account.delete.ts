import { requireUserSession } from '../../utils/session'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = await requireUserSession(event)
  
  try {
    // Delete user account - Prisma cascade will handle:
    // - All plants owned by the user
    // - All watering history for those plants  
    // - All plant photos for those plants
    await prisma.user.delete({
      where: {
        id: user.id
      }
    })
    
    // Clear the user session
    const { clearUserSession } = await import('../../utils/session')
    await clearUserSession(event)
    
    return {
      success: true,
      message: 'Account successfully deleted'
    }
  } catch (error: any) {
    console.error('Error deleting user account:', error)
    
    if (error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account'
    })
  }
})