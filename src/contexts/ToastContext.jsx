
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    // We can wrap react-toastify's toast function or manage our own state if needed.
    // For simplicity and consistency with the existing code's desire for custom toasts,
    // we'll stick to react-toastify but provide a wrapper.

    const showToast = useCallback((message, type = 'success') => {
        if (type === 'error') {
            toast.error(message);
        } else if (type === 'success') {
            toast.success(message);
        } else {
            toast.info(message);
        }
    }, []);

    const showConfirm = useCallback((message, onConfirm) => {
        const toastId = toast(
            <div className="p-1">
                <p className="font-semibold text-gray-800 mb-3 text-sm">{message}</p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(toastId);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            toast.dismiss(toastId);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors"
                    >
                        Confirm
                    </button>
                </div>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                className: 'border border-gray-100 shadow-xl'
            }
        );
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showConfirm }}>
            {children}
            <ToastContainer position="top-right" autoClose={4000} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
