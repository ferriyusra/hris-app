'use client';

import { useEffect, useState, useActionState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceStatusBadge } from '@/components/common/attendance-status-badge';
import { TimeDisplay, DateDisplay } from '@/components/common/time-display';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { clockIn, clockOut, getTodayAttendance } from '../actions';
import { INITIAL_STATE_ATTENDANCE } from '@/constants/attendance-constant';
import { format } from 'date-fns';
import Link from 'next/link';
import type { AttendanceTodayStatus } from '@/types/attendance';

export default function AttendanceClockInOut() {
	const [currentTime, setCurrentTime] = useState<Date | null>(null);
	const [todayStatus, setTodayStatus] = useState<AttendanceTodayStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isPending, startTransition] = useTransition();

	const [clockInState, clockInAction, isClockingIn] = useActionState(
		clockIn,
		INITIAL_STATE_ATTENDANCE
	);

	const [clockOutState, clockOutAction, isClockingOut] = useActionState(
		clockOut,
		INITIAL_STATE_ATTENDANCE
	);

	// Real-time clock - only run on client side
	useEffect(() => {
		// Set initial time on client mount
		setCurrentTime(new Date());

		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	// Load today's attendance status
	useEffect(() => {
		loadTodayStatus();
	}, []);

	const loadTodayStatus = async () => {
		setIsLoading(true);
		try {
			const status = await getTodayAttendance();
			setTodayStatus(status);
		} catch (error) {
			toast.error('Gagal memuat status kehadiran', {
				description: error instanceof Error ? error.message : 'Kesalahan tidak diketahui',
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle clock-in response
	useEffect(() => {
		if (clockInState.status === 'success') {
			toast.success('Berhasil absen masuk');
			loadTodayStatus();
		} else if (clockInState.status === 'error' && clockInState.errors?._form) {
			toast.error('Gagal absen masuk', {
				description: clockInState.errors._form[0],
			});
		}
	}, [clockInState]);

	// Handle clock-out response
	useEffect(() => {
		if (clockOutState.status === 'success') {
			toast.success('Berhasil absen keluar');
			loadTodayStatus();
		} else if (clockOutState.status === 'error' && clockOutState.errors?._form) {
			toast.error('Gagal absen keluar', {
				description: clockOutState.errors._form[0],
			});
		}
	}, [clockOutState]);

	const handleClockIn = () => {
		startTransition(() => {
			const formData = new FormData();
			clockInAction(formData);
		});
	};

	const handleClockOut = () => {
		startTransition(() => {
			const formData = new FormData();
			clockOutAction(formData);
		});
	};

	const canClockIn = !isLoading && !todayStatus?.has_record;
	const canClockOut =
		!isLoading &&
		todayStatus?.has_record &&
		todayStatus?.is_clocked_in &&
		!todayStatus?.is_clocked_out;

	return (
		<div className='w-full max-w-4xl mx-auto space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold'>Absensi Saya</h1>
				<Link href='/employee-attendance/history'>
					<Button variant='outline'>
						<Calendar className='mr-2 h-4 w-4' />
						Lihat Riwayat
					</Button>
				</Link>
			</div>

			{/* Real-time Clock Card */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Clock className='h-5 w-5' />
						Waktu Saat Ini
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-center'>
						{currentTime ? (
							<>
								<div className='text-5xl font-bold mb-2'>{format(currentTime, 'HH:mm:ss')}</div>
								<div className='text-muted-foreground'>{format(currentTime, 'EEEE, dd MMMM yyyy')}</div>
							</>
						) : (
							<div className='text-5xl font-bold mb-2'>--:--:--</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Today's Status Card */}
			<Card>
				<CardHeader>
					<CardTitle>Kehadiran Hari Ini</CardTitle>
					<CardDescription>
						{currentTime ? format(currentTime, 'dd MMMM yyyy') : 'Memuat...'}
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{isLoading ? (
						<div className='space-y-4'>
							<Skeleton className='h-12 w-full' />
							<Skeleton className='h-12 w-full' />
							<Skeleton className='h-12 w-full' />
						</div>
					) : (
						<>
							{/* Status Display */}
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<div className='text-sm font-medium text-muted-foreground'>Status</div>
									{todayStatus?.record ? (
										<AttendanceStatusBadge status={todayStatus.record.status} />
									) : (
										<span className='text-sm text-muted-foreground'>Belum absen</span>
									)}
								</div>

								<div className='space-y-2'>
									<div className='text-sm font-medium text-muted-foreground'>Absen Masuk</div>
									{todayStatus?.record?.clock_in ? (
										<TimeDisplay
											timestamp={todayStatus.record.clock_in}
											formatStr='HH:mm:ss'
											className='text-lg font-semibold'
										/>
									) : (
										<span className='text-sm text-muted-foreground'>-</span>
									)}
								</div>

								<div className='space-y-2'>
									<div className='text-sm font-medium text-muted-foreground'>Absen Keluar</div>
									{todayStatus?.record?.clock_out ? (
										<TimeDisplay
											timestamp={todayStatus.record.clock_out}
											formatStr='HH:mm:ss'
											className='text-lg font-semibold'
										/>
									) : (
										<span className='text-sm text-muted-foreground'>-</span>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className='flex gap-4 pt-4'>
								<Button
									onClick={handleClockIn}
									disabled={!canClockIn || isClockingIn}
									className='flex-1 cursor-pointer'
									size='lg'
								>
									<LogIn className='mr-2 h-5 w-5' />
									{isClockingIn ? 'Memproses...' : 'Absen Masuk'}
								</Button>

								<Button
									onClick={handleClockOut}
									disabled={!canClockOut || isClockingOut}
									variant='outline'
									className='flex-1 cursor-pointer'
									size='lg'
								>
									<LogOut className='mr-2 h-5 w-5' />
									{isClockingOut ? 'Memproses...' : 'Absen Keluar'}
								</Button>
							</div>

							{/* Help Text */}
							<div className='text-sm text-muted-foreground text-center pt-2'>
								{!todayStatus?.has_record && (
									<p>Klik &quot;Absen Masuk&quot; untuk memulai hari kerja Anda</p>
								)}
								{todayStatus?.has_record && !todayStatus?.is_clocked_out && (
									<p>Jangan lupa absen keluar di akhir hari kerja Anda</p>
								)}
								{todayStatus?.is_clocked_out && (
									<p>Anda telah menyelesaikan kehadiran untuk hari ini</p>
								)}
							</div>
						</>
					)}
				</CardContent>
			</Card>

			{/* Quick Stats */}
			{todayStatus?.record && todayStatus.is_clocked_in && todayStatus.is_clocked_out && (
				<Card>
					<CardHeader>
						<CardTitle>Ringkasan Hari Ini</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<div className='text-sm text-muted-foreground'>Total Waktu Kerja</div>
								<div className='text-2xl font-bold'>
									{(() => {
										const clockIn = new Date(todayStatus.record!.clock_in!);
										const clockOut = new Date(todayStatus.record!.clock_out!);
										const diff = clockOut.getTime() - clockIn.getTime();
										const hours = Math.floor(diff / (1000 * 60 * 60));
										const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
										return `${hours}j ${minutes}m`;
									})()}
								</div>
							</div>
							<div>
								<div className='text-sm text-muted-foreground'>Status</div>
								<div className='text-2xl font-bold'>
									<AttendanceStatusBadge status={todayStatus.record.status} />
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
