'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/validations/employee-validation';
import {
	Mail,
	Phone,
	Briefcase,
	Calendar,
	IdCard,
	User,
	CheckCircle2,
	XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getUserEmail } from '../actions';

interface DialogViewEmployeeProps {
	employee: Employee | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function DialogViewEmployee({
	employee,
	open,
	onOpenChange,
}: DialogViewEmployeeProps) {
	const supabase = createClient();
	const [userProfile, setUserProfile] = useState<{
		name: string;
		email: string | null;
		avatar_url: string | null;
		role: string;
	} | null>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(false);

	useEffect(() => {
		if (employee?.user_id && open) {
			loadUserProfile();
		}
	}, [employee?.user_id, open]);

	const loadUserProfile = async () => {
		if (!employee?.user_id) return;

		setIsLoadingProfile(true);
		try {
			// Get profile data
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.select('name, avatar_url, role')
				.eq('id', employee.user_id)
				.single();

			if (profileError) {
				console.error('Error loading profile:', profileError);
				setUserProfile(null);
				return;
			}

			// Get email from server action (uses admin client)
			const { email, error: emailError } = await getUserEmail(employee.user_id);

			if (emailError) {
				console.error('Error loading email:', emailError);
			}

			setUserProfile({
				name: profile?.name || employee.full_name,
				email: email || null,
				avatar_url: profile?.avatar_url || null,
				role: profile?.role || 'employee',
			});
		} catch (error) {
			console.error('Error loading user profile:', error);
			setUserProfile(null);
		} finally {
			setIsLoadingProfile(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (!employee) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Employee Details</DialogTitle>
					<DialogDescription>
						Complete information about the employee
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Profile Header */}
					<div className='flex flex-col sm:flex-row items-center gap-6 pb-6 border-b'>
						<Avatar className='h-24 w-24 border-4 border-primary/10'>
							<AvatarImage
								src={userProfile?.avatar_url || ''}
								alt={employee.full_name}
							/>
							<AvatarFallback className='text-2xl font-semibold bg-primary/10'>
								{employee.full_name?.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<div className='flex-1 text-center sm:text-left'>
							<h3 className='text-2xl font-bold'>{employee.full_name}</h3>
							<p className='text-muted-foreground text-lg'>{employee.position}</p>
							<div className='flex gap-2 mt-2 justify-center sm:justify-start'>
								{employee.is_active ? (
									<Badge className='bg-blue-600'>
										<CheckCircle2 className='h-3 w-3 mr-1' />
										Active
									</Badge>
								) : (
									<Badge variant='destructive'>
										<XCircle className='h-3 w-3 mr-1' />
										Inactive
									</Badge>
								)}
								{userProfile && (
									<Badge variant='secondary' className='capitalize'>
										{userProfile.role}
									</Badge>
								)}
							</div>
						</div>
					</div>

					{/* Employee Information */}
					<div className='space-y-4'>
						<h4 className='font-semibold flex items-center gap-2'>
							<User className='h-4 w-4' />
							Employee Information
						</h4>
						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='space-y-2'>
								<Label className='text-muted-foreground flex items-center gap-2'>
									<IdCard className='h-4 w-4' />
									Employee ID
								</Label>
								<div className='px-3 py-2 bg-muted rounded-md font-mono text-sm'>
									{employee.id.slice(0, 8).toUpperCase()}
								</div>
							</div>

							<div className='space-y-2'>
								<Label className='text-muted-foreground flex items-center gap-2'>
									<Phone className='h-4 w-4' />
									Phone Number
								</Label>
								<div className='px-3 py-2 bg-muted rounded-md text-sm'>
									{employee.phone_number}
								</div>
							</div>

							<div className='space-y-2'>
								<Label className='text-muted-foreground flex items-center gap-2'>
									<Briefcase className='h-4 w-4' />
									Position
								</Label>
								<div className='px-3 py-2 bg-muted rounded-md font-medium text-sm'>
									{employee.position}
								</div>
							</div>

							<div className='space-y-2'>
								<Label className='text-muted-foreground flex items-center gap-2'>
									<Calendar className='h-4 w-4' />
									Join Date
								</Label>
								<div className='px-3 py-2 bg-muted rounded-md text-sm'>
									{formatDate(employee.join_date)}
								</div>
							</div>
						</div>
					</div>

					{/* Account Information (if linked) */}
					{employee.user_id && (
						<>
							<Separator />
							<div className='space-y-4'>
								<h4 className='font-semibold flex items-center gap-2'>
									<Mail className='h-4 w-4' />
									Account Information
								</h4>

								{isLoadingProfile ? (
									<div className='text-sm text-muted-foreground'>
										Loading account information...
									</div>
								) : userProfile ? (
									<div className='grid gap-4 sm:grid-cols-2'>
										<div className='space-y-2'>
											<Label className='text-muted-foreground'>Account Name</Label>
											<div className='px-3 py-2 bg-muted rounded-md text-sm'>
												{userProfile.name}
											</div>
										</div>

										<div className='space-y-2'>
											<Label className='text-muted-foreground'>Email</Label>
											<div className='px-3 py-2 bg-muted rounded-md text-sm'>
												{userProfile.email || 'N/A'}
											</div>
										</div>

										<div className='space-y-2'>
											<Label className='text-muted-foreground'>Role</Label>
											<div className='px-3 py-2 bg-muted rounded-md text-sm capitalize'>
												{userProfile.role}
											</div>
										</div>

										<div className='space-y-2'>
											<Label className='text-muted-foreground'>User ID</Label>
											<div className='px-3 py-2 bg-muted rounded-md font-mono text-xs'>
												{employee.user_id.slice(0, 12)}...
											</div>
										</div>
									</div>
								) : (
									<div className='text-sm text-muted-foreground'>
										Account information not available
									</div>
								)}
							</div>
						</>
					)}

					{!employee.user_id && (
						<>
							<Separator />
							<div className='bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4'>
								<p className='text-sm text-amber-800 dark:text-amber-200'>
									<strong>Note:</strong> This employee is not linked to any user account yet.
								</p>
							</div>
						</>
					)}

					{/* Metadata */}
					<Separator />
					<div className='grid gap-4 sm:grid-cols-2 text-xs text-muted-foreground'>
						<div>
							<span className='font-medium'>Created:</span>{' '}
							{new Date(employee.created_at).toLocaleString('id-ID')}
						</div>
						<div>
							<span className='font-medium'>Last Updated:</span>{' '}
							{new Date(employee.updated_at).toLocaleString('id-ID')}
						</div>
					</div>
				</div>

				<div className='flex justify-end pt-4 border-t'>
					<Button variant='outline' onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
