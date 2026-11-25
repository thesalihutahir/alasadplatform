import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

function signatureMatches(expectedHex, receivedHex) {
    if (typeof receivedHex !== 'string') return false;
    const a = Buffer.from(expectedHex, 'utf8');
    const b = Buffer.from(receivedHex, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request) {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        const signature = request.headers.get('x-paystack-signature');

        if (!secret) {
            return NextResponse.json({ message: "Secret key missing" }, { status: 500 });
        }

        const rawBody = await request.text();
        const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

        if (!signatureMatches(hash, signature)) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
        }

        const event = JSON.parse(rawBody);

        if (event.event === 'charge.success') {
            const data = event.data || {};
            const reference = data.reference;

            if (typeof reference === 'string' && reference) {
                const adminDb = getAdminDb();
                const snapshot = await adminDb
                    .collection('donations')
                    .where('reference', '==', reference)
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const docSnapshot = snapshot.docs[0];
                    const donation = docSnapshot.data();

                    if (donation.status !== 'Success') {
                        const expectedKobo = Math.ceil(Number(donation.amount) * 100);
                        const amountOk = Number.isFinite(expectedKobo) && expectedKobo === Number(data.amount);
                        const currencyOk = !data.currency || data.currency === 'NGN';

                        if (amountOk && currencyOk) {
                            await docSnapshot.ref.update({
                                status: 'Success',
                                paidAt: FieldValue.serverTimestamp(),
                                updatedAt: FieldValue.serverTimestamp(),
                                paystackReference: data.reference,
                                paystackTransactionId: String(data.id),
                                gateway: "paystack",
                            });
                        } else {
                            await docSnapshot.ref.update({
                                flag: 'amount_mismatch',
                                updatedAt: FieldValue.serverTimestamp(),
                                paystackReference: data.reference,
                                paystackTransactionId: String(data.id),
                                gateway: "paystack",
                            });
                        }
                    }
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
