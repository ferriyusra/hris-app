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
	colorClass = 'text-primary',
	suffix,
}: EmployeeStatCardProps) {
	return (
		<Card className='glass-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-200'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
				<div className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-current/10', colorClass)}>
					<Icon className='h-4 w-4' />
				</div>
			</CardHeader>
			<CardContent>
				<div className='text-3xl font-bold tracking-tight'>
					{value}
					{suffix && <span className='text-lg text-muted-foreground ml-1 font-medium'>{suffix}</span>}
				</div>
				{description && (
					<p className='text-xs text-muted-foreground mt-2'>{description}</p>
				)}
			</CardContent>
		</Card>
	);
}
