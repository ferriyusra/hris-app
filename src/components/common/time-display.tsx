import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimeDisplayProps {
	timestamp: string | null;
	formatStr?: string;
	emptyText?: string;
	className?: string;
}

export function TimeDisplay({
	timestamp,
	formatStr = 'HH:mm:ss',
	emptyText = '-',
	className,
}: TimeDisplayProps) {
	if (!timestamp) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}

	try {
		const date = new Date(timestamp);
		return <span className={className}>{format(date, formatStr)}</span>;
	} catch (error) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}
}

interface DateDisplayProps {
	date: string | null;
	formatStr?: string;
	emptyText?: string;
	className?: string;
}

export function DateDisplay({
	date,
	formatStr = 'dd MMM yyyy',
	emptyText = '-',
	className,
}: DateDisplayProps) {
	if (!date) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}

	try {
		const dateObj = new Date(date);
		return <span className={className}>{format(dateObj, formatStr)}</span>;
	} catch (error) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}
}

interface DurationDisplayProps {
	startTime: string | null;
	endTime: string | null;
	emptyText?: string;
	className?: string;
}

export function DurationDisplay({
	startTime,
	endTime,
	emptyText = '-',
	className,
}: DurationDisplayProps) {
	if (!startTime || !endTime) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}

	try {
		const start = new Date(startTime);
		const end = new Date(endTime);
		const durationMs = end.getTime() - start.getTime();
		const hours = Math.floor(durationMs / (1000 * 60 * 60));
		const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

		return (
			<span className={className}>
				{hours}h {minutes}m
			</span>
		);
	} catch (error) {
		return <span className={cn('text-muted-foreground', className)}>{emptyText}</span>;
	}
}
