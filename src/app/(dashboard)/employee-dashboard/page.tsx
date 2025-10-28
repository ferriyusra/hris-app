import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getEmployeeMonthlyStats, getEmployeeAttendanceTrends } from './actions';
import EmployeeStatCard from './_components/employee-stat-card';
import AttendanceCalendar from './_components/attendance-calendar';
import { getTodayAttendance } from '../employee-attendance/actions';
import AttendanceClockInOut from '../employee-attendance/_components/attendance-clock-in-out';
import { getMyLeaveBalances } from '../employee-leave/actions';
import LeaveBalanceCards from '../employee-leave/_components/leave-balance-cards';

export const metadata = {
	title: 'HRIS App | Dasbor Karyawan',
};

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
				<h1 className='text-3xl font-bold'>Dasbor</h1>
				<p className='text-muted-foreground'>
					Ikhtisar kehadiran Anda untuk {currentMonth}
				</p>
			</div>

			{/* Quick Clock In/Out */}
			<AttendanceClockInOut todayAttendance={todayAttendance} />

			{/* Monthly Statistics */}
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
					colorClass='text-green-600'
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

			{/* Leave Balance */}
			<div>
				<h2 className='text-xl font-semibold mb-4'>
					Saldo Cuti {currentYear}
				</h2>
				<LeaveBalanceCards balances={leaveBalances} />
			</div>

			{/* Attendance Calendar */}
			<AttendanceCalendar trends={trends} />
		</div>
	);
}
