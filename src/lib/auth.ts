import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

console.log('🔧 Carregando configuração do NextAuth...')

export const authOptions: NextAuthOptions = {
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('🔥 NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata)
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // adapter: PrismaAdapter(prisma), // Removido temporariamente para testar
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🚀 AUTHORIZE FUNCTION CALLED!')
        console.log('🔍 Credentials received:', credentials ? { email: credentials.email, hasPassword: !!credentials.password } : 'null')
        
        try {
          console.log('🔍 Verificando instância do Prisma:', !!prisma)
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciais inválidas ou ausentes')
            return null
          }

          console.log('🔍 Iniciando busca pelo usuário:', credentials.email)
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('🔍 Resultado da busca:', !!user)
          console.log('🔍 Detalhes do usuário:', user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : 'null')

          if (!user || !user.isActive) {
            console.log('❌ Usuário não encontrado ou inativo')
            return null
          }

          console.log('🔍 Verificando senha...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔍 Senha válida:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('❌ Senha inválida')
            return null
          }

          console.log('✅ Login bem-sucedido!')
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('💥 Erro na função authorize:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.candidateId = user.candidateId
        token.companyId = user.companyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.candidateId = token.candidateId as string
        session.user.companyId = token.companyId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}