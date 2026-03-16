'use client';

import { Card } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { convertIDR } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Payslip } from '@/types/payroll';
import {
	HEADER_TABLE_MY_PAYSLIP,
	MONTH_NAMES,
	PAYMENT_STATUS_COLORS,
	PAYMENT_STATUS_LABELS,
} from '@/constants/payroll-constant';
import { getMyPayslips } from '../actions';
import { useCallback, useEffect, useState } from 'react';

type PayslipWithRun = Payslip & {
	payroll_run?: {
		id: string;
		month: number;
		year: number;
		status: string;
	};
};

export default function MyPayslips() {
	const [payslips, setPayslips] = useState<PayslipWithRun[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		const result = await getMyPayslips();
		setPayslips(result.data || []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-bold'>Slip Gaji</h1>
				<p className='text-muted-foreground'>
					Lihat riwayat slip gaji Anda
				</p>
			</div>

			<Card className='p-0'>
				<Table>
					<TableHeader className='bg-muted'>
						<TableRow>
							{HEADER_TABLE_MY_PAYSLIP.map((header) => (
								<TableHead key={header} className='px-6 py-3'>
									{header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<TableRow>
								<TableCell
									colSpan={HEADER_TABLE_MY_PAYSLIP.length}
									className='h-24 text-center'>
									Memuat...
								</TableCell>
							</TableRow>
						)}
						{!isLoading &&
							payslips.map((payslip, index) => {
								const paymentKey =
									payslip.payment_status as keyof typeof PAYMENT_STATUS_LABELS;
								const period = payslip.payroll_run
									? `${MONTH_NAMES[payslip.payroll_run.month - 1]} ${payslip.payroll_run.year}`
									: '-';

								return (
									<TableRow key={payslip.id}>
										<TableCell className='px-6 py-3'>
											{index + 1}
										</TableCell>
										<TableCell className='px-6 py-3 font-medium'>
											{period}
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
									</TableRow>
								);
							})}
						{!isLoading && payslips.length === 0 && (
							<TableRow>
								<TableCell
									colSpan={HEADER_TABLE_MY_PAYSLIP.length}
									className='h-24 text-center'>
									Belum ada slip gaji
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</Card>
		</div>
	);
}
