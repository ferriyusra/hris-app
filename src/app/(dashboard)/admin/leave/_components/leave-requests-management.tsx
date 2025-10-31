'use client';

import DataTable from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useDataTable from '@/hooks/use-data-table';
import { LeaveRequest } from '@/types/leave';
import { HEADER_TABLE_LEAVE_REQUEST, LEAVE_STATUS_COLORS, LEAVE_STATUS_LABELS } from '@/constants/leave-constant';
import { useMemo, useState, useEffect, useRef, startTransition } from 'react';
import { useActionState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { approveLeaveRequest, rejectLeaveRequest } from '../actions';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface LeaveRequestsManagementProps {
	requests: LeaveRequest[];
	onRefresh?: () => void;
}

export default function LeaveRequestsManagement({ requests, onRefresh }: LeaveRequestsManagementProps) {
	const { currentPage, currentLimit, currentSearch, handleChangePage, handleChangeLimit, handleChangeSearch } = useDataTable();
	const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
	const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
	const [rejectionReason, setRejectionReason] = useState('');

	const [approveState, approveAction, isApprovePending] = useActionState(approveLeaveRequest, INITIAL_STATE);
	const [rejectState, rejectAction, isRejectPending] = useActionState(rejectLeaveRequest, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const filteredRequests = useMemo(() => {
		if (!currentSearch) return requests;

		const searchLower = currentSearch.toLowerCase();
		return requests.filter(
			(req) =>
				req.employee?.full_name.toLowerCase().includes(searchLower) ||
				req.leave_type?.name.toLowerCase().includes(searchLower) ||
				req.status.toLowerCase().includes(searchLower)
		);
	}, [requests, currentSearch]);

	const filteredData = useMemo(() => {
		const startIndex = (currentPage - 1) * currentLimit;
		const endIndex = startIndex + currentLimit;
		const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

		return paginatedRequests.map((request, index) => {
			const isPending = request.status === 'pending';

			return [
				startIndex + index + 1,
				request.employee?.full_name || 'Tidak Diketahui',
				request.leave_type?.name || 'Tidak Diketahui',
				formatDate(request.start_date),
				formatDate(request.end_date),
				`${request.total_days} hari`,
				<div key={`reason-${request.id}`} className='max-w-xs truncate' title={request.reason}>
					{request.reason}
				</div>,
				<Badge key={`status-${request.id}`} className={LEAVE_STATUS_COLORS[request.status]}>
					{LEAVE_STATUS_LABELS[request.status]}
				</Badge>,
				isPending ? (
					<div key={`actions-${request.id}`} className='flex gap-1'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => {
								setSelectedRequest(request);
								setActionType('approve');
							}}>
							<Check className='h-4 w-4 text-blue-600' />
						</Button>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => {
								setSelectedRequest(request);
								setActionType('reject');
							}}>
							<X className='h-4 w-4 text-red-600' />
						</Button>
					</div>
				) : (
					<span key={`no-action-${request.id}`} className='text-xs text-muted-foreground'>-</span>
				),
			];
		});
	}, [filteredRequests, currentPage, currentLimit]);

	const totalPages = Math.ceil(filteredRequests.length / currentLimit);

	const handleApprove = () => {
		if (!selectedRequest) return;

		const formData = new FormData();
		formData.append('id', selectedRequest.id);

		hasShownToastRef.current = false;

		startTransition(() => {
			approveAction(formData);
		});
	};

	const handleReject = () => {
		if (!selectedRequest || !rejectionReason.trim()) return;

		const formData = new FormData();
		formData.append('id', selectedRequest.id);
		formData.append('rejection_reason', rejectionReason);

		hasShownToastRef.current = false;

		startTransition(() => {
			rejectAction(formData);
		});
	};

	const closeDialog = () => {
		setSelectedRequest(null);
		setActionType(null);
		setRejectionReason('');
	};

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (approveState.status === 'error') {
			toast.error('Gagal Menyetujui Cuti', {
				description: approveState.errors?._form?.[0] || 'Gagal menyetujui permohonan cuti',
			});
			hasShownToastRef.current = true;
		}

		if (approveState.status === 'success') {
			toast.success('Permohonan Cuti Disetujui');
			closeDialog();
			hasShownToastRef.current = true;

			// Refresh data after successful approval
			if (onRefresh) {
				onRefresh();
			}
		}
	}, [approveState, onRefresh]);

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (rejectState.status === 'error') {
			toast.error('Gagal Menolak Cuti', {
				description: rejectState.errors?._form?.[0] || 'Gagal menolak permohonan cuti',
			});
			hasShownToastRef.current = true;
		}

		if (rejectState.status === 'success') {
			toast.success('Permohonan Cuti Ditolak');
			closeDialog();
			hasShownToastRef.current = true;

			// Refresh data after successful rejection
			if (onRefresh) {
				onRefresh();
			}
		}
	}, [rejectState, onRefresh]);

	return (
		<>
			<div className='flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full'>
				<h1 className='text-2xl font-bold'>Manajemen Permohonan Cuti</h1>
				<Input
					placeholder='Cari berdasarkan karyawan, jenis cuti, atau status...'
					onChange={(e) => handleChangeSearch(e.target.value)}
				/>
			</div>
			<DataTable
				header={HEADER_TABLE_LEAVE_REQUEST}
				data={filteredData}
				isLoading={false}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>

			{/* Approve Dialog */}
			<Dialog
				open={actionType === 'approve'}
				onOpenChange={(open) => !open && closeDialog()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Setujui Permohonan Cuti</DialogTitle>
						<DialogDescription>
							Apakah Anda yakin ingin menyetujui permohonan cuti dari{' '}
							<strong>{selectedRequest?.employee?.full_name}</strong>?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant='outline' onClick={closeDialog} disabled={isApprovePending}>
							Batal
						</Button>
						<Button onClick={handleApprove} disabled={isApprovePending}>
							{isApprovePending ? 'Menyetujui...' : 'Setujui'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog
				open={actionType === 'reject'}
				onOpenChange={(open) => !open && closeDialog()}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tolak Permohonan Cuti</DialogTitle>
						<DialogDescription>
							Silakan berikan alasan penolakan permohonan cuti dari{' '}
							<strong>{selectedRequest?.employee?.full_name}</strong>.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<Label htmlFor='rejection_reason'>Alasan Penolakan</Label>
						<Textarea
							id='rejection_reason'
							value={rejectionReason}
							onChange={(e) => setRejectionReason(e.target.value)}
							placeholder='Masukkan alasan penolakan...'
							rows={4}
							className='mt-2'
						/>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={closeDialog} disabled={isRejectPending}>
							Batal
						</Button>
						<Button
							variant='destructive'
							onClick={handleReject}
							disabled={isRejectPending || !rejectionReason.trim()}>
							{isRejectPending ? 'Menolak...' : 'Tolak'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
