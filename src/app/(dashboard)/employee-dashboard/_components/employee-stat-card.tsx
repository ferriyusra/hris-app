import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmployeeStatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	description?: string;
	colorClass?: string;
	suffix?: string;
}

export default function EmployeeStatCard({
	title,
	value,
	icon: Icon,
	description,
	colorClass = 'text-blue-600',
	suffix,
}: EmployeeStatCardProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className={cn('h-5 w-5', colorClass)} />
			</CardHeader>
			<CardContent>
				<div className='text-3xl font-bold'>
					{value}
					{suffix && <span className='text-xl ml-1'>{suffix}</span>}
				</div>
				{description && (
					<p className='text-xs text-muted-foreground mt-2'>{description}</p>
				)}
			</CardContent>
		</Card>
	);
}
