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
					<TrendingUp className='h-5 w-5 text-primary' />
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
								backgroundColor: 'rgba(15, 15, 30, 0.9)',
								color: '#e2e8f0',
								border: 'none',
								borderRadius: '12px',
								padding: '10px 14px',
								boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
							}}
							itemStyle={{ color: '#e2e8f0' }}
							labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}
						/>
						<Legend
							wrapperStyle={{ fontSize: '12px' }}
							iconType='circle'
						/>
						<Area
							type='monotone'
							dataKey='present'
							stackId='1'
							stroke='#0d9488'
							fill='#0d9488'
							fillOpacity={0.5}
							name='Hadir'
						/>
						<Area
							type='monotone'
							dataKey='late'
							stackId='1'
							stroke='#d97706'
							fill='#d97706'
							fillOpacity={0.5}
							name='Terlambat'
						/>
						<Area
							type='monotone'
							dataKey='absent'
							stackId='1'
							stroke='#dc2626'
							fill='#dc2626'
							fillOpacity={0.5}
							name='Tidak Hadir'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
