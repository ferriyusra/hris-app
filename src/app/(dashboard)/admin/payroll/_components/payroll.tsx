/* eslint-disable react/jsx-key */
'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { convertIDR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Eye, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PayrollRun } from '@/types/payroll';
import {
	HEADER_TABLE_PAYROLL,
	MONTH_NAMES,
	PAYROLL_STATUS_COLORS,
	PAYROLL_STATUS_LABELS,
} from '@/constants/payroll-constant';
import DialogCreatePayroll from './dialog-create-payroll';
import DialogDelete from '@/components/common/dialog-delete';
import { deletePayrollRun } from '../actions';
import { startTransition, useActionState, useEffect } from 'react';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { useRouter } from 'next/navigation';

export default function PayrollManagement() {
	const supabase = createClient();
	const router = useRouter();
	const {
		currentPage,
		currentLimit,
		handleChangePage,
		handleChangeLimit,
	} = useDataTable();

	const {
		data: payrollRuns,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['payroll-runs', currentPage, currentLimit],
		queryFn: async () => {
			const result = await supabase
				.from('payroll_runs')
				.select('*', { count: 'exact' })
				.range(
					(currentPage - 1) * currentLimit,
					currentPage * currentLimit - 1
				)
				.order('year', { ascending: false })
				.order('month', { ascending: false });

			if (result.error)
				toast.error('Gagal mengambil data penggajian', {
					description: result.error.message,
				});

			return result;
		},
	});

	const [deleteOpen, setDeleteOpen] = useState<PayrollRun | null>(null);

	const [deleteState, deleteAction, isDeleting] = useActionState(
		deletePayrollRun,
		INITIAL_STATE_ACTION
	);

	const handleDelete = () => {
		if (!deleteOpen) return;
		const formData = new FormData();
		formData.append('id', deleteOpen.id);
		startTransition(() => {
			deleteAction(formData);
		});
	};

	useEffect(() => {
		if (deleteState?.status === 'error') {
			toast.error('Gagal Menghapus Penggajian', {
				description: deleteState.errors?._form?.[0],
			});
		}

		if (deleteState?.status === 'success') {
			toast.success('Penggajian Berhasil Dihapus');
			setDeleteOpen(null);
			refetch();
		}
	}, [deleteState]);

	const filteredData = useMemo(() => {
		return (payrollRuns?.data || []).map(
			(run: PayrollRun, index: number) => {
				const statusKey = run.status as keyof typeof PAYROLL_STATUS_LABELS;

				return [
					currentLimit * (currentPage - 1) + index + 1,
					`${MONTH_NAMES[run.month - 1]} ${run.year}`,
					<div
						className={cn(
							'px-2 py-1 rounded-full w-fit text-xs font-medium border',
							PAYROLL_STATUS_COLORS[statusKey]
						)}>
						{PAYROLL_STATUS_LABELS[statusKey]}
					</div>,
					convertIDR(run.total_amount),
					new Date(run.created_at).toLocaleDateString('id-ID'),
					<DropdownAction
						menu={[
							{
								label: (
									<span className='flex item-center gap-2'>
										<Eye />
										Lihat Detail
									</span>
								),
								action: () => {
									router.push(`/admin/payroll/${run.id}`);
								},
							},
							...(run.status === 'draft'
								? [
										{
											label: (
												<span className='flex item-center gap-2'>
													<Trash2 className='text-red-400' />
													Hapus
												</span>
											),
											variant: 'destructive' as const,
											action: () => setDeleteOpen(run),
										},
									]
								: []),
						]}
					/>,
				];
			}
		);
	}, [payrollRuns, currentLimit, currentPage, router]);

	const totalPages = useMemo(() => {
		return payrollRuns && payrollRuns.count !== null
			? Math.ceil(payrollRuns.count / currentLimit)
			: 0;
	}, [payrollRuns, currentLimit]);

	return (
		<div className='w-full'>
			<div className='flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full'>
				<div>
					<h1 className='text-2xl font-bold'>Penggajian</h1>
					<p className='text-muted-foreground'>
						Kelola penggajian bulanan karyawan
					</p>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='outline'>Buat Penggajian</Button>
					</DialogTrigger>
					<DialogCreatePayroll refetch={refetch} />
				</Dialog>
			</div>
			<DataTable
				header={HEADER_TABLE_PAYROLL}
				data={filteredData}
				isLoading={isLoading}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>
			<DialogDelete
				open={deleteOpen !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteOpen(null);
				}}
				isLoading={isDeleting}
				onSubmit={handleDelete}
				title='Penggajian'
			/>
		</div>
	);
}
