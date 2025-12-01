import { NextResponse } from 'next/server';

// FIX: Explicitly set dynamic to 'force-dynamic' to prevent Next.js from
// trying to statically render this route, which accesses request.url.
export const dynamic = 'force-dynamic';

// Simulated environment variable for the Paystack Secret Key
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_...";
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify/';

// API Handler for GET requests (Paystack typically sends verification reference via query)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json({ status: false, message: 'Transaction reference is missing.' }, { status: 400 });
        }

        const paystackResponse = await fetch(`${PAYSTACK_VERIFY_URL}${reference}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = await paystackResponse.json();

        if (data.status && data.data.status === 'success') {
            // Transaction successful. Here you would typically update Firestore/DB.
            // Example: await updateDonationRecord(data.data);
            
            return NextResponse.json({ status: true, message: 'Payment verified successfully.', data: data.data }, { status: 200 });
        } else {
            console.error("Paystack Verification Failed:", data);
            return NextResponse.json({ status: false, message: 'Payment verification failed.', details: data.message }, { status: 500 });
        }

    } catch (error) {
        console.error('API Verification Error:', error);
        return NextResponse.json({ status: false, message: 'Internal server error during verification.' }, { status: 500 });
    }
}