import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';

export default function FormTextarea<T extends FieldValues>({
	form,
	name,
	label,
	placeholder,
	rows = 3,
}: {
	form: UseFormReturn<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	rows?: number;
}) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Textarea
							{...field}
							placeholder={placeholder}
							rows={rows}
							className='resize-none'
						/>
					</FormControl>
					<FormMessage className='text-xs' />
				</FormItem>
			)}
		/>
	);
}
