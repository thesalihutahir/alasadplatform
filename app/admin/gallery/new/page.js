"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// Firebase
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// Global Modal & Components
import { useModal } from '@/context/ModalContext';
import CustomSelect from '@/components/CustomSelect'; 

import { 
    ArrowLeft, 
    Save, 
    Folder, 
    X, 
    Image as ImageIcon, 
    Loader2, 
    UploadCloud
} from 'lucide-react';

export default function UploadPhotosPage() {
    const router = useRouter();
    const { showSuccess } = useModal();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    // Data State
    const [availableAlbums, setAvailableAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState("");

    // Selected Files State (Local Previews)
    const [selectedFiles, setSelectedFiles] = useState([]);

    // 1. Fetch Albums on Mount
    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const q = query(collection(db, "gallery_albums"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const albums = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAvailableAlbums(albums);
            } catch (error) {
                console.error("Error fetching albums:", error);
            } finally {
                setIsLoadingAlbums(false);
            }
        };

        fetchAlbums();
    }, []);

    // Handle File Selection (Multiple)
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        // Filter valid images (max 5MB)
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) return false;
            if (file.size > 5 * 1024 * 1024) return false;
            return true;
        });

        if (validFiles.length < files.length) {
            alert("Some files were skipped (Must be image & under 5MB).");
        }

        // Create previews
        const newFileObjects = validFiles.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            name: file.name
        }));

        setSelectedFiles(prev => [...prev, ...newFileObjects]);
    };

    // Remove file from list
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Handler for Custom Select
    const handleAlbumChange = (value) => {
        setSelectedAlbum(value);
    };

    // 2. Handle Final Save to Firebase
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            alert("Please select at least one photo first.");
            return;
        }

        setIsSubmitting(true);
        setUploadProgress({ current: 0, total: selectedFiles.length });

        try {
            // Upload Loop
            const uploadPromises = selectedFiles.map(async (fileObj, index) => {
                const file = fileObj.file;
                
                // 1. Upload to Storage
                const storageRef = ref(storage, `gallery/${Date.now()}_${index}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                // Wait for upload
                await uploadTask; 
                const url = await getDownloadURL(uploadTask.snapshot.ref);

                // Update Progress (State update inside loop might batch, but good enough for simple UI)
                setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

                // 2. Save Metadata to Firestore
                return addDoc(collection(db, "gallery_photos"), {
                    url: url,
                    name: file.name,
                    albumId: selectedAlbum || "uncategorized",
                    // If we wanted to store album title for easier display without joins:
                    albumTitle: selectedAlbum ? availableAlbums.find(a => a.value === selectedAlbum)?.label : "Stream",
                    createdAt: serverTimestamp()
                });
            });

            // Wait for ALL uploads to finish
            await Promise.all(uploadPromises);

            showSuccess({
                title: "Photos Uploaded!",
                message: `Successfully published ${selectedFiles.length} photos to the gallery.`,
                confirmText: "Return to Gallery",
                onConfirm: () => router.push('/admin/gallery')
            });

        } catch (error) {
            console.error("Error saving photos:", error);
            alert("Failed to save photos. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Album Options for Custom Select
    const albumOptions = [
        { value: "", label: "-- No Album (Stream Only) --" },
        ...availableAlbums.map(alb => ({ value: alb.id, label: alb.title }))
    ];
    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 sticky top-0 bg-gray-50 z-20 py-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link href="/admin/gallery" className="p-2 hover:bg-gray-200 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="font-agency text-3xl text-brand-brown-dark">Upload Photos</h1>
                        <p className="font-lato text-sm text-gray-500">Add memories to the gallery.</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/admin/gallery" className="flex-1 md:flex-none">
                        <button type="button" className="w-full px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-center justify-center">
                            Cancel
                        </button>
                    </Link>
                    <button 
                        type="submit" 
                        disabled={selectedFiles.length === 0 || isSubmitting} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow-md text-white transition-colors ${
                            selectedFiles.length > 0 
                            ? 'bg-brand-gold hover:bg-brand-brown-dark' 
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSubmitting ? `Uploading ${uploadProgress.current}/${uploadProgress.total}` : `Publish (${selectedFiles.length})`}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT: Upload & Album Settings */}
                <div className="space-y-6">

                    {/* Album Selector */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <CustomSelect 
                            label="Assign to Album"
                            options={albumOptions}
                            value={selectedAlbum}
                            onChange={handleAlbumChange}
                            icon={Folder}
                            placeholder="Select Album"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                            Photos not assigned to an album will appear in the general "Recent Moments" stream.
                        </p>
                    </div>

                    {/* Simple Upload Box */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-brand-brown-dark text-sm mb-3 px-2">Add Photos</h3>

                        <div className="border-2 border-dashed border-brand-gold/30 bg-brand-sand/10 rounded-xl h-64 hover:bg-brand-sand/20 transition-colors relative flex flex-col items-center justify-center text-center p-4">
                            <UploadCloud className="w-10 h-10 text-brand-brown-dark mb-2" />
                            <p className="text-sm font-bold text-brand-brown-dark">Click to Select Photos</p>
                            <p className="text-xs text-gray-400 mt-1">Max 5MB per file</p>
                            
                            <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Preview Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px]">
                        <h3 className="font-agency text-xl text-brand-brown-dark border-b border-gray-100 pb-2 mb-4 flex justify-between items-center">
                            <span>Ready to Publish</span>
                            <span className="text-xs font-lato text-gray-400">{selectedFiles.length} items</span>
                        </h3>

                        {selectedFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-300">
                                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                                <p className="text-sm">No photos selected yet</p>
                                <p className="text-xs mt-1">Use the box on the left to add photos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {selectedFiles.map((fileObj, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 shadow-sm border border-gray-200">
                                        <Image 
                                            src={fileObj.preview} 
                                            alt="Preview" 
                                            fill 
                                            className="object-cover" 
                                        />

                                        {/* Remove Button */}
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(index)} 
                                            disabled={isSubmitting}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:hidden"
                                            title="Remove from list"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>

                                        {/* Filename caption */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm">
                                            <p className="text-[10px] text-white truncate text-center">{fileObj.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </form>
    );
}
