import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getEmployeeMonthlyStats, getEmployeeAttendanceTrends } from './actions';
import EmployeeStatCard from './_components/employee-stat-card';
import AttendanceCalendar from './_components/attendance-calendar';
import { getTodayAttendance } from '../employee-attendance/actions';
import AttendanceClockInOut from '../employee-attendance/_components/attendance-clock-in-out';
import { getMyLeaveBalances } from '../employee-leave/actions';
import LeaveBalanceCards from '../employee-leave/_components/leave-balance-cards';

export default async function EmployeeDashboard() {
	// Fetch all data in parallel
	const [statsResult, trendsResult, todayAttendanceResult, leaveBalancesResult] = await Promise.all([
		getEmployeeMonthlyStats(),
		getEmployeeAttendanceTrends(),
		getTodayAttendance(),
		getMyLeaveBalances(),
	]);

	const stats = statsResult.data || {
		totalDays: 0,
		presentDays: 0,
		lateDays: 0,
		absentDays: 0,
		attendanceRate: 0,
		punctualityRate: 0,
	};

	const trends = trendsResult.data || [];
	const todayAttendance = todayAttendanceResult.data;
	const leaveBalances = leaveBalancesResult.data || [];

	// Get current month name
	const currentMonth = new Date().toLocaleDateString('id-ID', {
		month: 'long',
		year: 'numeric',
	});
	const currentYear = new Date().getFullYear();

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>My Dashboard</h1>
				<p className='text-muted-foreground'>
					Your attendance overview for {currentMonth}
				</p>
			</div>

			{/* Quick Clock In/Out */}
			<AttendanceClockInOut todayAttendance={todayAttendance} />

			{/* Monthly Statistics */}
			<div className='grid gap-4 md:grid-cols-4'>
				<EmployeeStatCard
					title='Working Days'
					value={stats.totalDays}
					icon={Calendar}
					description='Total working days this month'
					colorClass='text-blue-600'
					suffix='days'
				/>
				<EmployeeStatCard
					title='Present Days'
					value={stats.presentDays}
					icon={CheckCircle2}
					description='Days you came on time'
					colorClass='text-green-600'
					suffix='days'
				/>
				<EmployeeStatCard
					title='Late Days'
					value={stats.lateDays}
					icon={Clock}
					description='Days you came late'
					colorClass='text-orange-600'
					suffix='days'
				/>
				<EmployeeStatCard
					title='Absent Days'
					value={stats.absentDays}
					icon={XCircle}
					description='Days you were absent'
					colorClass='text-red-600'
					suffix='days'
				/>
			</div>

			{/* Leave Balance */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>
					Leave Balance {currentYear}
				</h2>
				<LeaveBalanceCards balances={leaveBalances} />
			</div>

			{/* Attendance Calendar */}
			<AttendanceCalendar trends={trends} />
		</div>
	);
}
