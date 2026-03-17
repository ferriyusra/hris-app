import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
	title: string;
	value: number | string;
	icon: LucideIcon;
	description?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	colorClass?: string;
}

export default function StatCard({
	title,
	value,
	icon: Icon,
	description,
	trend,
	colorClass = 'text-primary',
}: StatCardProps) {
	return (
		<Card className='glass-card hover:shadow-[var(--shadow-card-hover)] transition-all duration-200'>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
				<div className={cn('flex h-9 w-9 items-center justify-center rounded-full bg-current/10', colorClass)}>
					<Icon className='h-4 w-4' />
				</div>
			</CardHeader>
			<CardContent>
				<div className='text-3xl font-bold tracking-tight'>{value}</div>
				{description && (
					<p className='text-xs text-muted-foreground mt-1'>{description}</p>
				)}
				{trend && (
					<div className='mt-2'>
						<span
							className={cn(
								'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
								trend.isPositive
									? 'bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400'
									: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
							)}>
							{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
