"use client";

import React, { createContext, useContext, useState } from 'react';
import SuccessModal from '@/components/SuccessModal';

const ModalContext = createContext();

export function ModalProvider({ children }) {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'success', // 'success' or 'danger'
        title: '',
        message: '',
        confirmText: 'Continue',
        cancelText: 'Cancel', // New prop
        onConfirm: null,
        onCancel: null, // New prop
    });

    const closeModal = () => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    };

    // 1. Existing Success Modal
    const showSuccess = ({ title, message, confirmText, onConfirm }) => {
        setModalConfig({
            isOpen: true,
            type: 'success',
            title,
            message,
            confirmText: confirmText || "Continue",
            cancelText: null, // No cancel button for success
            onConfirm: () => {
                if (onConfirm) onConfirm();
                closeModal();
            }
        });
    };

    // 2. NEW: Confirm/Delete Modal
    const showConfirm = ({ title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, type = 'danger' }) => {
        setModalConfig({
            isOpen: true,
            type, // usually 'danger' for deletes
            title,
            message,
            confirmText,
            cancelText,
            onConfirm: () => {
                if (onConfirm) onConfirm();
                closeModal();
            },
            onCancel: closeModal // Default cancel just closes
        });
    };

    return (
        <ModalContext.Provider value={{ showSuccess, showConfirm }}>
            {children}
            <SuccessModal 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                type={modalConfig.type} // Pass the type
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
                onConfirm={modalConfig.onConfirm}
                onCancel={modalConfig.onCancel}
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    return useContext(ModalContext);
}
