import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const showToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded shadow-[0_0_20px_rgba(0,0,0,0.5)] border-l-4 animate-slide-in ${
                    toast.type === "success" 
                    ? "bg-[#0c0a09] border-[#22c55e] text-[#e7e5e4]" 
                    : "bg-[#0c0a09] border-[#ef4444] text-[#e7e5e4]"
                }`}>
                    {toast.type === "success" ? <CheckCircle className="text-[#22c55e]" size={24} /> : <AlertCircle className="text-[#ef4444]" size={24} />}
                    <div>
                        <h4 className={`font-bold uppercase tracking-wider text-xs ${toast.type === "success" ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                            {toast.type === "success" ? "Success" : "Error"}
                        </h4>
                        <p className="text-sm">{toast.message}</p>
                    </div>
                    <button onClick={() => setToast({...toast, show: false})} className="ml-4 text-[#57534e] hover:text-[#e7e5e4]">
                        <X size={16} />
                    </button>
                </div>
            )}
        </ToastContext.Provider>
    );
}