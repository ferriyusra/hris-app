'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { updateAttendance } from '../actions';
import { INITIAL_STATE_ATTENDANCE } from '@/constants/attendance-constant';
import FormAttendance from './form-attendance';
import type { AttendanceRecordWithEmployee } from '@/types/attendance';

interface DialogUpdateAttendanceProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	refetch: () => void;
	currentData?: AttendanceRecordWithEmployee;
}

export default function DialogUpdateAttendance({
	open,
	onOpenChange,
	refetch,
	currentData,
}: DialogUpdateAttendanceProps) {
	const [state, action, isPending] = useActionState(
		updateAttendance,
		INITIAL_STATE_ATTENDANCE
	);

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		startTransition(() => {
			action(formData);
		});
	};

	useEffect(() => {
		if (state?.status === 'error') {
			toast.error('Gagal Mengubah Kehadiran', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Data kehadiran berhasil diubah');
			onOpenChange(false);
			refetch();
		}
	}, [state]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Ubah Data Kehadiran</DialogTitle>
						<DialogDescription>
							Perbarui detail data kehadiran. Semua perubahan akan langsung disimpan.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<FormAttendance
							state={state}
							currentData={currentData}
						/>
					</div>
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isPending}
						>
							Batal
						</Button>
						<Button type='submit' disabled={isPending}>
							{isPending ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
