import PayrollDetail from './_components/payroll-detail';

export const metadata = {
	title: 'HRIS App | Detail Penggajian',
};

export default async function PayrollDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <PayrollDetail id={id} />;
}
