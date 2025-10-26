'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { AttendanceTrend } from '../actions';

interface AttendanceTrendsChartProps {
	data: AttendanceTrend[];
}

export default function AttendanceTrendsChart({ data }: AttendanceTrendsChartProps) {
	// Format date for display
	const formattedData = data.map((item) => ({
		...item,
		displayDate: new Date(item.date).toLocaleDateString('id-ID', {
			month: 'short',
			day: 'numeric',
		}),
	}));

	return (
		<Card className='col-span-full'>
			<CardHeader>
				<CardTitle className='text-lg flex items-center gap-2'>
					<TrendingUp className='h-5 w-5 text-blue-600' />
					Tren Kehadiran (7 Hari Terakhir)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width='100%' height={300}>
					<AreaChart data={formattedData}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis
							dataKey='displayDate'
							tick={{ fontSize: 12 }}
							tickLine={false}
						/>
						<YAxis tick={{ fontSize: 12 }} tickLine={false} />
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(255, 255, 255, 0.95)',
								border: '1px solid #e2e8f0',
								borderRadius: '8px',
								padding: '8px',
							}}
						/>
						<Legend
							wrapperStyle={{ fontSize: '12px' }}
							iconType='circle'
						/>
						<Area
							type='monotone'
							dataKey='present'
							stackId='1'
							stroke='#10b981'
							fill='#10b981'
							fillOpacity={0.6}
							name='Hadir'
						/>
						<Area
							type='monotone'
							dataKey='late'
							stackId='1'
							stroke='#f59e0b'
							fill='#f59e0b'
							fillOpacity={0.6}
							name='Terlambat'
						/>
						<Area
							type='monotone'
							dataKey='absent'
							stackId='1'
							stroke='#ef4444'
							fill='#ef4444'
							fillOpacity={0.6}
							name='Tidak Hadir'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
