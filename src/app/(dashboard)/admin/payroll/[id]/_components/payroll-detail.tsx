'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
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
import { convertIDR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { PayrollRun, Payslip } from '@/types/payroll';
import {
	MONTH_NAMES,
	PAYROLL_STATUS_COLORS,
	PAYROLL_STATUS_LABELS,
	PAYMENT_STATUS_COLORS,
	PAYMENT_STATUS_LABELS,
	HEADER_TABLE_PAYSLIP,
} from '@/constants/payroll-constant';
import {
	getPayrollRunDetail,
	finalizePayrollRun,
	markPayslipAsPaid,
} from '../../actions';
import { ArrowLeft, CheckCircle, CircleDollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { startTransition, useActionState, useCallback, useEffect, useState } from 'react';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { toast } from 'sonner';

export default function PayrollDetail({ id }: { id: string }) {
	const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
	const [payslips, setPayslips] = useState<Payslip[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [confirmPayslip, setConfirmPayslip] = useState<Payslip | null>(null);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		const result = await getPayrollRunDetail(id);
		if (result.payrollRun) setPayrollRun(result.payrollRun);
		if (result.payslips) setPayslips(result.payslips);
		setIsLoading(false);
	}, [id]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const [finalizeState, finalizeAction, isFinalizing] = useActionState(
		finalizePayrollRun,
		INITIAL_STATE_ACTION
	);

	const [paymentState, paymentAction, isMarking] = useActionState(
		markPayslipAsPaid,
		INITIAL_STATE_ACTION
	);

	const handleFinalize = () => {
		const formData = new FormData();
		formData.append('id', id);
		startTransition(() => {
			finalizeAction(formData);
		});
	};

	const handleMarkAsPaid = () => {
		if (!confirmPayslip) return;
		const formData = new FormData();
		formData.append('payslip_id', confirmPayslip.id);
		formData.append('payroll_run_id', id);
		startTransition(() => {
			paymentAction(formData);
		});
	};

	useEffect(() => {
		if (finalizeState?.status === 'success') {
			toast.success('Penggajian berhasil difinalisasi');
			fetchData();
		}
		if (finalizeState?.status === 'error') {
			toast.error('Gagal memfinalisasi', {
				description: finalizeState.errors?._form?.[0],
			});
		}
	}, [finalizeState]);

	useEffect(() => {
		if (paymentState?.status === 'success') {
			toast.success('Pembayaran berhasil ditandai');
			setConfirmPayslip(null);
			fetchData();
		}
		if (paymentState?.status === 'error') {
			toast.error('Gagal menandai pembayaran', {
				description: paymentState.errors?._form?.[0],
			});
		}
	}, [paymentState]);

	if (isLoading) {
		return <p className='text-muted-foreground'>Memuat...</p>;
	}

	if (!payrollRun) {
		return <p className='text-muted-foreground'>Data tidak ditemukan</p>;
	}

	const statusKey = payrollRun.status as keyof typeof PAYROLL_STATUS_LABELS;

	return (
		<div className='space-y-6'>
			<div className='flex items-center gap-4'>
				<Link href='/admin/payroll'>
					<Button variant='ghost' size='icon'>
						<ArrowLeft />
					</Button>
				</Link>
				<div className='flex-1'>
					<h1 className='text-2xl font-bold'>
						Penggajian {MONTH_NAMES[payrollRun.month - 1]}{' '}
						{payrollRun.year}
					</h1>
					<div className='flex items-center gap-2 mt-1'>
						<span
							className={cn(
								'px-2 py-1 rounded-full text-xs font-medium border',
								PAYROLL_STATUS_COLORS[statusKey]
							)}>
							{PAYROLL_STATUS_LABELS[statusKey]}
						</span>
						<span className='text-muted-foreground'>
							Total: {convertIDR(payrollRun.total_amount)}
						</span>
					</div>
				</div>
				{payrollRun.status === 'draft' && (
					<Button onClick={handleFinalize} disabled={isFinalizing}>
						{isFinalizing ? (
							<Loader2 className='animate-spin mr-2' />
						) : (
							<CheckCircle className='mr-2' />
						)}
						Finalisasi
					</Button>
				)}
			</div>

			<Card className='p-0'>
				<Table>
					<TableHeader className='bg-muted'>
						<TableRow>
							{HEADER_TABLE_PAYSLIP.map((header) => (
								<TableHead key={header} className='px-6 py-3'>
									{header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{payslips.map((payslip, index) => {
							const paymentKey =
								payslip.payment_status as keyof typeof PAYMENT_STATUS_LABELS;

							return (
								<TableRow key={payslip.id}>
									<TableCell className='px-6 py-3'>
										{index + 1}
									</TableCell>
									<TableCell className='px-6 py-3'>
										<div>
											<h4 className='font-bold'>
												{payslip.employee?.full_name}
											</h4>
											<p className='text-sm text-muted-foreground'>
												{payslip.employee?.position}
											</p>
										</div>
									</TableCell>
									<TableCell className='px-6 py-3'>
										{convertIDR(payslip.base_salary)}
									</TableCell>
									<TableCell className='px-6 py-3'>
										{convertIDR(payslip.total_allowances)}
									</TableCell>
									<TableCell className='px-6 py-3'>
										<span className='text-red-600'>
											-{convertIDR(payslip.total_deductions)}
										</span>
									</TableCell>
									<TableCell className='px-6 py-3'>
										{convertIDR(payslip.overtime_pay)}
									</TableCell>
									<TableCell className='px-6 py-3 font-bold'>
										{convertIDR(payslip.net_salary)}
									</TableCell>
									<TableCell className='px-6 py-3'>
										<span
											className={cn(
												'px-2 py-1 rounded-full text-xs font-medium border',
												PAYMENT_STATUS_COLORS[paymentKey]
											)}>
											{PAYMENT_STATUS_LABELS[paymentKey]}
										</span>
									</TableCell>
									<TableCell className='px-6 py-3'>
										{payrollRun.status === 'finalized' &&
											payslip.payment_status === 'unpaid' && (
												<Button
													size='sm'
													variant='outline'
													onClick={() => setConfirmPayslip(payslip)}>
													<CircleDollarSign className='mr-1' />
													Bayar
												</Button>
											)}
										{payslip.payment_status === 'paid' && (
											<span className='text-sm text-green-600'>
												Lunas
											</span>
										)}
									</TableCell>
								</TableRow>
							);
						})}
						{payslips.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={HEADER_TABLE_PAYSLIP.length}
									className='h-24 text-center'>
									Tidak Ada Data
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Card>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
				<Card className='p-4'>
					<p className='text-sm text-muted-foreground'>Total Karyawan</p>
					<p className='text-2xl font-bold'>{payslips.length}</p>
				</Card>
				<Card className='p-4'>
					<p className='text-sm text-muted-foreground'>Total Gaji Bersih</p>
					<p className='text-2xl font-bold'>
						{convertIDR(payrollRun.total_amount)}
					</p>
				</Card>
				<Card className='p-4'>
					<p className='text-sm text-muted-foreground'>Sudah Dibayar</p>
					<p className='text-2xl font-bold'>
						{payslips.filter((p) => p.payment_status === 'paid').length}
					</p>
				</Card>
				<Card className='p-4'>
					<p className='text-sm text-muted-foreground'>Belum Dibayar</p>
					<p className='text-2xl font-bold'>
						{payslips.filter((p) => p.payment_status !== 'paid').length}
					</p>
				</Card>
			</div>

			{/* Confirm Payment Dialog */}
			<AlertDialog
				open={confirmPayslip !== null}
				onOpenChange={(open) => {
					if (!open) setConfirmPayslip(null);
				}}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
						<AlertDialogDescription>
							Tandai gaji{' '}
							<span className='font-semibold text-foreground'>
								{confirmPayslip?.employee?.full_name}
							</span>{' '}
							sebesar{' '}
							<span className='font-semibold text-foreground'>
								{confirmPayslip ? convertIDR(confirmPayslip.net_salary) : ''}
							</span>{' '}
							sebagai sudah dibayar?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleMarkAsPaid}
							disabled={isMarking}>
							{isMarking ? (
								<Loader2 className='animate-spin mr-2' />
							) : null}
							Ya, Tandai Dibayar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
