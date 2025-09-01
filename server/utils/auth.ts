import bcrypt from 'bcrypt'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function createUser(email: string, name: string, password: string) {
  const hashedPassword = await hashPassword(password)
  
  return await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    }
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    return null
  }
  
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email,
    name: user.name
  }
}