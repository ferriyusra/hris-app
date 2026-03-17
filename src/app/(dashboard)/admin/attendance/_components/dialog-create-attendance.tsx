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
import { createAttendance } from '../actions';
import { INITIAL_STATE_ATTENDANCE } from '@/constants/attendance-constant';
import FormAttendance from './form-attendance';

interface DialogCreateAttendanceProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	refetch: () => void;
}

export default function DialogCreateAttendance({
	open,
	onOpenChange,
	refetch,
}: DialogCreateAttendanceProps) {
	const [state, action, isPending] = useActionState(
		createAttendance,
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
			toast.error('Gagal Menambah Kehadiran', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Data kehadiran berhasil ditambahkan');
			onOpenChange(false);
			refetch();
		}
	}, [state]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[500px]'>
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Tambah Data Kehadiran</DialogTitle>
						<DialogDescription>
							Tambahkan data kehadiran secara manual. Isi semua kolom yang diperlukan.
						</DialogDescription>
					</DialogHeader>
					<div className='py-4'>
						<FormAttendance state={state} />
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
						<Button type='submit' disabled={isPending} className='bg-gradient-to-r from-primary to-primary/80'>
							{isPending ? 'Menyimpan...' : 'Simpan'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
