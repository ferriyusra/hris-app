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
				return <CheckCircle2 className='h-4 w-4 text-blue-600' />;
			case 'late':
				return <Clock className='h-4 w-4 text-orange-600' />;
			case 'absent':
				return <XCircle className='h-4 w-4 text-red-600' />;
		}
	};

	const getStatusColor = (status: 'present' | 'late' | 'absent') => {
		switch (status) {
			case 'present':
				return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
			case 'late':
				return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
			case 'absent':
				return 'bg-red-50 border-red-200 hover:bg-red-100';
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
					<Calendar className='h-5 w-5 text-blue-600' />
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
										'flex items-center justify-between p-3 rounded-lg border transition-colors',
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
