'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import DialogCreateLeave from './_components/dialog-create-leave';
import LeaveBalanceCards from './_components/leave-balance-cards';
import MyLeaveRequests from './_components/my-leave-requests';
import { getMyLeaveBalances, getMyLeaveRequests } from './actions';
import { LeaveBalance, LeaveRequest, LeaveType } from '@/types/leave';

export default function EmployeeLeavePage() {
	const [openDialog, setOpenDialog] = useState(false);
	const [balances, setBalances] = useState<LeaveBalance[]>([]);
	const [requests, setRequests] = useState<LeaveRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		const [balancesResult, requestsResult] = await Promise.all([
			getMyLeaveBalances(),
			getMyLeaveRequests(),
		]);

		console.log('=== CLIENT DEBUG: fetchData ===');
		console.log('CLIENT: Balances result:', balancesResult);
		console.log('CLIENT: Balances data:', balancesResult.data);
		console.log('CLIENT: Balances count:', balancesResult.data?.length);

		setBalances(balancesResult.data || []);
		setRequests(requestsResult.data || []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Extract leave types from assigned balances only
	const assignedLeaveTypes: LeaveType[] = balances
		.map((balance) => balance.leave_type)
		.filter((type): type is LeaveType => type !== undefined);

	const currentYear = new Date().getFullYear();

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Cuti Saya</h1>
					<p className='text-muted-foreground'>
						Kelola permintaan cuti Anda dan lihat saldo cuti Anda
					</p>
				</div>
				<Button
					onClick={() => setOpenDialog(true)}
					disabled={assignedLeaveTypes.length === 0}>
					<Plus className='h-4 w-4 mr-2' />
					Ajukan Cuti
				</Button>
			</div>

			<div>
				<h2 className='text-xl font-semibold mb-4'>
					Saldo Cuti {currentYear}
				</h2>
				{isLoading ? (
					<p className='text-muted-foreground'>Memuat...</p>
				) : balances.length === 0 ? (
					<div className='text-center py-8 border rounded-lg bg-muted/50'>
						<p className='text-muted-foreground'>
							Belum ada saldo cuti yang ditetapkan.
						</p>
						<p className='text-sm text-muted-foreground mt-2'>
							Silakan hubungi admin untuk mendapatkan saldo cuti.
						</p>
					</div>
				) : (
					<LeaveBalanceCards balances={balances} />
				)}
			</div>

			<div>
				<h2 className='text-xl font-semibold mb-4'>Pengajuan Cuti Saya</h2>
				{isLoading ? (
					<p className='text-muted-foreground'>Memuat...</p>
				) : (
					<MyLeaveRequests requests={requests} onRefresh={fetchData} />
				)}
			</div>

			<DialogCreateLeave
				open={openDialog}
				onOpenChange={setOpenDialog}
				leaveTypes={assignedLeaveTypes}
				balances={balances}
				onSuccess={fetchData}
			/>
		</div>
	);
}
