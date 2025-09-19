import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

console.log('🔧 Carregando configuração SIMPLIFICADA do NextAuth...')

export const authOptions: NextAuthOptions = {
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('\n' + '='.repeat(50))
        console.log('🚀 AUTHORIZE FUNCTION CALLED!')
        console.log('🔍 Credentials received:', credentials ? { email: credentials.email, hasPassword: !!credentials.password } : 'null')
        console.log('🔍 Process env NODE_ENV:', process.env.NODE_ENV)
        console.log('🔍 Timestamp:', new Date().toISOString())
        console.log('='.repeat(50))
        
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciais inválidas ou ausentes')
            return null
          }

          console.log('🔍 Iniciando busca pelo usuário:', credentials.email)
          console.log('🔍 Instância do Prisma:', !!prisma)
          console.log('🔍 Tipo do Prisma:', typeof prisma)
          
          // Primeiro, vamos testar a conexão
          console.log('🔍 Testando conexão com o banco...')
          await prisma.$connect()
          console.log('✅ Conexão estabelecida')
          
          // Contar total de usuários
          const totalUsers = await prisma.user.count()
          console.log('🔍 Total de usuários no banco:', totalUsers)
          
          // Buscar todos os emails para debug
          const allEmails = await prisma.user.findMany({
            select: { email: true }
          })
          console.log('🔍 Emails no banco:', allEmails.map(u => u.email))
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          console.log('🔍 Resultado da busca:', !!user)
          console.log('🔍 Detalhes do resultado:', user ? { id: user.id, email: user.email, isActive: user.isActive } : 'null')

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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
}