import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const generateUUID = () => uuidv4()

export const hashPassword = async (password) => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload, secret = process.env.JWT_SECRET, expiresIn = '24h') => {
  return jwt.sign(payload, secret, { expiresIn })
}

export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret)
  } catch (error) {
    return null
  }
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}

