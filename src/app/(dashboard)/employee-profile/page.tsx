import { redirect } from 'next/navigation';
import { getMyProfile } from './actions';
import ProfileForm from './_components/profile-form';

export const metadata = {
	title: 'HRIS App | Update Data Diri',
	description: 'Update your personal profile information',
};

export default async function EmployeeProfilePage() {
	const { profile, employee, email, error } = await getMyProfile();

	// If not authenticated or no profile found, redirect to login
	if (error || !profile || !employee || !email) {
		redirect('/login');
	}

	// Only allow employees to access this page (admins have separate management)
	if (profile.role !== 'employee') {
		redirect('/');
	}

	const initialData = {
		id: profile.id,
		name: profile.name,
		email: email,
		role: profile.role,
		avatar_url: profile.avatar_url,
		employee_id: employee.id,
		position: employee.position,
		join_date: employee.join_date,
		phone_number: employee.phone_number,
	};

	return (
		<div className='container py-6'>
			<ProfileForm initialData={initialData} />
		</div>
	);
}
