import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('NextAuth Warning:', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🚀 AUTHORIZE FUNCTION CALLED!')
        console.log('🔐 Tentativa de login:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais incompletas')
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            candidate: true,
            company: true
          }
        })

        if (!user) {
          console.log('❌ Usuário não encontrado:', credentials.email)
          return null
        }

        console.log('✅ Usuário encontrado:', { id: user.id, email: user.email, role: user.role })

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          console.log('❌ Senha inválida para:', credentials.email)
          return null
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
          console.log('❌ Email não verificado para:', credentials.email)
          throw new Error('Email não verificado. Verifique seu email para ativar sua conta.')
        }

        // Check if account is active
        if (!user.isActive) {
          console.log('❌ Conta inativa para:', credentials.email)
          throw new Error('Conta inativa. Entre em contato com o suporte.')
        }

        console.log('✅ Login bem-sucedido:', credentials.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          candidateId: user.candidate?.id,
          companyId: user.company?.id
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