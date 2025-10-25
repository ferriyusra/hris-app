import { CalendarCheck, Clock, UserCheck, UserX, Users } from 'lucide-react';
import { getDashboardStats, getTodayLateEmployees, getAttendanceTrends } from './actions';
import StatCard from './_components/stat-card';
import LateEmployeesList from './_components/late-employees-list';
import AttendanceTrendsChart from './_components/attendance-trends-chart';

export default async function AdminDashboard() {
	// Fetch all data in parallel
	const [statsResult, lateEmployeesResult, trendsResult] = await Promise.all([
		getDashboardStats(),
		getTodayLateEmployees(),
		getAttendanceTrends(),
	]);

	const stats = statsResult.data || {
		totalEmployees: 0,
		activeEmployees: 0,
		inactiveEmployees: 0,
		todayPresent: 0,
		todayLate: 0,
		todayAbsent: 0,
	};

	const lateEmployees = lateEmployeesResult.data || [];
	const trends = trendsResult.data || [];

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Dashboard</h1>
				<p className='text-muted-foreground'>Welcome to your HRIS dashboard</p>
			</div>

			{/* Employee Statistics */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<StatCard
					title='Total Employees'
					value={stats.totalEmployees}
					icon={Users}
					description='All registered employees'
					colorClass='text-blue-600'
				/>
				<StatCard
					title='Active Employees'
					value={stats.activeEmployees}
					icon={UserCheck}
					description='Currently active employees'
					colorClass='text-green-600'
				/>
				<StatCard
					title='Inactive Employees'
					value={stats.inactiveEmployees}
					icon={UserX}
					description='Currently inactive employees'
					colorClass='text-gray-600'
				/>
			</div>

			{/* Today's Attendance */}
			<div className='grid gap-4 md:grid-cols-3'>
				<StatCard
					title='Present Today'
					value={stats.todayPresent}
					icon={CalendarCheck}
					description='Employees who clocked in'
					colorClass='text-green-600'
				/>
				<StatCard
					title='Late Today'
					value={stats.todayLate}
					icon={Clock}
					description='Employees who came late'
					colorClass='text-orange-600'
				/>
				<StatCard
					title='Absent Today'
					value={stats.todayAbsent}
					icon={UserX}
					description='Employees not present'
					colorClass='text-red-600'
				/>
			</div>

			{/* Attendance Trends Chart */}
			<AttendanceTrendsChart data={trends} />

			{/* Late Employees List */}
			<LateEmployeesList employees={lateEmployees} />
		</div>
	);
}
