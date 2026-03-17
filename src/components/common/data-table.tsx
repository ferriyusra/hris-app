import { ReactNode } from 'react';
import { Card } from '../ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import PaginationDataTable from './pagination-data-table';
import { Label } from '../ui/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { LIMIT_LISTS } from '@/constants/data-table-constant';
import { Inbox } from 'lucide-react';

export default function DataTable({
	header,
	data,
	isLoading,
	totalPages,
	currentPage,
	currentLimit,
	onChangePage,
	onChangeLimit,
}: {
	header: string[];
	data: (string | ReactNode)[][];
	isLoading?: boolean;
	totalPages: number;
	currentPage: number;
	currentLimit: number;
	onChangePage: (page: number) => void;
	onChangeLimit: (limit: number) => void;
}) {
	return (
		<div className='w-full flex flex-col gap-4 animate-fade-in-up'>
			<Card className='p-0 overflow-hidden rounded-xl'>
				<Table className='w-full'>
					<TableHeader className='bg-muted/50 sticky top-0 z-10'>
						<TableRow>
							{header.map((column) => (
								<TableHead key={`th-${column}`} className='px-6 py-3'>
									{column}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data?.map((row, rowIndex) => (
							<TableRow key={`tr-${rowIndex}`}>
								{row.map((column, columnIndex) => (
									<TableCell
										className='px-6 py-3'
										key={`tc-${rowIndex}-${columnIndex}`}>
										{column}
									</TableCell>
								))}
							</TableRow>
						))}
						{data?.length === 0 && !isLoading && (
							<TableRow>
								<TableCell colSpan={header.length} className='h-32'>
									<div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
										<Inbox className='h-8 w-8 opacity-40' />
										<span className='text-sm'>Tidak Ada Data</span>
									</div>
								</TableCell>
							</TableRow>
						)}
						{isLoading && (
							<>
								{Array.from({ length: 4 }).map((_, i) => (
									<TableRow key={`skeleton-${i}`}>
										{header.map((_, colIdx) => (
											<TableCell key={`skeleton-cell-${i}-${colIdx}`} className='px-6 py-3'>
												<Skeleton className='h-5 w-full' />
											</TableCell>
										))}
									</TableRow>
								))}
							</>
						)}
					</TableBody>
				</Table>
			</Card>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Label className='text-muted-foreground text-xs'>Limit</Label>
					<Select
						value={currentLimit.toString()}
						onValueChange={(value) => onChangeLimit(Number(value))}>
						<SelectTrigger>
							<SelectValue placeholder='Select Limit' />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Limit</SelectLabel>
								{LIMIT_LISTS.map((limit) => (
									<SelectItem key={limit} value={limit.toString()}>
										{limit}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				{totalPages > 1 && (
					<div className='flex justify-end'>
						<PaginationDataTable
							currentPage={currentPage}
							onChangePage={onChangePage}
							totalPages={totalPages}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
