// src/app/api/paystack/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const signature = request.headers.get('x-paystack-signature');
        
        // Read text body for signature verification
        const rawBody = await request.text();
        
        const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

        if (hash !== signature) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);

        if (event.event === 'charge.success') {
            const data = event.data;
            const reference = data.reference;

            // Update Firestore
            const donationsRef = adminDb.collection('donations');
            const snapshot = await donationsRef.where('reference', '==', reference).limit(1).get();

            if (!snapshot.empty) {
                const docRef = snapshot.docs[0].ref;
                if (snapshot.docs[0].data().status !== 'Success') {
                    await docRef.update({
                        status: 'Success',
                        paidAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                        paystackReference: data.reference,
                        paystackTransactionId: data.id,
                        gateway: "paystack"
                    });
                    console.log(`Webhook: Updated donation ${reference} to Success`);
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
