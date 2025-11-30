// app/api/paystack/initialize/route.js
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_INITIALIZE_URL = 'https://api.paystack.co/transaction/initialize';

export async function POST(request) {
  try {
    const { amount, email, name, donationType } = await request.json();

    // 1. Generate Unique Reference for the transaction
    const reference = `ALASAD-${uuidv4()}`;

    // 2. Prepare Paystack request body
    const amountInKobo = Math.round(parseFloat(amount) * 100); // Paystack uses Kobo

    const body = JSON.stringify({
      email: email,
      amount: amountInKobo,
      reference: reference,
      // Pass donation type and donor name as metadata
      metadata: {
        custom_fields: [
          { display_name: "Donor Name", variable_name: "donor_name", value: name },
          { display_name: "Donation Type", variable_name: "donation_type", value: donationType }
        ]
      },
      // You can set the callback_url here, or set it on your Paystack Dashboard
      // callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/donations/verify` 
    });

    // 3. Make the secure server-side call to Paystack
    const paystackResponse = await fetch(PAYSTACK_INITIALIZE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok || !data.status) {
        // Log error and return user-friendly message
        console.error("Paystack Initialization Error:", data.message);
        return NextResponse.json({ error: 'Failed to initiate payment', details: data.message }, { status: 400 });
    }

    // 4. Return the authorization URL to the frontend
    return NextResponse.json({ 
        url: data.data.authorization_url, 
        reference: reference 
    });

  } catch (error) {
    console.error('API Error during initialization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
