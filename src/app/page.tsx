'use client';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';

export default function Home() {
	const profile = useAuthStore((state) => state.profile);
	return (
		<div className='flex justify-center items-center h-screen flex-col space-y-6 bg-gradient-to-br from-primary/5 via-background to-accent/5'>
			<h1 className='text-4xl font-bold tracking-tight'>Welcome {profile.name}</h1>
			<Link href={profile.role === 'admin' ? '/admin' : '/employee-dashboard'}>
				<Button className='bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 h-11 px-8'>
					Access Dashboard
				</Button>
			</Link>
		</div>
	);
}
