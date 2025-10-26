'use client';

import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getWorkTimeConfig, updateWorkTimeConfig } from './actions';
import { WorkTimeConfig } from '@/types/work-time';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminWorkTimePage() {
	const [config, setConfig] = useState<WorkTimeConfig>({
		work_start_time: '09:00',
		work_end_time: '17:00',
		late_threshold_minutes: 15,
		half_day_hours: 4,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			const result = await getWorkTimeConfig();
			if (result.data) {
				setConfig(result.data);
			}
			setIsLoading(false);
		}

		fetchData();
	}, []);

	const handleSave = async () => {
		setIsSaving(true);
		const result = await updateWorkTimeConfig(config);

		if (result.status === 'success') {
			toast.success('Konfigurasi waktu kerja berhasil diperbarui');
		} else {
			toast.error(result.errors?._form?.[0] || 'Gagal memperbarui konfigurasi waktu kerja');
		}

		setIsSaving(false);
	};

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold'>Konfigurasi Waktu Kerja</h1>
					<p className='text-muted-foreground'>Atur jam kerja dan aturan kehadiran</p>
				</div>
				<p className='text-muted-foreground'>Memuat...</p>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Konfigurasi Waktu Kerja</h1>
					<p className='text-muted-foreground'>Atur jam kerja dan aturan kehadiran</p>
				</div>
				<Button onClick={handleSave} disabled={isSaving}>
					<Save className='h-4 w-4 mr-2' />
					{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
				</Button>
			</div>

			<div className='grid gap-6 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>Jam Kerja</CardTitle>
						<CardDescription>Atur jam kerja standar untuk organisasi Anda</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='work_start_time'>Waktu Mulai Kerja</Label>
							<Input
								id='work_start_time'
								type='time'
								value={config.work_start_time}
								onChange={(e) => setConfig({ ...config, work_start_time: e.target.value })}
							/>
							<p className='text-sm text-muted-foreground'>Default: 09:00</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='work_end_time'>Waktu Selesai Kerja</Label>
							<Input
								id='work_end_time'
								type='time'
								value={config.work_end_time}
								onChange={(e) => setConfig({ ...config, work_end_time: e.target.value })}
							/>
							<p className='text-sm text-muted-foreground'>Default: 17:00</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Aturan Kehadiran</CardTitle>
						<CardDescription>Konfigurasi ambang batas dan aturan kehadiran</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='late_threshold_minutes'>Batas Keterlambatan (Menit)</Label>
							<Input
								id='late_threshold_minutes'
								type='number'
								min='0'
								value={config.late_threshold_minutes}
								onChange={(e) =>
									setConfig({ ...config, late_threshold_minutes: parseInt(e.target.value) || 0 })
								}
							/>
							<p className='text-sm text-muted-foreground'>
								Karyawan dianggap terlambat jika clock in setelah waktu ini (dalam menit)
							</p>
						</div>

						<div className='space-y-2'>
							<Label htmlFor='half_day_hours'>Batas Setengah Hari (Jam)</Label>
							<Input
								id='half_day_hours'
								type='number'
								min='0'
								step='0.5'
								value={config.half_day_hours}
								onChange={(e) =>
									setConfig({ ...config, half_day_hours: parseFloat(e.target.value) || 0 })
								}
							/>
							<p className='text-sm text-muted-foreground'>
								Kehadiran dianggap setengah hari jika bekerja kurang dari jam ini
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Ringkasan Konfigurasi Saat Ini</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<dt className='text-sm font-medium text-muted-foreground'>Jam Kerja</dt>
							<dd className='text-lg font-semibold'>
								{config.work_start_time} - {config.work_end_time}
							</dd>
						</div>
						<div>
							<dt className='text-sm font-medium text-muted-foreground'>Terlambat Setelah</dt>
							<dd className='text-lg font-semibold'>{config.late_threshold_minutes} menit</dd>
						</div>
						<div>
							<dt className='text-sm font-medium text-muted-foreground'>Setengah Hari Jika Kurang Dari</dt>
							<dd className='text-lg font-semibold'>{config.half_day_hours} jam</dd>
						</div>
					</dl>
				</CardContent>
			</Card>
		</div>
	);
}
