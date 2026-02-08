import { useEffect, useState } from "react";
import bg from "../assets/assignmentandchallenges.png";
import Coding from "../Components/Challenge/Coding";
import Quiz from "../Components/Challenge/Quiz";
import Debug from "../Components/Challenge/Debug";
import { Scroll, Brain, Bug, X, Plus, CheckCircle2, Trash2, Edit2, Save, Search, Filter, Eye, GraduationCap, AlertCircle, CheckCircle, ChevronRight, User, Layers, Menu } from "lucide-react";
import { db } from "../config/firebase.config";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where, getDoc, getDocs, writeBatch } from "firebase/firestore";
import Loader from "../Components/Loader";
import useAuth from "../hooks/auth";
import { useToast } from "../context/ToastContext";
import Editor from "@monaco-editor/react";
import useGradebook from "../hooks/useGradebook";
import SubmissionDetailView from "../Components/Grading/SubmissionDetailView";
import { useLocation, useNavigate } from "react-router-dom";

// Improved Helper Function
export const sendPushNotification = async (expoPushToken, title, body, data = {}) => {
  // Ensure we have tokens
  if (!expoPushToken || (Array.isArray(expoPushToken) && expoPushToken.length === 0)) {
      console.log("No push tokens provided.");
      return;
  }

  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    // Use Vercel serverless function to avoid CORS (works in both dev and production)
    const response = await fetch('/api/push', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
       console.error("Expo Push Error Status:", response.status);
       const errorText = await response.text();
       console.error("Expo Push Error Body:", errorText);
       return; 
    }

    const result = await response.json();
    console.log("Expo Push Result:", result);
    
    // Check for ticket errors (partial failures in batch/multicast)
    if (result.data && result.data.status === "error") {
        console.error("Expo Push Ticket Error:", result.data.message);
    }
    if (result.errors) {
         console.error("Expo Push Validation Errors:", result.errors);
    }

  } catch (error) {
    // Detailed error for "Failed to fetch"
    console.error("Error sending push notification (Network/CORS):", error);
  }
};


export default function AssignmentandChallenges() {
    const { admin } = useAuth();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    
    useEffect(() => {
        document.title = "Assignments & Challenges | CodeQuest";
    }, []);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [challengeType, setChallengeType] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);
    const [gradingTask, setGradingTask] = useState(null);
    const [preSelectedStudentId, setPreSelectedStudentId] = useState(null);
    const [userSection, setUserSection] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [filterSection, setFilterSection] = useState("all");
    const [filterDifficulty, setFilterDifficulty] = useState("all");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "easy",
        section: "A",
        dueDate: "",
        type: ""
    });

    // Specific Challenge State
    const [codingData, setCodingData] = useState({ instruction: "" });
    const [debugData, setDebugData] = useState({
        instruction: "", 
        code: "// Write your JavaScript code here\n\nfunction solve() {\n  console.log('Running test...');\n  return 42;\n}"
    });
    const [quizData, setQuizData] = useState({
        subtype: "mcq",
        mcQuestions: [],
        truefalseQuestions: [],
        enumQuestions: [],
        paragraphQuestions: []
    });

    // Fetch User Section
    useEffect(() => {
        const fetchUserSection = async () => {
            if (admin?.uid) {
                try {
                    let userData = null;
                    const userDoc = await getDoc(doc(db, "admins", admin.uid));
                    
                    if (userDoc.exists()) {
                        userData = userDoc.data();
                    } else {
                        const q = query(collection(db, "admins"), where("email", "==", admin.email));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            userData = querySnapshot.docs[0].data();
                        }
                    }

                    if (userData && userData.section) {
                        const sec = userData.section;
                        setUserSection(sec);
                        setFilterSection(sec);
                        setFormData(prev => ({ ...prev, section: sec }));
                    }
                } catch (error) {
                    console.error("Error fetching user section:", error);
                }
            }
        };
        fetchUserSection();
    }, [admin]);

    // Fetch Tasks
    useEffect(() => {
        if (!admin) return;

        const tasksCollection = collection(db, "task");
        const q = query(tasksCollection, where("createdBy", "==", admin.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dueDateFormatted: data.dueDate ? new Date(data.dueDate).toLocaleString() : "No Date"
                };
            });
            setTasks(fetchedTasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [admin]);

    // Handle Deep Linking from Student Management
    useEffect(() => {
        if (!loading && location.state && location.state.openGradingForTask && tasks.length > 0) {
            const targetTask = tasks.find(t => t.id === location.state.openGradingForTask);
            if (targetTask && (!gradingTask || gradingTask.id !== targetTask.id)) {
                setGradingTask(targetTask);
                setPreSelectedStudentId(location.state.preSelectedStudentId);
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, tasks, location.state]);

    const handleCloseGrading = () => {
        setGradingTask(null);
        setPreSelectedStudentId(null);
        navigate(location.pathname, { replace: true, state: {} });
    };

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              task.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              task.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || task.type === filterType;
        const matchesSection = filterSection === "all" || task.section === filterSection;
        const matchesDifficulty = filterDifficulty === "all" || task.difficulty === filterDifficulty;

        return matchesSearch && matchesType && matchesSection && matchesDifficulty;
    });

    const resetForm = () => {
        setFormData({ title: "", difficulty: "easy", section: userSection || "A", dueDate: "", type: "" });
        setCodingData({ instruction: "" });
        setDebugData({
            instruction: "", 
            code: "// Write your JavaScript code here\n\nfunction solve() {\n  console.log('Running test...');\n  return 42;\n}"
        });
        setQuizData({
            subtype: "mcq",
            mcQuestions: [],
            truefalseQuestions: [],
            enumQuestions: [],
            paragraphQuestions: []
        });
        setChallengeType("");
        setCurrentStep(1);
        setEditingTask(null);
    };

    const handleOpenModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            difficulty: task.difficulty,
            section: task.section,
            dueDate: task.dueDate,
            type: task.type
        });
        setChallengeType(task.type);

        if (task.type === "coding") {
            setCodingData({ instruction: task.instruction || "" });
        } else if (task.type === "debug") {
            setDebugData({ instruction: task.instruction || "", code: task.code || "" });
        } else if (task.type === "quiz") {
            setQuizData({
                subtype: task.subtype || "mcq",
                mcQuestions: task.questions || [],
                truefalseQuestions: task.questions || [],
                enumQuestions: task.questions || [],
                paragraphQuestions: task.questions || []
            });
        }
        
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleViewTask = (task) => {
        setViewingTask(task);
    };

    const handleGradeTask = (task) => {
        setGradingTask(task);
        setPreSelectedStudentId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleNextStep = () => {
        if (!formData.title || !formData.type || !formData.dueDate) return showToast("Please fill in all fields", "error");
        setChallengeType(formData.type);
        setCurrentStep(2);
    };

    const handleSaveTask = async () => {
        try {
            let specificData = {};

            if (formData.type === "coding") {
                specificData = codingData;
            } else if (formData.type === "debug") {
                specificData = debugData;
            } else if (formData.type === "quiz") {
                const { subtype } = quizData;
                let questions = [];
                if (subtype === "mcq") questions = quizData.mcQuestions;
                else if (subtype === "tf") questions = quizData.truefalseQuestions;
                else if (subtype === "enum") questions = quizData.enumQuestions;
                else if (subtype === "paragraph") questions = quizData.paragraphQuestions;

                specificData = { subtype, questions };
            }

            const payload = {
                ...formData,
                ...specificData,
                updatedAt: new Date().toISOString()
            };

            if (editingTask) {
                const taskRef = doc(db, "task", editingTask.id);
                await updateDoc(taskRef, payload);
                console.log("Document updated with ID: ", editingTask.id);
                showToast("Assignment updated successfully!", "success");
            } else {
                const docRef = await addDoc(collection(db, "task"), {
                    ...payload,
                    createdAt: new Date().toISOString(),
                    createdBy: admin?.uid || "Anonymous" 
                });
                console.log("Document written with ID: ", docRef.id);

                // Notify students in the section
                 try {
                    const usersRef = collection(db, "users");
                    const q = query(usersRef, where("section", "==", formData.section), where("role", "==", "student"));
                    const querySnapshot = await getDocs(q);
                
                    if (!querySnapshot.empty) {
                        const batch = writeBatch(db);
                        const pushTokens = []; // Store tokens to send in bulk/loop
            
                        querySnapshot.docs.forEach((userDoc) => {
                            const userData = userDoc.data();
            
                            // 1. Create Database Notification
                            const notifRef = doc(collection(db, "notifications"));
                            batch.set(notifRef, {
                                userId: userDoc.id,
                                title: "New Assignment: " + formData.title,
                                message: `A new task "${formData.title}" has been posted.`,
                                type: "task",
                                relatedId: docRef.id,
                                read: false,
                                createdAt: new Date().toISOString()
                            });

                            // 2. Collect Push Tokens
                            if (userData.pushToken && userData.pushToken.includes("ExponentPushToken")) {
                                pushTokens.push(userData.pushToken);
                            }
                        });

                        // 3. Commit Database Changes
                        await batch.commit();
                        console.log(`Database notifications saved.`);
            
                        // 4. Send Push Notifications
                        if (pushTokens.length > 0) {
                            await sendPushNotification(
                                pushTokens, 
                                "New Assignment: " + formData.title,
                                `A new task "${formData.title}" has been posted for Section ${formData.section}.`,
                                { taskId: docRef.id }
                            );
                        }
                    }
                } catch (notifError) {
                    // CATCH NETWORK ERRORS SO THE APP DOESN'T CRASH
                    console.error("Error sending notifications:", notifError);
                }

                showToast("Assignment created successfully!", "success");
            }
            
            handleCloseModal();
        } catch (error) {
            console.error("Error saving task:", error);
            showToast(`Failed to save assignment: ${error.message}`, "error");
        }
    };

    const handleDeleteTask = (task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        
        try {
            await deleteDoc(doc(db, "task", taskToDelete.id));
            showToast("Assignment deleted successfully!", "success");
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
        } catch (error) {
            console.error("Error deleting task:", error);
            showToast(`Failed to delete assignment: ${error.message}`, "error");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="font-serif min-h-screen w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] relative overflow-x-hidden">
            {/* Background Image */}
            <div 
                className="fixed inset-0 z-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "sepia(0.8) hue-rotate(-30deg) contrast(1.1)"
                }}
            />

            <div className="w-full flex flex-col items-center relative z-10">
                {/* Header */}
                <div className="w-full bg-[#0c0a09] border-b-2 md:border-b-4 border-[#292524] py-4 px-4 md:py-10 md:px-6 shadow-2xl">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-[0.1em] md:tracking-[0.15em] uppercase text-[#d4af37]">
                            Assignments & Challenges
                        </h1>
                        <p className="text-[#a8a29e] mt-1 md:mt-2 tracking-wide text-xs sm:text-sm md:text-base">Manage trials for your disciples</p>
                    </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="max-w-7xl w-full px-3 sm:px-4 md:px-6 mt-4 md:mt-10">
                    {/* Mobile: Search + Filter Toggle */}
                    <div className="md:hidden space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" size={16} />
                            <input 
                                type="text"
                                placeholder="Search task..."
                                className="w-full bg-[#292524] border border-[#44403c] pl-10 pr-4 py-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none placeholder-[#57534e] text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#292524] text-[#a8a29e] px-4 py-3 rounded border border-[#44403c] hover:border-[#d4af37] transition-all text-sm font-bold uppercase tracking-wider"
                            >
                                <Menu size={16} /> Filters
                            </button>
                            <button 
                                onClick={handleOpenModal}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#2c241b] text-[#d4af37] px-4 py-3 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all font-bold uppercase tracking-wider text-sm"
                            >
                                <Plus size={16} /> Create
                            </button>
                        </div>

                        {/* Mobile Filter Dropdown */}
                        {showMobileFilters && (
                            <div className="bg-[#292524] p-4 rounded border border-[#44403c] space-y-3 animate-fade-in">
                                <select 
                                    className="w-full bg-[#0c0a09] border border-[#44403c] px-3 py-2.5 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="coding">Coding</option>
                                    <option value="debug">Debug</option>
                                </select>

                                <select 
                                    className="w-full bg-[#0c0a09] border border-[#44403c] px-3 py-2.5 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                {!userSection && (
                                    <select 
                                        className="w-full bg-[#0c0a09] border border-[#44403c] px-3 py-2.5 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                        value={filterSection}
                                        onChange={(e) => setFilterSection(e.target.value)}
                                    >
                                        <option value="all">All Sections</option>
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                    </select>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Desktop: Full Filter Bar */}
                    <div className="hidden md:block bg-[#292524] p-4 rounded-sm border border-[#44403c] shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Search Bar */}
                            <div className="relative w-full lg:w-1/3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search by title, type, difficulty..."
                                    className="w-full bg-[#0c0a09] border border-[#44403c] pl-10 pr-4 py-2 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none placeholder-[#57534e]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Filters & Action */}
                            <div className="flex flex-wrap gap-4 w-full lg:w-auto items-center justify-end">
                                <div className="flex items-center gap-2 text-[#a8a29e] text-sm font-bold uppercase tracking-wider">
                                    <Filter size={16} /> Filters:
                                </div>

                                <select 
                                    className="bg-[#0c0a09] border border-[#44403c] px-3 py-2 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="quiz">Quiz</option>
                                    <option value="coding">Coding</option>
                                    <option value="debug">Debug</option>
                                </select>

                                <select 
                                    className="bg-[#0c0a09] border border-[#44403c] px-3 py-2 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                >
                                    <option value="all">All Difficulties</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                {userSection ? (
                                    <div className="bg-[#0c0a09] border border-[#d4af37]/30 px-3 py-2 rounded text-[#d4af37] text-sm font-bold flex items-center gap-2">
                                        <Layers size={14} /> Section {userSection}
                                    </div>
                                ) : (
                                    <select 
                                        className="bg-[#0c0a09] border border-[#44403c] px-3 py-2 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                        value={filterSection}
                                        onChange={(e) => setFilterSection(e.target.value)}
                                    >
                                        <option value="all">All Sections</option>
                                        <option value="A">Section A</option>
                                        <option value="B">Section B</option>
                                    </select>
                                )}

                                <button 
                                    onClick={handleOpenModal}
                                    className="flex items-center gap-2 bg-[#2c241b] text-[#d4af37] px-4 py-2 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                                >
                                    <Plus size={16} /> Create Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Task List - Desktop: Table, Mobile: Cards */}
                <div className="max-w-7xl w-full px-3 sm:px-4 md:px-6 py-4 md:py-6">
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0c0a09] text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                        <th className="p-3 md:p-4 font-bold">Title</th>
                                        <th className="p-3 md:p-4 font-bold">Type</th>
                                        <th className="p-3 md:p-4 font-bold">Section</th>
                                        <th className="p-3 md:p-4 font-bold">Difficulty</th>
                                        <th className="p-3 md:p-4 font-bold">Due Date</th>
                                        <th className="p-3 md:p-4 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#44403c]">
                                    {filteredTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-[#0c0a09]/50 transition-colors bg-[#1c1917]">
                                            <td className="p-3 md:p-4 font-medium text-[#e7e5e4] flex items-center gap-3">
                                                <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c]">
                                                    {task.type === 'quiz' && <Scroll size={16} className="text-[#fbbf24]" />}
                                                    {task.type === 'coding' && <Brain size={16} className="text-[#2dd4bf]" />}
                                                    {task.type === 'debug' && <Bug size={16} className="text-[#a855f7]" />}
                                                </div>
                                                {task.title}
                                            </td>
                                            <td className="p-3 md:p-4 text-[#a8a29e] uppercase text-xs font-bold tracking-wider">
                                                {task.type}
                                                {task.type === 'quiz' && task.subtype && (
                                                    <span className="ml-2 opacity-60 text-[10px]">({task.subtype})</span>
                                                )}
                                            </td>
                                            <td className="p-3 md:p-4 text-[#e7e5e4]">{task.section}</td>
                                            <td className="p-3 md:p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${ 
                                                    task.difficulty === 'hard' ? 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10' :
                                                    task.difficulty === 'medium' ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10' :
                                                    'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
                                                }`}>{task.difficulty}</span>
                                            </td>
                                            <td className="p-3 md:p-4 text-[#a8a29e] font-mono text-sm">{task.dueDateFormatted}</td>
                                            <td className="p-3 md:p-4 flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleViewTask(task)} 
                                                    className="text-[#a8a29e] hover:text-[#2dd4bf] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleGradeTask(task)} 
                                                    className="text-[#a8a29e] hover:text-[#fbbf24] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="Grade Submissions"
                                                >
                                                    <GraduationCap size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEditTask(task)} 
                                                    className="text-[#a8a29e] hover:text-[#d4af37] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTask(task)} 
                                                    className="text-[#a8a29e] hover:text-[#ef4444] transition-colors p-2 hover:bg-[#292524] rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTasks.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-[#57534e] italic">
                                                {tasks.length === 0 ? "No active task found. Create one to begin." : "No task match your filters."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="bg-[#292524] rounded border border-[#44403c] overflow-hidden">
                                {/* Card Header */}
                                <div className="p-4 border-b border-[#44403c] bg-[#0c0a09]/50">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-[#1c1917] rounded-full border border-[#44403c] flex-shrink-0">
                                                {task.type === 'quiz' && <Scroll size={18} className="text-[#fbbf24]" />}
                                                {task.type === 'coding' && <Brain size={18} className="text-[#2dd4bf]" />}
                                                {task.type === 'debug' && <Bug size={18} className="text-[#a855f7]" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[#e7e5e4] text-base break-words">{task.title}</h3>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="text-[#a8a29e] uppercase text-[10px] font-bold tracking-wider bg-[#1c1917] px-2 py-1 rounded">
                                                        {task.type}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${ 
                                                        task.difficulty === 'hard' ? 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10' :
                                                        task.difficulty === 'medium' ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10' :
                                                        'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
                                                    }`}>{task.difficulty}</span>
                                                    <span className="text-[#a8a29e] uppercase text-[10px] font-bold tracking-wider bg-[#1c1917] px-2 py-1 rounded">
                                                        Sec {task.section}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-[#57534e] text-xs font-mono">
                                        Due: {task.dueDateFormatted}
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="p-3 flex gap-2">
                                    <button 
                                        onClick={() => handleViewTask(task)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#0c0a09] text-[#2dd4bf] py-2.5 px-3 rounded border border-[#44403c] hover:border-[#2dd4bf] transition-all text-xs font-bold uppercase tracking-wider"
                                    >
                                        <Eye size={14} /> View
                                    </button>
                                    <button 
                                        onClick={() => handleGradeTask(task)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-[#0c0a09] text-[#fbbf24] py-2.5 px-3 rounded border border-[#44403c] hover:border-[#fbbf24] transition-all text-xs font-bold uppercase tracking-wider"
                                    >
                                        <GraduationCap size={14} /> Grade
                                    </button>
                                    <button 
                                        onClick={() => handleEditTask(task)}
                                        className="flex items-center justify-center gap-2 bg-[#0c0a09] text-[#d4af37] py-2.5 px-3 rounded border border-[#44403c] hover:border-[#d4af37] transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTask(task)}
                                        className="flex items-center justify-center gap-2 bg-[#0c0a09] text-[#ef4444] py-2.5 px-3 rounded border border-[#44403c] hover:border-[#ef4444] transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredTasks.length === 0 && (
                            <div className="bg-[#292524] p-8 rounded border border-[#44403c] text-center text-[#57534e] italic text-sm">
                                {tasks.length === 0 ? "No active task found. Create one to begin." : "No task match your filters."}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Assignment Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm">
                        <div className="relative w-full max-w-5xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-[#44403c] bg-[#0c0a09]">
                                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-[#d4af37] uppercase tracking-wider md:tracking-widest flex items-center gap-2 md:gap-3">
                                    <Scroll size={20} className="sm:w-6 sm:h-6" /> {editingTask ? "Edit Assignment" : "New Assignment"}
                                </h3>
                                <button onClick={handleCloseModal} className="text-[#a8a29e] hover:text-[#ef4444] p-1"><X size={20} className="sm:w-6 sm:h-6" /></button>
                            </div>
                            
                            {/* Step Indicator */}
                            <div className="w-full bg-[#292524] border-b border-[#44403c] p-3 sm:p-4 flex justify-center items-center gap-3 sm:gap-4">
                                <StepIndicator step={1} currentStep={currentStep} label="Details" />
                                <div className={`h-0.5 w-8 md:w-16 transition-colors duration-500 ${currentStep >= 2 ? "bg-[#d4af37]" : "bg-[#44403c]"}`}></div>
                                <StepIndicator step={2} currentStep={currentStep} label="Configuration" />
                            </div>

                            <div className="p-3 sm:p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                                {currentStep === 1 ? (
                                    <div className="space-y-4 sm:space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Assignment Title</label>
                                                <input className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#e7e5e4] text-sm sm:text-base focus:border-[#d4af37] outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Enter title..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Difficulty</label>
                                                <select className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#e7e5e4] text-sm sm:text-base focus:border-[#d4af37] outline-none" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Section</label>
                                                {userSection ? (
                                                    <div className="w-full bg-[#0c0a09]/50 border border-[#44403c] p-2.5 sm:p-3 rounded text-[#d4af37] font-bold text-sm sm:text-base">
                                                        Section {userSection}
                                                    </div>
                                                ) : (
                                                    <select 
                                                        className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#e7e5e4] text-sm sm:text-base focus:border-[#d4af37] outline-none"
                                                        value={formData.section} 
                                                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                                                    >
                                                        <option value="A">Section A</option>
                                                        <option value="B">Section B</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Due Date & Time</label>
                                                <input type="datetime-local" className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#e7e5e4] text-sm sm:text-base focus:border-[#d4af37] outline-none" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="pt-4 sm:pt-6 border-t border-[#44403c]">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-3 sm:mb-4 block">Select Challenge Type</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                <ChallengeTypeOption label="Quiz" icon={<Scroll size={20} className="sm:w-6 sm:h-6" />} selected={formData.type === "quiz"} onClick={() => setFormData({...formData, type: "quiz"})} />
                                                <ChallengeTypeOption label="Debug" icon={<Bug size={20} className="sm:w-6 sm:h-6" />} selected={formData.type === "debug"} onClick={() => setFormData({...formData, type: "debug"})} />
                                                <ChallengeTypeOption label="Coding" icon={<Brain size={20} className="sm:w-6 sm:h-6" />} selected={formData.type === "coding"} onClick={() => setFormData({...formData, type: "coding"})} />
                                            </div>
                                        </div>
                                        <button onClick={handleNextStep} disabled={!formData.type || !formData.title || !formData.dueDate} className="w-full bg-[#2c241b] text-[#d4af37] py-3 sm:py-4 rounded font-bold uppercase tracking-wider sm:tracking-widest text-sm sm:text-base border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all disabled:opacity-50 disabled:cursor-not-allowed">Next: Configure {formData.type || "Challenge"}</button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6 animate-fade-in">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
                                            <h4 className="text-lg sm:text-xl font-bold text-[#e7e5e4] uppercase tracking-wider">Configuring {challengeType}</h4>
                                            <button onClick={() => setCurrentStep(1)} className="text-[#a8a29e] hover:text-[#d4af37] text-xs sm:text-sm underline uppercase tracking-wide">Back to Details</button>
                                        </div>
                                        <div className="border border-[#44403c] p-3 sm:p-4 rounded bg-[#0c0a09]/50">
                                            {challengeType === "quiz" && <Quiz data={quizData} setData={setQuizData} readOnly={!!editingTask} />}
                                            {challengeType === "coding" && <Coding data={codingData} setData={setCodingData} />}
                                            {challengeType === "debug" && <Debug data={debugData} setData={setDebugData} />}
                                        </div>
                                        <button onClick={handleSaveTask} className="w-full bg-[#d4af37] text-[#0c0a09] py-3 sm:py-4 rounded font-bold uppercase tracking-wider sm:tracking-widest text-sm sm:text-base hover:bg-[#fbbf24] transition-all shadow-lg flex items-center justify-center gap-2"><Save size={18} className="sm:w-5 sm:h-5" /> {editingTask ? "Update Assignment" : "Save & Publish Assignment"}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW TASK MODAL */}
                {viewingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-sm">
                        <div className="relative w-full max-w-4xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
                            <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-[#44403c] bg-[#0c0a09]">
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="text-base sm:text-xl md:text-2xl font-bold text-[#d4af37] uppercase tracking-wider md:tracking-widest flex items-center gap-2 md:gap-3 break-words">
                                        {viewingTask.type === "quiz" && <Scroll size={20} className="flex-shrink-0 sm:w-6 sm:h-6" />}
                                        {viewingTask.type === "coding" && <Brain size={20} className="flex-shrink-0 sm:w-6 sm:h-6" />}
                                        {viewingTask.type === "debug" && <Bug size={20} className="flex-shrink-0 sm:w-6 sm:h-6" />}
                                        <span className="break-words">{viewingTask.title}</span>
                                    </h3>
                                    <p className="text-[#a8a29e] text-[10px] sm:text-xs mt-1 uppercase tracking-wider">{viewingTask.type} • {viewingTask.section} • {viewingTask.difficulty} • Due: {viewingTask.dueDateFormatted}</p>
                                </div>
                                <button onClick={() => setViewingTask(null)} className="text-[#a8a29e] hover:text-[#ef4444] p-1 flex-shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
                            </div>
                            <div className="p-3 sm:p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#1c1917]">
                                {(viewingTask.type === "coding" || viewingTask.type === "debug") && (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="bg-[#0c0a09] p-4 sm:p-6 rounded border border-[#292524]">
                                            <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 border-b border-[#292524] pb-2">Instructions</h4>
                                            <p className="text-[#e7e5e4] whitespace-pre-wrap font-serif italic text-sm sm:text-base md:text-lg leading-relaxed">{viewingTask.instruction}</p>
                                        </div>
                                        {viewingTask.type === "debug" && viewingTask.code && (
                                            <div className="bg-[#0c0a09] p-2 rounded border border-[#292524]">
                                                <h4 className="text-[#a8a29e] font-bold uppercase tracking-widest text-xs mb-2 px-2">Initial Code</h4>
                                                <Editor height="250px" defaultLanguage="javascript" theme="vs-dark" value={viewingTask.code} options={{ readOnly: true, fontSize: 12, fontFamily: 'monospace', minimap: { enabled: false }, scrollBeyondLastLine: false }} />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {viewingTask.type === "quiz" && (
                                    <div className="space-y-4 sm:space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-[#2c241b] text-[#d4af37] px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded border border-[#d4af37]/30">{viewingTask.subtype || "MCQ"}</span>
                                            <span className="text-[#57534e] text-[10px] sm:text-xs uppercase tracking-wider font-bold">{viewingTask.questions?.length || 0} Questions</span>
                                        </div>
                                        <div className="space-y-3 sm:space-y-4">
                                            {viewingTask.questions?.map((q, idx) => (
                                                <div key={idx} className="bg-[#0c0a09] p-4 sm:p-6 rounded border border-[#292524] relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]/50"></div>
                                                    <p className="font-bold text-[#e7e5e4] mb-3 sm:mb-4 flex gap-2 sm:gap-3 text-sm sm:text-base md:text-lg italic"><span className="text-[#d4af37] flex-shrink-0">Q{idx + 1}.</span><span className="break-words">{q.text}</span></p>
                                                    {viewingTask.subtype === "mcq" && (
                                                        <div className="grid grid-cols-1 gap-2 sm:gap-3 ml-0 sm:ml-8">
                                                            {q.choices?.map((choice, cIdx) => (
                                                                <div key={cIdx} className={`px-3 sm:px-4 py-2 sm:py-3 rounded border text-xs sm:text-sm flex items-center gap-2 sm:gap-3 break-words ${cIdx === q.correctIndex ? "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37] font-bold" : "bg-[#1c1917] border-[#292524] text-[#a8a29e]"}`}>
                                                                    <span className="text-[10px] sm:text-xs opacity-50 flex-shrink-0">{String.fromCharCode(65 + cIdx)}.</span>
                                                                    <span className="flex-1">{choice}</span>
                                                                    {cIdx === q.correctIndex && <CheckCircle2 size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {viewingTask.subtype === "tf" && (
                                                        <div className="ml-0 sm:ml-8 flex gap-3 sm:gap-4">
                                                            {["True", "False"].map((opt) => (
                                                                <div key={opt} className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded border text-xs sm:text-sm font-bold uppercase tracking-wider ${q.correctAnswer === opt ? (opt === "True" ? "bg-[#2dd4bf]/10 border-[#2dd4bf] text-[#2dd4bf]" : "bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]") : "bg-[#1c1917] border-[#292524] text-[#57534e] opacity-50"}`}>{opt}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {viewingTask.subtype === "enum" && (
                                                        <div className="ml-0 sm:ml-8 bg-[#1c1917] p-3 sm:p-4 rounded border border-[#292524]">
                                                            <p className="text-[#a8a29e] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">Accepted Answers:</p>
                                                            <ul className="list-disc list-inside text-[#e7e5e4] space-y-1 text-xs sm:text-sm">{q.answers?.map((ans, aIdx) => (<li key={aIdx} className="break-words">{ans}</li>))}</ul>
                                                        </div>
                                                    )}
                                                    {viewingTask.subtype === "paragraph" && <div className="ml-0 sm:ml-8"><p className="text-[#57534e] text-xs sm:text-sm italic border-l-2 border-[#292524] pl-3 sm:pl-4 py-2">(Open-ended response expected)</p></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* GRADING MODAL */}
                {gradingTask && <GradingModal task={gradingTask} onClose={handleCloseGrading} initialStudentId={preSelectedStudentId} />}

                {/* DELETE CONFIRMATION MODAL */}
                {isDeleteModalOpen && taskToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                        <div className="w-full max-w-md bg-[#1c1917] rounded border-2 border-[#44403c] shadow-2xl overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#450a0a] border border-[#ef4444]/30 flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={32} className="text-[#ef4444]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#e7e5e4] mb-2">Delete Assignment?</h3>
                                <p className="text-[#a8a29e] text-sm mb-6">
                                    Are you sure you want to delete <span className="text-[#d4af37] font-bold">"{taskToDelete.title}"</span>? 
                                    This action cannot be undone and all student submissions will be lost.
                                </p>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 py-3 rounded bg-[#292524] text-[#a8a29e] font-bold uppercase tracking-wider text-sm border border-[#44403c] hover:bg-[#44403c] hover:text-[#e7e5e4] transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 rounded bg-[#450a0a] text-[#ef4444] font-bold uppercase tracking-wider text-sm border border-[#ef4444]/30 hover:bg-[#ef4444] hover:text-white transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Grading Modal Component - Made Responsive
function GradingModal({ task, onClose, initialStudentId }) {
    const { showToast } = useToast();
    const { gradebookData, loading, updateGrade } = useGradebook(task.id, task.section);
    const [grades, setScores] = useState({});
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [showStudentList, setShowStudentList] = useState(false); // For mobile toggle

    useEffect(() => {
        if (gradebookData && gradebookData.length > 0) {
            setScores(prev => {
                const needsUpdate = gradebookData.some(item => !prev[item.student.uid]);
                if (!needsUpdate) return prev;

                const newGrades = { ...prev };
                gradebookData.forEach(item => {
                    if (!newGrades[item.student.uid]) {
                        newGrades[item.student.uid] = {
                            score: item.score,
                            feedback: item.feedback || ""
                        };
                    }
                });
                return newGrades;
            });
            
            if (!selectedStudentId) {
                if (initialStudentId) {
                    const found = gradebookData.find(item => item.student.uid === initialStudentId);
                    if (found) setSelectedStudentId(initialStudentId);
                    else setSelectedStudentId(gradebookData[0].student.uid);
                } else {
                    const firstSubmitted = gradebookData.find(s => s.status !== 'missing');
                    setSelectedStudentId(firstSubmitted ? firstSubmitted.student.uid : gradebookData[0].student.uid);
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gradebookData]);

    const handleGradeChange = (studentId, field, value) => {
        setScores(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const saveGrade = async (studentId, submissionId) => {
        const gradeData = grades[studentId];
        const success = await updateGrade(submissionId, studentId, gradeData.score, gradeData.feedback);
        if (success) {
            showToast("Grade updated!", "success");
        } else {
            showToast("Failed to update grade.", "error");
        }
    };


    const formatDate = (date) => {
        if (!date) return "-";
        if (typeof date.toDate === 'function') {
            return date.toDate().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        try {
            return new Date(date).toLocaleString();
        } catch {
            return String(date);
        }
    };

    const totalStudents = gradebookData.length;
    const submittedCount = gradebookData.filter(item => item.status !== 'missing').length;

    const selectedItem = gradebookData.find(item => item.student.uid === selectedStudentId);
    const selectedGrade = grades[selectedStudentId] || { score: 0, feedback: "" };

    const sortedGradebook = [...gradebookData].sort((a, b) => {
        const priority = { submitted: 1, graded: 2, missing: 3 };
        const pA = priority[a.status] || 4;
        const pB = priority[b.status] || 4;
        
        if (pA !== pB) return pA - pB;
        return a.student.lastName.localeCompare(b.student.lastName);
    });

    const filteredStudents = sortedGradebook.filter(item => {
        const fullName = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        const email = item.student.email.toLowerCase();
        const query = studentSearchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-sm">
            <div className="relative w-full h-full sm:h-[90vh] sm:max-w-7xl bg-[#1c1917] sm:rounded-sm border-0 sm:border-2 border-[#44403c] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-[#44403c] bg-[#0c0a09]">
                    <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-base sm:text-xl md:text-2xl font-bold text-[#d4af37] uppercase tracking-wider md:tracking-widest flex items-center gap-2 md:gap-3">
                            <GraduationCap size={20} className="flex-shrink-0 sm:w-6 sm:h-6" /> <span className="truncate">Gradebook: {task.title}</span>
                        </h3>
                        <p className="text-[#a8a29e] text-[10px] sm:text-xs mt-1 uppercase tracking-wider">
                            Section {task.section}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-[#a8a29e] hover:text-[#ef4444] p-1 flex-shrink-0"><X size={20} className="sm:w-6 sm:h-6" /></button>
                </div>

                {/* Mobile: Student Selector + Toggle */}
                <div className="md:hidden border-b border-[#44403c] bg-[#0c0a09] p-3">
                    <button 
                        onClick={() => setShowStudentList(!showStudentList)}
                        className="w-full flex items-center justify-between bg-[#1c1917] border border-[#44403c] p-3 rounded text-[#e7e5e4] hover:border-[#d4af37] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0c0a09] flex items-center justify-center border border-[#44403c] text-[#a8a29e]">
                                <User size={16} />
                            </div>
                            {selectedItem ? (
                                <div className="text-left">
                                    <p className="text-sm font-bold">{selectedItem.student.firstName} {selectedItem.student.lastName}</p>
                                    <StatusBadge status={selectedItem.status} />
                                </div>
                            ) : (
                                <span className="text-sm text-[#57534e]">Select a student</span>
                            )}
                        </div>
                        <ChevronRight size={18} className={`text-[#57534e] transition-transform ${showStudentList ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Mobile Student List Dropdown */}
                    {showStudentList && (
                        <div className="mt-3 bg-[#1c1917] border border-[#44403c] rounded max-h-[60vh] overflow-hidden flex flex-col animate-fade-in">
                            <div className="p-3 border-b border-[#44403c] bg-[#0c0a09] sticky top-0 z-10 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Search student..."
                                        className="w-full bg-[#292524] border border-[#44403c] pl-9 pr-3 py-2 rounded text-[#e7e5e4] text-xs focus:border-[#d4af37] outline-none"
                                        value={studentSearchQuery}
                                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-[#57534e]">
                                    <span>Total: <span className="text-[#e7e5e4]">{totalStudents}</span></span>
                                    <span>Submitted: <span className="text-[#d4af37]">{submittedCount}</span></span>
                                </div>
                            </div>
                            <div className="overflow-y-auto divide-y divide-[#292524]">
                                {filteredStudents.map((item, index, array) => {
                                    const isFirstMissing = item.status === 'missing' && (index === 0 || array[index - 1].status !== 'missing');
                                    return (
                                        <div key={item.student.uid}>
                                            {isFirstMissing && (
                                                <div className="bg-[#292524] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#57534e] border-y border-[#44403c]">
                                                    Not Submitted
                                                </div>
                                            )}
                                            <div 
                                                onClick={() => {
                                                    setSelectedStudentId(item.student.uid);
                                                    setShowStudentList(false);
                                                }}
                                                className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${selectedStudentId === item.student.uid ? "bg-[#292524] border-l-4 border-[#d4af37]" : "hover:bg-[#0c0a09] border-l-4 border-transparent"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#0c0a09] flex items-center justify-center border border-[#44403c] text-[#a8a29e]">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#e7e5e4]">{item.student.firstName} {item.student.lastName}</p>
                                                        <StatusBadge status={item.status} />
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className={`text-[#57534e] ${selectedStudentId === item.student.uid ? "text-[#d4af37]" : ""}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Body - Split View */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Desktop: Left Sidebar - Student List */}
                    <div className="hidden md:flex w-full md:w-1/3 border-r border-[#44403c] bg-[#0c0a09] overflow-y-auto custom-scrollbar flex-col">
                        <div className="p-3 md:p-4 border-b border-[#44403c] bg-[#0c0a09] sticky top-0 z-10 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]" size={14} />
                                <input 
                                    type="text"
                                    placeholder="Search student..."
                                    className="w-full bg-[#1c1917] border border-[#44403c] pl-9 pr-3 py-2 rounded text-[#e7e5e4] text-xs focus:border-[#d4af37] outline-none"
                                    value={studentSearchQuery}
                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-[#57534e]">
                                <span>Total: <span className="text-[#e7e5e4]">{totalStudents}</span></span>
                                <span>Submitted: <span className="text-[#d4af37]">{submittedCount}</span></span>
                            </div>
                        </div>

                        {loading ? <div className="p-4"><Loader /></div> : (
                            <div className="divide-y divide-[#292524] flex-1">
                                {filteredStudents.map((item, index, array) => {
                                    const isFirstMissing = item.status === 'missing' && (index === 0 || array[index - 1].status !== 'missing');
                                    
                                    return (
                                        <div key={item.student.uid}>
                                            {isFirstMissing && (
                                                <div className="bg-[#292524] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#57534e] border-y border-[#44403c]">
                                                    Not Submitted
                                                </div>
                                            )}
                                            <div 
                                                onClick={() => setSelectedStudentId(item.student.uid)}
                                                className={`p-3 md:p-4 cursor-pointer transition-colors flex items-center justify-between ${selectedStudentId === item.student.uid ? "bg-[#292524] border-l-4 border-[#d4af37]" : "hover:bg-[#1c1917] border-l-4 border-transparent"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#1c1917] flex items-center justify-center border border-[#44403c] text-[#a8a29e]">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-[#e7e5e4]">{item.student.firstName} {item.student.lastName}</p>
                                                        <StatusBadge status={item.status} />
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className={`text-[#57534e] ${selectedStudentId === item.student.uid ? "text-[#d4af37]" : ""}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredStudents.length === 0 && <p className="p-8 text-center text-[#57534e] text-xs italic">No students match your search.</p>}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Grading Detail */}
                    <div className="w-full md:w-2/3 bg-[#1c1917] flex flex-col overflow-hidden">
                        {selectedItem ? (
                            <>
                                {/* Student Header Info */}
                                <div className="p-3 sm:p-4 md:p-6 border-b border-[#44403c] bg-[#1c1917]">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base sm:text-lg md:text-xl font-bold text-[#e7e5e4] break-words">{selectedItem.student.firstName} {selectedItem.student.lastName}</h4>
                                            <p className="text-[#a8a29e] text-xs break-all">{selectedItem.student.email}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-[#57534e] text-[10px] sm:text-xs uppercase tracking-wider font-bold mb-1">Submitted</p>
                                            <p className="text-[#d4af37] font-mono text-xs sm:text-sm">{formatDate(selectedItem.submittedAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submission Content */}
                                <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar bg-[#0c0a09]/50">
                                    {selectedItem.status === "missing" ? (
                                        <div className="h-full flex flex-col items-center justify-center text-[#57534e] italic opacity-50">
                                            <AlertCircle size={40} className="mb-3 sm:mb-4 sm:w-12 sm:h-12" />
                                            <p className="text-sm sm:text-base">No submission available.</p>
                                        </div>
                                    ) : (
                                        <SubmissionDetailView 
                                            submission={selectedItem} 
                                            task={task} 
                                            onScoreUpdate={(newScore) => handleGradeChange(selectedStudentId, "score", newScore)}
                                        />
                                    )}
                                </div>

                                {/* Grading Footer */}
                                <div className="p-3 sm:p-4 md:p-6 border-t border-[#44403c] bg-[#1c1917]">
                                    <div className="flex flex-col gap-3 sm:gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-1 block">Feedback</label>
                                            <input 
                                                className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#e7e5e4] text-sm sm:text-base focus:border-[#d4af37] outline-none transition-colors placeholder-[#292524]"
                                                placeholder="Enter feedback for student..."
                                                value={selectedGrade.feedback}
                                                onChange={(e) => handleGradeChange(selectedStudentId, "feedback", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex gap-3 sm:gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-1 block">Score</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-2.5 sm:p-3 rounded text-[#d4af37] font-bold text-center text-sm sm:text-base focus:border-[#d4af37] outline-none"
                                                    value={selectedGrade.score}
                                                    onChange={(e) => handleGradeChange(selectedStudentId, "score", e.target.value)}
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button 
                                                    onClick={() => saveGrade(selectedStudentId, selectedItem.submissionId)}
                                                    className="h-[42px] sm:h-[46px] px-4 sm:px-6 bg-[#2c241b] text-[#d4af37] font-bold uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Save size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Update</span><span className="sm:hidden">Save</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#57534e] p-4 text-center text-sm sm:text-base">
                                Select a student to grade.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    let styles = "bg-[#292524] text-[#a8a29e] border-[#44403c]";
    let icon = <AlertCircle size={10} className="sm:w-3 sm:h-3" />;

    if (status === "submitted") {
        styles = "bg-[#172554] text-[#60a5fa] border-[#1e3a8a]";
        icon = <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />;
    } else if (status === "graded") {
        styles = "bg-[#052e16] text-[#4ade80] border-[#14532d]";
        icon = <CheckCircle size={10} className="sm:w-3 sm:h-3" />;
    } else if (status === "missing") {
        styles = "bg-[#450a0a] text-[#f87171] border-[#7f1d1d]";
        icon = <X size={10} className="sm:w-3 sm:h-3" />;
    }

    return (
        <span className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${styles} w-fit`}>
            {icon} {status}
        </span>
    );
}

function StepIndicator({ step, currentStep, label }) {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;

    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm border-2 transition-all ${ 
                isActive ? "bg-[#d4af37] border-[#d4af37] text-[#0c0a09]" :
                isCompleted ? "bg-[#2c241b] border-[#d4af37] text-[#d4af37]" :
                "bg-[#0c0a09] border-[#44403c] text-[#57534e]"
            }`}>
                {isCompleted ? <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> : step}
            </div>
            <span className={`uppercase text-[10px] sm:text-xs font-bold tracking-wider ${ 
                isActive || isCompleted ? "text-[#e7e5e4]" : "text-[#57534e]"
            }`}>
                {label}
            </span>
        </div>
    )
}

function ChallengeTypeOption({ label, icon, selected, onClick }) {
    return (
        <div 
            onClick={onClick}
            className={`cursor-pointer flex items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 rounded border-2 transition-all duration-300 ${ 
                selected 
                ? "bg-[#2c241b] border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                : "bg-[#0c0a09] border-[#292524] text-[#57534e] hover:border-[#57534e] hover:text-[#a8a29e]"
            }`}
        >
            {icon}
            <span className="font-bold uppercase tracking-wider text-sm sm:text-base">{label}</span>
        </div>
    )
}