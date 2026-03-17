import { CalendarCheck, Clock, UserCheck, UserX, Users } from 'lucide-react';
import { getDashboardStats, getTodayLateEmployees, getAttendanceTrends } from './actions';
import StatCard from './_components/stat-card';
import LateEmployeesList from './_components/late-employees-list';
import AttendanceTrendsChart from './_components/attendance-trends-chart';

export const dynamic = 'force-dynamic';

export const metadata = {
	title: 'HRIS App | Dasbor Admin',
};

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
		<div className='space-y-6 w-full'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight'>Dasbor</h1>
				<p className='text-muted-foreground'>Selamat datang di dasbor HRIS Anda</p>
			</div>

			{/* Employee Statistics */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<div className='animate-fade-in-up stagger-1'>
					<StatCard
						title='Total Karyawan'
						value={stats.totalEmployees}
						icon={Users}
						description='Semua karyawan terdaftar'
						colorClass='text-primary'
					/>
				</div>
				<div className='animate-fade-in-up stagger-2'>
					<StatCard
						title='Karyawan Aktif'
						value={stats.activeEmployees}
						icon={UserCheck}
						description='Karyawan yang saat ini aktif'
						colorClass='text-teal-600'
					/>
				</div>
				<div className='animate-fade-in-up stagger-3'>
					<StatCard
						title='Karyawan Tidak Aktif'
						value={stats.inactiveEmployees}
						icon={UserX}
						description='Karyawan yang saat ini tidak aktif'
						colorClass='text-muted-foreground'
					/>
				</div>
			</div>

			{/* Today's Attendance */}
			<div>
				<h2 className='text-lg font-semibold tracking-tight mb-3 pl-3 border-l-2 border-primary'>Kehadiran Hari Ini</h2>
				<div className='grid gap-4 md:grid-cols-3'>
					<div className='animate-fade-in-up stagger-1'>
						<StatCard
							title='Hadir Hari Ini'
							value={stats.todayPresent}
							icon={CalendarCheck}
							description='Karyawan yang sudah absen masuk'
							colorClass='text-teal-600'
						/>
					</div>
					<div className='animate-fade-in-up stagger-2'>
						<StatCard
							title='Terlambat Hari Ini'
							value={stats.todayLate}
							icon={Clock}
							description='Karyawan yang datang terlambat'
							colorClass='text-amber-600'
						/>
					</div>
					<div className='animate-fade-in-up stagger-3'>
						<StatCard
							title='Tidak Hadir Hari Ini'
							value={stats.todayAbsent}
							icon={UserX}
							description='Karyawan yang tidak hadir'
							colorClass='text-red-600'
						/>
					</div>
				</div>
			</div>

			{/* Attendance Trends Chart */}
			<AttendanceTrendsChart data={trends} />

			{/* Late Employees List */}
			<LateEmployeesList employees={lateEmployees} />
		</div>
	);
}
