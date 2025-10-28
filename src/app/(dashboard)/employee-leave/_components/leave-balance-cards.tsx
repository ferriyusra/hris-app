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
				<Card key={balance.id}>
					<CardHeader className='pb-2'>
						<CardTitle className='text-sm font-medium flex items-center gap-2'>
							<Calendar className='h-4 w-4 text-blue-600' />
							{balance.leave_type?.name || 'Unknown'}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='space-y-2'>
							<div className='flex justify-between items-center'>
								<span className='text-xs text-muted-foreground'>Total</span>
								<span className='text-sm font-semibold'>{balance.total_days} hari</span>
							</div>
							<div className='flex justify-between items-center'>
								<span className='text-xs text-muted-foreground'>Terpakai</span>
								<span className='text-sm font-semibold text-orange-600'>
									{balance.used_days} hari
								</span>
							</div>
							<div className='flex justify-between items-center pt-2 border-t'>
								<span className='text-xs font-medium'>Tersisa</span>
								<span className='text-lg font-bold text-green-600'>
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
