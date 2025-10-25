import { Badge } from '@/components/ui/badge';
import { ATTENDANCE_STATUS_LIST } from '@/constants/attendance-constant';
import type { AttendanceStatus } from '@/types/attendance';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
	status: AttendanceStatus;
	className?: string;
}

export function AttendanceStatusBadge({
	status,
	className,
}: AttendanceStatusBadgeProps) {
	const statusConfig = ATTENDANCE_STATUS_LIST.find((s) => s.value === status);

	if (!statusConfig) {
		return null;
	}

	return (
		<Badge
			className={cn(
				statusConfig.bgColor,
				statusConfig.textColor,
				'border-0',
				className
			)}
		>
			{statusConfig.label}
		</Badge>
	);
}
