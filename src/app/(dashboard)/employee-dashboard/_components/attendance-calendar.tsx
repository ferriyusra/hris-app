'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MonthlyTrend } from '../actions';
import { cn } from '@/lib/utils';

interface AttendanceCalendarProps {
	trends: MonthlyTrend[];
}

export default function AttendanceCalendar({ trends }: AttendanceCalendarProps) {
	const getStatusIcon = (status: 'present' | 'late' | 'absent') => {
		switch (status) {
			case 'present':
				return <div className='flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-950/30'><CheckCircle2 className='h-3.5 w-3.5 text-teal-600 dark:text-teal-400' /></div>;
			case 'late':
				return <div className='flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/30'><Clock className='h-3.5 w-3.5 text-amber-600 dark:text-amber-400' /></div>;
			case 'absent':
				return <div className='flex h-7 w-7 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30'><XCircle className='h-3.5 w-3.5 text-red-600 dark:text-red-400' /></div>;
		}
	};

	const getStatusColor = (status: 'present' | 'late' | 'absent') => {
		switch (status) {
			case 'present':
				return 'bg-teal-50 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/10 dark:border-teal-900/30 dark:hover:bg-teal-950/20';
			case 'late':
				return 'bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30 dark:hover:bg-amber-950/20';
			case 'absent':
				return 'bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-950/10 dark:border-red-900/30 dark:hover:bg-red-950/20';
		}
	};

	const getStatusLabel = (status: 'present' | 'late' | 'absent') => {
		switch (status) {
			case 'present':
				return 'Hadir';
			case 'late':
				return 'Terlambat';
			case 'absent':
				return 'Tidak Hadir';
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg flex items-center gap-2'>
					<Calendar className='h-5 w-5 text-primary' />
					Riwayat Kehadiran (30 Hari Terakhir)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					{trends.length === 0 ? (
						<p className='text-sm text-muted-foreground text-center py-8'>
							Belum ada catatan kehadiran
						</p>
					) : (
						trends.map((trend) => {
							const date = new Date(trend.date);
							const formattedDate = date.toLocaleDateString('id-ID', {
								weekday: 'short',
								year: 'numeric',
								month: 'short',
								day: 'numeric',
							});

							return (
								<div
									key={trend.date}
									className={cn(
										'flex items-center justify-between p-3 rounded-lg border transition-colors duration-150',
										getStatusColor(trend.status)
									)}>
									<div className='flex items-center gap-3'>
										{getStatusIcon(trend.status)}
										<div>
											<p className='font-medium text-sm'>{formattedDate}</p>
											<p className='text-xs text-muted-foreground'>
												{getStatusLabel(trend.status)}
												{trend.clock_in && ` • In: ${trend.clock_in}`}
												{trend.clock_out && ` • Out: ${trend.clock_out}`}
											</p>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</CardContent>
		</Card>
	);
}
