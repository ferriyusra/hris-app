'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeaveTypeForm, leaveTypeSchema } from '@/validations/leave-validation';
import { updateLeaveType } from '../actions';
import FormInput from '@/components/common/form-input';
import FormTextarea from '@/components/common/form-textarea';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { LeaveType } from '@/types/leave';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface DialogUpdateLeaveTypeProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leaveType: LeaveType | null;
}

export default function DialogUpdateLeaveType({
	open,
	onOpenChange,
	leaveType,
}: DialogUpdateLeaveTypeProps) {
	const form = useForm<LeaveTypeForm>({
		resolver: zodResolver(leaveTypeSchema),
		defaultValues: {
			name: '',
			description: '',
			max_days_per_year: 12,
			requires_approval: true,
			is_active: true,
			allows_flexible_end_date: false,
		},
	});

	const [state, formAction, isPending] = useActionState(updateLeaveType, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	useEffect(() => {
		if (leaveType) {
			form.reset({
				name: leaveType.name,
				description: leaveType.description || '',
				max_days_per_year: leaveType.max_days_per_year,
				requires_approval: leaveType.requires_approval,
				is_active: leaveType.is_active,
				allows_flexible_end_date: leaveType.allows_flexible_end_date,
			});
		}
	}, [leaveType, form]);

	const onSubmit = form.handleSubmit((data) => {
		if (!leaveType) return;

		const formData = new FormData();
		formData.append('id', leaveType.id);
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, String(value));
		});

		hasShownToastRef.current = false;

		startTransition(() => {
			formAction(formData);
		});
	});

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state.status === 'error') {
			if (state.errors) {
				Object.entries(state.errors).forEach(([key, value]) => {
					if (key !== '_form' && value && value.length > 0) {
						form.setError(key as keyof LeaveTypeForm, {
							message: value[0],
						});
					}
				});
			}

			toast.error('Gagal Mengubah Jenis Cuti', {
				description: state.errors?._form?.[0] || 'Silakan periksa form',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Jenis Cuti Berhasil Diubah');
			onOpenChange(false);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [state, form, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Ubah Jenis Cuti</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={onSubmit} className='space-y-4'>
						<FormInput
							form={form}
							name='name'
							label='Nama'
							placeholder='contoh: Cuti Tahunan, Cuti Sakit'
						/>

						<FormTextarea
							form={form}
							name='description'
							label='Deskripsi (Opsional)'
							placeholder='Deskripsi singkat jenis cuti ini...'
							rows={3}
						/>

						<div className='space-y-2'>
							<FormInput
								form={form}
								name='max_days_per_year'
								label='Maksimum Hari Per Tahun'
								type='number'
								placeholder='12'
							/>
							<p className='text-xs text-muted-foreground'>
								Jumlah maksimal hari cuti yang dapat digunakan dalam setahun.
								Untuk cuti dengan tanggal akhir fleksibel, setiap pengajuan mengurangi saldo per hari.
							</p>
						</div>

						<FormField
							control={form.control}
							name='requires_approval'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Memerlukan Persetujuan</FormLabel>
										<p className='text-sm text-muted-foreground'>
											Centang jika permohonan cuti jenis ini memerlukan persetujuan admin
										</p>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='is_active'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Aktif</FormLabel>
										<p className='text-sm text-muted-foreground'>
											Hanya jenis cuti aktif yang dapat dipilih oleh karyawan
										</p>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='allows_flexible_end_date'
							render={({ field }) => (
								<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className='space-y-1 leading-none'>
										<FormLabel>Tanggal Akhir Fleksibel</FormLabel>
										<p className='text-sm text-muted-foreground'>
											Centang jika cuti jenis ini tidak memerlukan tanggal akhir pasti (contoh: Cuti Sakit)
										</p>
									</div>
								</FormItem>
							)}
						/>

						<div className='flex justify-end gap-2 pt-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => onOpenChange(false)}
								disabled={isPending}>
								Batal
							</Button>
							<Button type='submit' disabled={isPending}>
								{isPending ? 'Mengubah...' : 'Ubah Jenis Cuti'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
