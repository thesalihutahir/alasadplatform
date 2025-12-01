import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Now available thanks to package.json update

// Simulated environment variable for the Paystack Secret Key
// In a real Vercel app, this would be retrieved from the Vercel Environment Variables (process.env.PAYSTACK_SECRET_KEY)
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_..."; 
const PAYSTACK_URL = 'https://api.paystack.co/transaction/initialize';

// API Handler for POST requests
export async function POST(request) {
    try {
        const { amount, email, reference } = await request.json();

        if (!amount || !email) {
            return NextResponse.json({ error: 'Amount and email are required.' }, { status: 400 });
        }

        // Generate a unique reference if one is not provided
        const transactionReference = reference || uuidv4();

        const paystackResponse = await fetch(PAYSTACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                // Paystack uses amount in kobo (cents/smallest currency unit), so we multiply by 100
                amount: amount * 100, 
                email: email,
                reference: transactionReference,
                callback_url: `${request.headers.get('origin')}/donate/verify`, // Redirect back to verify
            }),
        });

        const data = await paystackResponse.json();

        if (data.status) {
            return NextResponse.json(data, { status: 200 });
        } else {
            console.error("Paystack API Error:", data.message);
            return NextResponse.json({ error: 'Payment initialization failed.', details: data.message }, { status: 500 });
        }

    } catch (error) {
        console.error('API Processing Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}