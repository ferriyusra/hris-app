'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import DialogDelete from '@/components/common/dialog-delete';
import { deleteAttendance } from '../actions';
import { INITIAL_STATE_ATTENDANCE } from '@/constants/attendance-constant';
import type { AttendanceRecordWithEmployee } from '@/types/attendance';

interface DialogDeleteAttendanceProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	refetch: () => void;
	currentData?: AttendanceRecordWithEmployee;
}

export default function DialogDeleteAttendance({
	open,
	onOpenChange,
	refetch,
	currentData,
}: DialogDeleteAttendanceProps) {
	const [state, action, isPending] = useActionState(
		deleteAttendance,
		INITIAL_STATE_ATTENDANCE
	);

	const onSubmit = () => {
		const formData = new FormData();
		formData.append('id', currentData!.id);
		startTransition(() => {
			action(formData);
		});
	};

	useEffect(() => {
		if (state?.status === 'error') {
			toast.error('Hapus Kehadiran Gagal', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Catatan kehadiran berhasil dihapus');
			onOpenChange(false);
			refetch();
		}
	}, [state]);

	return (
		<DialogDelete
			open={open}
			onOpenChange={onOpenChange}
			isLoading={isPending}
			onSubmit={onSubmit}
			title='Attendance Record'
		/>
	);
}
