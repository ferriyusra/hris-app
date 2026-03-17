import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import AuthStoreProvider from '@/providers/auth-store-provider';
import { cookies } from 'next/headers';
import ReactQueryProvider from '@/providers/react-query-provider';

const dmSans = DM_Sans({
	variable: '--font-geist-sans',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
	weight: ['400', '500', '600'],
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookiesStore = await cookies();
	const profile = JSON.parse(cookiesStore.get('user_profile')?.value ?? '{}');

	return (
		<html lang='en' suppressHydrationWarning>
			<body
				className={`${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
				<ReactQueryProvider>
					<AuthStoreProvider profile={profile}>
						<ThemeProvider
							attribute='class'
							defaultTheme='system'
							enableSystem
							disableTransitionOnChange>
							{children}
							<Toaster />
						</ThemeProvider>
					</AuthStoreProvider>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
