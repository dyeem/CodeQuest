import { useEffect, useState, Fragment } from 'react';
import bg from "../assets/SMbg.png";
import { Search, Funnel, User, X, Scroll, Sword, Shield, Skull, Star, Trophy, Target, Zap, ChevronLeft, Boxes, Trash2, Eye, Activity, ExternalLink } from 'lucide-react';
import studentImg from "../assets/student.png"; // Fallback image
import { Dialog, Transition } from '@headlessui/react';
import battlemode from '../assets/battlemode.png';
import adventuremode from '../assets/adventuremode.png';
import debugmode from "../assets/debugmode.png";
import sandboxmode from "../assets/sandboxmode.png";
import algotower from "../assets/themes/algotower.png";
import syntaxvalley from "../assets/themes/syntaxvalley.png";
import loopcanyon from "../assets/themes/loopcanyon.png";
import jslab from "../assets/themes/jslab.png";
import debuggingdungeon from "../assets/themes/debuggingdungeon.png";

import { db } from "../config/firebase.config";
import { collection, onSnapshot, doc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import Loader from "../Components/Loader";
import { useNavigate } from 'react-router-dom';

export default function StudentManagement() {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = "Student List | CodeQuest";
  }, []);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  
  // Modal States
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedStudentForStats, setSelectedStudentForStats] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [selectedStudentForSubmissions, setSelectedStudentForSubmissions] = useState(null);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  useEffect(() => {
    const usersCollection = collection(db, "users");
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        const fetchedStudents = snapshot.docs.map(doc => {
            const data = doc.data();
            
            // Progression is structured by mode (adventure, debugMode, etc.)
            const adv = data.progression?.adventure || {};
            
            const totalLevels = 
                (adv.arithmeticTower?.highestLevelUnlocked || 0) + 
                (adv.syntaxValley?.highestLevelUnlocked || 0) + 
                (adv.loopCanyon?.highestLevelUnlocked || 0) + 
                (adv.jsLab?.highestLevelUnlocked || 0) +
                (adv.debuggingDungeon?.highestLevelUnlocked || 0);
            
            const progress = Math.min(100, Math.round((totalLevels / 500) * 100));

            return {
                id: doc.id,
                ...data,
                name: data.displayName || `${data.firstName} ${data.lastName}`,
                class: data.section ? `Class ${data.section}` : "Unassigned",
                progress: progress || 0,
                avatarUrl: data.avatarUrl || studentImg
            };
        });
        setStudents(fetchedStudents);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching students:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const classes = ["All", ...new Set(students.map((s) => s.class))];

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // --- STATS ACTIONS ---
  const handleOpenStats = (student) => {
    setSelectedStudentForStats(student);
    setIsStatsModalOpen(true);
    setSelectedTheme(null);
  };

  const handleCloseStats = () => {
    setIsStatsModalOpen(false);
    setSelectedStudentForStats(null);
    setSelectedTheme(null);
  };

  // --- SUBMISSION ACTIONS ---
  const handleOpenSubmissions = async (student) => {
    setSelectedStudentForSubmissions(student);
    setIsSubmissionsModalOpen(true);
    setSubmissionsLoading(true);
    try {
        const q = query(collection(db, "submissions"), where("studentId", "==", student.id));
        const querySnapshot = await getDocs(q);
        const fetchedSubmissions = [];
        
        querySnapshot.forEach((doc) => {
            fetchedSubmissions.push({ id: doc.id, ...doc.data() });
        });
        
        setStudentSubmissions(fetchedSubmissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
    } finally {
        setSubmissionsLoading(false);
    }
  };

  const handleCloseSubmissions = () => {
    setIsSubmissionsModalOpen(false);
    setSelectedStudentForSubmissions(null);
    setStudentSubmissions([]);
  };

  const handleViewSubmissionDetail = (submission) => {
      // Redirect to Assignments page, passing the taskId and studentId to open the grading modal
      // We assume the route is '/assignments' or whatever is defined in routes.jsx. 
      // Based on previous file names, likely '/assignments' or '/assignments-challenges'.
      // I'll use the file name hint 'AssignmentandChallenges' -> likely route '/assignments' (standard naming) 
      // or literally '/AssignmentandChallenges'.
      // I'll use '/assignments' as a safe bet, or check routes.jsx if I could.
      // Let's assume '/assignments' based on typical conventions, or I can check routes.jsx.
      navigate('/assignment-and-challenges', { 
          state: { 
              openGradingForTask: submission.taskId,
              preSelectedStudentId: selectedStudentForSubmissions.id 
          } 
      });
  };

  // --- REMOVE ACTION ---
  const handleRemoveStudent = async (studentId) => {
    if (confirm("Are you sure you want to remove this student? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "users", studentId));
            // Also optional: delete their submissions?
        } catch (error) {
            console.error("Error deleting student:", error);
            alert("Failed to delete student.");
        }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="font-serif min-h-full w-full flex flex-col items-center bg-[#1c1917] text-[#e7e5e4] relative">
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
            <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-12 px-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-5xl font-bold tracking-[0.15em] uppercase text-[#d4af37] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]" style={{ textShadow: "3px 3px 0px #000" }}>
                        Student Management
                    </h1>
                    <p className="text-lg font-medium text-[#a8a29e] tracking-wide mt-2 italic">
                        Monitor progress, view work, and manage enrollment
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full px-6 py-10">
                <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg mb-8">
                    <div className="bg-[#1c1917] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center bg-[#0c0a09] border border-[#44403c] rounded px-4 py-2 w-full md:w-auto">
                            <Funnel className="text-[#d4af37] mr-3" size={18} />
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="bg-transparent focus:outline-none text-[#e7e5e4] font-semibold w-full cursor-pointer uppercase tracking-wider text-sm"
                            >
                                {classes.map((cls) => (
                                    <option key={cls} value={cls} className="bg-[#1c1917]">{cls}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center bg-[#0c0a09] border border-[#44403c] rounded px-4 py-2 w-full md:w-96 focus-within:border-[#d4af37] transition-colors">
                            <input
                                type="search"
                                placeholder="Search by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent text-[#e7e5e4] font-medium placeholder-[#57534e] focus:outline-none w-full"
                            />
                            <Search className="text-[#d4af37] ml-2" size={18} />
                        </div>
                    </div>
                </div>

                {/* --- LIST VIEW TABLE --- */}
                <div className="bg-[#292524] p-1 rounded-sm border border-[#44403c] shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0c0a09]">
                                <tr className="text-[#d4af37] uppercase text-sm tracking-widest border-b border-[#44403c]">
                                    <th className="p-4 font-bold">Student</th>
                                    <th className="p-4 font-bold">Class</th>
                                    <th className="p-4 font-bold">Progress</th>
                                    <th className="p-4 font-bold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#44403c] bg-[#1c1917]">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-[#0c0a09]/50 transition-colors">
                                        <td className="p-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full border border-[#44403c] p-0.5 bg-[#0c0a09]">
                                                <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-[#e7e5e4] flex items-center gap-2">
                                                    {student.name}
                                                    <span className="text-[9px] bg-[#d4af37] text-[#0c0a09] px-1.5 py-0.5 rounded font-black">
                                                        L{Math.floor((student.stats?.currentXP || 0) / 1000) + 1}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-[#a8a29e]">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#a8a29e] font-mono text-sm uppercase tracking-wide">
                                            {student.class}
                                        </td>
                                        <td className="p-4 w-1/4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-full h-2 bg-[#0c0a09] rounded-full overflow-hidden border border-[#44403c]">
                                                    <div
                                                        className="h-full bg-[#d4af37]"
                                                        style={{ width: `${student.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-[#d4af37]">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenStats(student)}
                                                    className="p-2 bg-[#0c0a09] border border-[#44403c] rounded text-[#a8a29e] hover:text-[#d4af37] hover:border-[#d4af37] transition-all"
                                                    title="View Stats"
                                                >
                                                    <Activity size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenSubmissions(student)}
                                                    className="p-2 bg-[#0c0a09] border border-[#44403c] rounded text-[#a8a29e] hover:text-[#3b82f6] hover:border-[#3b82f6] transition-all"
                                                    title="View Submitted Work"
                                                >
                                                    <Scroll size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveStudent(student.id)}
                                                    className="p-2 bg-[#0c0a09] border border-[#44403c] rounded text-[#a8a29e] hover:text-[#ef4444] hover:border-[#ef4444] transition-all"
                                                    title="Remove Student"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-[#57534e] italic">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

      {/* --- STATS MODAL --- */}
      <Transition appear show={isStatsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseStats}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center font-serif">
              <Transition.Child as={Fragment} enter="ease-out duration-500" enterFrom="opacity-0 scale-95 translate-y-10" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-300" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-10">
                <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-sm bg-[#1c1917] p-1 text-left align-middle shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all border border-[#44403c] relative">
                    <button onClick={handleCloseStats} className="absolute top-4 right-4 z-20 text-[#a8a29e] hover:text-[#ef4444] transition-colors p-1 bg-[#0c0a09] rounded border border-[#44403c] hover:border-[#ef4444]">
                        <X size={20} />
                    </button>

                    <div className="bg-[#1c1917] border border-[#292524] p-6 md:p-10 relative min-h-[600px]">
                        {selectedTheme ? (
                            <div className="animate-fade-in">
                                <button onClick={() => setSelectedTheme(null)} className="flex items-center gap-2 text-[#d4af37] hover:text-[#fbbf24] mb-6 transition-colors uppercase tracking-widest text-sm">
                                    <ChevronLeft size={16} /> Back to Overview
                                </button>
                                
                                <div className="flex items-center gap-4 mb-8 border-b border-[#44403c] pb-4">
                                    <div className="p-3 bg-[#0c0a09] rounded border border-[#44403c]">
                                        <Trophy size={32} className="text-[#fbbf24]" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-[#e7e5e4] uppercase tracking-widest">{selectedTheme.title}</h3>
                                        <p className="text-[#a8a29e] text-sm">Detailed Level Analysis • {selectedTheme.completed.length} Completed</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar p-2">
                                    {selectedTheme.levels.map((level) => {
                                        const stars = selectedTheme.stars[level] || 0;
                                        const isCompleted = selectedTheme.completed.includes(Number(level)) || selectedTheme.completed.includes(String(level));
                                        
                                        return (
                                            <div key={level} className={`aspect-square p-1 rounded border flex flex-col items-center justify-center gap-0.5 transition-all ${isCompleted ? "bg-[#0c0a09] border-[#d4af37]/50 shadow-[0_0_5px_rgba(212,175,55,0.1)]" : "bg-[#292524]/50 border-[#44403c] opacity-40 grayscale"}`}>
                                                <span className={`text-sm font-bold ${isCompleted ? "text-[#e7e5e4]" : "text-[#57534e]"}`}>{level}</span>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3].map(s => (
                                                        <Star key={s} size={6} className={`${s <= stars ? "fill-[#fbbf24] text-[#fbbf24]" : "fill-transparent text-[#44403c]"}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b border-[#44403c]">
                                    <div className="w-28 h-28 p-1 bg-[#0c0a09] rounded-full border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                        <img src={selectedStudentForStats?.avatarUrl} alt={selectedStudentForStats?.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
                                    <h3 className="text-4xl font-bold text-[#d4af37] tracking-widest uppercase drop-shadow-md">
                                        {selectedStudentForStats?.name}
                                    </h3>
                                    <span className="bg-[#d4af37] text-[#0c0a09] px-3 py-0.5 rounded-sm font-black text-sm uppercase tracking-tighter">
                                        Lvl {Math.floor((selectedStudentForStats?.stats?.currentXP || 0) / 1000) + 1}
                                    </span>
                                </div>
                                <p className="text-[#a8a29e] uppercase tracking-[0.2em] text-sm mb-4">
                                    {selectedStudentForStats?.class} • Guild Member
                                </p>
                                
                                <div className="flex flex-col gap-3 max-w-md mx-auto md:mx-0">
                                    {/* Mastery Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-[#a8a29e] uppercase tracking-widest">
                                            <span>Mastery</span>
                                            <span>{selectedStudentForStats?.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[#0c0a09] rounded-full overflow-hidden border border-[#44403c]">
                                            <div
                                                className="h-full bg-[#e7e5e4] rounded-full transition-all duration-1000"
                                                style={{ width: `${selectedStudentForStats?.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* XP Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold text-[#2dd4bf] uppercase tracking-widest">
                                            <span>Essence (XP)</span>
                                            <span>{(selectedStudentForStats?.stats?.currentXP || 0) % 1000} / 1000</span>
                                        </div>
                                        <div className="w-full h-3 bg-[#0c0a09] rounded-sm overflow-hidden border border-[#292524] relative shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#0d9488] to-[#2dd4bf] transition-all duration-1000 relative"
                                                style={{ width: `${((selectedStudentForStats?.stats?.currentXP || 0) % 1000) / 10}%` }}
                                            >
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/glass-knobs.png')] opacity-20"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center bg-[#0c0a09] p-4 rounded border border-[#44403c] min-w-[150px] shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-xs text-[#a8a29e] uppercase tracking-widest block mb-1">Total XP</span>
                                <span className='text-3xl font-bold text-[#d4af37] drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]'>
                                    {selectedStudentForStats?.stats?.currentXP || 0}
                                </span>
                            </div>
                        </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative group overflow-hidden rounded border border-[#44403c] col-span-1 md:col-span-3">
                                        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${adventuremode})` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a09] via-[#0c0a09]/95 to-[#0c0a09]/60"></div>
                                        <div className="relative z-10 p-6">
                                            <div className="flex items-center gap-3 text-[#22c55e] mb-6">
                                                <Shield size={24} />
                                                <h4 className="font-bold uppercase tracking-[0.2em] text-lg">Adventure Mode Progress</h4>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                <ThemeStat 
                                                    label="Arithmetic Tower" 
                                                    image={algotower}
                                                    level={selectedStudentForStats?.progression?.adventure?.arithmeticTower?.highestLevelUnlocked || 0} 
                                                    stars={selectedStudentForStats?.progression?.adventure?.arithmeticTower?.stars} 
                                                    onClick={() => setSelectedTheme({ 
                                                        title: "Arithmetic Tower", 
                                                        levels: Array.from({length: 100}, (_, i) => i + 1), 
                                                        stars: selectedStudentForStats?.progression?.adventure?.arithmeticTower?.stars || {}, 
                                                        completed: selectedStudentForStats?.progression?.adventure?.arithmeticTower?.completedLevels || [] 
                                                    })} 
                                                />
                                                <ThemeStat 
                                                    label="Syntax Valley" 
                                                    image={syntaxvalley}
                                                    level={selectedStudentForStats?.progression?.adventure?.syntaxValley?.highestLevelUnlocked || 0} 
                                                    stars={selectedStudentForStats?.progression?.adventure?.syntaxValley?.stars} 
                                                    onClick={() => setSelectedTheme({ 
                                                        title: "Syntax Valley", 
                                                        levels: Array.from({length: 100}, (_, i) => i + 1), 
                                                        stars: selectedStudentForStats?.progression?.adventure?.syntaxValley?.stars || {}, 
                                                        completed: selectedStudentForStats?.progression?.adventure?.syntaxValley?.completedLevels || [] 
                                                    })} 
                                                />
                                                <ThemeStat 
                                                    label="Loop Canyon" 
                                                    image={loopcanyon}
                                                    level={selectedStudentForStats?.progression?.adventure?.loopCanyon?.highestLevelUnlocked || 0} 
                                                    stars={selectedStudentForStats?.progression?.adventure?.loopCanyon?.stars} 
                                                    onClick={() => setSelectedTheme({ 
                                                        title: "Loop Canyon", 
                                                        levels: Array.from({length: 100}, (_, i) => i + 1), 
                                                        stars: selectedStudentForStats?.progression?.adventure?.loopCanyon?.stars || {}, 
                                                        completed: selectedStudentForStats?.progression?.adventure?.loopCanyon?.completedLevels || [] 
                                                    })} 
                                                />
                                                <ThemeStat 
                                                    label="JS Lab" 
                                                    image={jslab}
                                                    level={selectedStudentForStats?.progression?.adventure?.jsLab?.highestLevelUnlocked || 0} 
                                                    stars={selectedStudentForStats?.progression?.adventure?.jsLab?.stars} 
                                                    onClick={() => setSelectedTheme({ 
                                                        title: "JS Lab", 
                                                        levels: Array.from({length: 100}, (_, i) => i + 1), 
                                                        stars: selectedStudentForStats?.progression?.adventure?.jsLab?.stars || {}, 
                                                        completed: selectedStudentForStats?.progression?.adventure?.jsLab?.completedLevels || [] 
                                                    })} 
                                                />
                                                <ThemeStat 
                                                    label="Debugging Dungeon" 
                                                    image={debuggingdungeon}
                                                    level={selectedStudentForStats?.progression?.adventure?.debuggingDungeon?.highestLevelUnlocked || 0} 
                                                    stars={selectedStudentForStats?.progression?.adventure?.debuggingDungeon?.stars} 
                                                    onClick={() => setSelectedTheme({ 
                                                        title: "Debugging Dungeon", 
                                                        levels: Array.from({length: 100}, (_, i) => i + 1), 
                                                        stars: selectedStudentForStats?.progression?.adventure?.debuggingDungeon?.stars || {}, 
                                                        completed: selectedStudentForStats?.progression?.adventure?.debuggingDungeon?.completedLevels || [] 
                                                    })} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden rounded border border-[#44403c] h-48">
                                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${battlemode})` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent"></div>
                                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                            <div className="flex items-center gap-2 text-[#ef4444]"><Sword size={20} /><h4 className="font-bold uppercase tracking-widest text-sm">Battle Mode</h4></div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center border-b border-[#44403c]/50 pb-2"><span className="text-[#a8a29e] text-xs uppercase">Rank Tier</span><span className="text-[#e7e5e4] font-bold">{selectedStudentForStats?.battleStats?.rankTier || "Unranked"}</span></div>
                                                <div className="flex justify-between items-center border-b border-[#44403c]/50 pb-2"><span className="text-[#a8a29e] text-xs uppercase">MMR</span><span className="text-[#d4af37] font-bold">{selectedStudentForStats?.battleStats?.mmr || 1000}</span></div>
                                                <div className="flex justify-between text-xs pt-1"><span className="text-green-500">W: {selectedStudentForStats?.battleStats?.wins || 0}</span><span className="text-red-500">L: {selectedStudentForStats?.battleStats?.losses || 0}</span><span className="text-[#a8a29e]">Total: {selectedStudentForStats?.battleStats?.totalMatches || 0}</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden rounded border border-[#44403c] h-48">
                                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${debugmode})` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent"></div>
                                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                            <div className="flex items-center gap-2 text-[#3b82f6]"><Skull size={20} /><h4 className="font-bold uppercase tracking-widest text-sm">Debug Mode</h4></div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-end">
                                                    <div><p className="text-3xl font-bold text-[#e7e5e4]">{selectedStudentForStats?.progression?.debugMode?.highestLevelUnlocked || 0}</p><p className="text-[10px] text-[#a8a29e] uppercase">Lvl Reach</p></div>
                                                    <div className="text-right"><p className="text-xl font-bold text-[#d4af37]">{selectedStudentForStats?.progression?.debugMode?.highScore || 0}</p><p className="text-[10px] text-[#a8a29e] uppercase">High Score</p></div>
                                                </div>
                                                <div onClick={() => setSelectedTheme({ title: "Debug Mode", levels: Array.from({length: 100}, (_, i) => i + 1), stars: selectedStudentForStats?.progression?.debugMode?.stars || {}, completed: selectedStudentForStats?.progression?.debugMode?.completedLevels || [] })} className="flex items-center justify-center gap-2 bg-[#0c0a09]/50 p-2 rounded border border-[#44403c]/50 cursor-pointer hover:border-[#d4af37] transition-colors"><Star size={14} className="text-[#fbbf24] fill-current" /><span className="text-xs text-[#e7e5e4]">{Object.values(selectedStudentForStats?.progression?.debugMode?.stars || {}).reduce((a,b)=>a+b, 0)} Total Stars</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative group overflow-hidden rounded border border-[#44403c] h-48">
                                        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${sandboxmode})` }}></div>
                                        <div className="absolute inset-0 bg-[#0c0a09] opacity-40"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent"></div>
                                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                                            <div className="flex items-center gap-2 text-[#fbbf24]"><Boxes size={20} /><h4 className="font-bold uppercase tracking-widest text-sm">Sandbox Mode</h4></div>
                                            <div className="flex flex-col gap-2">
                                                <span className="text-xs text-[#a8a29e] uppercase tracking-widest block border-b border-[#44403c]/50 pb-2">Total Creation Time</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-bold text-[#e7e5e4]">{selectedStudentForStats?.stats?.totalSandboxTime || 0}</span>
                                                    <span className="text-sm text-[#a8a29e] uppercase font-medium">Minutes</span>
                                                </div>
                                                <p className="text-[10px] text-[#57534e] italic mt-1"></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* --- SUBMISSIONS MODAL --- */}
      <Transition appear show={isSubmissionsModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseSubmissions}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center font-serif">
              <Transition.Child as={Fragment} enter="ease-out duration-500" enterFrom="opacity-0 scale-95 translate-y-10" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-300" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-10">
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-sm bg-[#1c1917] p-1 text-left align-middle shadow-[0_0_50px_rgba(212,175,55,0.15)] transition-all border border-[#44403c] relative">
                    <button onClick={handleCloseSubmissions} className="absolute top-4 right-4 z-20 text-[#a8a29e] hover:text-[#ef4444] transition-colors p-1 bg-[#0c0a09] rounded border border-[#44403c] hover:border-[#ef4444]">
                        <X size={20} />
                    </button>

                    <div className="bg-[#1c1917] border border-[#292524] p-8 min-h-[500px] flex flex-col">
                        <div className="flex items-center gap-4 mb-8 border-b border-[#44403c] pb-4">
                            <div className="w-16 h-16 rounded-full border border-[#44403c] p-0.5 bg-[#0c0a09]">
                                <img src={selectedStudentForSubmissions?.avatarUrl} alt={selectedStudentForSubmissions?.name} className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-[#e7e5e4] uppercase tracking-widest">{selectedStudentForSubmissions?.name}</h3>
                                <p className="text-[#a8a29e] tracking-wide">Submitted Work History</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {submissionsLoading ? (
                                <div className="h-full flex items-center justify-center"><Loader /></div>
                            ) : (
                                <div className="space-y-3">
                                    {studentSubmissions.map((sub) => (
                                        <div 
                                            key={sub.id} 
                                            onClick={() => handleViewSubmissionDetail(sub)}
                                            className="bg-[#0c0a09] p-4 rounded border border-[#292524] flex items-center justify-between hover:border-[#d4af37] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded border transition-colors ${
                                                    sub.status === 'graded' ? 'bg-[#052e16] border-[#14532d] text-[#4ade80]' : 'bg-[#172554] border-[#1e3a8a] text-[#60a5fa]'
                                                }`}>
                                                    <Scroll size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-[#e7e5e4] font-bold text-lg group-hover:text-[#d4af37] transition-colors">{sub.taskTitle || "Untitled Task"}</h4>
                                                    <div className="flex gap-3 text-xs text-[#a8a29e] uppercase font-medium">
                                                        <span>{sub.taskType || "Assignment"}</span>
                                                        <span>•</span>
                                                        <span>{sub.submittedAt ? new Date(sub.submittedAt.toDate()).toLocaleString() : "Unknown Date"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold uppercase tracking-widest mb-1 ${
                                                        sub.status === 'graded' ? 'text-[#4ade80]' : 'text-[#fbbf24]'
                                                    }`}>
                                                        {sub.status}
                                                    </div>
                                                    {sub.status === 'graded' && (
                                                        <div className="text-2xl font-bold text-[#d4af37]">
                                                            {sub.score} <span className="text-sm text-[#57534e]">/ 100</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <ExternalLink size={16} className="text-[#57534e] group-hover:text-[#d4af37] transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                    {studentSubmissions.length === 0 && (
                                        <div className="text-center py-12 text-[#57534e] italic">
                                            No submissions found for this student.
                                        </div>
                                    )}
                                </div>
                            )}
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

function ThemeStat({ label, level, stars, onClick, image }) {
    const totalStars = Object.values(stars || {}).reduce((a,b)=>a+b, 0);
    return (
        <div 
            onClick={onClick}
            className="relative bg-[#0c0a09] p-3 rounded border border-[#44403c] flex flex-col gap-1 cursor-pointer hover:border-[#d4af37] transition-all group overflow-hidden h-28 justify-between shadow-lg"
        >
            {/* Background Image */}
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-40" style={{ backgroundImage: `url(${image})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/70 to-transparent"></div>

            <div className="relative z-10">
                <p className="text-[#e7e5e4] text-[10px] font-bold uppercase tracking-widest mb-1 truncate drop-shadow-md">{label}</p>
            </div>
            
            <div className="relative z-10 flex justify-between items-end border-t border-[#ffffff]/10 pt-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-bold text-[#d4af37] leading-none drop-shadow-md">{level}</span>
                    <span className="text-[8px] text-[#a8a29e] uppercase font-bold tracking-wider">Level</span>
                </div>
                <div className="flex items-center gap-1 text-[#fbbf24] bg-[#000]/40 px-2 py-1 rounded backdrop-blur-sm border border-[#ffffff]/10">
                    <Star size={10} className="fill-current" />
                    <span className="text-xs font-bold text-[#e7e5e4]">{totalStars}</span>
                </div>
            </div>
        </div>
    )
}