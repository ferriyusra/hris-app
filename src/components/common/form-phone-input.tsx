import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

export default function FormPhoneInput<T extends FieldValues>({
	form,
	name,
	label,
	placeholder = '812-3456-7890',
}: {
	form: UseFormReturn<T>;
	name: Path<T>;
	label: string;
	placeholder?: string;
}) {
	// Format phone number Indonesia
	const formatPhoneNumber = (value: string) => {
		// Remove all non-digits
		const digits = value.replace(/\D/g, '');

		// Remove leading 0 or +62
		let cleaned = digits;
		if (cleaned.startsWith('62')) {
			cleaned = cleaned.substring(2);
		} else if (cleaned.startsWith('0')) {
			cleaned = cleaned.substring(1);
		}

		// Format: 812-3456-7890 or 812-345-678 (depends on length)
		if (cleaned.length <= 3) {
			return cleaned;
		} else if (cleaned.length <= 7) {
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
		} else if (cleaned.length <= 11) {
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
		} else {
			// Limit to 11 digits (Indonesian phone number max length)
			return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
		}
	};

	// Get display value (formatted)
	const getDisplayValue = (value: string | undefined | null) => {
		if (!value || value === '') return '';
		return formatPhoneNumber(value);
	};

	// Get storage value (unformatted, with +62 prefix)
	const getStorageValue = (value: string) => {
		if (!value || value === '') return '';
		const digits = value.replace(/\D/g, '');
		if (!digits) return '';

		let cleaned = digits;
		if (cleaned.startsWith('62')) {
			cleaned = cleaned.substring(2);
		} else if (cleaned.startsWith('0')) {
			cleaned = cleaned.substring(1);
		}

		return `+62${cleaned}`;
	};

	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field: { onChange, value, ...rest } }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<FormControl>
						<div className='relative'>
							<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground'>
								+62
							</div>
							<Input
								{...rest}
								type='tel'
								placeholder={placeholder}
								value={getDisplayValue(value || '')}
								onChange={(e) => {
									const formatted = formatPhoneNumber(e.target.value);
									const stored = getStorageValue(e.target.value);
									// Update form with storage format (+62xxx)
									onChange(stored);
								}}
								className={cn('pl-12', {
									'border-red-500': form.formState.errors[name]?.message,
								})}
							/>
						</div>
					</FormControl>
					<FormMessage className='text-xs' />
				</FormItem>
			)}
		/>
	);
}
