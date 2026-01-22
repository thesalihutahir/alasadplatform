"use client";

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react'; // Import simple loader for fallback

// Dynamically import the wizard with ssr: false
const FundDonationWizard = dynamic(() => import('@/components/FundDonationWizard'), {
    ssr: false,
    loading: () => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
        </div>
    ),
});

export default function DonateFundPage() {
    const params = useParams();
    const id = params?.id;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-lato">
            <Header />
            <main className="flex-grow pt-24 pb-20 px-4">
                {id ? <FundDonationWizard fundId={id} /> : (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
