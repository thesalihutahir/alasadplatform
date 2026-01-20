"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePaystackPayment } from 'react-paystack';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Heart, Users, CheckCircle, Loader2, Target, Wallet, Mail, Printer, Download, ShieldCheck } from 'lucide-react';

export default function DonatePage() {
    // --- 1. DATA STATE ---
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // --- 2. FORM STATE ---
    const [selectedProject, setSelectedProject] = useState(null);
    const [amount, setAmount] = useState(5000); // Base amount (Foundation gets this)
    const [customAmount, setCustomAmount] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    
    // --- 3. PAYMENT STATE ---
    const [showReceipt, setShowReceipt] = useState(false);
    const [transactionRef, setTransactionRef] = useState(null);

    // Static presets
    const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

    // --- 4. FEE CALCULATION (Donor Pays Fees) ---
    // Paystack: 1.5% + N100 (Waved N100 for < N2500)
    const calculateTotal = (baseAmount) => {
        let fee = 0;
        if (baseAmount < 2500) {
            fee = baseAmount * 0.015;
        } else {
            fee = (baseAmount * 0.015) + 100;
        }
        // Cap fee at N2000 if applicable, but standard formula usually:
        // To get exactly X, user pays: (X + 100) / (1 - 0.015) [Simplifying for standard usage]
        
        // Simple Helper: Just add the fee on top
        return Math.ceil(baseAmount + fee); 
    };

    const totalToPay = calculateTotal(amount); // Amount passed to Paystack

    // --- 5. FETCH PROJECTS ---
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const q = query(
                    collection(db, "donation_projects"),
                    where("status", "==", "Active"),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProjects(data);
                if (data.length > 0) setSelectedProject(data[0]);
                else setSelectedProject({ id: 'general', title: 'General Fund' });
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoadingProjects(false);
            }
        };
        fetchProjects();
    }, []);

    // --- 6. PAYSTACK CONFIG ---
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: totalToPay * 100, // Paystack takes Kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    };

    // Initialize Paystack Hook
    const initializePayment = usePaystackPayment(config);

    // Success Handler
    const onSuccess = async (reference) => {
        setTransactionRef(reference);
        
        // Save to Firebase
        try {
            await addDoc(collection(db, "donations"), {
                amount: amount, // Net amount intended
                totalPaid: totalToPay, // Actual amount paid
                fee: totalToPay - amount,
                donorName: name || 'Anonymous',
                donorEmail: email,
                projectTitle: selectedProject?.title || 'General Fund',
                reference: reference.reference,
                status: 'Success',
                createdAt: serverTimestamp(),
            });
            setShowReceipt(true);
        } catch (error) {
            console.error("Error saving donation:", error);
        }
    };

    const onClose = () => {
        console.log('Payment closed');
    };

    // Trigger Payment
    const handleDonate = (e) => {
        e.preventDefault();
        if(!email || amount < 100) {
            alert("Please provide a valid email and amount (min ₦100).");
            return;
        }
        initializePayment(onSuccess, onClose);
    };

    // Handle Amount Changes
    const handlePresetClick = (val) => {
        setAmount(val);
        setCustomAmount('');
    };

    const handleCustomChange = (e) => {
        const val = parseInt(e.target.value);
        setCustomAmount(e.target.value);
        setAmount(isNaN(val) ? 0 : val);
    };

    // --- RECEIPT COMPONENT ---
    const ReceiptModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative print:w-full print:h-full print:fixed print:top-0 print:left-0">
                {/* Header */}
                <div className="bg-brand-brown-dark p-6 text-center text-white print:bg-black">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                    <h2 className="text-2xl font-agency">Donation Successful</h2>
                    <p className="text-white/70 text-sm">Jazakumullahu Khairan</p>
                </div>

                {/* Body */}
                <div className="p-8 space-y-4 bg-[url('/bg-pattern.png')] bg-opacity-5">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Reference</span>
                        <span className="font-mono text-xs font-bold text-gray-700">{transactionRef?.reference}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Date</span>
                        <span className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Donor</span>
                        <span className="text-sm font-bold text-gray-800">{name || "Anonymous"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                        <span className="text-gray-500 text-sm">Cause</span>
                        <span className="text-sm font-bold text-brand-brown-dark">{selectedProject?.title}</span>
                    </div>
                    
                    <div className="mt-6 p-4 bg-green-50 rounded-xl flex justify-between items-center border border-green-100">
                        <span className="text-green-800 font-bold">Amount Donated</span>
                        <span className="text-2xl font-bold text-green-700">₦{amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        This is a computer generated receipt from Al-Asad Foundation.
                    </p>
                </div>

                {/* Actions (Hidden on Print) */}
                <div className="p-6 bg-gray-50 flex gap-3 print:hidden">
                    <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-brand-brown-dark text-white rounded-xl text-sm font-bold hover:bg-brand-gold transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-lato">
            <Header />
            {showReceipt && <ReceiptModal />}
            
            <main className="flex-grow pt-10 pb-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-agency text-brand-brown-dark mb-3">Invest in a Life. Donate Now.</h1>
                        <p className="text-lg text-brand-brown max-w-2xl mx-auto font-lato">
                            Your contribution directly funds education and community resilience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Project Selection */}
                        <div className="lg:col-span-2 space-y-6">
                            <h2 className="text-2xl font-agency text-brand-brown-dark flex items-center gap-2">
                                <Target className="w-5 h-5 text-brand-gold" /> Select a Cause
                            </h2>
                            {loadingProjects ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-gold" /></div>
                            ) : projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {projects.map((project) => (
                                        <button
                                            key={project.id}
                                            onClick={() => setSelectedProject(project)}
                                            className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${selectedProject?.id === project.id ? 'border-brand-gold bg-brand-sand/20 ring-1 ring-brand-gold' : 'border-gray-200 bg-white hover:border-brand-gold/50'}`}
                                        >
                                            <h3 className="font-bold text-brand-brown-dark text-lg mb-1">{project.title}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setSelectedProject({ id: 'general', title: 'General Fund' })}
                                        className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${selectedProject?.id === 'general' ? 'border-brand-gold bg-brand-sand/20 ring-1 ring-brand-gold' : 'border-gray-200 bg-white hover:border-brand-gold/50'}`}
                                    >
                                        <h3 className="font-bold text-brand-brown-dark text-lg mb-1">General Fund</h3>
                                        <p className="text-xs text-gray-500">Allocated where needed most.</p>
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center text-gray-500">No active campaigns. Donations go to General Fund.</div>
                            )}
                        </div>

                        {/* RIGHT: Payment Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
                                <form onSubmit={handleDonate} className="space-y-6">
                                    
                                    {/* Amount Grid */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Donation Amount (₦)</label>
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            {PRESET_AMOUNTS.map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => handlePresetClick(amt)}
                                                    className={`py-2 px-1 rounded-lg text-sm font-bold border transition-colors ${amount === amt && customAmount === '' ? 'bg-brand-brown-dark text-white border-brand-brown-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-gold'}`}
                                                >
                                                    {amt.toLocaleString()}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                            <input type="number" placeholder="Custom Amount" value={customAmount} onChange={handleCustomChange} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 font-bold text-gray-700" />
                                        </div>
                                    </div>

                                    {/* Donor Info */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">Your Information</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name (Optional)" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm" />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address *" required className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm" />
                                        </div>
                                    </div>

                                    {/* Fee Breakdown */}
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-500 space-y-1">
                                        <div className="flex justify-between"><span>Donation:</span> <span>₦{amount.toLocaleString()}</span></div>
                                        <div className="flex justify-between"><span>Processing Fee:</span> <span>₦{(totalToPay - amount).toLocaleString()}</span></div>
                                        <div className="flex justify-between font-bold text-brand-brown-dark pt-1 border-t border-gray-200 mt-1"><span>Total to Pay:</span> <span>₦{totalToPay.toLocaleString()}</span></div>
                                    </div>

                                    <button type="submit" className="w-full py-4 bg-brand-gold text-white font-agency text-xl rounded-xl hover:bg-brand-brown-dark transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-5 h-5" /> Secure Pay ₦{totalToPay.toLocaleString()}
                                    </button>
                                    
                                    <div className="flex justify-center gap-2">
                                        <Image src="https://upload.wikimedia.org/wikipedia/commons/2/23/Paystack_Logo.png" alt="Paystack" width={80} height={20} className="opacity-50 grayscale hover:grayscale-0 transition-all" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}