import {
	Album,
	Armchair,
	LayoutDashboard,
	SquareMenu,
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
			icon: Album,
		},
	],
	employee: [
		{
			title: 'Attendance',
			url: '/attendance',
			icon: Album,
		},
	],
};

export type SidebarMenuKey = keyof typeof SIDEBAR_MENU_LIST;
