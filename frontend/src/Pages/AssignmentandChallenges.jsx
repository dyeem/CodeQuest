import { useEffect, useState } from "react";
import bg from "../assets/assignmentandchallenges.png";
import Coding from "../Components/Challenge/Coding";
import Quiz from "../Components/Challenge/Quiz";
import Debug from "../Components/Challenge/Debug";
import { Scroll, Sword, Brain, Bug, X, Plus, Calendar, Users, BarChart, CheckCircle2, Circle } from "lucide-react";
import { db } from "../config/firebase.config";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import Loader from "../Components/Loader";

export default function AssignmentandChallenges() {
    useEffect(() => {
        document.title = "Assignments & Challenges | CodeQuest";
    }, []);

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [challengeType, setChallengeType] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        title: "",
        difficulty: "easy",
        section: "A",
        dueDate: "",
        type: ""
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

    const handleOpenModal = () => {
        setFormData({ title: "", difficulty: "easy", section: "A", dueDate: "", type: "" });
        setChallengeType("");
        setCurrentStep(1);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleNextStep = () => {
        if (!formData.title || !formData.type || !formData.dueDate) return alert("Please fill in all fields");
        setChallengeType(formData.type);
        setCurrentStep(2);
    };

    const handleCreateTask = async () => {
        try {
            await addDoc(collection(db, "task"), {
                ...formData,
                createdAt: new Date().toISOString(),
                createdBy: "Admin" 
            });
            handleCloseModal();
        } catch (error) {
            console.error("Error creating task:", error);
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
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold tracking-[0.15em] uppercase text-[#d4af37]">
                                Assignments & Challenges
                            </h1>
                            <p className="text-[#a8a29e] mt-2 tracking-wide">Manage trials for your disciples</p>
                        </div>
                        <button 
                            onClick={handleOpenModal}
                            className="flex items-center gap-2 bg-[#2c241b] text-[#d4af37] px-6 py-3 rounded border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-[#1c1917] transition-all duration-300 font-bold uppercase tracking-widest"
                        >
                            <Plus size={20} /> Create Assignment
                        </button>
                    </div>
                </div>

                {/* Task List Table */}
                <div className="max-w-7xl w-full px-6 py-10">
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#44403c]">
                                    {tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-[#0c0a09]/50 transition-colors bg-[#1c1917]">
                                            <td className="p-4 font-medium text-[#e7e5e4] flex items-center gap-3">
                                                <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c]">
                                                    {task.type === 'quiz' && <Scroll size={16} className="text-[#fbbf24]" />}
                                                    {task.type === 'coding' && <Brain size={16} className="text-[#2dd4bf]" />}
                                                    {task.type === 'debug' && <Bug size={16} className="text-[#a855f7]" />}
                                                </div>
                                                {task.title}
                                            </td>
                                            <td className="p-4 text-[#a8a29e] uppercase text-xs font-bold tracking-wider">{task.type}</td>
                                            <td className="p-4 text-[#e7e5e4]">{task.section}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                                    task.difficulty === 'hard' ? 'text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/10' :
                                                    task.difficulty === 'medium' ? 'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10' :
                                                    'text-[#22c55e] border-[#22c55e]/30 bg-[#22c55e]/10'
                                                }`}>
                                                    {task.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[#a8a29e] font-mono text-sm">{task.dueDateFormatted}</td>
                                        </tr>
                                    ))}
                                    {tasks.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-[#57534e] italic">
                                                No active assignments found. Create one to begin.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Create Assignment Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                        <div className="relative w-full max-w-5xl bg-[#1c1917] rounded-sm border-2 border-[#44403c] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-[#44403c] bg-[#0c0a09]">
                                <h3 className="text-2xl font-bold text-[#d4af37] uppercase tracking-widest flex items-center gap-3">
                                    <Scroll size={24} /> New Assignment
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
                                            {challengeType === "quiz" && <Quiz/>}
                                            {challengeType === "coding" && <Coding/>}
                                            {challengeType === "debug" && <Debug/>}
                                        </div>

                                        <button 
                                            onClick={handleCreateTask}
                                            className="w-full bg-[#d4af37] text-[#0c0a09] py-4 rounded font-bold uppercase tracking-widest hover:bg-[#fbbf24] transition-all shadow-lg"
                                        >
                                            Save & Publish Assignment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
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