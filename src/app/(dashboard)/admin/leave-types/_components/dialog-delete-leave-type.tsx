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
			toast.error('Delete Leave Type Failed', {
				description: state.errors?._form?.[0] || 'Failed to delete leave type',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Leave Type Deleted Successfully');
			onOpenChange(false);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [state, onOpenChange]);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Leave Type</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete <strong>{leaveType?.name}</strong>? This
						action cannot be undone and will affect all related leave balances and
						requests.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleDelete} disabled={isPending}>
						{isPending ? 'Deleting...' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
