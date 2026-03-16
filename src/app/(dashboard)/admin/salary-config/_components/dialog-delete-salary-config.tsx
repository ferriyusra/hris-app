import DialogDelete from '@/components/common/dialog-delete';
import { startTransition, useActionState, useEffect } from 'react';
import { deleteSalaryConfig } from '../actions';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { toast } from 'sonner';
import { SalaryConfig } from '@/types/payroll';

export default function DialogDeleteSalaryConfig({
	open,
	refetch,
	currentData,
	handleChangeAction,
}: {
	refetch: () => void;
	currentData?: SalaryConfig;
	open: boolean;
	handleChangeAction: (open: boolean) => void;
}) {
	const [state, action, isPending] = useActionState(
		deleteSalaryConfig,
		INITIAL_STATE_ACTION
	);

	const onSubmit = () => {
		const formData = new FormData();
		formData.append('id', currentData!.id as string);
		startTransition(() => {
			action(formData);
		});
	};

	useEffect(() => {
		if (state?.status === 'error') {
			toast.error('Gagal Menghapus Konfigurasi Gaji', {
				description: state.errors?._form?.[0],
			});
		}

		if (state?.status === 'success') {
			toast.success('Konfigurasi Gaji Berhasil Dihapus');
			handleChangeAction?.(false);
			refetch();
		}
	}, [state]);

	return (
		<DialogDelete
			open={open}
			onOpenChange={handleChangeAction}
			isLoading={isPending}
			onSubmit={onSubmit}
			title='Konfigurasi Gaji'
		/>
	);
}
