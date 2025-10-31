export interface LeaveType {
	id: string;
	name: string;
	description: string | null;
	max_days_per_year: number;
	requires_approval: boolean;
	is_active: boolean;
	allows_flexible_end_date: boolean;
	created_at: string;
	updated_at: string;
}

export interface LeaveBalance {
	id: string;
	employee_id: string;
	leave_type_id: string;
	year: number;
	total_days: number;
	used_days: number;
	remaining_days: number;
	created_at: string;
	updated_at: string;
	leave_type?: LeaveType;
}

export interface LeaveRequest {
	id: string;
	employee_id: string;
	leave_type_id: string;
	start_date: string;
	end_date: string | null;
	total_days: number;
	reason: string;
	status: 'pending' | 'approved' | 'rejected';
	approved_by: string | null;
	approved_at: string | null;
	rejection_reason: string | null;
	created_at: string;
	updated_at: string;
	employee?: {
		id: string;
		full_name: string;
		position: string;
	};
	leave_type?: LeaveType;
}

export interface LeaveRequestFormState {
	status: 'idle' | 'success' | 'error';
	errors?: {
		leave_type_id?: string[];
		start_date?: string[];
		end_date?: string[];
		reason?: string[];
		_form?: string[];
	};
}
