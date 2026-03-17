'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeaveBalance } from '@/types/leave';
import { Calendar } from 'lucide-react';

interface LeaveBalanceCardsProps {
	balances: LeaveBalance[];
}

export default function LeaveBalanceCards({ balances }: LeaveBalanceCardsProps) {
	if (balances.length === 0) {
		return (
			<div className='text-center py-8'>
				<p className='text-muted-foreground'>Tidak ada saldo cuti tersedia</p>
			</div>
		);
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{balances.map((balance) => (
				<Card key={balance.id} className='glass-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-200'>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10'>
								<Calendar className='h-3.5 w-3.5 text-primary' />
							</div>
							{balance.leave_type?.name || 'Unknown'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<span className='text-xs text-muted-foreground'>Total</span>
								<span className='text-sm font-semibold font-mono'>{balance.total_days} hari</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-xs text-muted-foreground'>Terpakai</span>
								<span className='text-sm font-semibold font-mono text-amber-600 dark:text-amber-400'>
									{balance.used_days} hari
								</span>
							</div>
							<div className='flex justify-between items-center pt-2 border-t'>
								<span className='text-xs font-medium'>Tersisa</span>
								<span className='text-lg font-bold font-mono text-primary'>
									{balance.remaining_days} hari
								</span>
							</div>
						</div>
						{balance.leave_type?.description && (
							<p className='text-xs text-muted-foreground mt-3'>
								{balance.leave_type.description}
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
