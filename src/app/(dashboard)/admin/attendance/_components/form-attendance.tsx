'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ATTENDANCE_STATUS_LIST } from '@/constants/attendance-constant';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AttendanceFormState } from '@/types/attendance';

interface FormAttendanceProps {
	state: AttendanceFormState;
	currentData?: {
		id?: string;
		employee_id?: string;
		date?: string;
		clock_in?: string;
		clock_out?: string;
		status?: string;
		notes?: string;
	};
}

export default function FormAttendance({
	state,
	currentData,
}: FormAttendanceProps) {
	const supabase = createClient();
	const [selectedDate, setSelectedDate] = useState(
		currentData?.date || format(new Date(), 'yyyy-MM-dd')
	);
	const [clockInTime, setClockInTime] = useState(
		currentData?.clock_in
			? format(new Date(currentData.clock_in), "HH:mm")
			: '09:00'
	);
	const [clockOutTime, setClockOutTime] = useState(
		currentData?.clock_out
			? format(new Date(currentData.clock_out), "HH:mm")
			: ''
	);

	// Fetch all employees
	const { data: employees } = useQuery({
		queryKey: ['employees'],
		queryFn: async () => {
			const { data, error } = await supabase
				.from('employees')
				.select('id, full_name, position')
				.eq('is_active', true)
				.order('full_name');

			if (error) throw error;
			return data;
		},
	});

	// Generate combined datetime strings
	const clockInDateTime = `${selectedDate}T${clockInTime}:00`;
	const clockOutDateTime = clockOutTime ? `${selectedDate}T${clockOutTime}:00` : '';

	return (
		<div className='flex flex-col gap-4'>
			{currentData?.id && <input type='hidden' name='id' value={currentData.id} />}

			{/* Employee Selection */}
			<div className='space-y-2'>
				<Label htmlFor='employee_id'>
					Karyawan <span className='text-red-500'>*</span>
				</Label>
				<select
					id='employee_id'
					name='employee_id'
					defaultValue={currentData?.employee_id || ''}
					className={cn(
						'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
						state?.errors?.employee_id && 'border-red-500'
					)}
					required
				>
					<option value='' disabled>Pilih karyawan</option>
					{employees?.map((emp) => (
						<option key={emp.id} value={emp.id}>
							{emp.full_name} - {emp.position}
						</option>
					))}
				</select>
				{state?.errors?.employee_id && (
					<p className='text-sm text-red-500'>{state.errors.employee_id[0]}</p>
				)}
			</div>

			{/* Date */}
			<div className='space-y-2'>
				<Label htmlFor='date'>
					Tanggal <span className='text-red-500'>*</span>
				</Label>
				<input
					type='date'
					id='date'
					name='date'
					value={selectedDate}
					onChange={(e) => setSelectedDate(e.target.value)}
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
					required
				/>
				{state?.errors?.date && (
					<p className='text-sm text-red-500'>{state.errors.date[0]}</p>
				)}
			</div>

			{/* Clock In Time */}
			<div className='space-y-2'>
				<Label htmlFor='clock_in_time'>
					Waktu Masuk <span className='text-red-500'>*</span>
				</Label>
				<input
					type='time'
					id='clock_in_time'
					value={clockInTime}
					onChange={(e) => setClockInTime(e.target.value)}
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
					required
				/>
				<input type='hidden' name='clock_in' value={clockInDateTime} />
				{state?.errors?.clock_in && (
					<p className='text-sm text-red-500'>{state.errors.clock_in[0]}</p>
				)}
			</div>

			{/* Clock Out Time (Optional) */}
			<div className='space-y-2'>
				<Label htmlFor='clock_out_time'>Waktu Keluar (Opsional)</Label>
				<input
					type='time'
					id='clock_out_time'
					value={clockOutTime}
					onChange={(e) => setClockOutTime(e.target.value)}
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
				/>
				{clockOutDateTime && <input type='hidden' name='clock_out' value={clockOutDateTime} />}
				{state?.errors?.clock_out && (
					<p className='text-sm text-red-500'>{state.errors.clock_out[0]}</p>
				)}
			</div>

			{/* Status */}
			<div className='space-y-2'>
				<Label htmlFor='status'>
					Status <span className='text-red-500'>*</span>
				</Label>
				<select
					id='status'
					name='status'
					defaultValue={currentData?.status || 'present'}
					className={cn(
						'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
						state?.errors?.status && 'border-red-500'
					)}
					required
				>
					{ATTENDANCE_STATUS_LIST.map((status) => (
						<option key={status.value} value={status.value}>
							{status.label}
						</option>
					))}
				</select>
				{state?.errors?.status && (
					<p className='text-sm text-red-500'>{state.errors.status[0]}</p>
				)}
			</div>

			{/* Notes (Optional) */}
			<div className='space-y-2'>
				<Label htmlFor='notes'>Catatan (Opsional)</Label>
				<Textarea
					id='notes'
					name='notes'
					placeholder='Tambahkan catatan tentang data kehadiran ini...'
					defaultValue={currentData?.notes}
					className='resize-none'
					rows={3}
				/>
				{state?.errors?.notes && (
					<p className='text-sm text-red-500'>{state.errors.notes[0]}</p>
				)}
			</div>

			{/* Form Error */}
			{state?.errors?._form && (
				<p className='text-sm text-red-500'>{state.errors._form[0]}</p>
			)}
		</div>
	);
}
