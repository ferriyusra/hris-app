'use client';

import DataTable from '@/components/common/data-table';
import DropdownAction from '@/components/common/dropdown-action';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { HEADER_TABLE_USER } from '@/constants/user-constant';
import useDataTable from '@/hooks/use-data-table';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import DialogCreateUser from './dialog-create-user';
import { Profile } from '@/types/auth';
import DialogUpdateUser from './dialog-update-user';
import DialogDeleteUser from './dialog-delete-user';

export default function UserManagement() {
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
		data: users,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['users', currentPage, currentLimit, currentSearch],
		queryFn: async () => {
			const result = await supabase
				.from('profiles')
				.select('*', { count: 'exact' })
				.range((currentPage - 1) * currentLimit, currentPage * currentLimit - 1)
				.order('created_at')
				.ilike('name', `%${currentSearch}%`);

			if (result.error)
				toast.error('Gagal mengambil data pengguna', {
					description: result.error.message,
				});

			return result;
		},
	});

	const [selectedAction, setSelectedAction] = useState<{
		data: Profile;
		type: 'update' | 'delete';
	} | null>(null);

	const handleChangeAction = (open: boolean) => {
		if (!open) setSelectedAction(null);
	};

	const filteredData = useMemo(() => {
		return (users?.data || []).map((user, index) => {
			return [
				index + 1,
				user.id,
				user.name,
				user.role,
				// eslint-disable-next-line react/jsx-key
				<DropdownAction
					menu={[
						{
							label: (
								<span className='flex gap-2 item-center'>
									<Pencil />
									Ubah
								</span>
							),
							action: () => {
								setSelectedAction({
									data: user,
									type: 'update',
								});
							},
						},
						{
							label: (
								<span className='flex gap-2 item-center'>
									<Trash2 className='text-red-400' />
									Hapus
								</span>
							),
							variant: 'destructive',
							action: () => {
								setSelectedAction({
									data: user,
									type: 'delete',
								});
							},
						},
					]}
				/>,
			];
		});
	}, [users]);

	const totalPages = useMemo(() => {
		return users && users.count !== null
			? Math.ceil(users.count / currentLimit)
			: 0;
	}, [users]);

	return (
		<div className='w-full'>
			<div className='flex flex-col justify-between w-full gap-2 mb-4 lg:flex-row'>
				<h1 className='text-2xl font-bold tracking-tight'>Manajemen Pengguna</h1>
				<div className='flex gap-2'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
						<Input
							placeholder='Cari berdasarkan nama'
							onChange={(e) => handleChangeSearch(e.target.value)}
							className='pl-9'
						/>
					</div>
					<Dialog>
						<DialogTrigger asChild>
							<Button><Plus className='mr-2 h-4 w-4' />Tambah</Button>
						</DialogTrigger>
						<DialogCreateUser refetch={refetch} />
					</Dialog>
				</div>
			</div>
			<DataTable
				header={HEADER_TABLE_USER}
				data={filteredData}
				isLoading={isLoading}
				totalPages={totalPages}
				currentPage={currentPage}
				currentLimit={currentLimit}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>
			<DialogUpdateUser
				open={selectedAction !== null && selectedAction.type === 'update'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
			<DialogDeleteUser
				open={selectedAction !== null && selectedAction.type === 'delete'}
				refetch={refetch}
				currentData={selectedAction?.data}
				handleChangeAction={handleChangeAction}
			/>
		</div>
	);
}
