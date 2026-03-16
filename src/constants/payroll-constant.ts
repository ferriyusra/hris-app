export const PAYROLL_STATUS = {
	DRAFT: 'draft',
	FINALIZED: 'finalized',
	PAID: 'paid',
} as const;

export const PAYROLL_STATUS_LABELS = {
	draft: 'Draf',
	finalized: 'Final',
	paid: 'Dibayar',
} as const;

export const PAYROLL_STATUS_COLORS = {
	draft: 'bg-gray-100 text-gray-800 border-gray-200',
	finalized: 'bg-blue-100 text-blue-800 border-blue-200',
	paid: 'bg-green-100 text-green-800 border-green-200',
} as const;

export const PAYMENT_STATUS = {
	UNPAID: 'unpaid',
	PENDING: 'pending',
	PAID: 'paid',
	FAILED: 'failed',
} as const;

export const PAYMENT_STATUS_LABELS = {
	unpaid: 'Belum Dibayar',
	pending: 'Menunggu',
	paid: 'Dibayar',
	failed: 'Gagal',
} as const;

export const PAYMENT_STATUS_COLORS = {
	unpaid: 'bg-gray-100 text-gray-800 border-gray-200',
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	paid: 'bg-green-100 text-green-800 border-green-200',
	failed: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const HEADER_TABLE_SALARY_CONFIG = [
	'No',
	'Karyawan',
	'Gaji Pokok',
	'Tunjangan',
	'Potongan/Hari',
	'Lembur/Jam',
	'Tahun',
	'Aksi',
];

export const HEADER_TABLE_PAYROLL = [
	'No',
	'Periode',
	'Status',
	'Total Gaji',
	'Dibuat',
	'Aksi',
];

export const HEADER_TABLE_PAYSLIP = [
	'No',
	'Karyawan',
	'Gaji Pokok',
	'Tunjangan',
	'Potongan',
	'Lembur',
	'Gaji Bersih',
	'Status',
	'Aksi',
];

export const HEADER_TABLE_MY_PAYSLIP = [
	'No',
	'Periode',
	'Gaji Pokok',
	'Tunjangan',
	'Potongan',
	'Lembur',
	'Gaji Bersih',
	'Status',
];

export const MONTH_NAMES = [
	'Januari',
	'Februari',
	'Maret',
	'April',
	'Mei',
	'Juni',
	'Juli',
	'Agustus',
	'September',
	'Oktober',
	'November',
	'Desember',
] as const;

export const INITIAL_SALARY_CONFIG = {
	employee_id: '',
	year: '',
	base_salary: '',
	transport_allowance: '0',
	meal_allowance: '0',
	late_deduction_per_day: '0',
	absent_deduction_per_day: '0',
	half_day_deduction_per_day: '0',
	overtime_rate_per_hour: '0',
};

export const INITIAL_STATE_SALARY_CONFIG = {
	status: 'idle',
	errors: {
		employee_id: [],
		base_salary: [],
		transport_allowance: [],
		meal_allowance: [],
		late_deduction_per_day: [],
		absent_deduction_per_day: [],
		half_day_deduction_per_day: [],
		overtime_rate_per_hour: [],
		year: [],
		_form: [],
	},
};

export const INITIAL_PAYROLL = {
	month: '',
	year: '',
};

export const INITIAL_STATE_PAYROLL = {
	status: 'idle',
	errors: {
		month: [],
		year: [],
		_form: [],
	},
};
