'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect, useActionState, useRef, startTransition } from 'react';
import { getAllEmployeesWithBalances, removeLeaveBalance } from './actions';
import { getAllLeaveTypes } from '../leave-types/actions';
import { LeaveType } from '@/types/leave';
import DialogAssignBalance from './_components/dialog-assign-balance';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface EmployeeWithBalances {
	id: string;
	full_name: string;
	position: string;
	balances: any[];
}

export default function AdminLeaveBalancePage() {
	const [employees, setEmployees] = useState<EmployeeWithBalances[]>([]);
	const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithBalances | null>(null);
	const [showAssignDialog, setShowAssignDialog] = useState(false);
	const [balanceToRemove, setBalanceToRemove] = useState<any>(null);

	const [removeState, removeAction, isRemoving] = useActionState(removeLeaveBalance, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const [empResult, typesResult] = await Promise.all([
				getAllEmployeesWithBalances(),
				getAllLeaveTypes(),
			]);
			setEmployees(empResult.data || []);
			setLeaveTypes((typesResult.data || []).filter((t: LeaveType) => t.is_active));
			setIsLoading(false);
		}

		fetchData();
	}, []);

	const handleAssignClick = (employee: EmployeeWithBalances) => {
		setSelectedEmployee(employee);
		setShowAssignDialog(true);
	};

	const handleRemoveBalance = () => {
		if (!balanceToRemove) return;

		const formData = new FormData();
		formData.append('balance_id', balanceToRemove.id);

		hasShownToastRef.current = false;

		startTransition(() => {
			removeAction(formData);
		});
	};

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (removeState.status === 'error') {
			toast.error('Remove Leave Balance Failed', {
				description: removeState.errors?._form?.[0] || 'Failed to remove leave balance',
			});
			hasShownToastRef.current = true;
		}

		if (removeState.status === 'success') {
			toast.success('Leave Balance Removed Successfully');
			setBalanceToRemove(null);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [removeState]);

	const currentYear = new Date().getFullYear();

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold'>Employee Leave Balance</h1>
				<p className='text-muted-foreground'>
					Assign and manage leave balances for employees ({currentYear})
				</p>
			</div>

			{isLoading ? (
				<p className='text-muted-foreground'>Loading...</p>
			) : employees.length === 0 ? (
				<p className='text-muted-foreground'>No active employees found</p>
			) : (
				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{employees.map((employee) => (
						<Card key={employee.id}>
							<CardHeader>
								<CardTitle className='text-lg flex items-center justify-between'>
									<div>
										<p className='font-semibold'>{employee.full_name}</p>
										<p className='text-sm text-muted-foreground font-normal'>
											{employee.position}
										</p>
									</div>
									<Button
										size='sm'
										variant='outline'
										onClick={() => handleAssignClick(employee)}>
										<Plus className='h-4 w-4' />
									</Button>
								</CardTitle>
							</CardHeader>
							<CardContent>
								{employee.balances.length === 0 ? (
									<p className='text-sm text-muted-foreground'>
										No leave balances assigned
									</p>
								) : (
									<div className='space-y-3'>
										{employee.balances.map((balance: any) => (
											<div
												key={balance.id}
												className='flex items-center justify-between p-3 rounded-lg border bg-card'>
												<div className='flex-1'>
													<p className='font-medium text-sm'>
														{balance.leave_type?.name || 'Unknown'}
													</p>
													<div className='flex gap-2 mt-1'>
														<Badge variant='outline' className='text-xs'>
															Total: {balance.total_days}d
														</Badge>
														<Badge variant='outline' className='text-xs text-orange-600'>
															Used: {balance.used_days}d
														</Badge>
														<Badge variant='outline' className='text-xs text-green-600'>
															Remaining: {balance.remaining_days}d
														</Badge>
													</div>
												</div>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => setBalanceToRemove(balance)}>
													<Trash2 className='h-4 w-4 text-red-500' />
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{selectedEmployee && (
				<DialogAssignBalance
					open={showAssignDialog}
					onOpenChange={setShowAssignDialog}
					employeeId={selectedEmployee.id}
					employeeName={selectedEmployee.full_name}
					leaveTypes={leaveTypes}
				/>
			)}

			<AlertDialog
				open={balanceToRemove !== null}
				onOpenChange={(open) => !open && setBalanceToRemove(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Leave Balance</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove this leave balance? This action cannot
							be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleRemoveBalance} disabled={isRemoving}>
							{isRemoving ? 'Removing...' : 'Remove'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
