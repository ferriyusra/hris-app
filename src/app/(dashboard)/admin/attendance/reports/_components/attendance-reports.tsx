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
import { toast } from 'sonner';
import type { MonthlyAttendanceSummary } from '@/types/attendance';

export default function AttendanceReports() {
	const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

	// Generate month options (last 12 months)
	const monthOptions = Array.from({ length: 12 }, (_, i) => {
		const date = new Date();
		date.setMonth(date.getMonth() - i);
		const value = format(date, 'yyyy-MM');
		const label = format(date, 'MMMM yyyy');
		return { value, label };
	});

	const {
		data: summaryData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['monthly-attendance-summary', selectedMonth],
		queryFn: async () => {
			const result = await getMonthlyAttendanceSummary(selectedMonth);
			if (result.error) {
				toast.error('Failed to fetch summary', {
					description: result.error,
				});
			}
			return result;
		},
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

	const tableData = summary.map((emp: MonthlyAttendanceSummary, index: number) => [
		index + 1,
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

	const handleExport = () => {
		// Convert data to CSV
		const headers = [
			'No',
			'Employee Name',
			'Position',
			'Total Days',
			'Present',
			'Late',
			'Absent',
			'Attendance Rate',
			'Total Hours',
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
		a.download = `attendance-report-${selectedMonth}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		toast.success('Report exported successfully');
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
						<h1 className='text-2xl font-bold'>Attendance Reports</h1>
						<p className='text-muted-foreground'>
							Monthly attendance summary and analytics
						</p>
					</div>
				</div>
				<div className='flex gap-2'>
					<Select value={selectedMonth} onValueChange={setSelectedMonth}>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select month' />
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
						Export CSV
					</Button>
				</div>
			</div>

			{/* Overall Statistics */}
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
				<Card>
					<CardHeader>
						<CardDescription>Total Employees</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalEmployees}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Avg Attendance Rate</CardDescription>
						<CardTitle className='text-3xl'>{avgAttendanceRate.toFixed(1)}%</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Total Work Hours</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalWorkHours.toFixed(0)}h</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Total Absences</CardDescription>
						<CardTitle className='text-3xl'>{overallStats.totalAbsent}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Attendance Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Attendance Breakdown</CardTitle>
					<CardDescription>Overview of attendance status distribution</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='present' />
							<span className='text-2xl font-bold'>{overallStats.totalPresent}</span>
							<span className='text-sm text-muted-foreground'>Present Days</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='late' />
							<span className='text-2xl font-bold'>{overallStats.totalLate}</span>
							<span className='text-sm text-muted-foreground'>Late Days</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='half_day' />
							<span className='text-2xl font-bold'>
								{summary.reduce((acc, emp) => acc + emp.half_days, 0)}
							</span>
							<span className='text-sm text-muted-foreground'>Half Days</span>
						</div>
						<div className='flex flex-col items-center gap-2 p-4 border rounded-lg'>
							<AttendanceStatusBadge status='absent' />
							<span className='text-2xl font-bold'>{overallStats.totalAbsent}</span>
							<span className='text-sm text-muted-foreground'>Absent Days</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Employee Summary Table */}
			<Card>
				<CardHeader>
					<CardTitle>Employee Summary</CardTitle>
					<CardDescription>
						Detailed attendance summary for {monthOptions.find((m) => m.value === selectedMonth)?.label}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<DataTable
						header={[
							'No',
							'Employee',
							'Total Days',
							'Present',
							'Late',
							'Absent',
							'Attendance Rate',
							'Total Hours',
						]}
						data={tableData}
						isLoading={isLoading}
						totalPages={1}
						currentPage={1}
						currentLimit={summary.length || 10}
						onChangePage={() => {}}
						onChangeLimit={() => {}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
