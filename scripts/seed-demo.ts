import { createClient } from '@supabase/supabase-js';

/**
 * Demo Seed Script for HRIS App
 *
 * Creates demo users, employees, attendance records, leave data,
 * salary configs, and payroll runs so users can explore the app
 * with realistic data.
 *
 * Usage:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

// Load env from .env or .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
	console.error(
		'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
	);
	process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
	auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Demo Data ───────────────────────────────────────────────

const DEMO_PASSWORD = 'demo1234';

const DEMO_ADMIN = {
	email: 'admin@demo.com',
	name: 'Admin Demo',
	role: 'admin',
};

const DEMO_EMPLOYEES = [
	{
		full_name: 'Budi Santoso',
		position: 'Software Engineer',
		phone_number: '081234567890',
		join_date: '2024-01-15',
		email: 'budi@demo.com',
	},
	{
		full_name: 'Siti Rahayu',
		position: 'UI/UX Designer',
		phone_number: '081234567891',
		join_date: '2024-03-01',
		email: 'siti@demo.com',
	},
	{
		full_name: 'Ahmad Wijaya',
		position: 'Backend Developer',
		phone_number: '081234567892',
		join_date: '2024-06-10',
		email: 'ahmad@demo.com',
	},
	{
		full_name: 'Dewi Lestari',
		position: 'Project Manager',
		phone_number: '081234567893',
		join_date: '2023-11-20',
		email: 'dewi@demo.com',
	},
	{
		full_name: 'Rizky Pratama',
		position: 'QA Engineer',
		phone_number: '081234567894',
		join_date: '2024-09-05',
		email: 'rizky@demo.com',
	},
];

// ─── Helpers ─────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(d: Date) {
	return d.toISOString().split('T')[0];
}

function formatTimestamp(dateStr: string, time: string) {
	return `${dateStr}T${time}+07:00`; // WIB timezone
}

function isWeekday(d: Date) {
	const day = d.getDay();
	return day !== 0 && day !== 6;
}

function getWorkingDays(year: number, month: number): string[] {
	const days: string[] = [];
	const daysInMonth = new Date(year, month, 0).getDate();
	for (let d = 1; d <= daysInMonth; d++) {
		const date = new Date(year, month - 1, d);
		if (isWeekday(date)) {
			days.push(formatDate(date));
		}
	}
	return days;
}

// ─── Seed Functions ──────────────────────────────────────────

async function createAuthUser(
	email: string,
	name: string,
	role: string
): Promise<string> {
	// Check if user already exists
	const { data: existingUsers } = await supabase.auth.admin.listUsers();
	const existing = existingUsers?.users?.find((u) => u.email === email);
	if (existing) {
		console.log(`  ⏩ User ${email} already exists, skipping`);
		// Update profile role in case it changed
		await supabase
			.from('profiles')
			.update({ name, role })
			.eq('id', existing.id);
		return existing.id;
	}

	const { data, error } = await supabase.auth.admin.createUser({
		email,
		password: DEMO_PASSWORD,
		email_confirm: true,
		user_metadata: { name, role },
	});

	if (error) throw new Error(`Failed to create user ${email}: ${error.message}`);

	// Wait a moment for the trigger to create the profile
	await new Promise((r) => setTimeout(r, 500));

	// Ensure profile has correct role
	await supabase
		.from('profiles')
		.update({ name, role })
		.eq('id', data.user.id);

	console.log(`  ✅ Created user: ${email}`);
	return data.user.id;
}

async function seedEmployees(
	employeeUsers: { userId: string; emp: (typeof DEMO_EMPLOYEES)[0] }[]
) {
	const results: { employeeId: string; fullName: string }[] = [];

	for (const { userId, emp } of employeeUsers) {
		// Check if employee already exists for this user
		const { data: existing } = await supabase
			.from('employees')
			.select('id')
			.eq('user_id', userId)
			.single();

		if (existing) {
			console.log(`  ⏩ Employee ${emp.full_name} already exists`);
			results.push({ employeeId: existing.id, fullName: emp.full_name });
			continue;
		}

		const { data, error } = await supabase
			.from('employees')
			.insert({
				user_id: userId,
				full_name: emp.full_name,
				position: emp.position,
				phone_number: emp.phone_number,
				join_date: emp.join_date,
				is_active: true,
			})
			.select('id')
			.single();

		if (error)
			throw new Error(
				`Failed to create employee ${emp.full_name}: ${error.message}`
			);

		console.log(`  ✅ Created employee: ${emp.full_name}`);
		results.push({ employeeId: data.id, fullName: emp.full_name });
	}

	return results;
}

async function seedWorkTimeConfig() {
	const { data: existing } = await supabase
		.from('work_time_config')
		.select('id')
		.limit(1)
		.single();

	if (existing) {
		console.log('  ⏩ Work time config already exists');
		return;
	}

	const { error } = await supabase.from('work_time_config').insert({
		work_start_time: '09:00:00',
		work_end_time: '17:00:00',
		late_threshold_minutes: 15,
		half_day_hours: 4.0,
	});

	if (error)
		throw new Error(`Failed to create work time config: ${error.message}`);
	console.log('  ✅ Created work time config');
}

async function seedAttendance(
	employees: { employeeId: string; fullName: string }[]
) {
	// Generate attendance for the last 2 months
	const now = new Date();
	const months = [
		{ year: now.getFullYear(), month: now.getMonth() }, // last month (0-indexed)
		{ year: now.getFullYear(), month: now.getMonth() + 1 }, // current month
	];

	// Adjust if current month is January
	if (now.getMonth() === 0) {
		months[0] = { year: now.getFullYear() - 1, month: 12 };
		months[1] = { year: now.getFullYear(), month: 1 };
	}

	for (const { year, month } of months) {
		const workingDays = getWorkingDays(year, month);
		// Only include days up to today
		const today = formatDate(now);
		const validDays = workingDays.filter((d) => d <= today);

		for (const emp of employees) {
			const records = [];

			for (const day of validDays) {
				// 80% present, 10% late, 5% half_day, 5% absent
				const rand = Math.random();
				let status: string;
				let clockIn: string | null;
				let clockOut: string | null;

				if (rand < 0.8) {
					status = 'present';
					const mins = randomBetween(0, 10);
					clockIn = formatTimestamp(
						day,
						`09:${mins.toString().padStart(2, '0')}:00`
					);
					clockOut = formatTimestamp(
						day,
						`17:${randomBetween(0, 30).toString().padStart(2, '0')}:00`
					);
				} else if (rand < 0.9) {
					status = 'late';
					const mins = randomBetween(16, 45);
					clockIn = formatTimestamp(
						day,
						`09:${mins.toString().padStart(2, '0')}:00`
					);
					clockOut = formatTimestamp(
						day,
						`17:${randomBetween(0, 30).toString().padStart(2, '0')}:00`
					);
				} else if (rand < 0.95) {
					status = 'half_day';
					clockIn = formatTimestamp(day, '09:00:00');
					clockOut = formatTimestamp(day, '13:00:00');
				} else {
					status = 'absent';
					clockIn = null;
					clockOut = null;
				}

				records.push({
					employee_id: emp.employeeId,
					date: day,
					clock_in: clockIn,
					clock_out: clockOut,
					status,
					notes: status === 'absent' ? 'Tidak masuk tanpa keterangan' : null,
				});
			}

			// Upsert to handle re-runs
			const { error } = await supabase
				.from('attendance_records')
				.upsert(records, { onConflict: 'employee_id,date' });

			if (error)
				console.warn(
					`  ⚠️ Attendance for ${emp.fullName} (${year}-${month}): ${error.message}`
				);
		}
	}

	console.log('  ✅ Created attendance records (last 2 months)');
}

async function seedLeaveTypes(): Promise<{ id: string; name: string }[]> {
	const { data: existing } = await supabase.from('leave_types').select('id, name');

	if (existing && existing.length > 0) {
		console.log(`  ⏩ Leave types already exist (${existing.length} found)`);
		return existing;
	}

	const types = [
		{
			name: 'Cuti Tahunan',
			description: 'Cuti tahunan karyawan',
			max_days_per_year: 12,
			requires_approval: true,
			allows_flexible_end_date: false,
		},
		{
			name: 'Cuti Sakit',
			description: 'Cuti karena sakit',
			max_days_per_year: 12,
			requires_approval: true,
			allows_flexible_end_date: true,
		},
		{
			name: 'Cuti Pribadi',
			description: 'Cuti untuk keperluan pribadi',
			max_days_per_year: 3,
			requires_approval: true,
			allows_flexible_end_date: false,
		},
		{
			name: 'Cuti Melahirkan',
			description: 'Cuti melahirkan',
			max_days_per_year: 90,
			requires_approval: true,
			allows_flexible_end_date: false,
		},
		{
			name: 'Cuti Ayah',
			description: 'Cuti untuk ayah baru',
			max_days_per_year: 3,
			requires_approval: true,
			allows_flexible_end_date: false,
		},
	];

	const { data, error } = await supabase
		.from('leave_types')
		.insert(types)
		.select('id, name');

	if (error) throw new Error(`Failed to create leave types: ${error.message}`);
	console.log('  ✅ Created leave types');
	return data;
}

async function seedLeaveBalances(
	employees: { employeeId: string; fullName: string }[],
	leaveTypes: { id: string; name: string }[]
) {
	const currentYear = new Date().getFullYear();

	for (const emp of employees) {
		for (const lt of leaveTypes) {
			const { data: existing } = await supabase
				.from('leave_balances')
				.select('id')
				.eq('employee_id', emp.employeeId)
				.eq('leave_type_id', lt.id)
				.eq('year', currentYear)
				.single();

			if (existing) continue;

			const maxDays =
				lt.name === 'Cuti Tahunan'
					? 12
					: lt.name === 'Cuti Sakit'
						? 12
						: lt.name === 'Cuti Pribadi'
							? 3
							: lt.name === 'Cuti Melahirkan'
								? 90
								: 3;

			const usedDays = lt.name === 'Cuti Tahunan' ? randomBetween(0, 3) : 0;

			await supabase.from('leave_balances').insert({
				employee_id: emp.employeeId,
				leave_type_id: lt.id,
				year: currentYear,
				total_days: maxDays,
				used_days: usedDays,
			});
		}
	}

	console.log('  ✅ Created leave balances');
}

async function seedLeaveRequests(
	employees: { employeeId: string; fullName: string }[],
	leaveTypes: { id: string; name: string }[],
	adminUserId: string
) {
	const annualLeave = leaveTypes.find((lt) => lt.name === 'Cuti Tahunan');
	const sickLeave = leaveTypes.find((lt) => lt.name === 'Cuti Sakit');
	if (!annualLeave || !sickLeave) return;

	const requests = [
		{
			employee_id: employees[0].employeeId,
			leave_type_id: annualLeave.id,
			start_date: '2026-04-01',
			end_date: '2026-04-03',
			total_days: 3,
			reason: 'Liburan keluarga',
			status: 'pending',
		},
		{
			employee_id: employees[1].employeeId,
			leave_type_id: sickLeave.id,
			start_date: '2026-03-10',
			end_date: '2026-03-11',
			total_days: 2,
			reason: 'Demam dan flu',
			status: 'approved',
			approved_by: adminUserId,
			approved_at: '2026-03-09T10:00:00+07:00',
		},
		{
			employee_id: employees[2].employeeId,
			leave_type_id: annualLeave.id,
			start_date: '2026-03-20',
			end_date: '2026-03-21',
			total_days: 2,
			reason: 'Urusan pribadi',
			status: 'pending',
		},
		{
			employee_id: employees[3].employeeId,
			leave_type_id: annualLeave.id,
			start_date: '2026-02-15',
			end_date: '2026-02-17',
			total_days: 3,
			reason: 'Acara keluarga',
			status: 'approved',
			approved_by: adminUserId,
			approved_at: '2026-02-14T09:00:00+07:00',
		},
	];

	for (const req of requests) {
		// Check for existing request on same dates
		const { data: existing } = await supabase
			.from('leave_requests')
			.select('id')
			.eq('employee_id', req.employee_id)
			.eq('start_date', req.start_date)
			.single();

		if (existing) continue;

		const { error } = await supabase.from('leave_requests').insert(req);
		if (error) console.warn(`  ⚠️ Leave request: ${error.message}`);
	}

	console.log('  ✅ Created leave requests');
}

async function seedSalaryConfigs(
	employees: { employeeId: string; fullName: string }[]
) {
	const currentYear = new Date().getFullYear();

	const salaries = [
		{ base: 12000000, transport: 500000, meal: 600000 },
		{ base: 10000000, transport: 500000, meal: 600000 },
		{ base: 11000000, transport: 500000, meal: 600000 },
		{ base: 15000000, transport: 750000, meal: 600000 },
		{ base: 9000000, transport: 500000, meal: 600000 },
	];

	for (let i = 0; i < employees.length; i++) {
		const emp = employees[i];
		const sal = salaries[i];

		const { data: existing } = await supabase
			.from('salary_configs')
			.select('id')
			.eq('employee_id', emp.employeeId)
			.eq('year', currentYear)
			.single();

		if (existing) continue;

		await supabase.from('salary_configs').insert({
			employee_id: emp.employeeId,
			year: currentYear,
			base_salary: sal.base,
			transport_allowance: sal.transport,
			meal_allowance: sal.meal,
			late_deduction_per_day: 50000,
			absent_deduction_per_day: 200000,
			half_day_deduction_per_day: 100000,
			overtime_rate_per_hour: 75000,
		});
	}

	console.log('  ✅ Created salary configs');
}

async function seedPayrollRun(
	employees: { employeeId: string; fullName: string }[],
	adminUserId: string
) {
	// Create a payroll run for last month
	const now = new Date();
	let month = now.getMonth(); // 0-indexed, so this is last month
	let year = now.getFullYear();
	if (month === 0) {
		month = 12;
		year -= 1;
	}

	const { data: existing } = await supabase
		.from('payroll_runs')
		.select('id')
		.eq('month', month)
		.eq('year', year)
		.single();

	if (existing) {
		console.log('  ⏩ Payroll run already exists');
		return;
	}

	const { data: payrollRun, error } = await supabase
		.from('payroll_runs')
		.insert({
			month,
			year,
			status: 'paid',
			created_by: adminUserId,
			finalized_at: new Date().toISOString(),
			total_amount: 0,
		})
		.select('id')
		.single();

	if (error)
		throw new Error(`Failed to create payroll run: ${error.message}`);

	// Create payslips
	const baseSalaries = [12000000, 10000000, 11000000, 15000000, 9000000];
	let totalAmount = 0;

	for (let i = 0; i < employees.length; i++) {
		const emp = employees[i];
		const baseSalary = baseSalaries[i];
		const totalAllowances = 1100000;
		const lateDays = randomBetween(0, 3);
		const absentDays = randomBetween(0, 1);
		const totalDeductions = lateDays * 50000 + absentDays * 200000;
		const netSalary = baseSalary + totalAllowances - totalDeductions;
		totalAmount += netSalary;

		await supabase.from('payslips').insert({
			payroll_run_id: payrollRun.id,
			employee_id: emp.employeeId,
			base_salary: baseSalary,
			total_allowances: totalAllowances,
			total_deductions: totalDeductions,
			overtime_hours: 0,
			overtime_pay: 0,
			net_salary: netSalary,
			present_days: randomBetween(18, 22),
			late_days: lateDays,
			absent_days: absentDays,
			half_days: 0,
			payment_status: 'paid',
			paid_at: new Date().toISOString(),
		});
	}

	// Update total amount
	await supabase
		.from('payroll_runs')
		.update({ total_amount: totalAmount })
		.eq('id', payrollRun.id);

	console.log(`  ✅ Created payroll run (${year}-${month}) with payslips`);
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
	console.log('🌱 Seeding demo data...\n');

	// 1. Create admin user
	console.log('👤 Creating admin user...');
	const adminUserId = await createAuthUser(
		DEMO_ADMIN.email,
		DEMO_ADMIN.name,
		DEMO_ADMIN.role
	);

	// 2. Create employee users
	console.log('\n👥 Creating employee users...');
	const employeeUsers = [];
	for (const emp of DEMO_EMPLOYEES) {
		const userId = await createAuthUser(emp.email, emp.full_name, 'employee');
		employeeUsers.push({ userId, emp });
	}

	// 3. Create employee records
	console.log('\n📋 Creating employee records...');
	const employees = await seedEmployees(employeeUsers);

	// 4. Work time config
	console.log('\n⏰ Setting up work time config...');
	await seedWorkTimeConfig();

	// 5. Attendance records
	console.log('\n📊 Creating attendance records...');
	await seedAttendance(employees);

	// 6. Leave types & balances
	console.log('\n🏖️  Setting up leave management...');
	const leaveTypes = await seedLeaveTypes();
	await seedLeaveBalances(employees, leaveTypes);
	await seedLeaveRequests(employees, leaveTypes, adminUserId);

	// 7. Salary & Payroll
	console.log('\n💰 Setting up salary & payroll...');
	await seedSalaryConfigs(employees);
	await seedPayrollRun(employees, adminUserId);

	console.log('\n✅ Demo seeding complete!\n');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('  Demo Accounts:');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`  Admin:    ${DEMO_ADMIN.email} / ${DEMO_PASSWORD}`);
	DEMO_EMPLOYEES.forEach((e) => {
		console.log(`  Employee: ${e.email} / ${DEMO_PASSWORD}`);
	});
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch((err) => {
	console.error('❌ Seed failed:', err);
	process.exit(1);
});
