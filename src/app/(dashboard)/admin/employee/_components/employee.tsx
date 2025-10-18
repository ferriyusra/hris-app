/* eslint-disable react/jsx-key */
'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Employee } from '@/validations/employee-validation';
import { HEADER_TABLE_EMPLOYEE } from '@/constants/employee-constant';
import DialogCreateEmployee from './dialog-create-employee';
import DialogUpdateEmployee from './dialog-update-employee';
import DialogDeleteEmployee from './dialog-delete-employee';

export default function EmployeeManagement() {
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
		data: employees,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['employees', currentPage, currentLimit, currentSearch],
		queryFn: async () => {
			const query = supabase
				.from('employees')
				.select('*', { count: 'exact' })
				.range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
				.order('created_at');

			if (currentSearch) {
				query.or(
					`position.ilike.%${currentSearch}%,full_name.ilike.%${currentSearch}%`
				);
			}

			const result = await query;

			if (result.error)
				toast.error('Get Employee data failed', {
					description: result.error.message,
				});

			return result;
		},
	});

	const [selectedAction, setSelectedAction] = useState<{
		data: Employee;
		type: 'update' | 'delete';
	} | null>(null);

	const handleChangeAction = (open: boolean) => {
		if (!open) setSelectedAction(null);
	};

	const filteredData = useMemo(() => {
		return (employees?.data || []).map((employee: Employee, index) => {
			return [
				currentLimit * (currentPage - 1) + index + 1,
				employee.id,
				<div>
					<h4 className='font-bold'>{employee.full_name}</h4>
				</div>,
				employee.position,
				employee.phone_number,
				<div
					className={cn('px-2 py-1 rounded-full text-white w-fit capitalize', {
						 'bg-green-600': employee.is_active,
    					'bg-red-600': !employee.is_active,
					})}>
					 {employee.is_active ? 'Active' : 'Inactive'}
				</div>,
				<DropdownAction
					menu={[
						{
							label: (
								<span className='flex item-center gap-2'>
									<Pencil />
									Edit
								</span>
							),
							action: () => {
								setSelectedAction({
									data: employee,
									type: 'update',
								});
							},
						},
						{
							label: (
								<span className='flex item-center gap-2'>
									<Trash2 className='text-red-400' />
									Delete
								</span>
							),
							variant: 'destructive',
							action: () => {
								setSelectedAction({
									data: employee,
									type: 'delete',
								});
							},
						},
					]}
				/>,
			];
		});
	}, [employees]);

	const totalPages = useMemo(() => {
		return employees && employees.count !== null
			? Math.ceil(employees.count / currentLimit)
			: 0;
	}, [employees]);

	return (
		<div className='w-full'>
			<div className='flex flex-col lg:flex-row mb-4 gap-2 justify-between w-full'>
				<h1 className='text-2xl font-bold'>Employee Management</h1>
				<div className='flex gap-2'>
					<Input
						placeholder='Search...'
						onChange={(e) => handleChangeSearch(e.target.value)}
					/>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant='outline'>Create</Button>
						</DialogTrigger>
						<DialogCreateEmployee refetch={refetch} />
					</Dialog>
				</div>
			</div>
			<DataTable
				header={HEADER_TABLE_EMPLOYEE}
				data={filteredData}
				isLoading={isLoading}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>
			<DialogUpdateEmployee
				open={selectedAction !== null && selectedAction.type === 'update'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
			<DialogDeleteEmployee
				open={selectedAction !== null && selectedAction.type === 'delete'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
		</div>
	);
}
