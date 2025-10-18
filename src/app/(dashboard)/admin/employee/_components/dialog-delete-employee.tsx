import DialogDelete from '@/components/common/dialog-delete';
import { startTransition, useActionState, useEffect } from 'react';
import { deleteEmployee } from '../actions';
import { INITIAL_STATE_ACTION } from '@/constants/general-constant';
import { toast } from 'sonner';
import { Table } from '@/validations/employee-validation';

export default function DialogDeleteEmployee({
	open,
	refetch,
	currentData,
	handleChangeAction,
}: {
	refetch: () => void;
	currentData?: Table;
	open: boolean;
	handleChangeAction: (open: boolean) => void;
}) {
	const [deleteEmployeeState, deleteEmployeeAction, isPendingdeleteEmployee] =
		useActionState(deleteEmployee, INITIAL_STATE_ACTION);

	const onSubmit = () => {
		const formData = new FormData();
		formData.append('id', currentData!.id as string);
		startTransition(() => {
			deleteEmployeeAction(formData);
		});
	};

	useEffect(() => {
		if (deleteEmployeeState?.status === 'error') {
			toast.error('Delete Employee Failed', {
				description: deleteEmployeeState.errors?._form?.[0],
			});
		}

		if (deleteEmployeeState?.status === 'success') {
			toast.success('Delete Employee Success');
			handleChangeAction?.(false);
			refetch();
		}
	}, [deleteEmployeeState]);

	return (
		<DialogDelete
			open={open}
			onOpenChange={handleChangeAction}
			isLoading={isPendingdeleteEmployee}
			onSubmit={onSubmit}
			title='Table'
		/>
	);
}
