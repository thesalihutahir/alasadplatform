"use client";

import React from 'react';
import { CheckCircle, AlertTriangle, Trash2 } from 'lucide-react'; // Added icons

export default function SuccessModal({ 
    isOpen, 
    onClose, 
    type = 'success', 
    title, 
    message, 
    onConfirm, 
    onCancel,
    confirmText = "Continue",
    cancelText
}) {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-brown-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            <div className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl border-2 overflow-hidden transform animate-in zoom-in-95 duration-200 ${isDanger ? 'border-red-500' : 'border-brand-gold'}`}>
                
                {/* Decoration Header */}
                <div className={`h-2 w-full ${isDanger ? 'bg-red-500' : 'bg-brand-gold'}`}></div>

                <div className="p-8 text-center">
                    {/* Icon Logic */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-red-100' : 'bg-green-100'}`}>
                        {isDanger ? (
                            <Trash2 className="w-8 h-8 text-red-600" />
                        ) : (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        )}
                    </div>

                    {/* Content */}
                    <h3 className="font-agency text-3xl text-brand-brown-dark mb-2">
                        {title || "Success!"}
                    </h3>
                    <p className="font-lato text-gray-500 mb-8 leading-relaxed">
                        {message || "Action completed successfully."}
                    </p>

                    {/* Buttons Row */}
                    <div className="flex gap-3">
                        {/* Cancel Button (Only if cancelText exists) */}
                        {cancelText && (
                            <button 
                                onClick={onCancel || onClose}
                                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase text-xs tracking-wider"
                            >
                                {cancelText}
                            </button>
                        )}

                        {/* Confirm Button */}
                        <button 
                            onClick={onConfirm || onClose}
                            className={`flex-1 py-3 text-white font-bold rounded-xl transition-colors shadow-lg tracking-wide uppercase text-xs ${
                                isDanger 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' 
                                : 'bg-brand-gold hover:bg-brand-brown-dark shadow-brand-gold/20'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
