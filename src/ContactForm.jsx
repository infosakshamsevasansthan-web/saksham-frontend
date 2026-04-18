import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react'; // Ek icon ke liye

const ContactForm = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Form data nikaalna
        const formData = {
            name: e.target.name.value,
            mobile: e.target.mobile.value,
            message: e.target.message.value,
        };

        try {
            const res = await fetch('https://saksham-backend-9719.onrender.com/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true); // Success message dikhane ke liye
            }
        } catch (err) {
            alert("Kuch galti hui, dobara try karein!");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-xl animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Thank You!</h2>
                <p className="text-slate-500 text-center text-lg">
                    Aapka message humein mil gaya hai. Hamari team jald hi aap se sampark karegi.
                </p>
                <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                    Back to Form
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Your Name" className="w-full p-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            <input name="mobile" placeholder="Mobile Number" className="w-full p-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            <textarea name="message" placeholder="Message" rows="4" className="w-full p-4 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
            
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg hover:shadow-lg hover:bg-emerald-700 transition-all flex justify-center items-center"
            >
                {loading ? "Sending..." : "Submit Message 🚀"}
            </button>
        </form>
    );
};
