import { useEffect, useState, Fragment } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";
import Loader from "../Components/Loader";
import { MessageSquare, Bug, Search, Trash2, Smartphone, Monitor, Calendar, User, Eye, ArrowUpDown, X, TriangleAlert } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import bg from "../assets/SMbg.png"; // Reusing the background

export default function Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("All"); // All, Feedback, Bug
    const [search, setSearch] = useState("");
    const [usersCache, setUsersCache] = useState({});
    const [sortOrder, setSortOrder] = useState("desc"); // desc (Newest), asc (Oldest)

    // Modal States
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState(null);

    useEffect(() => {
        document.title = "Feedback | CodeQuest";
        
        const q = query(collection(db, "feedback"), orderBy("submittedAt", sortOrder));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedFeedback = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFeedbacks(fetchedFeedback);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching feedback:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [sortOrder]);

    // Fetch user details for unique UIDs
    useEffect(() => {
        const fetchUsers = async () => {
            const uniqueUids = [...new Set(feedbacks.map(f => f.uid).filter(uid => uid && !usersCache[uid]))];
            
            if (uniqueUids.length === 0) return;

            const newUsersData = {};
            await Promise.all(uniqueUids.map(async (uid) => {
                try {
                    const userDoc = await getDoc(doc(db, "users", uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        newUsersData[uid] = {
                            name: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || "Unknown User",
                            avatarUrl: data.avatarUrl || data.photoURL,
                            email: data.email
                        };
                    } else {
                        newUsersData[uid] = { name: "Unknown User", avatarUrl: null };
                    }
                } catch (err) {
                    console.error(`Error fetching user ${uid}:`, err);
                    newUsersData[uid] = { name: "Error Loading User", avatarUrl: null };
                }
            }));

            setUsersCache(prev => ({ ...prev, ...newUsersData }));
        };

        if (feedbacks.length > 0) {
            fetchUsers();
        }
    }, [feedbacks]);

    const handleSortToggle = () => {
        setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    };

    // View Modal Handlers
    const handleOpenView = (feedback) => {
        setSelectedFeedback(feedback);
        setViewModalOpen(true);
    };

    const handleCloseView = () => {
        setViewModalOpen(false);
        setSelectedFeedback(null);
    };

    // Delete Modal Handlers
    const handleOpenDelete = (id) => {
        setFeedbackToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleCloseDelete = () => {
        setDeleteModalOpen(false);
        setFeedbackToDelete(null);
    };

    const confirmDelete = async () => {
        if (!feedbackToDelete) return;
        try {
            await deleteDoc(doc(db, "feedback", feedbackToDelete));
            handleCloseDelete();
        } catch (error) {
            console.error("Error deleting feedback:", error);
            alert("Failed to delete feedback. Please try again.");
        }
    };

    const filteredFeedbacks = feedbacks.filter(item => {
        const matchesType = filterType === "All" || item.type === filterType;
        const matchesSearch = item.details?.toLowerCase().includes(search.toLowerCase()) || 
                              item.uid?.toLowerCase().includes(search.toLowerCase()) ||
                              (usersCache[item.uid]?.name || "").toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    if (loading) return <Loader />;

    return (
        <div className="font-serif min-h-screen w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] relative overflow-x-hidden">
             <div 
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "sepia(0.8) hue-rotate(-30deg) contrast(1.1)"
                }}
            />

            <div className="w-full flex flex-col items-center relative z-10">
                {/* Header */}
                <div className="w-full bg-[#0c0a09] border-b-2 md:border-b-4 border-[#292524] py-6 sm:py-8 md:py-12 px-4 md:px-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-[0.1em] md:tracking-[0.15em] uppercase text-[#d4af37] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ textShadow: "2px 2px 0px #000" }}>
                            User Feedback
                        </h1>
                        <p className="text-xs sm:text-sm md:text-lg font-medium text-[#a8a29e] tracking-wide mt-1 sm:mt-2 italic">
                            Review bug reports and suggestions from adventurers
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 md:py-10">
                    
                    {/* Filters */}
                    <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg mb-8">
                        <div className="bg-[#1c1917] p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                                <button 
                                    onClick={() => setFilterType("All")}
                                    className={`px-4 py-2 rounded border transition-all uppercase text-xs font-bold tracking-wider ${filterType === "All" ? "bg-[#d4af37] text-[#0c0a09] border-[#d4af37]" : "bg-[#0c0a09] text-[#a8a29e] border-[#44403c] hover:border-[#d4af37]"}`}
                                >
                                    All
                                </button>
                                <button 
                                    onClick={() => setFilterType("Feedback")}
                                    className={`px-4 py-2 rounded border transition-all uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${filterType === "Feedback" ? "bg-[#d4af37] text-[#0c0a09] border-[#d4af37]" : "bg-[#0c0a09] text-[#a8a29e] border-[#44403c] hover:border-[#d4af37]"}`}
                                >
                                    <MessageSquare size={14} /> Feedback
                                </button>
                                <button 
                                    onClick={() => setFilterType("Bug")}
                                    className={`px-4 py-2 rounded border transition-all uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${filterType === "Bug" ? "bg-[#d4af37] text-[#0c0a09] border-[#d4af37]" : "bg-[#0c0a09] text-[#a8a29e] border-[#44403c] hover:border-[#d4af37]"}`}
                                >
                                    <Bug size={14} /> Bug
                                </button>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button 
                                    onClick={handleSortToggle}
                                    className="px-4 py-2 rounded border border-[#44403c] bg-[#0c0a09] text-[#a8a29e] hover:border-[#d4af37] hover:text-[#d4af37] transition-all uppercase text-xs font-bold tracking-wider flex items-center gap-2 whitespace-nowrap"
                                >
                                    <ArrowUpDown size={14} /> 
                                    {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                                </button>

                                <div className="flex items-center bg-[#0c0a09] border border-[#44403c] rounded px-4 py-2 w-full lg:w-80 focus-within:border-[#d4af37] transition-colors">
                                    <input
                                        type="search"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="bg-transparent text-[#e7e5e4] font-medium placeholder-[#57534e] focus:outline-none w-full text-sm"
                                    />
                                    <Search className="text-[#d4af37] ml-2" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="bg-[#0c0a09]">
                                    <tr className="text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                        <th className="p-4 font-bold w-24 text-center">Type</th>
                                        <th className="p-4 font-bold">User</th>
                                        <th className="p-4 font-bold">Submitted At</th>
                                        <th className="p-4 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#44403c] bg-[#1c1917]">
                                    {filteredFeedbacks.map((item) => {
                                        const user = usersCache[item.uid] || {};
                                        return (
                                            <tr key={item.id} className="hover:bg-[#0c0a09]/50 transition-colors group">
                                                <td className="p-4 text-center">
                                                    <div className={`inline-flex items-center justify-center p-2 rounded-full border ${item.type === 'Bug' ? 'bg-[#7f1d1d]/20 border-[#ef4444]/50 text-[#ef4444]' : 'bg-[#1e3a8a]/20 border-[#3b82f6]/50 text-[#3b82f6]'}`}>
                                                        {item.type === 'Bug' ? <Bug size={18} /> : <MessageSquare size={18} />}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full border border-[#44403c] bg-[#0c0a09] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                            {user.avatarUrl ? (
                                                                <img src={user.avatarUrl} alt="User" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <User size={14} className="text-[#57534e]" />
                                                            )}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-[#e7e5e4] text-sm font-bold truncate max-w-[150px]">
                                                                {user.name || "Loading..."}
                                                            </p>
                                                            <p className="text-[10px] text-[#57534e] font-mono truncate max-w-[150px]">{item.uid}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                               
                                                <td className="p-4 text-[#a8a29e] text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={12} />
                                                        {item.submittedAt ? new Date(item.submittedAt.toDate()).toLocaleString() : "Unknown"}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button 
                                                            onClick={() => handleOpenView(item)}
                                                            className="p-2 bg-[#0c0a09] border border-[#44403c] rounded text-[#a8a29e] hover:text-[#d4af37] hover:border-[#d4af37] transition-all"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenDelete(item.id)}
                                                            className="p-2 bg-[#0c0a09] border border-[#44403c] rounded text-[#a8a29e] hover:text-[#ef4444] hover:border-[#ef4444] transition-all"
                                                            title="Delete Feedback"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredFeedbacks.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-[#57534e] italic">
                                                No feedback found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {filteredFeedbacks.map((item) => {
                             const user = usersCache[item.uid] || {};
                             return (
                                <div key={item.id} className="bg-[#292524] rounded border border-[#44403c] overflow-hidden">
                                    <div className="p-4 bg-[#0c0a09]/50 border-b border-[#44403c] flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full border ${item.type === 'Bug' ? 'bg-[#7f1d1d]/20 border-[#ef4444]/50 text-[#ef4444]' : 'bg-[#1e3a8a]/20 border-[#3b82f6]/50 text-[#3b82f6]'}`}>
                                                {item.type === 'Bug' ? <Bug size={16} /> : <MessageSquare size={16} />}
                                            </div>
                                            <div>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${item.type === 'Bug' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}`}>
                                                    {item.type}
                                                </span>
                                                <div className="text-[10px] text-[#57534e] font-mono">
                                                    {item.submittedAt ? new Date(item.submittedAt.toDate()).toLocaleDateString() : "Unknown"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => handleOpenView(item)}
                                                className="text-[#57534e] hover:text-[#d4af37] p-2 bg-[#1c1917] rounded border border-[#44403c] hover:border-[#d4af37]"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDelete(item.id)}
                                                className="text-[#57534e] hover:text-[#ef4444] p-2 bg-[#1c1917] rounded border border-[#44403c] hover:border-[#ef4444]"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 bg-[#1c1917] border-b border-[#44403c]/50 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full border border-[#44403c] bg-[#0c0a09] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} alt="User" className="h-full w-full object-cover" />
                                            ) : (
                                                <User size={14} className="text-[#57534e]" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[#e7e5e4] text-xs font-bold truncate">
                                                {user.name || "Loading..."}
                                            </p>
                                            <p className="text-[9px] text-[#57534e] font-mono truncate">{item.uid}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 cursor-pointer" onClick={() => handleOpenView(item)}>
                                        <p className="text-[#e7e5e4] text-sm whitespace-pre-wrap line-clamp-3 mb-3">{item.details}</p>
                                        <div className="flex justify-between items-center text-[10px] text-[#a8a29e] border-t border-[#44403c] pt-2">
                                            <span>{item.deviceInfo?.platform} ({item.deviceInfo?.width}px)</span>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                         {filteredFeedbacks.length === 0 && (
                            <div className="bg-[#292524] p-8 rounded border border-[#44403c] text-center text-[#57534e] italic text-sm">
                                No feedback found matching your criteria.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- VIEW FEEDBACK MODAL --- */}
            <Transition appear show={viewModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={handleCloseView}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center font-serif">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-sm bg-[#1c1917] p-1 text-left align-middle shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all border border-[#44403c] relative">
                                    <button onClick={handleCloseView} className="absolute top-4 right-4 z-20 text-[#a8a29e] hover:text-[#ef4444] transition-colors p-1 bg-[#0c0a09] rounded border border-[#44403c] hover:border-[#ef4444]">
                                        <X size={20} />
                                    </button>

                                    <div className="bg-[#1c1917] border border-[#292524] p-6 md:p-8">
                                        {/* Modal Header */}
                                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#44403c]">
                                            <div className={`p-3 rounded-full border ${selectedFeedback?.type === 'Bug' ? 'bg-[#7f1d1d]/20 border-[#ef4444]/50 text-[#ef4444]' : 'bg-[#1e3a8a]/20 border-[#3b82f6]/50 text-[#3b82f6]'}`}>
                                                {selectedFeedback?.type === 'Bug' ? <Bug size={24} /> : <MessageSquare size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#e7e5e4] uppercase tracking-wider">
                                                    {selectedFeedback?.type} Details
                                                </h3>
                                                <p className="text-[#a8a29e] text-sm flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    Submitted: {selectedFeedback?.submittedAt ? new Date(selectedFeedback.submittedAt.toDate()).toLocaleString() : "Unknown"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* User Info */}
                                        <div className="bg-[#0c0a09] p-4 rounded border border-[#292524] mb-6 flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full border border-[#44403c] bg-[#1c1917] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {usersCache[selectedFeedback?.uid]?.avatarUrl ? (
                                                    <img src={usersCache[selectedFeedback?.uid].avatarUrl} alt="User" className="h-full w-full object-cover" />
                                                ) : (
                                                    <User size={20} className="text-[#57534e]" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[#e7e5e4] font-bold text-lg">
                                                    {usersCache[selectedFeedback?.uid]?.name || "Loading User..."}
                                                </p>
                                                <p className="text-[#a8a29e] text-xs font-mono">{selectedFeedback?.uid}</p>
                                                {usersCache[selectedFeedback?.uid]?.email && (
                                                     <p className="text-[#57534e] text-xs mt-0.5">{usersCache[selectedFeedback?.uid]?.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Feedback Content */}
                                        <div className="mb-6">
                                            <h4 className="text-[#d4af37] text-xs uppercase font-bold tracking-widest mb-2 border-b border-[#44403c]/50 pb-1">Message Content</h4>
                                            <div className="bg-[#292524]/50 p-4 rounded border border-[#44403c] min-h-[100px] text-[#e7e5e4] whitespace-pre-wrap">
                                                {selectedFeedback?.details}
                                            </div>
                                        </div>

                                        {/* Device Stats */}
                                        <div>
                                            <h4 className="text-[#d4af37] text-xs uppercase font-bold tracking-widest mb-2 border-b border-[#44403c]/50 pb-1">System Information</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-[#0c0a09] p-3 rounded border border-[#292524] flex items-center gap-3">
                                                    <Monitor size={18} className="text-[#57534e]" />
                                                    <div>
                                                        <p className="text-[10px] text-[#a8a29e] uppercase">Platform</p>
                                                        <p className="text-[#e7e5e4] font-medium">{selectedFeedback?.deviceInfo?.platform || "Unknown"}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-[#0c0a09] p-3 rounded border border-[#292524] flex items-center gap-3">
                                                    <Smartphone size={18} className="text-[#57534e]" />
                                                    <div>
                                                        <p className="text-[10px] text-[#a8a29e] uppercase">Screen Width</p>
                                                        <p className="text-[#e7e5e4] font-medium">{selectedFeedback?.deviceInfo?.width || "?"} px</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Footer */}
                                        <div className="mt-8 pt-6 border-t border-[#44403c] flex justify-end gap-3">
                                            <button 
                                                onClick={handleCloseView}
                                                className="px-4 py-2 bg-[#292524] text-[#e7e5e4] rounded border border-[#44403c] hover:border-[#d4af37] transition-all font-bold text-sm uppercase tracking-wider"
                                            >
                                                Close
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    handleCloseView();
                                                    handleOpenDelete(selectedFeedback?.id);
                                                }}
                                                className="px-4 py-2 bg-[#7f1d1d] text-[#fee2e2] rounded border border-[#b91c1c] hover:bg-[#991b1b] transition-all font-bold text-sm uppercase tracking-wider flex items-center gap-2"
                                            >
                                                <Trash2 size={16} /> Delete Entry
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* --- DELETE CONFIRMATION MODAL --- */}
            <Transition appear show={deleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={handleCloseDelete}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center font-serif">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-4" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-4">
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-sm bg-[#1c1917] p-1 text-left align-middle shadow-[0_0_50px_rgba(239,68,68,0.2)] transition-all border border-[#ef4444]/50 relative">
                                    <div className="bg-[#1c1917] border border-[#292524] p-6 text-center">
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#7f1d1d]/20 mb-4 border border-[#ef4444]/50">
                                            <TriangleAlert className="h-8 w-8 text-[#ef4444]" aria-hidden="true" />
                                        </div>
                                        <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-[#e7e5e4] uppercase tracking-wider mb-2">
                                            Delete Feedback?
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-[#a8a29e]">
                                                Are you sure you want to permanently delete this feedback entry? This action cannot be undone.
                                            </p>
                                        </div>

                                        <div className="mt-6 flex justify-center gap-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded border border-[#44403c] bg-[#292524] px-4 py-2 text-sm font-bold text-[#e7e5e4] hover:border-[#d4af37] focus:outline-none transition-all uppercase tracking-wide"
                                                onClick={handleCloseDelete}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded border border-[#b91c1c] bg-[#7f1d1d] px-4 py-2 text-sm font-bold text-[#fee2e2] hover:bg-[#991b1b] focus:outline-none transition-all uppercase tracking-wide"
                                                onClick={confirmDelete}
                                            >
                                                Yes, Delete It
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}