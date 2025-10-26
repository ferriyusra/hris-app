'use client';

import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { getAllLeaveRequests } from './actions';
import { LeaveRequest } from '@/types/leave';
import LeaveRequestsManagement from './_components/leave-requests-management';

export default function AdminLeavePage() {
	const [requests, setRequests] = useState<LeaveRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [search, setSearch] = useState('');

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		const result = await getAllLeaveRequests();
		setRequests(result.data || []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const pendingCount = requests.filter((r) => r.status === 'pending').length;

	return (
		<div className='space-y-6'>
			<div className='flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Manajemen Cuti</h1>
					<p className='text-muted-foreground'>
						Kelola permohonan cuti karyawan
						{pendingCount > 0 && (
							<span className='ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
								{pendingCount} menunggu
							</span>
						)}
					</p>
				</div>
			</div>

			<div>
				{isLoading ? (
					<p className='text-muted-foreground'>Memuat...</p>
				) : (
					<LeaveRequestsManagement requests={requests} onRefresh={fetchData} />
				)}
			</div>
		</div>
	);
}
