'use client';

import DataTable from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useDataTable from '@/hooks/use-data-table';
import { LeaveRequest } from '@/types/leave';
import { HEADER_TABLE_MY_LEAVE, LEAVE_STATUS_COLORS, LEAVE_STATUS_LABELS } from '@/constants/leave-constant';
import { useMemo, useState, useActionState, useEffect, useRef } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cancelLeaveRequest } from '../actions';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface MyLeaveRequestsProps {
	requests: LeaveRequest[];
	onRefresh?: () => void;
}

export default function MyLeaveRequests({ requests, onRefresh }: MyLeaveRequestsProps) {
	const { currentPage, currentLimit, handleChangePage, handleChangeLimit } = useDataTable();
	const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
	const [state, formAction, isPending] = useActionState(cancelLeaveRequest, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return 'Fleksibel';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const filteredData = useMemo(() => {
		const startIndex = (currentPage - 1) * currentLimit;
		const endIndex = startIndex + currentLimit;
		const paginatedRequests = requests.slice(startIndex, endIndex);

		return paginatedRequests.map((request, index) => {
			const canCancel = request.status === 'pending';

			return [
				startIndex + index + 1,
				request.leave_type?.name || 'Unknown',
				formatDate(request.start_date),
				formatDate(request.end_date),
				`${request.total_days} hari`,
				<div key={`reason-${request.id}`} className='max-w-xs truncate' title={request.reason}>
					{request.reason}
				</div>,
				<Badge key={`status-${request.id}`} className={LEAVE_STATUS_COLORS[request.status]}>
					{LEAVE_STATUS_LABELS[request.status]}
				</Badge>,
				canCancel ? (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setSelectedRequest(request)}>
						<Trash2 className='h-4 w-4 text-red-500' />
					</Button>
				) : (
					<span className='text-xs text-muted-foreground'>-</span>
				),
			];
		});
	}, [requests, currentPage, currentLimit]);

	const totalPages = Math.ceil(requests.length / currentLimit);

	const handleCancel = () => {
		if (!selectedRequest) return;

		const formData = new FormData();
		formData.append('id', selectedRequest.id);

		hasShownToastRef.current = false;
		formAction(formData);
	};

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state.status === 'error') {
			toast.error('Gagal Membatalkan Permintaan Cuti', {
				description: state.errors?._form?.[0] || 'Gagal membatalkan permintaan cuti',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Permintaan Cuti Berhasil Dibatalkan');
			setSelectedRequest(null);
			hasShownToastRef.current = true;

			// Refresh data after successful cancellation
			if (onRefresh) {
				onRefresh();
			}
		}
	}, [state, onRefresh]);

	return (
		<>
			<DataTable
				header={HEADER_TABLE_MY_LEAVE}
				data={filteredData}
				isLoading={false}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>

			<AlertDialog
				open={selectedRequest !== null}
				onOpenChange={(open) => !open && setSelectedRequest(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Batal Ajukan Cuti</AlertDialogTitle>
						<AlertDialogDescription>
							Apakah Anda yakin ingin membatalkan permintaan cuti ini? Tindakan ini tidak dapat dibatalkan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
						<AlertDialogAction onClick={handleCancel} disabled={isPending}>
							{isPending ? 'Membatalkan...' : 'Konfirmasi'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
