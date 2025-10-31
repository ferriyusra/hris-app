import { Suspense } from 'react';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getEmployeeMonthlyStats, getEmployeeAttendanceTrends } from './actions';
import EmployeeStatCard from './_components/employee-stat-card';
import AttendanceCalendar from './_components/attendance-calendar';
import { getTodayAttendance } from '../employee-attendance/actions';
import AttendanceClockInOut from '../employee-attendance/_components/attendance-clock-in-out';
import { getMyLeaveBalances } from '../employee-leave/actions';
import LeaveBalanceCards from '../employee-leave/_components/leave-balance-cards';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
	title: 'HRIS App | Dasbor Karyawan',
};

// Separate components for Suspense boundaries
async function ClockInOutSection() {
	const todayAttendance = await getTodayAttendance();
	return <AttendanceClockInOut todayAttendance={todayAttendance} />;
}

async function MonthlyStatsSection() {
	const statsResult = await getEmployeeMonthlyStats();
	const stats = statsResult.data || {
		totalDays: 0,
		presentDays: 0,
		lateDays: 0,
		absentDays: 0,
		attendanceRate: 0,
		punctualityRate: 0,
	};

	return (
		<div className='grid gap-4 md:grid-cols-4'>
			<EmployeeStatCard
				title='Hari Kerja'
				value={stats.totalDays}
				icon={Calendar}
				description='Total hari kerja bulan ini'
				colorClass='text-blue-600'
				suffix='hari'
			/>
			<EmployeeStatCard
				title='Hari Hadir'
				value={stats.presentDays}
				icon={CheckCircle2}
				description='Hari Anda datang tepat waktu'
				colorClass='text-blue-600'
				suffix='hari'
			/>
			<EmployeeStatCard
				title='Hari Terlambat'
				value={stats.lateDays}
				icon={Clock}
				description='Hari Anda datang terlambat'
				colorClass='text-orange-600'
				suffix='hari'
			/>
			<EmployeeStatCard
				title='Hari Tidak Hadir'
				value={stats.absentDays}
				icon={XCircle}
				description='Hari Anda tidak hadir'
				colorClass='text-red-600'
				suffix='hari'
			/>
		</div>
	);
}

async function LeaveBalanceSection() {
	const leaveBalancesResult = await getMyLeaveBalances();
	const leaveBalances = leaveBalancesResult.data || [];
	const currentYear = new Date().getFullYear();

	return (
		<div>
			<h2 className='text-xl font-semibold mb-4'>Saldo Cuti {currentYear}</h2>
			<LeaveBalanceCards balances={leaveBalances} />
		</div>
	);
}

async function AttendanceCalendarSection() {
	const trendsResult = await getEmployeeAttendanceTrends();
	const trends = trendsResult.data || [];

	return <AttendanceCalendar trends={trends} />;
}

// Loading fallbacks
function ClockInOutSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-6 w-40' />
			</CardHeader>
			<CardContent className='space-y-4'>
				<Skeleton className='h-20 w-full' />
				<Skeleton className='h-10 w-full' />
			</CardContent>
		</Card>
	);
}

function StatsCardsSkeleton() {
	return (
		<div className='grid gap-4 md:grid-cols-4'>
			{[1, 2, 3, 4].map((i) => (
				<Card key={i}>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-5 w-5 rounded-full' />
					</CardHeader>
					<CardContent>
						<Skeleton className='h-9 w-20 mb-2' />
						<Skeleton className='h-3 w-32' />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function LeaveBalanceSkeleton() {
	return (
		<div>
			<Skeleton className='h-7 w-40 mb-4' />
			<div className='grid gap-4 md:grid-cols-3'>
				{[1, 2, 3].map((i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-5 w-5 rounded-full' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-9 w-20 mb-2' />
							<Skeleton className='h-3 w-32' />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function AttendanceCalendarSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-6 w-64' />
			</CardHeader>
			<CardContent>
				<div className='space-y-2'>
					{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
						<Skeleton key={i} className='h-16 w-full' />
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export default function EmployeeDashboard() {
	// Get current month name
	const currentMonth = new Date().toLocaleDateString('id-ID', {
		month: 'long',
		year: 'numeric',
	});

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Dasbor</h1>
				<p className='text-muted-foreground'>
					Ikhtisar kehadiran Anda untuk {currentMonth}
				</p>
			</div>

			{/* Quick Clock In/Out - Load first for immediate interaction */}
			<Suspense fallback={<ClockInOutSkeleton />}>
				<ClockInOutSection />
			</Suspense>

			{/* Monthly Statistics - Fast query, show quickly */}
			<Suspense fallback={<StatsCardsSkeleton />}>
				<MonthlyStatsSection />
			</Suspense>

			{/* Leave Balance - Independent section */}
			<Suspense fallback={<LeaveBalanceSkeleton />}>
				<LeaveBalanceSection />
			</Suspense>

			{/* Attendance Calendar - Heaviest query, loads last */}
			<Suspense fallback={<AttendanceCalendarSkeleton />}>
				<AttendanceCalendarSection />
			</Suspense>
		</div>
	);
}
