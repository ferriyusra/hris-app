import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { Combobox, ComboboxOption } from '../ui/combobox';
import { cn } from '@/lib/utils';

export default function FormCombobox<T extends FieldValues>({
	form,
	name,
	label,
	options,
	onValueChange,
	placeholder,
	searchPlaceholder,
	emptyText,
}: {
	form: UseFormReturn<T>;
	name: Path<T>;
	label: string;
	options: ComboboxOption[];
	onValueChange?: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
}) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field: { onChange, value, ...rest } }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<Combobox
							{...rest}
							options={options}
							value={value}
							onValueChange={(newValue) => {
								onChange(newValue);
								onValueChange?.(newValue);
							}}
							placeholder={placeholder || `Select ${label}`}
							searchPlaceholder={searchPlaceholder || `Search ${label.toLowerCase()}...`}
							emptyText={emptyText || `No ${label.toLowerCase()} found.`}
							className={cn({
								'border-red-500': form.formState.errors[name]?.message,
							})}
						/>
					</FormControl>
					<FormMessage className='text-xs' />
				</FormItem>
			)}
		/>
	);
}
