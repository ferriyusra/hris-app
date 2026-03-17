'use client';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { Fragment } from 'react';

// Mapping untuk menerjemahkan path URL ke bahasa Indonesia
const PATH_TRANSLATIONS: Record<string, string> = {
	// Admin routes
	admin: 'Admin',
	employee: 'Karyawan',
	user: 'Pengguna',
	attendance: 'Kehadiran',
	reports: 'Laporan',
	leave: 'Cuti',
	'leave-types': 'Jenis Cuti',
	'leave-balance': 'Saldo Cuti',
	'work-time': 'Waktu Kerja',
	'salary-config': 'Pengaturan Gaji',
	payroll: 'Penggajian',

	// Employee routes
	'employee-dashboard': 'Dasbor',
	'employee-attendance': 'Absensi',
	'employee-leave': 'Cuti Saya',
	'employee-profile': 'Profil Saya',
	'employee-payslip': 'Gaji Karyawan',
	history: 'Riwayat',
};

export default function DashboardBreadcrumb() {
	const pathname = usePathname();
	const paths = pathname.split('/').slice(1);

	// Fungsi untuk mendapatkan label yang diterjemahkan
	const getPathLabel = (path: string): string => {
		return PATH_TRANSLATIONS[path] || path;
	};

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{paths.map((path, index) => (
					<Fragment key={`path-${path}`}>
						<BreadcrumbItem className='capitalize'>
							{index < paths.length - 1 ? (
								<BreadcrumbLink
									href={`/${paths.slice(0, index + 1).join('/')}`}
									className='capitalize'>
									{getPathLabel(path)}
								</BreadcrumbLink>
							) : (
								<BreadcrumbPage>{getPathLabel(path)}</BreadcrumbPage>
							)}
						</BreadcrumbItem>
						{index < paths.length - 1 && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
