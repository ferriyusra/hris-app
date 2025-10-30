'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/common/data-table';
import { AttendanceStatusBadge } from '@/components/common/attendance-status-badge';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { getMonthlyAttendanceSummary } from '../../actions';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import type { MonthlyAttendanceSummary } from '@/types/attendance';

export default function AttendanceReports() {
	const [selectedMonth, setSelectedMonth] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// Generate month options (last 12 months)
	const monthOptions = [
		{ value: 'all', label: 'Semua Bulan' },
		...Array.from({ length: 12 }, (_, i) => {
			const date = new Date();
			date.setDate(1); // Set to first day of month to avoid rollover issues
			date.setMonth(date.getMonth() - i);
			const value = format(date, 'yyyy-MM');
			const label = format(date, 'MMMM yyyy', { locale: id });
			return { value, label };
		}),
	];

	const {
		data: summaryData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['monthly-attendance-summary', selectedMonth],
		queryFn: async () => {
			const result = await getMonthlyAttendanceSummary(selectedMonth);
			if (result.error) {
				toast.error('Gagal mengambil ringkasan', {
					description: result.error,
				});
			}
			return result;
		},
		enabled: !!selectedMonth,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		staleTime: 0,
	});

	const summary = summaryData?.data || [];

	// Calculate overall statistics
	const overallStats = summary.reduce(
		(acc, emp) => ({
			totalEmployees: acc.totalEmployees + 1,
			totalDays: acc.totalDays + emp.total_days,
			totalPresent: acc.totalPresent + emp.present_days,
			totalLate: acc.totalLate + emp.late_days,
			totalAbsent: acc.totalAbsent + emp.absent_days,
			totalWorkHours: acc.totalWorkHours + emp.total_work_hours,
		}),
		{
			totalEmployees: 0,
			totalDays: 0,
			totalPresent: 0,
			totalLate: 0,
			totalAbsent: 0,
			totalWorkHours: 0,
		}
	);

	const avgAttendanceRate =
		summary.length > 0
			? summary.reduce((acc, emp) => acc + emp.attendance_rate, 0) / summary.length
			: 0;

	// Pagination logic
	const totalPages = Math.ceil(summary.length / limit);
	const startIndex = (currentPage - 1) * limit;
	const endIndex = startIndex + limit;
	const paginatedSummary = summary.slice(startIndex, endIndex);

	const tableData = paginatedSummary.map((emp: MonthlyAttendanceSummary, index: number) => [
		startIndex + index + 1,
		<div key={`employee-${emp.employee_id}`}>
			<div className='font-medium'>{emp.employee_name}</div>
			<div className='text-sm text-muted-foreground'>{emp.employee_position}</div>
		</div>,
		emp.total_days,
		emp.present_days,
		emp.late_days,
		emp.absent_days,
		`${emp.attendance_rate}%`,
		`${emp.total_work_hours}h`,
	]);

	// Reset to page 1 when month changes
	const handleMonthChange = (month: string) => {
		setSelectedMonth(month);
		setCurrentPage(1);
	};

	// Reset to page 1 when limit changes
	const handleLimitChange = (newLimit: number) => {
		setLimit(newLimit);
		setCurrentPage(1);
	};

	const handleExport = () => {
		// Convert data to CSV
		const headers = [
			'No',
			'Nama Karyawan',
			'Posisi',
			'Total Hari',
			'Hadir',
			'Terlambat',
			'Tidak Hadir',
			'Tingkat Kehadiran',
			'Total Jam',
		];

		const csvData = summary.map((emp: MonthlyAttendanceSummary, index: number) => [
			index + 1,
			emp.employee_name,
			emp.employee_position,
			emp.total_days,
			emp.present_days,
			emp.late_days,
			emp.absent_days,
			`${emp.attendance_rate}%`,
			`${emp.total_work_hours}h`,
		]);

		const csvContent = [
			headers.join(','),
			...csvData.map((row) => row.join(',')),
		].join('\n');

		// Download CSV
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `laporan-kehadiran-${selectedMonth}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		toast.success('Laporan berhasil diexport');
	};

	return (
		<div className='w-full space-y-6'>
			{/* Header */}
			<div className='flex justify-between items-center'>
				<div className='flex items-center gap-4'>
					<Link href='/admin/attendance'>
						<Button variant='outline' size='icon'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					</Link>
					<div>
						<h1 className='text-2xl font-bold'>Laporan Kehadiran</h1>
						<p className='text-muted-foreground'>
							Ringkasan dan analitik kehadiran bulanan
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Select value={selectedMonth} onValueChange={handleMonthChange}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Pilih bulan' />
						</SelectTrigger>
						<SelectContent>
							{monthOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant='outline' onClick={handleExport} disabled={summary.length === 0}>
						<Download className='mr-2 h-4 w-4' />
						Ekspor CSV
					</Button>
				</div>
			</div>

			{/* Overall Statistics */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				<Card>
					<CardHeader>
						<CardDescription>Total Karyawan</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalEmployees}</CardTitle>
					</CardHeader>
				</Card>
				{/* <Card>
					<CardHeader>
						<CardDescription>Rata-rata Tingkat Kehadiran</CardDescription>
						<CardTitle className='text-3xl'>{avgAttendanceRate.toFixed(1)}%</CardTitle>
					</CardHeader>
				</Card> */}
				<Card>
					<CardHeader>
						<CardDescription>Total Jam Kerja</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalWorkHours.toFixed(0)}j</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Total Ketidakhadiran</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalAbsent}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Attendance Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Rincian Kehadiran</CardTitle>
					<CardDescription>Gambaran distribusi status kehadiran</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='present' />
							<span className='text-2xl font-bold'>{overallStats.totalPresent}</span>
							<span className='text-sm text-muted-foreground'>Hari Hadir</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='late' />
							<span className='text-2xl font-bold'>{overallStats.totalLate}</span>
							<span className='text-sm text-muted-foreground'>Hari Terlambat</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='half_day' />
							<span className='text-2xl font-bold'>
								{summary.reduce((acc, emp) => acc + emp.half_days, 0)}
							</span>
							<span className='text-sm text-muted-foreground'>Hari Setengah</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='absent' />
							<span className='text-2xl font-bold'>{overallStats.totalAbsent}</span>
							<span className='text-sm text-muted-foreground'>Hari Tidak Hadir</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Employee Summary Table */}
			<Card>
				<CardHeader>
					<CardTitle>Ringkasan Karyawan</CardTitle>
					<CardDescription>
						Ringkasan kehadiran terperinci untuk {monthOptions.find((m) => m.value === selectedMonth)?.label}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable
						header={[
							'No',
							'Karyawan',
							'Total Hari',
							'Hadir',
							'Terlambat',
							'Tidak Hadir',
							'Tingkat Kehadiran',
							'Total Jam',
						]}
						data={tableData}
						isLoading={isLoading}
						totalPages={totalPages}
						currentPage={currentPage}
						currentLimit={limit}
						onChangePage={setCurrentPage}
						onChangeLimit={handleLimitChange}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
