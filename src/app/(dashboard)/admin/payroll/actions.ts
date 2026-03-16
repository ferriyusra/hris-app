'use server';

import { createClient } from '@/lib/supabase/server';
import { PayrollFormState } from '@/types/payroll';
import { payrollSchema } from '@/validations/payroll-validation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function getAllPayrollRuns() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('payroll_runs')
			.select('*')
			.order('year', { ascending: false })
			.order('month', { ascending: false });

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('getAllPayrollRuns error:', error);
		return {
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'Gagal mengambil data penggajian',
		};
	}
}

export async function createPayrollRun(
	prevState: PayrollFormState,
	formData: FormData
): Promise<PayrollFormState> {
	const validatedFields = payrollSchema.safeParse({
		month: formData.get('month'),
		year: formData.get('year'),
	});

	if (!validatedFields.success) {
		return {
			status: 'error',
			errors: {
				...validatedFields.error.flatten().fieldErrors,
				_form: [],
			},
		};
	}

	const { month, year } = validatedFields.data;

	const supabase = await createClient();
	const cookieStore = await cookies();
	const profileCookie = cookieStore.get('user_profile');

	if (!profileCookie) {
		return {
			status: 'error',
			errors: { _form: ['Tidak terautentikasi'] },
		};
	}

	const profile = JSON.parse(profileCookie.value);

	// Check if payroll run already exists for this period
	const { data: existing } = await supabase
		.from('payroll_runs')
		.select('id')
		.eq('month', month)
		.eq('year', year)
		.single();

	if (existing) {
		return {
			status: 'error',
			errors: { _form: ['Penggajian untuk periode ini sudah ada'] },
		};
	}

	// Get all active employees with salary configs for this year
	const { data: salaryConfigs, error: configError } = await supabase
		.from('salary_configs')
		.select(
			`
			*,
			employee:employees!inner(id, full_name, position, is_active)
		`
		)
		.eq('year', year)
		.eq('employee.is_active', true);

	if (configError) {
		return {
			status: 'error',
			errors: { _form: [configError.message] },
		};
	}

	if (!salaryConfigs || salaryConfigs.length === 0) {
		return {
			status: 'error',
			errors: {
				_form: ['Tidak ada karyawan aktif dengan konfigurasi gaji'],
			},
		};
	}

	// Create payroll run
	const { data: payrollRun, error: runError } = await supabase
		.from('payroll_runs')
		.insert({
			month,
			year,
			status: 'draft',
			created_by: profile.id,
		})
		.select()
		.single();

	if (runError) {
		return {
			status: 'error',
			errors: { _form: [runError.message] },
		};
	}

	// Calculate payslips for each employee
	const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	let totalAmount = 0;
	const payslips = [];

	for (const config of salaryConfigs) {
		// Get attendance records for this employee in this period
		const { data: attendance } = await supabase
			.from('attendance_records')
			.select('*')
			.eq('employee_id', config.employee_id)
			.gte('date', startDate)
			.lte('date', endDate);

		const records = attendance || [];
		const presentDays = records.filter(
			(r) => r.status === 'present'
		).length;
		const lateDays = records.filter((r) => r.status === 'late').length;
		const halfDays = records.filter(
			(r) => r.status === 'half_day'
		).length;

		// Calculate working days in the month (exclude weekends)
		let workingDays = 0;
		const current = new Date(startDate);
		const end = new Date(endDate);
		while (current <= end) {
			const day = current.getDay();
			if (day !== 0 && day !== 6) workingDays++;
			current.setDate(current.getDate() + 1);
		}

		const attendedDays = presentDays + lateDays + halfDays;
		const absentDays = Math.max(0, workingDays - attendedDays);

		const totalAllowances =
			(config.transport_allowance || 0) + (config.meal_allowance || 0);

		const totalDeductions =
			lateDays * (config.late_deduction_per_day || 0) +
			absentDays * (config.absent_deduction_per_day || 0) +
			halfDays * (config.half_day_deduction_per_day || 0);

		const netSalary = Math.max(
			0,
			config.base_salary + totalAllowances - totalDeductions
		);

		totalAmount += netSalary;

		payslips.push({
			payroll_run_id: payrollRun.id,
			employee_id: config.employee_id,
			base_salary: config.base_salary,
			total_allowances: totalAllowances,
			total_deductions: totalDeductions,
			overtime_hours: 0,
			overtime_pay: 0,
			net_salary: netSalary,
			present_days: presentDays,
			late_days: lateDays,
			absent_days: absentDays,
			half_days: halfDays,
			payment_status: 'unpaid',
		});
	}

	// Insert all payslips
	const { error: payslipError } = await supabase
		.from('payslips')
		.insert(payslips);

	if (payslipError) {
		// Cleanup: delete the payroll run if payslip creation fails
		await supabase.from('payroll_runs').delete().eq('id', payrollRun.id);
		return {
			status: 'error',
			errors: { _form: [payslipError.message] },
		};
	}

	// Update total amount
	await supabase
		.from('payroll_runs')
		.update({ total_amount: totalAmount })
		.eq('id', payrollRun.id);

	revalidatePath('/admin/payroll');

	return { status: 'success' };
}

export async function getPayrollRunDetail(id: string) {
	try {
		const supabase = await createClient();

		const { data: payrollRun, error: runError } = await supabase
			.from('payroll_runs')
			.select('*')
			.eq('id', id)
			.single();

		if (runError) throw runError;

		const { data: payslips, error: payslipError } = await supabase
			.from('payslips')
			.select(
				`
				*,
				employee:employees!inner(id, full_name, position)
			`
			)
			.eq('payroll_run_id', id)
			.order('created_at');

		if (payslipError) throw payslipError;

		return { payrollRun, payslips, error: null };
	} catch (error) {
		console.error('getPayrollRunDetail error:', error);
		return {
			payrollRun: null,
			payslips: null,
			error:
				error instanceof Error
					? error.message
					: 'Gagal mengambil detail penggajian',
		};
	}
}

export async function finalizePayrollRun(
	prevState: PayrollFormState,
	formData: FormData
): Promise<PayrollFormState> {
	try {
		const supabase = await createClient();
		const id = formData.get('id') as string;

		const { error } = await supabase
			.from('payroll_runs')
			.update({
				status: 'finalized',
				finalized_at: new Date().toISOString(),
			})
			.eq('id', id)
			.eq('status', 'draft');

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		revalidatePath(`/admin/payroll/${id}`);
		revalidatePath('/admin/payroll');

		return { status: 'success' };
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: 'Gagal memfinalisasi penggajian',
				],
			},
		};
	}
}

export async function deletePayrollRun(
	prevState: PayrollFormState,
	formData: FormData
): Promise<PayrollFormState> {
	const supabase = await createClient();

	const { error } = await supabase
		.from('payroll_runs')
		.delete()
		.eq('id', formData.get('id'))
		.eq('status', 'draft');

	if (error) {
		return {
			status: 'error',
			errors: { _form: [error.message] },
		};
	}

	revalidatePath('/admin/payroll');

	return { status: 'success' };
}

export async function markPayslipAsPaid(
	prevState: PayrollFormState,
	formData: FormData
): Promise<PayrollFormState> {
	try {
		const payslipId = formData.get('payslip_id') as string;
		const payrollRunId = formData.get('payroll_run_id') as string;
		const supabase = await createClient();

		const { error } = await supabase
			.from('payslips')
			.update({
				payment_status: 'paid',
				paid_at: new Date().toISOString(),
			})
			.eq('id', payslipId);

		if (error) {
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		// Check if all payslips for this run are paid
		const { data: unpaidSlips } = await supabase
			.from('payslips')
			.select('id')
			.eq('payroll_run_id', payrollRunId)
			.neq('payment_status', 'paid');

		if (!unpaidSlips || unpaidSlips.length === 0) {
			await supabase
				.from('payroll_runs')
				.update({ status: 'paid' })
				.eq('id', payrollRunId);
		}

		revalidatePath(`/admin/payroll/${payrollRunId}`);
		revalidatePath('/admin/payroll');

		return { status: 'success' };
	} catch (error) {
		return {
			status: 'error',
			errors: {
				_form: [
					error instanceof Error
						? error.message
						: 'Gagal menandai pembayaran',
				],
			},
		};
	}
}
