export const HEADER_TABLE_EMPLOYEE = [
	'No',
	'ID Karyawan',
	'Nama Lengkap',
	'Posisi',
	'Nomor Telepon',
	'Status',
	'Aksi',
];

export const STATUS_TABLE_EMPLOYEE = [
	{
		value: 'true',
		label: 'Aktif',
	},
	{
		value: 'false',
		label: 'Tidak Aktif',
	},
];

export const INITIAL_EMPLOYEE = {
	// user_id: '',
	full_name: '',
	position: '',
	phone_number:'',
	is_active: '',
};

export const INITIAL_STATE_EMPLOYEE = {
	status: 'idle',
	errors: {
		id: [],
		// user_id: [],
		full_name: [],
		position: [],
		phone_number:[],
		is_active: [],
		_form: [],
	},
};
