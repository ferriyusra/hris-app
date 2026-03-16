/* eslint-disable react/jsx-key */
'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { convertIDR } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SalaryConfig } from '@/types/payroll';
import { HEADER_TABLE_SALARY_CONFIG } from '@/constants/payroll-constant';
import DialogCreateSalaryConfig from './dialog-create-salary-config';
import DialogUpdateSalaryConfig from './dialog-update-salary-config';
import DialogDeleteSalaryConfig from './dialog-delete-salary-config';

export default function SalaryConfigManagement() {
	const supabase = createClient();
	const {
		currentPage,
		currentLimit,
		currentSearch,
		handleChangePage,
		handleChangeLimit,
		handleChangeSearch,
	} = useDataTable();

	const {
		data: salaryConfigs,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['salary-configs', currentPage, currentLimit, currentSearch],
		queryFn: async () => {
			const query = supabase
				.from('salary_configs')
				.select(
					`
					*,
					employee:employees!inner(id, full_name, position)
				`,
					{ count: 'exact' }
				)
				.range(
					(currentPage - 1) * currentLimit,
					currentPage * currentLimit - 1
				)
				.order('created_at', { ascending: false });

			if (currentSearch) {
				query.or(
					`employee.full_name.ilike.%${currentSearch}%,employee.position.ilike.%${currentSearch}%`
				);
			}

			const result = await query;

			if (result.error)
				toast.error('Gagal mengambil data konfigurasi gaji', {
					description: result.error.message,
				});

			return result;
		},
	});

	const [selectedAction, setSelectedAction] = useState<{
		data: SalaryConfig;
		type: 'update' | 'delete';
	} | null>(null);

	const handleChangeAction = (open: boolean) => {
		if (!open) setSelectedAction(null);
	};

	const filteredData = useMemo(() => {
		return (salaryConfigs?.data || []).map(
			(config: SalaryConfig, index: number) => {
				const totalAllowances =
					(config.transport_allowance || 0) + (config.meal_allowance || 0);

				return [
					currentLimit * (currentPage - 1) + index + 1,
					<div>
						<h4 className='font-bold'>{config.employee?.full_name}</h4>
						<p className='text-sm text-muted-foreground'>
							{config.employee?.position}
						</p>
					</div>,
					convertIDR(config.base_salary),
					convertIDR(totalAllowances),
					<div className='text-sm'>
						<p>Terlambat: {convertIDR(config.late_deduction_per_day)}</p>
						<p>Absen: {convertIDR(config.absent_deduction_per_day)}</p>
					</div>,
					convertIDR(config.overtime_rate_per_hour),
					config.year,
					<DropdownAction
						menu={[
							{
								label: (
									<span className='flex item-center gap-2'>
										<Pencil />
										Ubah
									</span>
								),
								action: () => {
									setSelectedAction({
										data: config,
										type: 'update',
									});
								},
							},
							{
								label: (
									<span className='flex item-center gap-2'>
										<Trash2 className='text-red-400' />
										Hapus
									</span>
								),
								variant: 'destructive',
								action: () => {
									setSelectedAction({
										data: config,
										type: 'delete',
									});
								},
							},
						]}
					/>,
				];
			}
		);
	}, [salaryConfigs, currentLimit, currentPage]);

	const totalPages = useMemo(() => {
		return salaryConfigs && salaryConfigs.count !== null
			? Math.ceil(salaryConfigs.count / currentLimit)
			: 0;
	}, [salaryConfigs, currentLimit]);

	return (
		<div className='w-full'>
			<div className='flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full'>
				<div>
					<h1 className='text-2xl font-bold'>Konfigurasi Gaji</h1>
					<p className='text-muted-foreground'>
						Kelola gaji pokok, tunjangan, dan potongan karyawan
					</p>
				</div>
				<div className='flex gap-2'>
					<Input
						placeholder='Cari...'
						onChange={(e) => handleChangeSearch(e.target.value)}
					/>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant='outline'>Tambah</Button>
						</DialogTrigger>
						<DialogCreateSalaryConfig refetch={refetch} />
					</Dialog>
				</div>
			</div>
			<DataTable
				header={HEADER_TABLE_SALARY_CONFIG}
				data={filteredData}
				isLoading={isLoading}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>
			<DialogUpdateSalaryConfig
				open={selectedAction !== null && selectedAction.type === 'update'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
			<DialogDeleteSalaryConfig
				open={selectedAction !== null && selectedAction.type === 'delete'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
		</div>
	);
}
