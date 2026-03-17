export interface SalaryConfig {
	id: string;
	employee_id: string;
	base_salary: number;
	transport_allowance: number;
	meal_allowance: number;
	late_deduction_per_day: number;
	absent_deduction_per_day: number;
	half_day_deduction_per_day: number;
	overtime_rate_per_hour: number;
	year: number;
	created_at: string;
	updated_at: string;
	employee?: {
		id: string;
		full_name: string;
		position: string;
	};
}

export interface PayrollRun {
	id: string;
	month: number;
	year: number;
	status: 'unpaid' | 'process' | 'paid';
	created_by: string | null;
	finalized_at: string | null;
	total_amount: number;
	created_at: string;
	updated_at: string;
}

export interface Payslip {
	id: string;
	payroll_run_id: string;
	employee_id: string;
	base_salary: number;
	total_allowances: number;
	total_deductions: number;
	overtime_hours: number;
	overtime_pay: number;
	net_salary: number;
	present_days: number;
	late_days: number;
	absent_days: number;
	half_days: number;
	payment_status: 'unpaid' | 'pending' | 'paid' | 'failed';
	midtrans_transaction_id: string | null;
	midtrans_payment_url: string | null;
	paid_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	employee?: {
		id: string;
		full_name: string;
		position: string;
	};
}

export type SalaryConfigFormState = {
	status?: string;
	errors?: {
		employee_id?: string[];
		base_salary?: string[];
		transport_allowance?: string[];
		meal_allowance?: string[];
		late_deduction_per_day?: string[];
		absent_deduction_per_day?: string[];
		half_day_deduction_per_day?: string[];
		overtime_rate_per_hour?: string[];
		year?: string[];
		_form?: string[];
	};
};

export type PayrollFormState = {
	status?: string;
	errors?: {
		month?: string[];
		year?: string[];
		_form?: string[];
	};
};
