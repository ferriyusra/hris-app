'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LeaveRequestForm, leaveRequestSchema } from '@/validations/leave-validation';
import { createLeaveRequest } from '../actions';
import { LeaveType, LeaveBalance } from '@/types/leave';
import FormInput from '@/components/common/form-input';
import FormTextarea from '@/components/common/form-textarea';
import { Badge } from '@/components/ui/badge';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface DialogCreateLeaveProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leaveTypes: LeaveType[];
	balances: LeaveBalance[];
	onSuccess?: () => void;
}

export default function DialogCreateLeave({
	open,
	onOpenChange,
	leaveTypes,
	balances,
	onSuccess,
}: DialogCreateLeaveProps) {
	const form = useForm<LeaveRequestForm>({
		resolver: zodResolver(leaveRequestSchema),
		defaultValues: {
			leave_type_id: '',
			start_date: '',
			end_date: '',
			reason: '',
		},
	});

	const [state, formAction, isPending] = useActionState(createLeaveRequest, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	const onSubmit = form.handleSubmit((data) => {
		console.log('=== CLIENT: Form Submit Data ===');
		console.log('Form data:', data);
		console.log('Selected leave type:', selectedLeaveType);
		console.log('Allows flexible end date?', selectedLeaveType?.allows_flexible_end_date);

		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			// Only append end_date if it has a value (not empty string)
			// For flexible end date leave types, end_date will be empty
			if (key === 'end_date' && (!value || value.toString().trim() === '')) {
				console.log('CLIENT: Skipping empty end_date');
				return; // Skip empty end_date
			}
			console.log(`CLIENT: Appending ${key}:`, value);
			formData.append(key, value);
		});

		console.log('=== END CLIENT Form Submit ===');

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
						form.setError(key as keyof LeaveRequestForm, {
							message: value[0],
						});
					}
				});
			}

			toast.error('Gagal Mengajukan Permintaan Cuti', {
				description: state.errors?._form?.[0] || 'Silakan periksa formulir',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Permintaan Cuti Berhasil Diajukan', {
				description: 'Permintaan cuti Anda telah diajukan untuk disetujui',
			});
			form.reset();
			onOpenChange(false);
			hasShownToastRef.current = true;

			// Refresh data after successful submission
			if (onSuccess) {
				onSuccess();
			}
		}
	}, [state, form, onOpenChange, onSuccess]);

	// Get selected leave type balance and type details
	const selectedLeaveTypeId = form.watch('leave_type_id');
	const selectedBalance = balances.find((b) => b.leave_type_id === selectedLeaveTypeId);
	const selectedLeaveType = leaveTypes.find((t) => t.id === selectedLeaveTypeId);

	// Clear end_date when switching to a leave type with flexible end date
	useEffect(() => {
		if (selectedLeaveType?.allows_flexible_end_date) {
			form.setValue('end_date', '');
		}
	}, [selectedLeaveType?.allows_flexible_end_date, selectedLeaveType?.id, form]);

	// Get today's date in YYYY-MM-DD format for min date validation
	const today = new Date().toISOString().split('T')[0];
	const startDate = form.watch('start_date');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Ajukan Cuti</DialogTitle>
					<DialogDescription>
						Isi formulir di bawah ini untuk mengajukan permintaan cuti Anda.
					</DialogDescription>
				</DialogHeader>

				{leaveTypes.length === 0 ? (
					<div className='py-8 text-center'>
						<p className='text-muted-foreground'>
							Belum ada saldo cuti yang ditetapkan.
						</p>
						<p className='text-sm text-muted-foreground mt-2'>
							Silakan hubungi admin untuk mendapatkan saldo cuti.
						</p>
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={onSubmit} className='space-y-4'>
							<FormField
								control={form.control}
								name='leave_type_id'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tipe Cuti</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Pilih tipe cuti' />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{leaveTypes.map((type) => {
													const balance = balances.find((b) => b.leave_type_id === type.id);
													return (
														<SelectItem key={type.id} value={type.id}>
															{type.name} - Tersedia: {balance?.remaining_days || 0} hari
														</SelectItem>
													);
												})}
											</SelectContent>
										</Select>
										{selectedBalance && (
											<div className='flex gap-2 mt-2'>
												<Badge variant='outline'>
													Total: {selectedBalance.total_days} hari
												</Badge>
												<Badge variant='outline' className='text-orange-600'>
													Terpakai: {selectedBalance.used_days} hari
												</Badge>
												<Badge variant='outline' className='text-green-600'>
													Tersisa: {selectedBalance.remaining_days} hari
												</Badge>
											</div>
										)}
										<FormMessage />
									</FormItem>
								)}
							/>

						<div className='grid grid-cols-2 gap-4'>
							<FormInput
								form={form}
								name='start_date'
								label='Tanggal Mulai'
								type='date'
								placeholder=''
								min={today}
							/>
							{selectedLeaveType?.allows_flexible_end_date ? (
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Tanggal Akhir</label>
									<div className='p-3 bg-muted rounded-md space-y-2'>
										<p className='text-xs text-muted-foreground'>
											<strong>Untuk {selectedLeaveType.name.toLowerCase()}, tanggal akhir tidak perlu ditentukan di awal.</strong>
										</p>
										<p className='text-xs text-muted-foreground'>
											Setiap pengajuan dihitung sebagai <strong>1 hari cuti</strong> dan akan mengurangi saldo Anda.
											Jika masih memerlukan cuti, ajukan lagi untuk hari berikutnya.
										</p>
									</div>
								</div>
							) : (
								<FormInput
									form={form}
									name='end_date'
									label='Tanggal Akhir'
									type='date'
									placeholder=''
									min={startDate || today}
								/>
							)}
						</div>

						<FormTextarea
							form={form}
							name='reason'
							label='Alasan'
							placeholder='Berikan alasan untuk pengajuan cuti Anda...'
							rows={4}
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
									{isPending ? 'Mengajukan...' : 'Ajukan Cuti'}
								</Button>
							</div>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
