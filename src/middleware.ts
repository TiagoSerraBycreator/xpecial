import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for API routes, static files, and other excluded paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/cadastro', '/cert', '/ativar-conta', '/verify-email', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Public company profile routes (empresa/[slug] pattern)
  const isPublicCompanyProfile = /^\/empresa\/[^/]+$/.test(pathname)
  
  if (isPublicRoute || isPublicCompanyProfile) {
    return NextResponse.next()
  }

  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Check if user has the right role for the route
  if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/empresa') && token?.role !== 'COMPANY') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/candidato') && token?.role !== 'CANDIDATE') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}