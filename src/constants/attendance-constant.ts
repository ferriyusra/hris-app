export const HEADER_TABLE_ATTENDANCE = [
	'No',
	'Nama',
	'Check In',
	'Check Out',
	'Status',
	'Action',
];

export const CATEGORY_LIST = [
	{
		value: 'beverages',
		label: 'Beverages',
	},
	{
		value: 'mains',
		label: 'Mains',
	},
	{
		value: 'desserts',
		label: 'Desserts',
	},
];

export const INITIAL_MENU = {
	name: '',
	description: '',
	price: '',
	discount: '',
	category: '',
	image_url: '',
	is_available: '',
};

export const INITIAL_STATE_MENU = {
	status: 'idle',
	errors: {
		id: [],
		name: [],
		description: [],
		price: [],
		discount: [],
		category: [],
		image_url: [],
		is_available: [],
		_form: [],
	},
};
