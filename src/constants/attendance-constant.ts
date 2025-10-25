// Attendance Table Headers
export const HEADER_TABLE_ATTENDANCE = [
	'No',
	'Employee Name',
	'Date',
	'Clock In',
	'Clock Out',
	'Duration',
	'Status',
	'Action',
];

// Attendance Status List
export const ATTENDANCE_STATUS_LIST = [
	{
		value: 'present',
		label: 'Present',
		color: 'bg-green-500',
		textColor: 'text-green-700',
		bgColor: 'bg-green-100',
	},
	{
		value: 'late',
		label: 'Late',
		color: 'bg-yellow-500',
		textColor: 'text-yellow-700',
		bgColor: 'bg-yellow-100',
	},
	{
		value: 'half_day',
		label: 'Half Day',
		color: 'bg-blue-500',
		textColor: 'text-blue-700',
		bgColor: 'bg-blue-100',
	},
	{
		value: 'absent',
		label: 'Absent',
		color: 'bg-red-500',
		textColor: 'text-red-700',
		bgColor: 'bg-red-100',
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
		label: 'Today',
	},
	{
		value: 'yesterday',
		label: 'Yesterday',
	},
	{
		value: 'this_week',
		label: 'This Week',
	},
	{
		value: 'last_week',
		label: 'Last Week',
	},
	{
		value: 'this_month',
		label: 'This Month',
	},
	{
		value: 'last_month',
		label: 'Last Month',
	},
	{
		value: 'custom',
		label: 'Custom Range',
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
