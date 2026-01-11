"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomDatePicker({ label, value, onChange, dir }) {
    const [isOpen, setIsOpen] = useState(false);
    // Initialize viewDate to today if value is invalid/empty, otherwise parse the value
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date(value);
        return isNaN(d.getTime()) ? new Date() : d;
    });
    
    const calendarRef = useRef(null);

    // Sync view if external value changes (and is valid)
    useEffect(() => {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            setViewDate(d);
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Calendar Logic
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const daysShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const handleDateClick = (day) => {
        // Create date object in local time
        const selected = new Date(currentYear, currentMonth, day);
        // Format to YYYY-MM-DD manually to avoid timezone shifts
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, '0');
        const d = String(selected.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${d}`;
        
        onChange(dateString); // Pass simple string back
        setIsOpen(false);
    };

    const changeMonth = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(currentMonth + direction);
        setViewDate(newDate);
    };

    // Display Logic
    const displayValue = value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Select Date...";

    return (
        <div className="relative group" ref={calendarRef}>
            {label && <label className="block text-xs font-bold text-gray-500 uppercase mb-2">{label}</label>}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 bg-white border border-gray-200 rounded-xl text-sm flex justify-between items-center cursor-pointer transition-all hover:border-brand-gold/50 ${isOpen ? 'ring-2 ring-brand-gold/20 border-brand-gold' : ''}`}
                dir={dir}
            >
                <span className={`${!value ? 'text-gray-400' : 'text-gray-700 font-bold'}`}>{displayValue}</span>
                <Calendar className="w-4 h-4 text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute z-50 top-full mt-2 w-full min-w-[280px] bg-white border border-gray-100 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                        <span className="font-agency text-lg font-bold text-brand-brown-dark">{months[currentMonth]} {currentYear}</span>
                        <button type="button" onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {daysShort.map(d => <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                            const day = i + 1;
                            // Check equality string-wise to avoid time issues
                            const checkDate = new Date(currentYear, currentMonth, day);
                            const checkYear = checkDate.getFullYear();
                            const checkMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
                            const checkD = String(checkDate.getDate()).padStart(2, '0');
                            const checkStr = `${checkYear}-${checkMonth}-${checkD}`;
                            
                            const isSelected = value === checkStr;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDateClick(day)}
                                    className={`h-8 w-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors 
                                        ${isSelected ? 'bg-brand-gold text-white shadow-md' : 'text-gray-700 hover:bg-brand-sand/30'}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
