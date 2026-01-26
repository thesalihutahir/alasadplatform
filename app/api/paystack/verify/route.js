import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { verifyPaystackTransaction } from '@/lib/paystack';
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request) {
    try {
        const { reference } = await request.json();

        if (!reference) {
            return NextResponse.json({ success: false, message: "No reference provided" }, { status: 400 });
        }

        // 1. Verify with Paystack
        const paystackResponse = await verifyPaystackTransaction(reference);

        if (!paystackResponse.status || paystackResponse.data.status !== 'success') {
            return NextResponse.json({ success: false, message: "Transaction not successful at Paystack" }, { status: 400 });
        }

        const pData = paystackResponse.data;

        // 2. Find Donation in Firestore
        const donationsRef = collection(db, 'donations');
        const q = query(donationsRef, where('reference', '==', reference));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ success: false, message: "Donation record not found" }, { status: 404 });
        }

        const docSnapshot = snapshot.docs[0];
        const docRef = docSnapshot.ref;
        
        // 3. Update Status
        if (docSnapshot.data().status !== 'Success') {
            await updateDoc(docRef, {
                status: 'Success',
                paidAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                paystackReference: pData.reference,
                paystackTransactionId: String(pData.id),
                paystackChannel: pData.channel,
                amount: pData.amount / 100,
                gateway: "paystack"
            });
        }

        return NextResponse.json({ success: true, message: "Verified successfully" });

    } catch (error) {
        console.error("Verification API Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
