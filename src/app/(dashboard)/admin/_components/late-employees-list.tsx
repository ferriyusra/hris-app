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
						Karyawan Terlambat Hari Ini
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className='text-sm text-muted-foreground text-center py-4'>
						Tidak ada karyawan yang terlambat hari ini!
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
					Karyawan Terlambat Hari Ini ({employees.length})
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='divide-y divide-border'>
					{employees.map((employee) => (
						<div
							key={employee.id}
							className='flex items-center justify-between py-3 px-2 rounded-lg hover:bg-primary/5 transition-colors duration-150'>
							<div className='flex items-center gap-3'>
								<div className='flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-semibold dark:bg-amber-950/30 dark:text-amber-400'>
									{employee.employee_name?.charAt(0)?.toUpperCase()}
								</div>
								<div>
									<p className='font-medium'>{employee.employee_name}</p>
									<p className='text-sm text-muted-foreground font-mono'>
										Jam masuk: {employee.clock_in}
									</p>
								</div>
							</div>
							<div className='text-right'>
								<span className='inline-flex items-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-0.5 text-xs font-medium'>
									Terlambat {employee.minutes_late} menit
								</span>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
