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
import { cn, convertIDR } from '@/lib/utils';
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
	processPayrollRun,
	markPayslipAsPaid,
} from '../../actions';
import {
	ArrowLeft,
	Check,
	CircleDollarSign,
	CreditCard,
	FileText,
	Loader2,
	PlayCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
	startTransition,
	useActionState,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { toast } from 'sonner';

export default function PayrollDetail({ id }: { id: string }) {
	const [payrollRun, setPayrollRun] = useState<PayrollRun | null>(null);
	const [payslips, setPayslips] = useState<Payslip[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [confirmPayslip, setConfirmPayslip] = useState<Payslip | null>(null);
	const [showProcessDialog, setShowProcessDialog] = useState(false);

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

	const [processState, processAction, isProcessing] = useActionState(
		processPayrollRun,
		INITIAL_STATE_ACTION
	);

	const [paymentState, paymentAction, isMarking] = useActionState(
		markPayslipAsPaid,
		INITIAL_STATE_ACTION
	);

	const handleProcess = () => {
		const formData = new FormData();
		formData.append('id', id);
		startTransition(() => {
			processAction(formData);
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
		if (processState?.status === 'success') {
			toast.success('Penggajian sedang diproses');
			setShowProcessDialog(false);
			fetchData();
		}
		if (processState?.status === 'error') {
			toast.error('Gagal memproses penggajian', {
				description: processState.errors?._form?.[0],
			});
		}
	}, [processState]);

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
			{/* Header */}
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

				{payrollRun.status === 'unpaid' && (
					<Button onClick={() => setShowProcessDialog(true)}>
						<PlayCircle className='mr-2 h-4 w-4' />
						Proses Pembayaran
					</Button>
				)}
			</div>

			{/* Stepper */}
			<Card className='p-6'>
				<h3 className='font-semibold mb-6'>Status Penggajian</h3>
				<PayrollStepper payrollRun={payrollRun} />
			</Card>

			{/* Payslip Table */}
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
										{payrollRun.status === 'process' &&
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

			{/* Process Dialog */}
			<AlertDialog
				open={showProcessDialog}
				onOpenChange={setShowProcessDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Proses Pembayaran</AlertDialogTitle>
						<AlertDialogDescription>
							Mulai proses pembayaran gaji periode{' '}
							{MONTH_NAMES[payrollRun.month - 1]} {payrollRun.year} dengan
							total {convertIDR(payrollRun.total_amount)}? Slip gaji akan
							dapat dilihat oleh karyawan.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Batal</AlertDialogCancel>
						<AlertDialogAction onClick={handleProcess} disabled={isProcessing}>
							{isProcessing ? (
								<Loader2 className='animate-spin mr-2' />
							) : (
								<PlayCircle className='mr-2 h-4 w-4' />
							)}
							Ya, Proses
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

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

function PayrollStepper({ payrollRun }: { payrollRun: PayrollRun }) {
	const statusOrder: PayrollRun['status'][] = ['unpaid', 'process', 'paid'];
	const currentIndex = statusOrder.indexOf(payrollRun.status);

	const steps = [
		{
			label: 'Belum Dibayar',
			icon: <FileText className='h-4 w-4' />,
		},
		{
			label: 'Diproses',
			icon: <PlayCircle className='h-4 w-4' />,
		},
		{
			label: 'Dibayar',
			icon: <CreditCard className='h-4 w-4' />,
		},
	];

	return (
		<div className='flex items-center'>
			{steps.map((step, index) => {
				const isCompleted = index < currentIndex;
				const isCurrent = index === currentIndex;

				return (
					<div key={step.label} className='flex items-center flex-1 last:flex-none'>
						{/* Step circle + label */}
						<div className='flex flex-col items-center'>
							<div
								className={cn(
									'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors',
									isCompleted &&
										'bg-emerald-500 border-emerald-500 text-white',
									isCurrent &&
										'bg-blue-500 border-blue-500 text-white',
									!isCompleted &&
										!isCurrent &&
										'bg-muted border-muted-foreground/30 text-muted-foreground'
								)}>
								{isCompleted ? (
									<Check className='h-4 w-4' />
								) : (
									step.icon
								)}
							</div>
							<span
								className={cn(
									'text-xs font-medium mt-2 text-center',
									!isCompleted && !isCurrent
										? 'text-muted-foreground'
										: 'text-foreground'
								)}>
								{step.label}
							</span>
						</div>

						{/* Connector line */}
						{index < steps.length - 1 && (
							<div className='flex-1 flex items-center px-2 -mt-5'>
								<div
									className={cn(
										'h-0.5 w-full rounded-full',
										isCompleted
											? 'bg-emerald-500'
											: 'bg-muted-foreground/20'
									)}
								/>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
