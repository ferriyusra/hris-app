import { Dialog } from '@radix-ui/react-dialog';
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Trash2 } from 'lucide-react';

export default function DialogDelete({
	open,
	onOpenChange,
	onSubmit,
	title,
	isLoading,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: () => void;
	title: string;
	isLoading: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[425px]'>
				<form className='grid gap-6'>
					<DialogHeader>
						<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-2'>
							<Trash2 className='h-5 w-5 text-destructive' />
						</div>
						<DialogTitle className='text-center'>Hapus {title}</DialogTitle>
						<DialogDescription className='text-center'>
							Apakah kamu yakin ingin menghapus data{' '}
							<span className='lowercase'>{title}</span>?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant='outline'>Batal</Button>
						</DialogClose>
						<Button
							variant='destructive'
							formAction={onSubmit}
							className='hover:shadow-lg'>
							{isLoading ? <Loader2 className='animate-spin' /> : 'Hapus'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
