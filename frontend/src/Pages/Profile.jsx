import { useState, useEffect } from "react";
import { User, Mail, Save, Upload, Loader2, KeyRound, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { db, auth } from "../config/firebase.config";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { updatePassword, updateEmail } from "firebase/auth";
import useAuth from "../hooks/auth";
import Loader from "../Components/Loader";

// Cloudinary Config
const CLOUD_NAME = "dg3eusrdy";
const UPLOAD_PRESET = "codequest_avatar";

export default function Profile() {
    const { admin, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [docId, setDocId] = useState(null); 

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        photoURL: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        document.title = "My Profile | CodeQuest";
        
        const fetchProfile = async () => {
            if (admin?.uid) {
                try {
                    const directRef = doc(db, "admins", admin.uid);
                    let docSnap = await getDoc(directRef);
                    
                    let userData = null;
                    let foundDocId = null;

                    if (docSnap.exists()) {
                        userData = docSnap.data();
                        foundDocId = docSnap.id;
                    } else {
                        const q = query(collection(db, "admins"), where("email", "==", admin.email));
                        const querySnapshot = await getDocs(q);
                        
                        if (!querySnapshot.empty) {
                            userData = querySnapshot.docs[0].data();
                            foundDocId = querySnapshot.docs[0].id;
                        }
                    }

                    if (userData) {
                        setDocId(foundDocId);
                        setFormData(prev => ({
                            ...prev,
                            firstName: userData.firstName || "",
                            lastName: userData.lastName || "",
                            email: userData.email || admin.email,
                            photoURL: userData.photoURL || admin.photoURL || ""
                        }));
                        setImagePreview(userData.photoURL || admin.photoURL || null);
                    } else {
                        setFormData(prev => ({
                            ...prev,
                            email: admin.email,
                            photoURL: admin.photoURL || ""
                        }));
                        setImagePreview(admin.photoURL || null);
                    }
                } catch (err) {
                    console.error("Error fetching profile:", err);
                }
            }
            setLoading(false);
        };

        if (!authLoading) {
            fetchProfile();
        }
    }, [admin, authLoading]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadToCloudinary = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("cloud_name", CLOUD_NAME);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: data
            });

            if (!res.ok) throw new Error("Image upload failed");
            const json = await res.json();
            return json.secure_url;
        } catch (error) {
            console.error("Cloudinary Error:", error);
            throw error;
        }
    };

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let photoURL = formData.photoURL;
            if (imageFile) {
                photoURL = await uploadToCloudinary(imageFile);
            }

            let targetDocId = docId;
            if (!targetDocId) {
                const q = query(collection(db, "admins"), where("email", "==", admin.email));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    targetDocId = querySnapshot.docs[0].id;
                } else {
                    throw new Error("Profile document not found in database.");
                }
            }

            const userRef = doc(db, "admins", targetDocId);
            
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                photoURL: photoURL,
                email: formData.email
            };

            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmPassword) {
                    alert("Passwords do not match!");
                    setSaving(false);
                    return;
                }
                await updatePassword(auth.currentUser, formData.newPassword);
                updateData.password = await hashPassword(formData.newPassword);
            }

            if (formData.email !== admin.email) {
                await updateEmail(auth.currentUser, formData.email);
            }

            await updateDoc(userRef, updateData);

            alert("Profile updated successfully!");
            setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "", photoURL }));
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.code === 'auth/requires-recent-login') {
                alert("Please log out and log in again to update sensitive information.");
            } else {
                alert(`Failed to update profile: ${error.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) return <Loader />;

    return (
        <div className="font-serif min-h-screen w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4]">
            {/* Header */}
            <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-6 md:py-10 px-4 md:px-6 shadow-2xl">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-[0.15em] uppercase text-[#d4af37]">
                        Profile Settings
                    </h1>
                    <p className="text-[#a8a29e] mt-2 tracking-wide uppercase text-[10px] md:text-xs">Manage Profile</p>
                </div>
            </div>

            <div className="max-w-6xl w-full px-4 md:px-6 py-6 md:py-12">
                <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-6 md:gap-12 items-start">
                    
                    {/* Left Column: Avatar Upload */}
                    <div className="w-full lg:w-1/3 flex flex-col items-center lg:sticky lg:top-24">
                        {/* Smaller avatar container on mobile (w-32) vs desktop (w-64) */}
                        <div className="relative group p-1 bg-[#0c0a09] rounded-full border-2 border-[#44403c] shadow-2xl overflow-hidden mb-4 md:mb-6">
                            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full overflow-hidden relative">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[#44403c] bg-[#0c0a09]">
                                        <ImageIcon size={40} className="md:w-20 md:h-20" />
                                    </div>
                                )}
                                
                                <label className="absolute inset-0 bg-[#0c0a09]/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-4 border-dashed border-[#d4af37]/30 rounded-full m-2">
                                    <Upload size={24} className="text-[#d4af37] mb-1 md:mb-2 md:w-8 md:h-8" />
                                    <span className="text-[#e7e5e4] text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em]">Change Avatar</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl md:text-2xl font-bold text-[#d4af37] tracking-widest uppercase">{formData.firstName} {formData.lastName}</h2>
                            <p className="text-[#57534e] text-[10px] md:text-xs uppercase tracking-[0.2em] mt-1">Change your Avatar here</p>
                        </div>
                    </div>

                    {/* Right Column: Form Fields */}
                    <div className="flex-1 w-full space-y-6 md:space-y-8">
                        {/* Compact padding on mobile (p-4) vs desktop (p-8) */}
                        <div className="bg-[#292524] p-4 md:p-8 rounded-sm border border-[#44403c] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-5 pointer-events-none"></div>
                            
                            <h3 className="text-[#d4af37] font-bold uppercase tracking-widest text-base md:text-lg mb-5 md:mb-8 border-b border-[#44403c] pb-3 md:pb-4 flex items-center gap-3">
                                <User size={18} className="md:w-5 md:h-5" /> Personal Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">First Name</label>
                                    <input 
                                        className="w-full bg-[#0c0a09] border border-[#44403c] p-3 md:p-4 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-all shadow-inner text-sm md:text-base"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        placeholder="First name"
                                    />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">Last Name</label>
                                    <input 
                                        className="w-full bg-[#0c0a09] border border-[#44403c] p-3 md:p-4 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-all shadow-inner text-sm md:text-base"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        placeholder="Last name"
                                    />
                                </div>
                                <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-[#44403c]" size={16} />
                                        <input 
                                            type="email"
                                            className="w-full bg-[#0c0a09] border border-[#44403c] pl-10 md:pl-12 pr-4 py-3 md:py-4 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-all shadow-inner text-sm md:text-base"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="Enter your email address"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-[#292524] p-4 md:p-8 rounded-sm border border-[#44403c] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-5 pointer-events-none"></div>
                            
                            <h3 className="text-[#d4af37] font-bold uppercase tracking-widest text-base md:text-lg mb-5 md:mb-8 border-b border-[#44403c] pb-3 md:pb-4 flex items-center gap-3">
                                <KeyRound size={18} className="md:w-5 md:h-5" /> Security Credentials
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">New Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showNewPassword ? "text" : "password"}
                                            className="w-full bg-[#0c0a09] border border-[#44403c] p-3 md:p-4 pr-10 md:pr-12 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-all shadow-inner text-sm md:text-base"
                                            placeholder="••••••••"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#d4af37] transition-colors"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">Confirm Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full bg-[#0c0a09] border border-[#44403c] p-3 md:p-4 pr-10 md:pr-12 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-all shadow-inner text-sm md:text-base"
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        />
                                        <button 
                                            type="button"
                                            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#d4af37] transition-colors"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto bg-[#2c241b] text-[#d4af37] px-8 py-3 md:px-12 md:py-4 rounded font-bold uppercase tracking-[0.2em] border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] text-xs md:text-sm"
                            >
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} className="md:w-5 md:h-5" />}
                                {saving ? "Synchronizing..." : "Update Profile"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}