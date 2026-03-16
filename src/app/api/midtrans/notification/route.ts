import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const {
			order_id,
			status_code,
			gross_amount,
			signature_key,
			transaction_status,
			fraud_status,
		} = body;

		// Verify signature
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!serverKey) {
			return NextResponse.json(
				{ error: 'Server key not configured' },
				{ status: 500 }
			);
		}

		const expectedSignature = crypto
			.createHash('sha512')
			.update(`${order_id}${status_code}${gross_amount}${serverKey}`)
			.digest('hex');

		if (signature_key !== expectedSignature) {
			return NextResponse.json(
				{ error: 'Invalid signature' },
				{ status: 403 }
			);
		}

		// Determine payment status
		let paymentStatus: 'pending' | 'paid' | 'failed' = 'pending';

		if (transaction_status === 'capture') {
			paymentStatus = fraud_status === 'accept' ? 'paid' : 'failed';
		} else if (transaction_status === 'settlement') {
			paymentStatus = 'paid';
		} else if (
			['cancel', 'deny', 'expire'].includes(transaction_status)
		) {
			paymentStatus = 'failed';
		}

		// Update payslip
		const supabase = await createClient({ isAdmin: true });

		const updateData: Record<string, unknown> = {
			payment_status: paymentStatus,
		};

		if (paymentStatus === 'paid') {
			updateData.paid_at = new Date().toISOString();
		}

		const { error } = await supabase
			.from('payslips')
			.update(updateData)
			.eq('midtrans_transaction_id', order_id);

		if (error) {
			console.error('Failed to update payslip:', error);
			return NextResponse.json(
				{ error: 'Failed to update payslip' },
				{ status: 500 }
			);
		}

		// If all payslips for a payroll run are paid, mark the run as paid
		if (paymentStatus === 'paid') {
			// Find the payroll run from the payslip
			const { data: payslip } = await supabase
				.from('payslips')
				.select('payroll_run_id')
				.eq('midtrans_transaction_id', order_id)
				.single();

			if (payslip) {
				const { data: unpaidSlips } = await supabase
					.from('payslips')
					.select('id')
					.eq('payroll_run_id', payslip.payroll_run_id)
					.neq('payment_status', 'paid');

				if (!unpaidSlips || unpaidSlips.length === 0) {
					await supabase
						.from('payroll_runs')
						.update({ status: 'paid' })
						.eq('id', payslip.payroll_run_id);
				}
			}
		}

		return NextResponse.json({ status: 'ok' });
	} catch (error) {
		console.error('Midtrans webhook error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
