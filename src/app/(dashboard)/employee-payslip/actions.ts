'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getMyPayslips() {
	try {
		const cookieStore = await cookies();
		const profileCookie = cookieStore.get('user_profile');

		if (!profileCookie) {
			return { data: null, error: 'Tidak terautentikasi' };
		}

		const profile = JSON.parse(profileCookie.value);
		const supabase = await createClient();

		// Get employee record for the current user
		const { data: employee } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', profile.id)
			.single();

		if (!employee) {
			return { data: null, error: 'Data karyawan tidak ditemukan' };
		}

		// Get payslips with payroll run info (RLS ensures employee sees only own payslips)
		const { data, error } = await supabase
			.from('payslips')
			.select(
				`
				*,
				payroll_run:payroll_runs!inner(id, month, year, status)
			`
			)
			.eq('employee_id', employee.id)
			.in('payroll_run.status', ['process', 'paid'])
			.order('created_at', { ascending: false });

		if (error) throw error;

		return { data: data || [], error: null };
	} catch (error) {
		console.error('getMyPayslips error:', error);
		return {
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'Gagal mengambil data slip gaji',
		};
	}
}
