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
				<h1 className='text-3xl font-bold'>Dasbor</h1>
				<p className='text-muted-foreground'>Selamat datang di dasbor HRIS Anda</p>
			</div>

			{/* Employee Statistics */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<StatCard
					title='Total Karyawan'
					value={stats.totalEmployees}
					icon={Users}
					description='Semua karyawan terdaftar'
					colorClass='text-blue-600'
				/>
				<StatCard
					title='Karyawan Aktif'
					value={stats.activeEmployees}
					icon={UserCheck}
					description='Karyawan yang saat ini aktif'
					colorClass='text-green-600'
				/>
				<StatCard
					title='Karyawan Tidak Aktif'
					value={stats.inactiveEmployees}
					icon={UserX}
					description='Karyawan yang saat ini tidak aktif'
					colorClass='text-gray-600'
				/>
			</div>

			{/* Today's Attendance */}
			<div className='grid gap-4 md:grid-cols-3'>
				<StatCard
					title='Hadir Hari Ini'
					value={stats.todayPresent}
					icon={CalendarCheck}
					description='Karyawan yang sudah absen masuk'
					colorClass='text-green-600'
				/>
				<StatCard
					title='Terlambat Hari Ini'
					value={stats.todayLate}
					icon={Clock}
					description='Karyawan yang datang terlambat'
					colorClass='text-orange-600'
				/>
				<StatCard
					title='Tidak Hadir Hari Ini'
					value={stats.todayAbsent}
					icon={UserX}
					description='Karyawan yang tidak hadir'
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
