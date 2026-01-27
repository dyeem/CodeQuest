import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X, UserCog, ShieldAlert, Upload, Loader2, Image as ImageIcon, KeyRound, RefreshCw, Copy, Layers } from "lucide-react";
import { db } from "../config/firebase.config";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import Loader from "../Components/Loader";
import useAuth from "../hooks/auth";
import { useToast } from "../context/ToastContext";

// Cloudinary Config
const CLOUD_NAME = "dg3eusrdy";
const UPLOAD_PRESET = "codequest_avatar"; 

// Firebase Config (Must match your config file)
const firebaseConfig = {
  apiKey: "AIzaSyBxjX5Xo436MaHQav1vcseMxDJXmljnS9U",
  authDomain: "codequest-200b.firebaseapp.com",
  projectId: "codequest-200b",
  storageBucket: "codequest-200b.firebasestorage.app",
  messagingSenderId: "991275629710",
  appId: "1:991275629710:web:1faed78dc6cd69da3adddf",
  measurementId: "G-WEB9D2JHCZ"
};

export default function UserManagement() {
    const { admin: currentUser } = useAuth();
    const { showToast } = useToast();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "teacher",
        section: "A", // Default section
        photoURL: "",
        password: "" 
    });
    
    // Image State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Derive current user's role from the fetched list
    const currentUserRole = admins.find(a => a.email === currentUser?.email)?.role;

    useEffect(() => {
        document.title = "User Management | CodeQuest";
        
        const adminsCollection = collection(db, "admins");
        const unsubscribe = onSnapshot(adminsCollection, (snapshot) => {
            const fetchedAdmins = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAdmins(fetchedAdmins);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                firstName: admin.firstName || "",
                lastName: admin.lastName || "",
                email: admin.email || "",
                role: admin.role || "teacher",
                section: admin.section || "A",
                photoURL: admin.photoURL || "",
                password: "" // Don't load existing password
            });
            setImagePreview(admin.photoURL || null);
        } else {
            setEditingAdmin(null);
            setFormData({ firstName: "", lastName: "", email: "", role: "teacher", section: "A", photoURL: "", password: "" });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const generatePassword = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let pass = "";
        for (let i = 0; i < 12; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, password: pass });
    };

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
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

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.message || "Upload failed");
            }

            const uploadedImage = await res.json();
            return uploadedImage.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            throw error;
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            let photoURL = formData.photoURL;

            if (imageFile) {
                photoURL = await uploadToCloudinary(imageFile);
            }

            // Exclude section if role is admin
            const sectionToSave = formData.role === 'admin' ? "" : formData.section;

            const dataToSave = { 
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                role: formData.role,
                section: sectionToSave,
                photoURL: photoURL
            };
            
            if (formData.password) {
                dataToSave.password = await hashPassword(formData.password);
            }

            if (editingAdmin) {
                // Update Firestore Document
                const adminRef = doc(db, "admins", editingAdmin.id);
                await updateDoc(adminRef, dataToSave);
                showToast("User updated successfully!");
            } else {
                // Create New User Logic (Secondary App Workaround)
                if (!formData.password) {
                    throw new Error("Password is required for new users.");
                }

                // 1. Create secondary app instance
                const secondaryApp = initializeApp(firebaseConfig, "Secondary");
                const secondaryAuth = getAuth(secondaryApp);

                // 2. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email.trim(), formData.password);
                const newUser = userCredential.user;

                // 3. Create Firestore Document
                await addDoc(collection(db, "admins"), {
                    ...dataToSave,
                    uid: newUser.uid, // Save UID for reference
                    createdAt: new Date().toISOString()
                });

                // 4. Cleanup secondary app
                await signOut(secondaryAuth);
                try {
                    await deleteApp(secondaryApp);
                } catch (e) {
                    console.log("Error deleting secondary app:", e);
                }
                showToast("User created successfully!");
            }
            
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving admin:", error);
            showToast(`Failed to save: ${error.message}`, "error");
        } finally {
            setUploading(false);
        }
    };

    // Helper for sign out from secondary app
    const signOut = async (authInstance) => {
        try {
            await firebaseSignOut(authInstance);
        } catch (e) {
            console.log("Error signing out secondary:", e);
        }
    };

    const handleDeleteClick = (admin) => {
        setAdminToDelete(admin);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!adminToDelete) return;
        try {
            await deleteDoc(doc(db, "admins", adminToDelete.id));
            showToast("User deleted successfully!");
            setIsDeleteModalOpen(false);
            setAdminToDelete(null);
        } catch (error) {
            console.error("Error deleting admin:", error);
            showToast(`Failed to delete: ${error.message}`, "error");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-full w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] font-serif relative">
             {/* Header */}
             <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-10 px-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-[#d4af37]">
                            User Management
                        </h1>
                        <p className="text-[#a8a29e] mt-2 tracking-wide">Manage system administrators and teachers</p>
                    </div>
                </div>
            </div>

            {/* Content Table */}
            <div className="max-w-7xl w-full px-6 py-10">
                <div className="flex justify-end mb-6">
                    {/* Only Show "Add User" if current user is admin */}
                    {currentUserRole === 'admin' && (
                        <button 
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 bg-[#2c241b] text-[#d4af37] px-6 py-3 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 font-bold uppercase tracking-widest"
                        >
                            <Plus size={20} /> Add User
                        </button>
                    )}
                </div>
                <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0c0a09] text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                    <th className="p-4 font-bold">User</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold">Section</th>
                                    {currentUserRole === 'admin' && <th className="p-4 font-bold text-center">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#44403c]">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-[#0c0a09]/50 transition-colors bg-[#1c1917]">
                                        <td className="p-4 font-medium text-[#e7e5e4] flex items-center gap-4">
                                            {/* Avatar Display */}
                                            <div className="h-10 w-10 rounded-full bg-[#292524] border border-[#44403c] overflow-hidden flex-shrink-0">
                                                {admin.photoURL ? (
                                                    <img src={admin.photoURL} alt={admin.firstName} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[#a8a29e]">
                                                        <UserCog size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[#e7e5e4]">{admin.firstName} {admin.lastName}</span>
                                                <span className="text-xs text-[#a8a29e] uppercase tracking-wider">{admin.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#a8a29e]">{admin.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 w-fit ${
                                                admin.role === 'admin' 
                                                ? "bg-[#7f1d1d]/20 text-[#ef4444] border border-[#ef4444]/30" 
                                                : "bg-[#1e3a8a]/20 text-[#3b82f6] border border-[#3b82f6]/30"
                                            }`}>
                                                {admin.role === 'admin' ? <ShieldAlert size={14} /> : <UserCog size={14} />}
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[#e7e5e4] font-bold">
                                            {admin.role === 'admin' ? "-" : (admin.section || "-")}
                                        </td>
                                        {currentUserRole === 'admin' && (
                                            <td className="p-4 flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleOpenModal(admin)} 
                                                    className="text-[#a8a29e] hover:text-[#d4af37] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(admin)} 
                                                    className="text-[#a8a29e] hover:text-[#ef4444] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan={currentUserRole === 'admin' ? "5" : "4"} className="p-8 text-center text-[#57534e] italic">
                                            No users found. {currentUserRole === 'admin' && 'Click "Add User" to get started.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && adminToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#1c1917] w-full max-w-md p-8 rounded border-2 border-[#7f1d1d] shadow-[0_0_30px_rgba(127,29,29,0.3)] relative text-center">
                        <ShieldAlert size={48} className="mx-auto text-[#ef4444] mb-4" />
                        <h2 className="text-2xl font-bold text-[#e7e5e4] mb-2 uppercase tracking-widest">Confirm Delete</h2>
                        <p className="text-[#a8a29e] mb-8">
                            Are you sure you want to remove <span className="text-[#d4af37] font-bold">{adminToDelete.firstName} {adminToDelete.lastName}</span>? This action cannot be undone.
                        </p>
                        
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-6 py-3 rounded text-[#a8a29e] font-bold uppercase tracking-widest hover:text-[#e7e5e4] border border-transparent hover:border-[#57534e] transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="bg-[#7f1d1d] text-[#e7e5e4] px-8 py-3 rounded font-bold uppercase tracking-widest border border-[#ef4444]/50 hover:bg-[#ef4444] transition-all flex items-center gap-2"
                            >
                                <Trash2 size={18} /> Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1c1917] w-full max-w-5xl p-0 rounded-lg border border-[#44403c] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-[#44403c] bg-[#0c0a09] flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-2xl font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-3">
                                {editingAdmin ? <Edit2 size={24} /> : <Plus size={24} />}
                                {editingAdmin ? "Edit User" : "Add New User"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#a8a29e] hover:text-[#ef4444] transition-colors">
                                <X size={28} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                
                                {/* Left Column: Image Upload */}
                                <div className="md:col-span-4 flex flex-col items-center gap-4">
                                    <div className="relative group w-48 h-48 rounded-full border-4 border-[#292524] bg-[#0c0a09] overflow-hidden flex items-center justify-center shadow-inner">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center text-[#44403c] group-hover:text-[#a8a29e] transition-colors">
                                                <ImageIcon size={48} />
                                                <span className="text-xs uppercase font-bold mt-2">No Image</span>
                                            </div>
                                        )}
                                        
                                        {/* Overlay for upload */}
                                        <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Upload size={32} className="text-[#d4af37] mb-2" />
                                            <span className="text-[#e7e5e4] text-xs font-bold uppercase tracking-wider">Change Photo</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[#a8a29e] text-xs uppercase tracking-widest font-bold">Profile Photo</p>
                                        <p className="text-[#57534e] text-[10px] mt-1">Click image to upload. Max 2MB.</p>
                                    </div>
                                </div>

                                {/* Right Column: Form Fields */}
                                <div className="md:col-span-8 space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-wider">First Name</label>
                                            <input 
                                                className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-colors"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                placeholder="e.g. John"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-wider">Last Name</label>
                                            <input 
                                                className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-colors"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                placeholder="e.g. Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-wider">Email Address</label>
                                        <input 
                                            type="email"
                                            className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-colors"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            placeholder="teacher@codequest.com"
                                            required
                                        />
                                    </div>

                                    {/* Password Field with Generator */}
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-wider">
                                            {editingAdmin ? "Reset Password (Optional)" : "Password"}
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input 
                                                    type="text" // Visible text for admin ease
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-colors font-mono tracking-wide"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                    placeholder={editingAdmin ? "Leave blank to keep current" : "Generate or type..."}
                                                    required={!editingAdmin}
                                                />
                                                <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57534e]" />
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={generatePassword}
                                                className="bg-[#292524] border border-[#44403c] text-[#d4af37] p-3 rounded hover:bg-[#d4af37] hover:text-[#1c1917] transition-all"
                                                title="Generate Password"
                                            >
                                                <RefreshCw size={20} />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(formData.password);
                                                    showToast("Password copied to clipboard!");
                                                }}
                                                className="bg-[#292524] border border-[#44403c] text-[#d4af37] p-3 rounded hover:bg-[#d4af37] hover:text-[#1c1917] transition-all"
                                                title="Copy Password"
                                                disabled={!formData.password}
                                            >
                                                <Copy size={20} />
                                            </button>
                                        </div>
                                        <p className="text-[#57534e] text-[10px]">
                                            {editingAdmin ? "Updating this will not change their actual login password (only metadata) unless you have Admin SDK." : "Generates a strong password. Copy this before saving."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-wider">Role</label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none appearance-none transition-colors"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                >
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a8a29e]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Only show Section dropdown if role is teacher */}
                                        {formData.role === 'teacher' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Section</label>
                                                <div className="relative">
                                                    <select 
                                                        className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none appearance-none transition-colors"
                                                        value={formData.section}
                                                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                                                    >
                                                        <option value="A">Section A</option>
                                                        <option value="B">Section B</option>
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a8a29e]">
                                                        <Layers size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[#57534e] text-xs mt-1">
                                        {formData.role === 'admin' 
                                            ? "Admins have full access to system settings and user management." 
                                            : "Teachers can manage classes, assignments, and view student progress."}
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-[#0c0a09] border-t border-[#44403c] flex justify-end gap-3 sticky bottom-0 z-10">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded text-[#a8a29e] font-bold uppercase tracking-widest hover:text-[#e7e5e4] transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={uploading}
                                className="bg-[#2c241b] text-[#d4af37] px-8 py-3 rounded font-bold uppercase tracking-widest border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {uploading ? "Saving..." : (editingAdmin ? "Update User" : "Save User")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}