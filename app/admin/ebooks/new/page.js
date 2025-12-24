"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, UploadCloud, FileText, CheckCircle, X, Library } from 'lucide-react';

export default function UploadBookPage() {

    const availableCollections = [
        { id: 1, title: "Tafsir Volumes (1-10)" },
        { id: 2, title: "Ramadan Essentials" }
    ];

    const [formData, setFormData] = useState({
        title: '',
        author: 'Sheikh Goni Dr. Muneer Ja\'afar',
        collection: '',
        category: 'Tafsir',
        language: 'English',
        description: ''
    });

    const [pdfFile, setPdfFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file) setPdfFile(file);
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!pdfFile || !coverImage) {
            alert("Please upload both a PDF and a Cover Image.");
            return;
        }
        alert(`Book "${formData.title}" uploading... \nCollection: ${formData.collection || 'None'}`);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* Header - Adjusted for Mobile Responsiveness */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ebooks" className="p-2 hover:bg-gray-200 rounded-lg"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload eBook</h1>
                        <p className="font-lato text-sm text-gray-500">Add a new book or paper to the library.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button type="button" className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-center justify-center">Cancel</button>
                    <button type="submit" disabled={!pdfFile} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white ${pdfFile ? 'bg-brand-gold hover:bg-brand-brown-dark' : 'bg-gray-300 cursor-not-allowed'}`}>
                        <Save className="w-4 h-4" /> Publish
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Upload Zones */}
                <div className="space-y-6">
                    {/* PDF Upload */}
                    <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors h-48 flex flex-col items-center justify-center ${pdfFile ? 'bg-green-50 border-green-300' : 'bg-white border-gray-300 hover:border-brand-gold'}`}>
                        {pdfFile ? (
                            <div>
                                <FileText className="w-10 h-10 text-green-600 mx-auto mb-2" />
                                <p className="font-bold text-brand-brown-dark text-sm truncate w-48">{pdfFile.name}</p>
                                <button type="button" onClick={() => setPdfFile(null)} className="text-red-500 text-xs font-bold hover:underline mt-2">Change PDF</button>
                            </div>
                        ) : (
                            <>
                                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                <h3 className="font-bold text-gray-700 text-sm">Upload Book PDF</h3>
                                <input type="file" accept=".pdf" onChange={handlePdfChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>

                    {/* Cover Image Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-agency text-xl text-brand-brown-dark mb-4">Book Cover</h3>
                        <div className="relative w-full aspect-[2/3] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-gold">
                            {coverPreview ? (
                                <>
                                    <Image src={coverPreview} alt="Cover" fill className="object-cover" />
                                    <button type="button" onClick={() => {setCoverImage(null); setCoverPreview(null);}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md"><X className="w-4 h-4" /></button>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-500 text-center px-4">Upload Cover (JPG/PNG)</p>
                                    <input type="file" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Metadata */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2">Book Details</h3>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Book Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50" />
                        </div>

                        {/* Collection Selector */}
                        <div className="bg-brand-sand/20 p-4 rounded-xl border border-brand-gold/20">
                            <label className="flex items-center gap-2 text-xs font-bold text-brand-brown-dark uppercase tracking-wider mb-2">
                                <Library className="w-4 h-4" /> Add to Collection
                            </label>
                            <select name="collection" value={formData.collection} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50 cursor-pointer">
                                <option value="">Select a Collection (Optional)</option>
                                {availableCollections.map(col => <option key={col.id} value={col.title}>{col.title}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50">
                                    <option>Tafsir</option>
                                    <option>Fiqh</option>
                                    <option>Aqeedah</option>
                                    <option>History</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brand-brown mb-1">Language</label>
                                <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50">
                                    <option>English</option>
                                    <option>Hausa</option>
                                    <option>Arabic</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brand-brown mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-gold/50"></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
