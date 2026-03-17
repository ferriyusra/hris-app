// Attendance Table Headers
export const HEADER_TABLE_ATTENDANCE = [
	'No',
	'Nama Karyawan',
	'Tanggal',
	'Jam Masuk',
	'Jam Keluar',
	'Durasi',
	'Status',
	'Aksi',
];

// Attendance Status List
export const ATTENDANCE_STATUS_LIST = [
	{
		value: 'present',
		label: 'Hadir',
		color: 'bg-teal-500',
		textColor: 'text-teal-700 dark:text-teal-400',
		bgColor: 'bg-teal-100 dark:bg-teal-950/30',
	},
	{
		value: 'late',
		label: 'Terlambat',
		color: 'bg-amber-500',
		textColor: 'text-amber-700 dark:text-amber-400',
		bgColor: 'bg-amber-100 dark:bg-amber-950/30',
	},
	{
		value: 'half_day',
		label: 'Setengah Hari',
		color: 'bg-indigo-500',
		textColor: 'text-indigo-700 dark:text-indigo-400',
		bgColor: 'bg-indigo-100 dark:bg-indigo-950/30',
	},
	{
		value: 'absent',
		label: 'Tidak Hadir',
		color: 'bg-red-500',
		textColor: 'text-red-700 dark:text-red-400',
		bgColor: 'bg-red-100 dark:bg-red-950/30',
	},
];

// Work Time Configuration
export const WORK_START_TIME = '09:00'; // 9:00 AM
export const WORK_END_TIME = '17:00'; // 5:00 PM
export const LATE_THRESHOLD_MINUTES = 15; // Consider late after 15 minutes
export const HALF_DAY_HOURS = 4; // Half day if worked less than 4 hours

// Date Filter Presets
export const DATE_FILTER_PRESETS = [
	{
		value: 'today',
		label: 'Hari Ini',
	},
	{
		value: 'yesterday',
		label: 'Kemarin',
	},
	{
		value: 'this_week',
		label: 'Minggu Ini',
	},
	{
		value: 'last_week',
		label: 'Minggu Lalu',
	},
	{
		value: 'this_month',
		label: 'Bulan Ini',
	},
	{
		value: 'last_month',
		label: 'Bulan Lalu',
	},
	{
		value: 'custom',
		label: 'Rentang Kustom',
	},
];

// Initial Attendance Form State
export const INITIAL_ATTENDANCE = {
	employee_id: '',
	date: '',
	clock_in: '',
	clock_out: '',
	status: '',
	notes: '',
};

// Initial Attendance Form State
export const INITIAL_STATE_ATTENDANCE = {
	status: 'idle' as const,
	errors: {
		id: [] as string[],
		employee_id: [] as string[],
		date: [] as string[],
		clock_in: [] as string[],
		clock_out: [] as string[],
		status: [] as string[],
		notes: [] as string[],
		_form: [] as string[],
	},
};

// Helper function to convert status to Indonesian
export const getStatusLabel = (status: string): string => {
	const statusConfig = ATTENDANCE_STATUS_LIST.find((s) => s.value === status);
	return statusConfig?.label || status;
};
