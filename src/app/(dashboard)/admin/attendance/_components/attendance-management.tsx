'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { AttendanceStatusBadge } from '@/components/common/attendance-status-badge';
import { TimeDisplay, DateDisplay, DurationDisplay } from '@/components/common/time-display';
import { Pencil, Trash2, Plus, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import useDataTable from '@/hooks/use-data-table';
import { getAllAttendance } from '../actions';
import { HEADER_TABLE_ATTENDANCE, ATTENDANCE_STATUS_LIST } from '@/constants/attendance-constant';
import DialogCreateAttendance from './dialog-create-attendance';
import DialogUpdateAttendance from './dialog-update-attendance';
import DialogDeleteAttendance from './dialog-delete-attendance';
import type { AttendanceRecordWithEmployee } from '@/types/attendance';
import Link from 'next/link';

export default function AttendanceManagement() {
	const {
		currentPage,
		currentLimit,
		currentSearch,
		handleChangePage,
		handleChangeLimit,
		handleChangeSearch,
	} = useDataTable();

	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<{
		data: AttendanceRecordWithEmployee;
		type: 'update' | 'delete';
	} | null>(null);

	const {
		data: attendanceData,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['admin-attendance', currentPage, currentLimit, currentSearch, statusFilter],
		queryFn: async () => {
			const result = await getAllAttendance({
				search: currentSearch,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				limit: currentLimit,
				offset: (currentPage - 1) * currentLimit,
			});

			if (result.error) {
				toast.error('Gagal mengambil data kehadiran', {
					description: result.error,
				});
			}

			return result;
		},
	});

	const records = attendanceData?.data || [];
	const totalCount = attendanceData?.count || 0;

	const handleChangeAction = (open: boolean) => {
		if (!open) setSelectedAction(null);
	};

	const tableData = useMemo(() => {
		return records.map((record: AttendanceRecordWithEmployee, index: number) => [
			(currentPage - 1) * currentLimit + index + 1,
			<div key={`employee-${record.id}`}>
				<div className='font-medium'>{record.employee_name}</div>
				<div className='text-sm text-muted-foreground'>{record.employee_position}</div>
			</div>,
			<DateDisplay key={`date-${record.id}`} date={record.date} formatStr='dd MMM yyyy' />,
			<TimeDisplay key={`clock-in-${record.id}`} timestamp={record.clock_in} formatStr='HH:mm' />,
			<TimeDisplay key={`clock-out-${record.id}`} timestamp={record.clock_out} formatStr='HH:mm' />,
			<DurationDisplay
				key={`duration-${record.id}`}
				startTime={record.clock_in}
				endTime={record.clock_out}
			/>,
			<AttendanceStatusBadge key={`status-${record.id}`} status={record.status} />,
			<DropdownAction
				key={`action-${record.id}`}
				menu={[
					{
						label: (
							<span className='flex items-center gap-2'>
								<Pencil className='h-4 w-4' />
								Ubah
							</span>
						),
						action: () => {
							setSelectedAction({
								data: record,
								type: 'update',
							});
						},
					},
					{
						label: (
							<span className='flex items-center gap-2'>
								<Trash2 className='h-4 w-4 text-red-400' />
								Hapus
							</span>
						),
						variant: 'destructive',
						action: () => {
							setSelectedAction({
								data: record,
								type: 'delete',
							});
						},
					},
				]}
			/>,
		]);
	}, [records, currentPage, currentLimit]);

	const totalPages = useMemo(() => {
		return totalCount ? Math.ceil(totalCount / currentLimit) : 0;
	}, [totalCount, currentLimit]);

	const handleExport = () => {
		// Export functionality
		toast.success('Fitur ekspor akan segera hadir');
	};

	return (
		<div className='w-full space-y-4'>
			{/* Header */}
			<div className='flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center'>
				<div>
					<h1 className='text-2xl font-bold'>Manajemen Kehadiran</h1>
					<p className='text-muted-foreground'>
						Kelola catatan kehadiran karyawan dan lihat laporan terperinci
					</p>
				</div>
				<Link href='/admin/attendance/reports'>
					<Button variant='outline'>
						<FileDown className='mr-2 h-4 w-4' />
						Lihat Laporan
					</Button>
				</Link>
			</div>

			{/* Filters */}
			<div className='flex flex-col sm:flex-row gap-2'>
				<Input
					placeholder='Cari nama karyawan...'
					onChange={(e) => handleChangeSearch(e.target.value)}
					className='sm:max-w-xs'
				/>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className='sm:w-[180px]'>
						<SelectValue placeholder='Filter berdasarkan status' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Semua Status</SelectItem>
						{ATTENDANCE_STATUS_LIST.map((status) => (
							<SelectItem key={status.value} value={status.value}>
								{status.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button onClick={() => setCreateDialogOpen(true)} className='sm:ml-auto'>
					<Plus className='mr-2 h-4 w-4' />
					Tambah Kehadiran
				</Button>
			</div>

			{/* Data Table */}
			<DataTable
				header={HEADER_TABLE_ATTENDANCE}
				data={tableData}
				isLoading={isLoading}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>

			{/* Dialogs */}
			<DialogCreateAttendance
				open={createDialogOpen}
				onOpenChange={setCreateDialogOpen}
				refetch={refetch}
			/>
			<DialogUpdateAttendance
				open={selectedAction !== null && selectedAction.type === 'update'}
				onOpenChange={handleChangeAction}
				refetch={refetch}
				currentData={selectedAction?.data}
			/>
			<DialogDeleteAttendance
				open={selectedAction !== null && selectedAction.type === 'delete'}
				onOpenChange={handleChangeAction}
				refetch={refetch}
				currentData={selectedAction?.data}
			/>
		</div>
	);
}
