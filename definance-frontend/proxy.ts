import { NextResponse, type NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const authCookie =
    request.cookies.get('definance_token') ||
    request.cookies.get('.AspNetCore.Identity.Application')

  const isAuthenticated = !!authCookie

  const privateRoutes = ['/dashboard', '/onboarding']
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route))

  if (!isAuthenticated && isPrivateRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/login',
    '/register'
  ],
}