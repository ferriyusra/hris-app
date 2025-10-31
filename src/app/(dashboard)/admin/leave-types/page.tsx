'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllLeaveTypes } from './actions';
import { LeaveType } from '@/types/leave';
import DataTable from '@/components/common/data-table';
import { Badge } from '@/components/ui/badge';
import useDataTable from '@/hooks/use-data-table';
import { HEADER_TABLE_LEAVE_TYPES } from '@/constants/leave-constant';
import { useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import DialogCreateLeaveType from './_components/dialog-create-leave-type';
import DialogUpdateLeaveType from './_components/dialog-update-leave-type';
import DialogDeleteLeaveType from './_components/dialog-delete-leave-type';

export default function AdminLeaveTypesPage() {
	const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
	const [actionType, setActionType] = useState<'create' | 'update' | 'delete' | null>(null);
	const { currentPage, currentLimit, handleChangePage, handleChangeLimit } = useDataTable();

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const result = await getAllLeaveTypes();
			setLeaveTypes(result.data || []);
			setIsLoading(false);
		}

		fetchData();
	}, []);

	const filteredData = useMemo(() => {
		const startIndex = (currentPage - 1) * currentLimit;
		const endIndex = startIndex + currentLimit;
		const paginatedTypes = leaveTypes.slice(startIndex, endIndex);

		return paginatedTypes.map((type, index) => {
			return [
				startIndex + index + 1,
				<span key={`name-${type.id}`} className='font-medium'>{type.name}</span>,
				<span key={`desc-${type.id}`} className='text-sm text-muted-foreground'>{type.description || '-'}</span>,
				<span key={`days-${type.id}`}>{type.max_days_per_year} hari</span>,
				<Badge key={`approval-${type.id}`} variant={type.requires_approval ? 'default' : 'secondary'}>
					{type.requires_approval ? 'Ya' : 'Tidak'}
				</Badge>,
				<Badge
					key={`status-${type.id}`}
					className={
						type.is_active
							? 'bg-blue-100 text-blue-800 border-blue-200'
							: 'bg-gray-100 text-gray-800 border-gray-200'
					}>
					{type.is_active ? 'Aktif' : 'Nonaktif'}
				</Badge>,
				<div key={`actions-${type.id}`} className='flex gap-1'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => {
							setSelectedType(type);
							setActionType('update');
						}}>
						<Pencil className='h-4 w-4 text-blue-600' />
					</Button>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => {
							setSelectedType(type);
							setActionType('delete');
						}}>
						<Trash2 className='h-4 w-4 text-red-600' />
					</Button>
				</div>,
			];
		});
	}, [leaveTypes, currentPage, currentLimit]);

	const totalPages = Math.ceil(leaveTypes.length / currentLimit);

	const closeDialog = () => {
		setSelectedType(null);
		setActionType(null);
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Manajemen Jenis Cuti</h1>
					<p className='text-muted-foreground'>
						Kelola jenis cuti dan konfigurasi pengaturannya
					</p>
				</div>
				<Button onClick={() => setActionType('create')}>
					<Plus className='h-4 w-4 mr-2' />
					Tambah Jenis Cuti
				</Button>
			</div>

			<div>
				{isLoading ? (
					<p className='text-muted-foreground'>Memuat...</p>
				) : (
					<DataTable
						header={HEADER_TABLE_LEAVE_TYPES}
						data={filteredData}
						isLoading={false}
						totalPages={totalPages}
						currentPage={currentPage}
						currentLimit={currentLimit}
						onChangePage={handleChangePage}
						onChangeLimit={handleChangeLimit}
					/>
				)}
			</div>

			<DialogCreateLeaveType
				open={actionType === 'create'}
				onOpenChange={(open) => !open && closeDialog()}
			/>

			<DialogUpdateLeaveType
				open={actionType === 'update'}
				onOpenChange={(open) => !open && closeDialog()}
				leaveType={selectedType}
			/>

			<DialogDeleteLeaveType
				open={actionType === 'delete'}
				onOpenChange={(open) => !open && closeDialog()}
				leaveType={selectedType}
			/>
		</div>
	);
}
