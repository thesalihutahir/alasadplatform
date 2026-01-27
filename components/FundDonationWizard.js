"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
    ArrowLeft, ArrowRight, CreditCard, Landmark, CheckCircle, 
    Copy, User, Mail, Phone, ChevronRight, Lock, Loader2, AlertCircle
} from 'lucide-react';

export default function FundDonationWizard({ fundId }) {
    const router = useRouter();

    const [fund, setFund] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1); 
    const [processing, setProcessing] = useState(false);

    const [amount, setAmount] = useState(5000);
    const [customAmount, setCustomAmount] = useState('');
    const [donor, setDonor] = useState({ name: '', email: '', phone: '', note: '' });
    const [paymentMethod, setPaymentMethod] = useState('paystack'); 
    
    // Donation Reference
    const [donationRef, setDonationRef] = useState(""); 

    const PRESET_AMOUNTS = [1000, 5000, 10000, 20000, 50000, 100000];
    
    const generateRef = () => {
        return `DON-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    };

    useEffect(() => {
        const fetchFund = async () => {
            if (!fundId) return;
            try {
                const docRef = doc(db, "donation_funds", fundId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFund({ id: docSnap.id, ...docSnap.data() });
                } else {
                    router.push('/get-involved/donate');
                }
            } catch (error) {
                console.error("Error fetching fund:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFund();
    }, [fundId, router]);

    const config = {
        reference: donationRef, 
        email: donor.email,
        amount: Math.ceil(amount * 100), 
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        metadata: {
            fundId: fund?.id,
            fundTitle: fund?.title,
            donorName: donor.name,
        }
    };
    
    const initializePaystack = usePaystackPayment(config);

    const createPendingRecord = async (method) => {
        setProcessing(true);
        const newRef = generateRef();
        setDonationRef(newRef);

        try {
            await setDoc(doc(db, "donations", newRef), {
                fundId: fund.id,
                fundTitle: fund.title,
                amount: amount,
                donorName: donor.name || "Anonymous",
                donorEmail: donor.email,
                donorPhone: donor.phone || "",
                message: donor.note || "",
                method: method,
                reference: newRef,
                status: "Pending",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return newRef;
        } catch (error) {
            console.error("Error creating record:", error);
            alert("Could not initialize donation. Please try again.");
            setProcessing(false);
            return null;
        }
    };

    const handleNextStep = () => {
        if (step === 1 && amount < 100) return alert("Minimum donation is ₦100");
        if (step === 2 && !donor.email) return alert("Please provide an email address.");
        setStep(prev => prev + 1);
    };

    const handlePaystackPayment = async () => {
        const ref = await createPendingRecord('paystack');
        if (!ref) return;

        const freshConfig = { ...config, reference: ref };
        
        initializePaystack({
            config: freshConfig,
            onSuccess: async () => {
                try {
                    const res = await fetch('/api/paystack/verify', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ reference: ref })
                    });
                    const data = await res.json();
                    
                    if (data.success) {
                        setStep(4);
                    } else {
                        alert("Payment verification failed. Please contact support.");
                    }
                } catch (err) {
                    console.error("Verification error", err);
                } finally {
                    setProcessing(false);
                }
            },
            onClose: async () => {
                // CHANGED: We now verify on close to distinguish 'Failed' vs 'Cancelled'
                setProcessing(true);
                try {
                    await fetch('/api/paystack/verify', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ reference: ref })
                    });
                    // We don't alert failure here, as the user knowingly closed it.
                    // Just update the DB silently.
                    alert("Transaction ended.");
                } catch (error) {
                    console.error("Error verifying on close:", error);
                } finally {
                    setProcessing(false);
                }
            }
        });
    };

    const handleBankTransfer = async () => {
        const ref = await createPendingRecord('bank');
        if (ref) {
            setStep(4);
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-brand-gold" /></div>;
    if (!fund) return null;

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-7">
                 <div className="sticky top-32">
                    <Link href="/get-involved/donate" className="inline-flex items-center text-gray-500 hover:text-brand-brown-dark mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Funds
                    </Link>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg mb-8">
                        <Image src={fund.coverImage || "/fallback.webp"} alt={fund.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white">
                            <h1 className="font-agency text-4xl md:text-5xl font-bold mb-2">{fund.title}</h1>
                            {fund.tagline && <p className="text-white/80 font-lato text-lg">{fund.tagline}</p>}
                        </div>
                    </div>
                    <div className="prose prose-lg text-gray-600 leading-relaxed font-lato">
                        <h3 className="font-agency text-2xl text-brand-brown-dark">About this Fund</h3>
                        <p>{fund.description}</p>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-5 relative z-10">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-32">
                    {step < 4 && (
                        <div className="bg-gray-50 px-8 py-4 border-b border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                            <span className={step >= 1 ? 'text-brand-brown-dark' : ''}>1. Amount</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className={step >= 2 ? 'text-brand-brown-dark' : ''}>2. Details</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className={step >= 3 ? 'text-brand-brown-dark' : ''}>3. Pay</span>
                        </div>
                    )}

                    <div className="p-8">
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-6">Choose Amount</h2>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {PRESET_AMOUNTS.map((amt) => (
                                        <button key={amt} onClick={() => { setAmount(amt); setCustomAmount(''); }} className={`py-3 rounded-xl text-sm font-bold border transition-all ${amount === amt && customAmount === '' ? 'bg-brand-brown-dark text-white border-brand-brown-dark shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold'}`}>₦{amt.toLocaleString()}</button>
                                    ))}
                                </div>
                                <div className="relative mb-8">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                    <input type="text" value={customAmount} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setCustomAmount(v); setAmount(v ? parseInt(v) : 0); }} placeholder="Enter custom amount" className="w-full pl-8 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-bold text-gray-800 text-lg" />
                                </div>
                                <button onClick={handleNextStep} className="w-full py-4 bg-brand-gold text-white font-bold rounded-xl text-lg hover:bg-brand-brown-dark transition-all shadow-lg flex items-center justify-center gap-2">Continue <ArrowRight className="w-5 h-5" /></button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-2">Your Details</h2>
                                <div className="relative"><User className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" /><input type="text" placeholder="Full Name (Optional)" value={donor.name} onChange={(e) => setDonor({...donor, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" /></div>
                                <div className="relative"><Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" /><input type="email" placeholder="Email Address *" value={donor.email} onChange={(e) => setDonor({...donor, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" /></div>
                                <div className="relative"><Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" /><input type="text" placeholder="Phone (Optional)" value={donor.phone} onChange={(e) => setDonor({...donor, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm" /></div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setStep(1)} className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Back</button>
                                    <button onClick={handleNextStep} className="flex-grow py-4 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark shadow-lg">Proceed</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="font-agency text-3xl text-brand-brown-dark mb-2">Select Payment</h2>
                                <p className="text-gray-500 text-sm mb-6">Total: <span className="text-brand-brown-dark font-bold text-lg">₦{amount.toLocaleString()}</span></p>
                                
                                <div className="space-y-4 mb-8">
                                    <button onClick={() => setPaymentMethod('paystack')} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'paystack' ? 'border-brand-gold bg-brand-sand/10' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600"><CreditCard className="w-5 h-5" /></div><span className="font-bold text-gray-800">Pay Online (Card/Transfer)</span></div>
                                        {paymentMethod === 'paystack' && <CheckCircle className="w-5 h-5 text-brand-gold" />}
                                    </button>
                                    <button onClick={() => setPaymentMethod('bank')} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${paymentMethod === 'bank' ? 'border-brand-gold bg-brand-sand/10' : 'border-gray-100'}`}>
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Landmark className="w-5 h-5" /></div><span className="font-bold text-gray-800">Manual Bank Transfer</span></div>
                                        {paymentMethod === 'bank' && <CheckCircle className="w-5 h-5 text-brand-gold" />}
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Back</button>
                                    
                                    {paymentMethod === 'paystack' ? (
                                        <button 
                                            onClick={handlePaystackPayment} 
                                            disabled={processing}
                                            className="flex-grow py-4 bg-brand-gold text-white font-bold rounded-xl hover:bg-brand-brown-dark shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                                            {processing ? 'Processing...' : 'Pay Securely'}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleBankTransfer} 
                                            disabled={processing}
                                            className="flex-grow py-4 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold shadow-lg flex items-center justify-center gap-2"
                                        >
                                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Landmark className="w-4 h-4" />}
                                            Get Account Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="animate-in fade-in zoom-in-95 duration-300 text-center">
                                {paymentMethod === 'paystack' ? (
                                    <>
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
                                        <h2 className="font-agency text-3xl text-brand-brown-dark mb-2">Thank You!</h2>
                                        <p className="text-gray-500 text-sm mb-8">Your donation was successful. May Allah accept it.</p>
                                        <Link href="/" className="block w-full py-4 bg-brand-brown-dark text-white font-bold rounded-xl hover:bg-brand-gold transition-colors">Return Home</Link>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-brand-sand/30 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-brown-dark"><Landmark className="w-8 h-8" /></div>
                                        <h2 className="font-agency text-2xl text-brand-brown-dark mb-2">Bank Transfer Details</h2>
                                        <p className="text-gray-500 text-xs mb-6 px-4">Transfer <strong className="text-black">₦{amount.toLocaleString()}</strong> to:</p>
                                        
                                        <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-4 mb-6 border border-gray-200">
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Bank</p><p className="font-bold text-gray-800">{fund.bankDetails?.bankName || "Jaiz Bank"}</p></div>
                                            <div><p className="text-xs text-gray-400 uppercase font-bold">Account</p><p className="font-bold text-gray-800">{fund.bankDetails?.accountName || "Al Asad Foundation"}</p></div>
                                            <div className="flex justify-between items-end">
                                                <div><p className="text-xs text-gray-400 uppercase font-bold">Number</p><p className="font-bold text-2xl text-brand-brown-dark tracking-widest">{fund.bankDetails?.accountNumber || "0000000000"}</p></div>
                                                <button onClick={() => navigator.clipboard.writeText(fund.bankDetails?.accountNumber)} className="p-2 bg-white border rounded-lg hover:text-brand-gold"><Copy className="w-4 h-4" /></button>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <p className="text-xs text-red-500 uppercase font-bold mb-1">Use this Reference (Required)</p>
                                                <div className="flex justify-between items-center bg-white border border-brand-gold/30 rounded-lg p-3">
                                                    <span className="font-mono font-bold text-brand-gold">{donationRef}</span>
                                                    <button onClick={() => navigator.clipboard.writeText(donationRef)}><Copy className="w-4 h-4 text-gray-400 hover:text-brand-gold" /></button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-left mb-6">
                                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-800">Your donation is marked as <strong>Pending</strong>. It will be confirmed once we receive the funds.</p>
                                        </div>
                                        <Link href="/" className="block w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">I have made the transfer</Link>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
