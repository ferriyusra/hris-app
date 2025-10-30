import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeeDashboardLoading() {
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div>
				<Skeleton className='h-9 w-48 mb-2' />
				<Skeleton className='h-5 w-64' />
			</div>

			{/* Clock In/Out Card */}
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-40' />
				</CardHeader>
				<CardContent className='space-y-4'>
					<Skeleton className='h-20 w-full' />
					<Skeleton className='h-10 w-full' />
				</CardContent>
			</Card>

			{/* Monthly Statistics */}
			<div className='grid gap-4 md:grid-cols-4'>
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-5 w-5 rounded-full' />
						</CardHeader>
						<CardContent>
							<Skeleton className='h-9 w-20 mb-2' />
							<Skeleton className='h-3 w-32' />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Leave Balance */}
			<div>
				<Skeleton className='h-7 w-40 mb-4' />
				<div className='grid gap-4 md:grid-cols-3'>
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<Skeleton className='h-4 w-24' />
								<Skeleton className='h-5 w-5 rounded-full' />
							</CardHeader>
							<CardContent>
								<Skeleton className='h-9 w-20 mb-2' />
								<Skeleton className='h-3 w-32' />
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Attendance Calendar */}
			<Card>
				<CardHeader>
					<Skeleton className='h-6 w-64' />
				</CardHeader>
				<CardContent>
					<div className='space-y-2'>
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<Skeleton key={i} className='h-16 w-full' />
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
