import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
	colorClass = 'text-blue-600',
}: StatCardProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className={`h-4 w-4 ${colorClass}`} />
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold'>{value}</div>
				{description && (
					<p className='text-xs text-muted-foreground mt-1'>{description}</p>
				)}
				{trend && (
					<p
						className={`text-xs mt-1 ${
							trend.isPositive ? 'text-green-600' : 'text-red-600'
						}`}>
						{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
					</p>
				)}
			</CardContent>
		</Card>
	);
}
