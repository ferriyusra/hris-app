'use server';

import { WorkTimeConfig } from '@/types/work-time';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface WorkTimeFormState {
	status: 'idle' | 'success' | 'error';
	errors?: {
		work_start_time?: string[];
		work_end_time?: string[];
		late_threshold_minutes?: string[];
		half_day_hours?: string[];
		_form?: string[];
	};
}

/**
 * Get work time configuration from database
 */
export async function getWorkTimeConfig() {
	try {
		const supabase = await createClient();

		const { data, error } = await supabase
			.from('work_time_config')
			.select('*')
			.single();

		if (error) {
			console.error('Database error:', error);
			throw error;
		}

		// If no config exists, return default values
		if (!data) {
			return {
				data: {
					work_start_time: '09:00',
					work_end_time: '17:00',
					late_threshold_minutes: 15,
					half_day_hours: 4,
				},
				error: null,
			};
		}

		// Convert TIME type (HH:MM:SS) to HH:MM format for the UI
		const config: WorkTimeConfig = {
			work_start_time: data.work_start_time.substring(0, 5), // Get HH:MM from HH:MM:SS
			work_end_time: data.work_end_time.substring(0, 5),
			late_threshold_minutes: data.late_threshold_minutes,
			half_day_hours: parseFloat(data.half_day_hours),
		};

		return { data: config, error: null };
	} catch (error) {
		console.error('getWorkTimeConfig error:', error);
		return {
			data: null,
			error: error instanceof Error ? error.message : 'Failed to fetch work time configuration',
		};
	}
}

/**
 * Update work time configuration in database
 */
export async function updateWorkTimeConfig(
	config: WorkTimeConfig
): Promise<WorkTimeFormState> {
	try {
		// Validation
		const errors: WorkTimeFormState['errors'] = {};

		// Validate time format (HH:mm)
		const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
		if (!timeRegex.test(config.work_start_time)) {
			errors.work_start_time = ['Invalid time format. Use HH:mm format'];
		}
		if (!timeRegex.test(config.work_end_time)) {
			errors.work_end_time = ['Invalid time format. Use HH:mm format'];
		}

		// Validate start time is before end time
		if (config.work_start_time >= config.work_end_time) {
			errors.work_start_time = ['Work start time must be before work end time'];
		}

		// Validate numeric values
		if (config.late_threshold_minutes < 0) {
			errors.late_threshold_minutes = ['Late threshold must be a positive number'];
		}
		if (config.half_day_hours < 0) {
			errors.half_day_hours = ['Half day hours must be a positive number'];
		}

		if (Object.keys(errors).length > 0) {
			return {
				status: 'error',
				errors,
			};
		}

		const supabase = await createClient();

		// Check if config exists
		const { data: existingConfig } = await supabase
			.from('work_time_config')
			.select('id')
			.single();

		// Convert HH:mm to HH:mm:ss for TIME type in database
		const dataToSave = {
			work_start_time: `${config.work_start_time}:00`,
			work_end_time: `${config.work_end_time}:00`,
			late_threshold_minutes: config.late_threshold_minutes,
			half_day_hours: config.half_day_hours,
		};

		let error;

		if (existingConfig) {
			// Update existing config
			const result = await supabase
				.from('work_time_config')
				.update(dataToSave)
				.eq('id', existingConfig.id);

			error = result.error;
		} else {
			// Insert new config
			const result = await supabase
				.from('work_time_config')
				.insert(dataToSave);

			error = result.error;
		}

		if (error) {
			console.error('Database error:', error);
			return {
				status: 'error',
				errors: { _form: [error.message] },
			};
		}

		// Revalidate the page to show updated data
		revalidatePath('/admin/work-time');

		return { status: 'success' };
	} catch (error) {
		console.error('updateWorkTimeConfig error:', error);
		return {
			status: 'error',
			errors: {
				_form: [error instanceof Error ? error.message : 'Failed to update work time configuration'],
			},
		};
	}
}
