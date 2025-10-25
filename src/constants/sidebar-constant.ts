import {
	Album,
	CalendarCheck,
	LayoutDashboard,
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
	],
	employee: [
		{
			title: 'Attendance',
			url: '/employee-attendance',
			icon: CalendarCheck,
		},
		{
			title: 'Profile',
			url: '/employee-profile',
			icon: User,
		},
	],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
