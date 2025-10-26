export const LEAVE_STATUS = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
} as const;

export const LEAVE_STATUS_LABELS = {
	pending: 'Menunggu',
	approved: 'Disetujui',
	rejected: 'Ditolak',
} as const;

export const LEAVE_STATUS_COLORS = {
	pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
	approved: 'bg-green-100 text-green-800 border-green-200',
	rejected: 'bg-red-100 text-red-800 border-red-200',
} as const;

export const HEADER_TABLE_LEAVE_REQUEST = [
	'No',
	'Karyawan',
	'Jenis Cuti',
	'Tanggal Mulai',
	'Tanggal Selesai',
	'Hari',
	'Alasan',
	'Status',
	'Aksi',
];

export const HEADER_TABLE_MY_LEAVE = [
	'No',
	'Jenis Cuti',
	'Tanggal Mulai',
	'Tanggal Selesai',
	'Hari',
	'Alasan',
	'Status',
	'Aksi',
];

export const HEADER_TABLE_LEAVE_TYPES = [
	'No',
	'Nama',
	'Deskripsi',
	'Maks Hari/Tahun',
	'Perlu Persetujuan',
	'Status',
	'Aksi',
];
