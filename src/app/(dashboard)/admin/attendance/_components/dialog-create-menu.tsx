import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createAttendance } from '../actions';
import { toast } from 'sonner';
import { Preview } from '@/types/general';
import { MenuForm, menuFormSchema } from '@/validations/menu-validation';
import { INITIAL_MENU, INITIAL_STATE_MENU } from '@/constants/attendance-constant';
import FormMenu from './form-menu';

export default function DialogcreateAttendance({ refetch }: { refetch: () => void }) {
	const form = useForm<MenuForm>({
		resolver: zodResolver(menuFormSchema),
		defaultValues: INITIAL_MENU,
	});

	const [createAttendanceState, createAttendanceAction, isPendingcreateAttendance] =
		useActionState(createAttendance, INITIAL_STATE_MENU);

	const [preview, setPreview] = useState<Preview | undefined>(undefined);

	const onSubmit = form.handleSubmit((data) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			formData.append(key, key === 'image_url' ? preview!.file ?? '' : value);
		});

		startTransition(() => {
			createAttendanceAction(formData);
		});
	});

	useEffect(() => {
		if (createAttendanceState?.status === 'error') {
			toast.error('Create Menu Failed', {
				description: createAttendanceState.errors?._form?.[0],
			});
		}

		if (createAttendanceState?.status === 'success') {
			toast.success('Create Menu Success');
			form.reset();
			setPreview(undefined);
			document.querySelector<HTMLButtonElement>('[data-state="open"]')?.click();
			refetch();
		}
	}, [createAttendanceState]);

	return (
		<FormMenu
			form={form}
			onSubmit={onSubmit}
			isLoading={isPendingcreateAttendance}
			type='Create'
			preview={preview}
			setPreview={setPreview}
		/>
	);
}
