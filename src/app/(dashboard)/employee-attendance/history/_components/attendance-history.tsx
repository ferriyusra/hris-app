'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/common/data-table';
import { AttendanceStatusBadge } from '@/components/common/attendance-status-badge';
import { TimeDisplay, DateDisplay, DurationDisplay } from '@/components/common/time-display';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { getMyAttendance, getMyAttendanceStats } from '../../actions';
import { DATE_FILTER_PRESETS, getStatusLabel } from '@/constants/attendance-constant';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, subWeeks, subDays, format } from 'date-fns';
import type { AttendanceRecord, AttendanceStats } from '@/types/attendance';
import { Skeleton } from '@/components/ui/skeleton';

export default function AttendanceHistory() {
	const [dateFilter, setDateFilter] = useState('this_month');
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
		from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
		to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
	});

	// Calculate date range based on filter
	useEffect(() => {
		const now = new Date();
		let from: Date;
		let to: Date = now;

		switch (dateFilter) {
			case 'today':
				from = now;
				to = now;
				break;
			case 'yesterday':
				from = subDays(now, 1);
				to = subDays(now, 1);
				break;
			case 'this_week':
				from = startOfWeek(now, { weekStartsOn: 1 });
				to = endOfWeek(now, { weekStartsOn: 1 });
				break;
			case 'last_week':
				from = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
				to = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
				break;
			case 'this_month':
				from = startOfMonth(now);
				to = endOfMonth(now);
				break;
			case 'last_month':
				from = startOfMonth(subMonths(now, 1));
				to = endOfMonth(subMonths(now, 1));
				break;
			default:
				from = startOfMonth(now);
				to = endOfMonth(now);
		}

		setDateRange({
			from: format(from, 'yyyy-MM-dd'),
			to: format(to, 'yyyy-MM-dd'),
		});
	}, [dateFilter]);

	// Fetch attendance records
	const {
		data: attendanceData,
		isLoading: isLoadingRecords,
		refetch,
	} = useQuery({
		queryKey: ['my-attendance', dateRange],
		queryFn: async () => {
			const result = await getMyAttendance({
				dateFrom: dateRange.from,
				dateTo: dateRange.to,
			});
			return result;
		},
	});

	// Fetch statistics
	const { data: statsData, isLoading: isLoadingStats } = useQuery({
		queryKey: ['my-attendance-stats', dateRange],
		queryFn: async () => {
			const result = await getMyAttendanceStats({
				dateFrom: dateRange.from,
				dateTo: dateRange.to,
			});
			return result;
		},
	});

	const records = attendanceData?.data || [];
	const stats = statsData?.data;

	// Transform data for table
	const tableData = useMemo(() => {
		return records.map((record: AttendanceRecord, index: number) => [
			index + 1,
			<DateDisplay key={`date-${record.id}`} date={record.date} formatStr='dd MMM yyyy' />,
			<TimeDisplay key={`clock-in-${record.id}`} timestamp={record.clock_in} formatStr='HH:mm:ss' />,
			<TimeDisplay key={`clock-out-${record.id}`} timestamp={record.clock_out} formatStr='HH:mm:ss' />,
			<DurationDisplay
				key={`duration-${record.id}`}
				startTime={record.clock_in}
				endTime={record.clock_out}
			/>,
			<AttendanceStatusBadge key={`status-${record.id}`} status={record.status} />,
		]);
	}, [records]);

	const handleExport = () => {
		// Convert data to CSV
		const headers = ['No', 'Tanggal', 'Masuk', 'Keluar', 'Durasi', 'Status'];
		const csvData = records.map((record: AttendanceRecord, index: number) => {
			const clockIn = record.clock_in ? format(new Date(record.clock_in), 'HH:mm:ss') : '-';
			const clockOut = record.clock_out ? format(new Date(record.clock_out), 'HH:mm:ss') : '-';
			let duration = '-';
			if (record.clock_in && record.clock_out) {
				const diff = new Date(record.clock_out).getTime() - new Date(record.clock_in).getTime();
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				duration = `${hours}h ${minutes}m`;
			}
			return [
				index + 1,
				format(new Date(record.date), 'dd MMM yyyy'),
				clockIn,
				clockOut,
				duration,
				getStatusLabel(record.status),
			];
		});

		const csvContent = [
			headers.join(','),
			...csvData.map((row) => row.join(',')),
		].join('\n');

		// Download CSV
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `attendance-history-${dateRange.from}-${dateRange.to}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	return (
		<div className='w-full space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-4'>
					<Link href='/employee-attendance'>
						<Button variant='outline' size='icon'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<h1 className='text-2xl font-bold tracking-tight'>Riwayat Kehadiran</h1>
				</div>
				<div className='flex gap-2'>
					<Select value={dateFilter} onValueChange={setDateFilter}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Pilih periode' />
						</SelectTrigger>
						<SelectContent>
							{DATE_FILTER_PRESETS.filter((p) => p.value !== 'custom').map((preset) => (
								<SelectItem key={preset.value} value={preset.value}>
									{preset.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant='outline' onClick={handleExport} disabled={records.length === 0}>
						<Download className='mr-2 h-4 w-4' />
						Ekspor CSV
					</Button>
				</div>
			</div>

			{/* Statistics Cards */}
			{isLoadingStats ? (
				<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className='h-4 w-24' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-8 w-16' />
							</CardContent>
						</Card>
					))}
				</div>
			) : stats ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
					<Card>
						<CardHeader>
							<CardDescription>Total Hari</CardDescription>
							<CardTitle className='text-3xl'>{stats.total_days}</CardTitle>
						</CardHeader>
					</Card>
					{/* <Card>
						<CardHeader>
							<CardDescription>Tingkat Kehadiran</CardDescription>
							<CardTitle className='text-3xl'>{stats.attendance_rate}%</CardTitle>
						</CardHeader>
					</Card> */}
					<Card>
						<CardHeader>
							<CardDescription>Total Jam Kerja</CardDescription>
							<CardTitle className='text-3xl'>{stats.total_work_hours}j</CardTitle>
						</CardHeader>
					</Card>
					{/* <Card>
						<CardHeader>
							<CardDescription>Rata-rata Jam/Hari</CardDescription>
							<CardTitle className='text-3xl'>{stats.average_work_hours}j</CardTitle>
						</CardHeader>
					</Card> */}
				</div>
			) : null}

			{/* Detailed Breakdown */}
			{stats && (
				<Card>
					<CardHeader>
						<CardTitle>Rincian Kehadiran</CardTitle>
					</CardHeader>
					<CardContent>
						<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
							<div className='flex items-center gap-2'>
								<AttendanceStatusBadge status='present' />
								<span className='font-semibold'>{stats.present_days}</span>
							</div>
							<div className='flex items-center gap-2'>
								<AttendanceStatusBadge status='late' />
								<span className='font-semibold'>{stats.late_days}</span>
							</div>
							<div className='flex items-center gap-2'>
								<AttendanceStatusBadge status='half_day' />
								<span className='font-semibold'>{stats.half_days}</span>
							</div>
							<div className='flex items-center gap-2'>
								<AttendanceStatusBadge status='absent' />
								<span className='font-semibold'>{stats.absent_days}</span>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Attendance Records Table */}
			<Card>
				<CardHeader>
					<CardTitle>Catatan Kehadiran</CardTitle>
					<CardDescription>
						Menampilkan catatan dari {format(new Date(dateRange.from), 'dd MMM yyyy')} hingga{' '}
						{format(new Date(dateRange.to), 'dd MMM yyyy')}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable
						header={['No', 'Tanggal', 'Masuk', 'Keluar', 'Durasi', 'Status']}
						data={tableData}
						isLoading={isLoadingRecords}
						totalPages={1}
						currentPage={1}
						currentLimit={records.length || 10}
						onChangePage={() => {}}
						onChangeLimit={() => {}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
