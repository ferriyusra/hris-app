export const HEADER_TABLE_EMPLOYEE = [
	'No',
	'Full Name',
	'Position',
	'Phone Number',
	'Status',
	'Action',
];

export const STATUS_TABLE_EMPLOYEE = [
	{
		value: 'true',
		label: 'Active',
	},
	{
		value: 'false',
		label: 'Non Active',
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
