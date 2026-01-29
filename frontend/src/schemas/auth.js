import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

export const recoverySchema = z.object({
  email: z.string().email('Email invalido')
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email invalido')
});
