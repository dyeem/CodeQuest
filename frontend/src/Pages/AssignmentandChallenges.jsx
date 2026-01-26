import { useEffect, useState } from "react";
import bg from "../assets/assignmentandchallenges.png";
import Coding from "../Components/Challenge/Coding";
import Quiz from "../Components/Challenge/Quiz";
import Debug from "../Components/Challenge/Debug";
import { Scroll, Brain, Bug, X, Plus, CheckCircle2, Trash2, Edit2, Save, Search, Filter, Eye, GraduationCap, AlertCircle, CheckCircle, ChevronRight, User } from "lucide-react";
import { db } from "../config/firebase.config";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import Loader from "../Components/Loader";
import useAuth from "../hooks/auth";
import Editor from "@monaco-editor/react";
import useGradebook from "../hooks/useGradebook";
import SubmissionDetailView from "../Components/Grading/SubmissionDetailView";

export default function AssignmentandChallenges() {
    const { admin } = useAuth();
    
    useEffect(() => {
        document.title = "Assignments & Challenges | CodeQuest";
    }, []);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [challengeType, setChallengeType] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [editingTask, setEditingTask] = useState(null); // Track the task being edited
    const [viewingTask, setViewingTask] = useState(null); // Track the task being viewed
    const [gradingTask, setGradingTask] = useState(null); // Track the task being graded
    
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

    // Fetch Tasks
    useEffect(() => {
        const tasksCollection = collection(db, "task");
        const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Format date for display if it exists
                    dueDateFormatted: data.dueDate ? new Date(data.dueDate).toLocaleString() : "No Date"
                };
            });
            setTasks(fetchedTasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

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
        setFormData({ title: "", difficulty: "easy", section: "A", dueDate: "", type: "" });
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

        // Pre-fill specific data based on type
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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleNextStep = () => {
        if (!formData.title || !formData.type || !formData.dueDate) return alert("Please fill in all fields");
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
                // Filter only the relevant questions based on subtype
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
                // Update existing task
                const taskRef = doc(db, "task", editingTask.id);
                await updateDoc(taskRef, payload);
                console.log("Document updated with ID: ", editingTask.id);
                alert("Assignment updated successfully!");
            } else {
                // Create new task
                const docRef = await addDoc(collection(db, "task"), {
                    ...payload,
                    createdAt: new Date().toISOString(),
                    createdBy: admin?.uid || "Anonymous" 
                });
                console.log("Document written with ID: ", docRef.id);
                alert("Assignment created successfully!");
            }
            
            handleCloseModal();
        } catch (error) {
            console.error("Error saving task:", error);
            alert(`Failed to save assignment: ${error.message}`);
        }
    };

    const handleDeleteTask = async (id) => {
        if (confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, "task", id));
                alert("Assignment deleted successfully.");
            } catch (error) {
                console.error("Error deleting task:", error);
                alert(`Failed to delete assignment: ${error.message}`);
            }
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="font-serif min-h-full w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] relative">
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
                <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-10 px-6 shadow-2xl">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-[#d4af37]">
                            Assignments & Challenges
                        </h1>
                        <p className="text-[#a8a29e] mt-2 tracking-wide">Manage trials for your disciples</p>
                    </div>
                </div>

                {/* Filter & Search Controls */}
                <div className="max-w-7xl w-full px-6 mt-10">
                    <div className="bg-[#292524] p-4 rounded-sm border border-[#44403c] shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Search Bar */}
                        <div className="relative w-full md:w-1/3">
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
                        <div className="flex flex-wrap gap-4 w-full md:w-auto items-center justify-end">
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

                            <select 
                                className="bg-[#0c0a09] border border-[#44403c] px-3 py-2 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none text-sm"
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                            >
                                <option value="all">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                            </select>

                            <button 
                                onClick={handleOpenModal}
                                className="flex items-center gap-2 bg-[#2c241b] text-[#d4af37] px-4 py-2 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 font-bold uppercase tracking-widest text-xs ml-2"
                            >
                                <Plus size={16} /> Create Assignment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Task List Table */}
                <div className="max-w-7xl w-full px-6 py-6">
                    <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0c0a09] text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                        <th className="p-4 font-bold">Title</th>
                                        <th className="p-4 font-bold">Type</th>
                                        <th className="p-4 font-bold">Section</th>
                                        <th className="p-4 font-bold">Difficulty</th>
                                        <th className="p-4 font-bold">Due Date</th>
                                        <th className="p-4 font-bold text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#44403c]">
                                    {filteredTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-[#0c0a09]/50 transition-colors bg-[#1c1917]">
                                            <td className="p-4 font-medium text-[#e7e5e4] flex items-center gap-3">
                                                <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c]">
                                                    {task.type === 'quiz' && <Scroll size={16} className="text-[#fbbf24]" />}
                                                    {task.type === 'coding' && <Brain size={16} className="text-[#2dd4bf]" />}
                                                    {task.type === 'debug' && <Bug size={16} className="text-[#a855f7]" />}
                                                </div>
                                                {task.title}
                                            </td>
                                            <td className="p-4 text-[#a8a29e] uppercase text-xs font-bold tracking-wider">
                                                {task.type}
                                                {task.type === 'quiz' && task.subtype && (
                                                    <span className="ml-2 opacity-60 text-[10px]">({task.subtype})</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-[#e7e5e4]">{task.section}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${ 
                                                    task.difficulty === 'hard' ? 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10' :
                                                    task.difficulty === 'medium' ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10' :
                                                    'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
                                                }`}>{task.difficulty}</span>
                                            </td>
                                            <td className="p-4 text-[#a8a29e] font-mono text-sm">{task.dueDateFormatted}</td>
                                            <td className="p-4 flex justify-center gap-3">
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
                                                    onClick={() => handleDeleteTask(task.id)} 
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
                                                {tasks.length === 0 ? "No active assignments found. Create one to begin." : "No assignments match your filters."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create/Edit Assignment Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <div className="relative w-full max-w-5xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#44403c] bg-[#0c0a09]">
                                <h3 className="text-2xl font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-3">
                                    <Scroll size={24} /> {editingTask ? "Edit Assignment" : "New Assignment"}
                                </h3>
                                <button 
                                    onClick={handleCloseModal}
                                    className="text-[#a8a29e] hover:text-[#ef4444] transition-colors p-2 hover:bg-[#292524] rounded border border-transparent hover:border-[#ef4444]/50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Timeline Stepper */}
                            <div className="w-full bg-[#292524] border-b border-[#44403c] p-4 flex justify-center items-center gap-4">
                                <StepIndicator step={1} currentStep={currentStep} label="Details" />
                                <div className={`h-0.5 w-16 transition-colors duration-500 ${currentStep >= 2 ? "bg-[#d4af37]" : "bg-[#44403c]"}`}></div>
                                <StepIndicator step={2} currentStep={currentStep} label="Configuration" />
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                                {currentStep === 1 ? (
                                    // Step 1: General Details
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Assignment Title</label>
                                                <input 
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                                    placeholder="Enter title..."
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Difficulty</label>
                                                <select 
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                                    value={formData.difficulty}
                                                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Section</label>
                                                <select 
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none"
                                                    value={formData.section}
                                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                                >
                                                    <option value="A">Section A</option>
                                                    <option value="B">Section B</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest">Due Date & Time</label>
                                                <input 
                                                    type="datetime-local"
                                                    className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none scheme-dark"
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-[#44403c]">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-4 block">Select Challenge Type</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <ChallengeTypeOption 
                                                    label="Quiz" 
                                                    icon={<Scroll size={24} />}
                                                    selected={formData.type === "quiz"}
                                                    onClick={() => setFormData({...formData, type: "quiz"})}
                                                />
                                                <ChallengeTypeOption 
                                                    label="Debug" 
                                                    icon={<Bug size={24} />}
                                                    selected={formData.type === "debug"}
                                                    onClick={() => setFormData({...formData, type: "debug"})}
                                                />
                                                <ChallengeTypeOption 
                                                    label="Coding" 
                                                    icon={<Brain size={24} />}
                                                    selected={formData.type === "coding"}
                                                    onClick={() => setFormData({...formData, type: "coding"})}
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleNextStep}
                                            disabled={!formData.type || !formData.title || !formData.dueDate}
                                            className="w-full bg-[#2c241b] text-[#d4af37] py-4 rounded font-bold uppercase tracking-widest border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next: Configure {formData.type || "Challenge"}
                                        </button>
                                    </div>
                                ) : (
                                    // Step 2: Specific Challenge Config
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-xl font-bold text-[#e7e5e4] uppercase tracking-wider">Configuring {challengeType}</h4>
                                            <button onClick={() => setCurrentStep(1)} className="text-[#a8a29e] hover:text-[#d4af37] text-sm underline uppercase tracking-wide">Back to Details</button>
                                        </div>
                                        
                                        <div className="border border-[#44403c] p-4 rounded bg-[#0c0a09]/50">
                                            {challengeType === "quiz" && <Quiz data={quizData} setData={setQuizData} readOnly={!!editingTask} />}
                                            {challengeType === "coding" && <Coding data={codingData} setData={setCodingData} />}
                                            {challengeType === "debug" && <Debug data={debugData} setData={setDebugData} />}
                                        </div>

                                        <button 
                                            onClick={handleSaveTask}
                                            className="w-full bg-[#d4af37] text-[#0c0a09] py-4 rounded font-bold uppercase tracking-widest hover:bg-[#fbbf24] transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                           <Save size={20} /> {editingTask ? "Update Assignment" : "Save & Publish Assignment"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW TASK MODAL */}
                {viewingTask && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
                        <div className="relative w-full max-w-4xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#44403c] bg-[#0c0a09]">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-3">
                                        {viewingTask.type === "quiz" && <Scroll size={24} />}
                                        {viewingTask.type === "coding" && <Brain size={24} />}
                                        {viewingTask.type === "debug" && <Bug size={24} />}
                                        {viewingTask.title}
                                    </h3>
                                    <p className="text-[#a8a29e] text-xs mt-1 uppercase tracking-wider">
                                        {viewingTask.type} • {viewingTask.section} • {viewingTask.difficulty} • Due: {viewingTask.dueDateFormatted}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setViewingTask(null)}
                                    className="text-[#a8a29e] hover:text-[#ef4444] transition-colors p-2 hover:bg-[#292524] rounded border border-transparent hover:border-[#ef4444]/50"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#1c1917]">
                                {/* Coding / Debug Instructions */}
                                {(viewingTask.type === "coding" || viewingTask.type === "debug") && (
                                    <div className="space-y-6">
                                        <div className="bg-[#0c0a09] p-6 rounded border border-[#292524]">
                                            <h4 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-4 border-b border-[#292524] pb-2">
                                                Instructions
                                            </h4>
                                            <p className="text-[#e7e5e4] whitespace-pre-wrap font-serif italic text-lg leading-relaxed">
                                                {viewingTask.instruction}
                                            </p>
                                        </div>
                                        
                                        {viewingTask.type === "debug" && viewingTask.code && (
                                            <div className="bg-[#0c0a09] p-2 rounded border border-[#292524]">
                                                <h4 className="text-[#a8a29e] font-bold uppercase tracking-widest text-xs mb-2 px-2">
                                                    Initial Code
                                                </h4>
                                                <Editor
                                                    height="300px"
                                                    defaultLanguage="javascript"
                                                    theme="vs-dark"
                                                    value={viewingTask.code}
                                                    options={{
                                                        readOnly: true,
                                                        fontSize: 14,
                                                        fontFamily: 'monospace',
                                                        minimap: { enabled: false },
                                                        scrollBeyondLastLine: false,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quiz Questions */}
                                {viewingTask.type === "quiz" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-[#2c241b] text-[#d4af37] px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border border-[#d4af37]/30">
                                                {viewingTask.subtype || "MCQ"}
                                            </span>
                                            <span className="text-[#57534e] text-xs uppercase tracking-wider font-bold">
                                                {viewingTask.questions?.length || 0} Questions
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {viewingTask.questions?.map((q, idx) => (
                                                <div key={idx} className="bg-[#0c0a09] p-6 rounded border border-[#292524] relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]/50"></div>
                                                    
                                                    <p className="font-bold text-[#e7e5e4] mb-4 flex gap-3 text-lg italic">
                                                        <span className="text-[#d4af37]">Q{idx + 1}.</span>
                                                        {q.text}
                                                    </p>

                                                    {/* MCQ Choices */}
                                                    {viewingTask.subtype === "mcq" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                                                            {q.choices?.map((choice, cIdx) => (
                                                                <div 
                                                                    key={cIdx}
                                                                    className={`px-4 py-3 rounded border text-sm flex items-center gap-3 ${ 
                                                                        cIdx === q.correctIndex 
                                                                        ? "bg-[#d4af37]/10 border-[#d4af37] text-[#d4af37] font-bold" 
                                                                        : "bg-[#1c1917] border-[#292524] text-[#a8a29e]" 
                                                                    }`}
                                                                >
                                                                    <span className="text-xs opacity-50">{String.fromCharCode(65 + cIdx)}.</span>
                                                                    {choice}
                                                                    {cIdx === q.correctIndex && <CheckCircle2 size={16} className="ml-auto" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* True/False Answer */}
                                                    {viewingTask.subtype === "tf" && (
                                                        <div className="ml-8 flex gap-4">
                                                            {["True", "False"].map((opt) => (
                                                                <div 
                                                                    key={opt}
                                                                    className={`px-6 py-2 rounded border text-sm font-bold uppercase tracking-wider ${ 
                                                                        q.correctAnswer === opt
                                                                        ? (opt === "True" ? "bg-[#2dd4bf]/10 border-[#2dd4bf] text-[#2dd4bf]" : "bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]")
                                                                        : "bg-[#1c1917] border-[#292524] text-[#57534e] opacity-50"
                                                                    }`}
                                                                >
                                                                    {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Enum Answers */}
                                                    {viewingTask.subtype === "enum" && (
                                                        <div className="ml-8 bg-[#1c1917] p-4 rounded border border-[#292524]">
                                                            <p className="text-[#a8a29e] text-xs font-bold uppercase tracking-widest mb-2">Accepted Answers:</p>
                                                            <ul className="list-disc list-inside text-[#e7e5e4] space-y-1">
                                                                {q.answers?.map((ans, aIdx) => (
                                                                    <li key={aIdx}>{ans}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Paragraph */}
                                                    {viewingTask.subtype === "paragraph" && (
                                                        <div className="ml-8">
                                                            <p className="text-[#57534e] text-sm italic border-l-2 border-[#292524] pl-4 py-2">
                                                                (Open-ended response expected)
                                                            </p>
                                                        </div>
                                                    )}
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
                {gradingTask && <GradingModal task={gradingTask} onClose={() => setGradingTask(null)} />}
            </div>
        </div>
    );
}

// Grading Modal Component
function GradingModal({ task, onClose }) {
    const { gradebookData, loading, updateGrade } = useGradebook(task.id, task.section);
    
    // key: studentId, value: { score, feedback }
    const [grades, setScores] = useState({});
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");

    // Initialize local state when data loads
    useEffect(() => {
        if (gradebookData && gradebookData.length > 0) {
            // Check if we need to initialize to avoid strict linter warning
            const needsInit = gradebookData.some(item => !grades[item.student.uid]);
            
            if (needsInit) {
                setScores(prev => {
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
            }
            
            // Set selected student only if none selected
            if (!selectedStudentId && gradebookData.length > 0) {
                 setSelectedStudentId(gradebookData[0].student.uid);
            }
        }
    }, [gradebookData]); // Removed selectedStudentId from deps to avoid loop, managed inside

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
            alert("Grade updated!");
        } else {
            alert("Failed to update grade.");
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        // Check if Firestore Timestamp (has toDate method)
        if (typeof date.toDate === 'function') {
            return date.toDate().toLocaleString();
        }
        // Check if string or standard Date
        return new Date(date).toLocaleString();
    };

    // Filter students based on search
    const filteredStudents = gradebookData.filter(item => {
        const fullName = `${item.student.firstName} ${item.student.lastName}`.toLowerCase();
        const email = item.student.email.toLowerCase();
        const query = studentSearchQuery.toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    const totalStudents = gradebookData.length;
    const submittedCount = gradebookData.filter(item => item.status !== 'missing').length;

    const selectedItem = gradebookData.find(item => item.student.uid === selectedStudentId);
    const selectedGrade = grades[selectedStudentId] || { score: 0, feedback: "" };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm">
            <div className="relative w-full max-w-7xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#44403c] bg-[#0c0a09]">
                    <div>
                        <h3 className="text-2xl font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-3">
                            <GraduationCap size={24} /> Gradebook: {task.title}
                        </h3>
                        <p className="text-[#a8a29e] text-xs mt-1 uppercase tracking-wider">
                            Section {task.section}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-[#a8a29e] hover:text-[#ef4444]"><X size={24} /></button>
                </div>

                {/* Body - Split View */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Student List */}
                    <div className="w-1/3 border-r border-[#44403c] bg-[#0c0a09] overflow-y-auto custom-scrollbar flex flex-col">
                        
                        {/* Search & Summary Header */}
                        <div className="p-4 border-b border-[#44403c] bg-[#0c0a09] sticky top-0 z-10 space-y-3">
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
                                {filteredStudents.map(item => (
                                    <div 
                                        key={item.student.uid}
                                        onClick={() => setSelectedStudentId(item.student.uid)}
                                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${selectedStudentId === item.student.uid ? "bg-[#292524] border-l-4 border-[#d4af37]" : "hover:bg-[#1c1917] border-l-4 border-transparent"}`}
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
                                ))}
                                {filteredStudents.length === 0 && <p className="p-8 text-center text-[#57534e] text-xs italic">No students match your search.</p>}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Grading Detail */}
                    <div className="w-2/3 bg-[#1c1917] flex flex-col overflow-hidden">
                        {selectedItem ? (
                            <>
                                {/* Student Header Info */}
                                <div className="p-6 border-b border-[#44403c] bg-[#1c1917] flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-bold text-[#e7e5e4]">{selectedItem.student.firstName} {selectedItem.student.lastName}</h4>
                                        <p className="text-[#a8a29e] text-xs">{selectedItem.student.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[#57534e] text-xs uppercase tracking-wider font-bold mb-1">Submitted</p>
                                        <p className="text-[#d4af37] font-mono text-sm">{formatDate(selectedItem.submittedAt)}</p>
                                    </div>
                                </div>

                                {/* Submission Content */}
                                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0c0a09]/50">
                                    {selectedItem.status === "missing" ? (
                                        <div className="h-full flex flex-col items-center justify-center text-[#57534e] italic opacity-50">
                                            <AlertCircle size={48} className="mb-4" />
                                            <p>No submission available.</p>
                                        </div>
                                    ) : (
                                        <SubmissionDetailView 
                                            submission={selectedItem} 
                                            task={task} 
                                        />
                                    )}
                                </div>

                                {/* Grading Footer */}
                                <div className="p-6 border-t border-[#44403c] bg-[#1c1917]">
                                    <div className="flex items-end gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-1 block">Feedback</label>
                                            <input 
                                                className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#e7e5e4] focus:border-[#d4af37] outline-none transition-colors placeholder-[#292524]"
                                                placeholder="Enter feedback for student..."
                                                value={selectedGrade.feedback}
                                                onChange={(e) => handleGradeChange(selectedStudentId, "feedback", e.target.value)}
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs font-bold text-[#a8a29e] uppercase tracking-widest mb-1 block">Score</label>
                                            <input 
                                                type="number"
                                                className="w-full bg-[#0c0a09] border border-[#44403c] p-3 rounded text-[#d4af37] font-bold text-center focus:border-[#d4af37] outline-none"
                                                value={selectedGrade.score}
                                                onChange={(e) => handleGradeChange(selectedStudentId, "score", e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => saveGrade(selectedStudentId, selectedItem.submissionId)}
                                            className="h-[46px] px-6 bg-[#2c241b] text-[#d4af37] font-bold uppercase tracking-widest rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all flex items-center gap-2"
                                        >
                                            <Save size={18} /> Update
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[#57534e]">
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
    let icon = <AlertCircle size={12} />;

    if (status === "submitted") {
        styles = "bg-[#172554] text-[#60a5fa] border-[#1e3a8a]"; // Blue
        icon = <CheckCircle2 size={12} />;
    } else if (status === "graded") {
        styles = "bg-[#052e16] text-[#4ade80] border-[#14532d]"; // Green
        icon = <CheckCircle size={12} />;
    } else if (status === "missing") {
        styles = "bg-[#450a0a] text-[#f87171] border-[#7f1d1d]"; // Red
        icon = <X size={12} />;
    }

    return (
        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles} w-fit`}>
            {icon} {status}
        </span>
    );
}

function StepIndicator({ step, currentStep, label }) {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;

    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${ 
                isActive ? "bg-[#d4af37] border-[#d4af37] text-[#0c0a09]" :
                isCompleted ? "bg-[#2c241b] border-[#d4af37] text-[#d4af37]" :
                "bg-[#0c0a09] border-[#44403c] text-[#57534e]"
            }`}>
                {isCompleted ? <CheckCircle2 size={16} /> : step}
            </div>
            <span className={`uppercase text-xs font-bold tracking-wider ${ 
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
            className={`cursor-pointer flex items-center justify-center gap-3 p-6 rounded border-2 transition-all duration-300 ${ 
                selected 
                ? "bg-[#2c241b] border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                : "bg-[#0c0a09] border-[#292524] text-[#57534e] hover:border-[#57534e] hover:text-[#a8a29e]"
            }`}
        >
            {icon}
            <span className="font-bold uppercase tracking-wider">{label}</span>
        </div>
    )
}