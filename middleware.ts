// middleware.ts (project root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

// Do NOT include '/' here, or everything becomes public
const PUBLIC = ['/login', '/admin/login', '/schools/login']
// Exact match only
const isPublic = (p: string) => PUBLIC.includes(p)

async function getRole(req: NextRequest): Promise<'admin'|'school'|null> {
  const t = req.cookies.get('token')?.value
  if (!t) return null
  try {
    const { payload } = await jwtVerify(t, secret)
    return (payload.role as any) ?? null
  } catch { return null }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  const role = await getRole(req)
  const inAdmin = pathname.startsWith('/admin')

  // Only admins can access /admin/**
  if (inAdmin) {
    if (role === 'admin') return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  // Admins cannot access non-admin routes (e.g., /settings)
  if (role === 'admin') {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // Non-admins proceed for non-admin pages
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}