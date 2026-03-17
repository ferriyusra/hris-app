import AppSidebar from '@/components/common/app-sidebar';
import { DarkModeToggle } from '@/components/common/darkmode-toggle';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import DashboardBreadcrumb from './_components/dashboard-breadcrumb';

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className='overflow-x-hidden'>
				<header className='sticky top-0 z-20 flex justify-between h-16 shrink-0 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sideabar-wrapper:h-12'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='cursor-pointer' />
						<Separator
							orientation='vertical'
							className='mr-2 data-[orientation=vertical]:h-4'
						/>
						<DashboardBreadcrumb />
					</div>
					<div className='px-4'>
						<DarkModeToggle />
					</div>
				</header>
				<main className='flex flex-1 flex-col items-start gap-4 p-4 pt-4 animate-fade-in-up'>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
