import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export default function FormInput<T extends FieldValues>({
	form,
	name,
	label,
	placeholder,
	type = 'text',
	min,
	max,
}: {
	form: UseFormReturn<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
	type?: string;
	min?: string;
	max?: string;
}) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field: { ...rest } }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						{type === 'textarea' ? (
							<Textarea
								{...rest}
								placeholder={placeholder}
								autoComplete='off'
								className='resize-none'
							/>
						) : (
							<Input
								{...rest}
								type={type}
								placeholder={placeholder}
								autoComplete='off'
								min={min}
								max={max}
							/>
						)}
					</FormControl>
					<FormMessage className='text-xs' />
				</FormItem>
			)}
		/>
	);
}
