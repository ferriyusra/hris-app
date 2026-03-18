import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { rateLimit } from './lib/rate-limit';

export async function middleware(request: NextRequest) {
	const ip =
		request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';

	// Stricter rate limit on login: 5 requests per 60s
	if (request.nextUrl.pathname === '/login') {
		const allowed = rateLimit(`auth:${ip}`, 5, 60_000);
		if (!allowed) {
			return NextResponse.json(
				{
					error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.',
				},
				{ status: 429 }
			);
		}
	}

	// General rate limit: 10 requests per 10s
	const allowed = rateLimit(`general:${ip}`, 10, 10_000);
	if (!allowed) {
		return NextResponse.json(
			{ error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
			{ status: 429 }
		);
	}

	return await updateSession(request);
}

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
};
