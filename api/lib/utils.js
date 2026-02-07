import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'


export const generateUUID = () => uuidv4()

export const MD5 = (d) => crypto.createHash('md5').update(d).digest('hex');
export const sha256 = (d) => crypto.createHash('sha256').update(d).digest('hex');
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

export function retroDate(num=1){
  return (new Date(Date.now() - (num * (3600000 * 24))).toISOString().split('T'))[0]
}

export function sanitizeData(obj) {
  return JSON.parse(JSON.stringify(obj, (k, v) => {
    if (typeof v == 'bigint') {
      return parseInt(v);
    }
    return v;
  }));
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user
  return sanitizedUser
}

