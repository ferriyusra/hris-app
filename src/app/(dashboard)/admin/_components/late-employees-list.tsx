'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { LateEmployee } from '../actions';

interface LateEmployeesListProps {
	employees: LateEmployee[];
}

export default function LateEmployeesList({ employees }: LateEmployeesListProps) {
	if (employees.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='text-lg flex items-center gap-2'>
						<Clock className='h-5 w-5 text-orange-600' />
						Late Employees Today
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-sm text-muted-foreground text-center py-4'>
						No late employees today! 🎉
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg flex items-center gap-2'>
					<Clock className='h-5 w-5 text-orange-600' />
					Late Employees Today ({employees.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{employees.map((employee) => (
						<div
							key={employee.id}
							className='flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'>
							<div>
								<p className='font-medium'>{employee.employee_name}</p>
								<p className='text-sm text-muted-foreground'>
									Clock in: {employee.clock_in}
								</p>
							</div>
							<div className='text-right'>
								<p className='text-sm font-semibold text-orange-600'>
									{employee.minutes_late} min late
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
