import {
	Album,
	CalendarCheck,
	CalendarDays,
	ClipboardList,
	LayoutDashboard,
	Settings,
	SquareMenu,
	User,
	Users,
} from 'lucide-react';

export const SIDEBAR_MENU_LIST = {
	admin: [
		{
			title: 'Dashboard',
			url: '/admin',
			icon: LayoutDashboard,
		},
		{
			title: 'User',
			url: '/admin/user',
			icon: Users,
		},
		{
			title: 'Employee',
			url: '/admin/employee',
			icon: SquareMenu,
		},
		{
			title: 'Attendance',
			url: '/admin/attendance',
			icon: CalendarCheck,
		},
		{
			title: 'Leave',
			url: '/admin/leave',
			icon: CalendarDays,
		},
		{
			title: 'Leave Types',
			url: '/admin/leave-types',
			icon: Settings,
		},
		{
			title: 'Leave Balance',
			url: '/admin/leave-balance',
			icon: ClipboardList,
		},
	],
	employee: [
		{
			title: 'Dashboard',
			url: '/employee-dashboard',
			icon: LayoutDashboard,
		},
		{
			title: 'Attendance',
			url: '/employee-attendance',
			icon: CalendarCheck,
		},
		{
			title: 'Leave',
			url: '/employee-leave',
			icon: CalendarDays,
		},
		{
			title: 'Profile',
			url: '/employee-profile',
			icon: User,
		},
	],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
