'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { assignLeaveBalance } from '../actions';
import { LeaveType } from '@/types/leave';

const INITIAL_STATE = {
	status: 'idle' as const,
	errors: {},
};

interface DialogAssignBalanceProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeId: string;
	employeeName: string;
	leaveTypes: LeaveType[];
}

export default function DialogAssignBalance({
	open,
	onOpenChange,
	employeeId,
	employeeName,
	leaveTypes,
}: DialogAssignBalanceProps) {
	const [leaveTypeId, setLeaveTypeId] = useState('');
	const [totalDays, setTotalDays] = useState('');
	const currentYear = new Date().getFullYear();

	const [state, formAction, isPending] = useActionState(assignLeaveBalance, INITIAL_STATE);
	const hasShownToastRef = useRef(false);

	// Auto-fill total days when leave type is selected
	const handleLeaveTypeChange = (value: string) => {
		setLeaveTypeId(value);
		const selectedType = leaveTypes.find((t) => t.id === value);
		if (selectedType) {
			setTotalDays(String(selectedType.max_days_per_year));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!leaveTypeId) {
			toast.error('Please select a leave type');
			return;
		}

		const formData = new FormData();
		formData.append('employee_id', employeeId);
		formData.append('leave_type_id', leaveTypeId);
		formData.append('total_days', totalDays);
		formData.append('year', String(currentYear));

		hasShownToastRef.current = false;

		startTransition(() => {
			formAction(formData);
		});
	};

	useEffect(() => {
		if (hasShownToastRef.current) return;

		if (state.status === 'error') {
			toast.error('Assign Leave Balance Failed', {
				description: state.errors?._form?.[0] || 'Failed to assign leave balance',
			});
			hasShownToastRef.current = true;
		}

		if (state.status === 'success') {
			toast.success('Leave Balance Assigned Successfully');
			setLeaveTypeId('');
			setTotalDays('');
			onOpenChange(false);
			hasShownToastRef.current = true;
			window.location.reload();
		}
	}, [state, onOpenChange]);

	// Get selected leave type info for display
	const selectedLeaveType = leaveTypes.find((t) => t.id === leaveTypeId);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Assign Leave Balance</DialogTitle>
					<p className='text-sm text-muted-foreground mt-2'>
						Assign leave balance to <strong>{employeeName}</strong> for year{' '}
						{currentYear}
					</p>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='leave_type_id'>Leave Type</Label>
						<Select value={leaveTypeId} onValueChange={handleLeaveTypeChange}>
							<SelectTrigger>
								<SelectValue placeholder='Select leave type' />
							</SelectTrigger>
							<SelectContent>
								{leaveTypes.map((type) => (
									<SelectItem key={type.id} value={type.id}>
										{type.name} ({type.max_days_per_year} days)
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedLeaveType?.description && (
							<p className='text-xs text-muted-foreground'>
								{selectedLeaveType.description}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='total_days'>
							Total Days
							{selectedLeaveType && (
								<span className='text-muted-foreground font-normal ml-2'>
									(Default: {selectedLeaveType.max_days_per_year} days)
								</span>
							)}
						</Label>
						<Input
							type='number'
							id='total_days'
							value={totalDays}
							onChange={(e) => setTotalDays(e.target.value)}
							min='1'
							max='365'
							placeholder='Select leave type first'
							disabled={!leaveTypeId}
						/>
						<p className='text-xs text-muted-foreground'>
							Auto-filled from leave type settings. You can customize it for this employee.
						</p>
					</div>

					<div className='flex justify-end gap-2 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isPending}>
							Cancel
						</Button>
						<Button type='submit' disabled={isPending}>
							{isPending ? 'Assigning...' : 'Assign Leave Balance'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
