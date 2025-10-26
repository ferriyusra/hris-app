'use client';

import { startTransition, useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
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
import { deleteLeaveType } from '../actions';
import { LeaveType } from '@/types/leave';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface DialogDeleteLeaveTypeProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leaveType: LeaveType | null;
}

export default function DialogDeleteLeaveType({
	open,
	onOpenChange,
	leaveType,
}: DialogDeleteLeaveTypeProps) {
	const [state, formAction, isPending] = useActionState(deleteLeaveType, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	const handleDelete = () => {
		if (!leaveType) return;

		const formData = new FormData();
		formData.append('id', leaveType.id);

		hasShownToastRef.current = false;

		startTransition(() => {
			formAction(formData);
		});
	};

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state.status === 'error') {
			toast.error('Gagal Menghapus Jenis Cuti', {
				description: state.errors?._form?.[0] || 'Gagal menghapus jenis cuti',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Jenis Cuti Berhasil Dihapus');
			onOpenChange(false);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [state, onOpenChange]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Hapus Jenis Cuti</AlertDialogTitle>
					<AlertDialogDescription>
						Apakah Anda yakin ingin menghapus <strong>{leaveType?.name}</strong>? Tindakan ini
						tidak dapat dibatalkan dan akan mempengaruhi semua saldo cuti dan permohonan
						terkait.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isPending}>
						{isPending ? 'Menghapus...' : 'Hapus'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
