export const LEAVE_STATUS = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
} as const;

export const LEAVE_STATUS_LABELS = {
	pending: 'Pending',
	approved: 'Approved',
	rejected: 'Rejected',
} as const;

export const LEAVE_STATUS_COLORS = {
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	approved: 'bg-green-100 text-green-800 border-green-200',
	rejected: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const HEADER_TABLE_LEAVE_REQUEST = [
	'No',
	'Employee',
	'Leave Type',
	'Start Date',
	'End Date',
	'Days',
	'Reason',
	'Status',
	'Action',
];

export const HEADER_TABLE_MY_LEAVE = [
	'No',
	'Leave Type',
	'Start Date',
	'End Date',
	'Days',
	'Reason',
	'Status',
	'Action',
];

export const HEADER_TABLE_LEAVE_TYPES = [
	'No',
	'Name',
	'Description',
	'Max Days/Year',
	'Requires Approval',
	'Status',
	'Action',
];
