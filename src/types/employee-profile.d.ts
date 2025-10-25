export interface EmployeeProfile {
	// From profiles
	id: string;
	name: string;
	role: string;
	avatar_url: string | null;

	// From employees
	employee_id: string;
	full_name: string;
	position: string;
	join_date: string;
	phone_number: string;
	is_active: boolean;

	// From auth.users
	email: string;
}

export interface ProfileFormState {
	status: 'idle' | 'success' | 'error';
	errors?: {
		name?: string[];
		phone_number?: string[];
		avatar_url?: string[];
		_form?: string[];
	};
}
