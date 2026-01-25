import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Save, X, UserCog, ShieldAlert } from "lucide-react";
import { db } from "../config/firebase.config";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Loader from "../Components/Loader";

export default function UserManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        role: "teacher"
    });

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
                role: admin.role || "teacher"
            });
        } else {
            setEditingAdmin(null);
            setFormData({ firstName: "", lastName: "", email: "", role: "teacher" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                // Update
                const adminRef = doc(db, "admins", editingAdmin.id);
                await updateDoc(adminRef, formData);
            } else {
                // Create
                await addDoc(collection(db, "admins"), {
                    ...formData,
                    createdAt: new Date().toISOString()
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving admin:", error);
            alert("Failed to save. Check console for details.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to remove this user?")) {
            try {
                await deleteDoc(doc(db, "admins", id));
            } catch (error) {
                console.error("Error deleting admin:", error);
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-full w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] font-serif">
             {/* Header */}
             <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-10 px-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-[#d4af37]">
                            User Management
                        </h1>
                        <p className="text-[#a8a29e] mt-2 tracking-wide">Manage system administrators and teachers</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-[#2c241b] text-[#d4af37] px-6 py-3 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 font-bold uppercase tracking-widest"
                    >
                        <Plus size={20} /> Add User
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="max-w-7xl w-full px-6 py-10">
                <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#0c0a09] text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                    <th className="p-4 font-bold">Name</th>
                                    <th className="p-4 font-bold">Email</th>
                                    <th className="p-4 font-bold">Role</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#44403c]">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-[#0c0a09]/50 transition-colors bg-[#1c1917]">
                                        <td className="p-4 font-medium text-[#e7e5e4] flex items-center gap-3">
                                            <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c]">
                                                {admin.role === 'admin' ? <ShieldAlert size={16} className="text-[#ef4444]" /> : <UserCog size={16} className="text-[#2dd4bf]" />}
                                            </div>
                                            {admin.firstName} {admin.lastName}
                                        </td>
                                        <td className="p-4 text-[#a8a29e]">{admin.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                admin.role === 'admin' 
                                                ? "bg-[#7f1d1d]/20 text-[#ef4444] border border-[#ef4444]/30" 
                                                : "bg-[#1e3a8a]/20 text-[#3b82f6] border border-[#3b82f6]/30"
                                            }`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-3">
                                            <button 
                                                onClick={() => handleOpenModal(admin)} 
                                                className="text-[#a8a29e] hover:text-[#d4af37] transition-colors p-2 hover:bg-[#292524] rounded"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(admin.id)} 
                                                className="text-[#a8a29e] hover:text-[#ef4444] transition-colors p-2 hover:bg-[#292524] rounded"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {admins.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-[#57534e] italic">
                                            No users found. Click "Add User" to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#1c1917] w-full max-w-md p-8 rounded border-2 border-[#44403c] shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-[#a8a29e] hover:text-[#ef4444]">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-2xl font-bold text-[#d4af37] mb-6 uppercase tracking-widest border-b border-[#44403c] pb-4">
                            {editingAdmin ? "Edit User" : "Add New User"}
                        </h2>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#a8a29e] uppercase mb-1">First Name</label>
                                <input 
                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#a8a29e] uppercase mb-1">Last Name</label>
                                <input 
                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#a8a29e] uppercase mb-1">Email Address</label>
                                <input 
                                    type="email"
                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#a8a29e] uppercase mb-1">Role</label>
                                <select 
                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button type="submit" className="w-full bg-[#2c241b] text-[#d4af37] py-3 rounded font-bold uppercase tracking-widest border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all mt-4 flex items-center justify-center gap-2">
                                <Save size={18} /> {editingAdmin ? "Update User" : "Save User"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
