// src/lib/paystack.js
export const verifyPaystackTransaction = async (reference) => {
    try {
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        
        if (!secretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
        }

        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Important: Never cache verification requests
        });

        const data = await response.json();
        return data; // Returns { status: true, data: { status: 'success', ... } }
    } catch (error) {
        console.error("Paystack Verification Error:", error);
        return { status: false, message: error.message };
    }
};
