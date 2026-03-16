import {
	Album,
	Banknote,
	CalendarCheck,
	CalendarDays,
	Clock,
	ClipboardList,
	CreditCard,
	LayoutDashboard,
	Receipt,
	Settings,
	SquareMenu,
	User,
	Users,
	Wallet,
} from 'lucide-react';

export const SIDEBAR_MENU_LIST = {
	admin: [
		{
			title: 'Dasbor',
			url: '/admin',
			icon: LayoutDashboard,
		},
		{
			title: 'Pengguna',
			url: '/admin/user',
			icon: Users,
		},
		{
			title: 'Karyawan',
			url: '/admin/employee',
			icon: SquareMenu,
		},
		{
			title: 'Kehadiran',
			url: '/admin/attendance',
			icon: CalendarCheck,
		},
		{
			title: 'Cuti',
			url: '/admin/leave',
			icon: CalendarDays,
		},
		{
			title: 'Jenis Cuti',
			url: '/admin/leave-types',
			icon: Settings,
		},
		{
			title: 'Saldo Cuti',
			url: '/admin/leave-balance',
			icon: ClipboardList,
		},
		{
			title: 'Waktu Kerja',
			url: '/admin/work-time',
			icon: Clock,
		},
		{
			title: 'Konfigurasi Gaji',
			url: '/admin/salary-config',
			icon: Wallet,
		},
		{
			title: 'Penggajian',
			url: '/admin/payroll',
			icon: Banknote,
		},
	],
	employee: [
		{
			title: 'Dasbor',
			url: '/employee-dashboard',
			icon: LayoutDashboard,
		},
		{
			title: 'Kehadiran',
			url: '/employee-attendance',
			icon: CalendarCheck,
		},
		{
			title: 'Cuti',
			url: '/employee-leave',
			icon: CalendarDays,
		},
		{
			title: 'Slip Gaji',
			url: '/employee-payslip',
			icon: Receipt,
		},
		{
			title: 'Profil',
			url: '/employee-profile',
			icon: User,
		},
	],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
