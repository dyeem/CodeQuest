import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Target, BookCheck, Star, ScrollText, FileText, MessageSquare, Eye, Calendar, ArrowRight } from "lucide-react";
import bg from "../assets/dashboardbg.png"; 

import CountUp from "../Components/animation/CountUp";
import Loader from "../Components/Loader";

// charts
import BarGraph from "../Components/Charts/BarGraph";
import AreaChart from "../Components/Charts/AreaChart";
import PieChart from "../Components/Charts/PieGraph";
import LineChart from "../Components/Charts/LineChart";

// auth hook
import useCurrentAdmin from "../hooks/auth";

// firebase
import { db } from "../config/firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
    const { admin, loading } = useCurrentAdmin();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        avgMastery: 0,
        totalAssignments: 0, 
        totalStars: 0
    });
    const [chartData, setChartData] = useState({
        line: { xAxis: [], series: [] },
        pie: [],
        bar: { labels: [], values: [] },
        area: { labels: [], values: [] }
    });
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        document.title = "Dashboard | CodeQuest";
    }, []);

    useEffect(() => {
        if (!loading && !admin) {
            navigate("/auth/login");
        }
    }, [admin, loading, navigate]);

    // Real-time listener for collections
    useEffect(() => {
        if (!loading && admin) {
            const usersCollection = collection(db, "users");
            const adminsCollection = collection(db, "admins");
            const tasksCollection = collection(db, "task");
            const feedbackCollection = collection(db, "feedback");

            // Listener for Teachers
            const unsubscribeAdmins = onSnapshot(adminsCollection, (snapshot) => {
                const teacherCount = snapshot.docs.filter(doc => doc.data().role !== 'admin').length;
                setStats(prev => ({ ...prev, totalTeachers: teacherCount }));
            });

            // Listener for Assignments
            const unsubscribeTasks = onSnapshot(tasksCollection, (snapshot) => {
                setStats(prev => ({ ...prev, totalAssignments: snapshot.size }));
            });

            // Listener for Feedback
            const unsubscribeFeedback = onSnapshot(feedbackCollection, (snapshot) => {
                const feedback = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0)).slice(0, 5);
                setRecentFeedback(feedback);
            });
            
            const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
                const students = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setStudentsData(students);

                if (students.length === 0) {
                    setDataLoading(false);
                    return;
                }

                // 2. Calculate Dashboard Stats
                const totalStudents = students.length;
                const totalXP = students.reduce((acc, s) => acc + (s.stats?.currentXP || 0), 0);
                
                // Calculate Total Stars across all themes
                const totalStars = students.reduce((acc, s) => {
                    const adv = s.progression?.adventure || {};
                    let studentStars = 0;
                    ['arithmeticTower', 'syntaxValley', 'loopCanyon', 'jsLab', 'debuggingDungeon'].forEach(theme => {
                        const themeStars = adv[theme]?.stars || {};
                        studentStars += Object.values(themeStars).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
                    });
                    return acc + studentStars;
                }, 0);
                
                // Calculate Average Mastery across all 5 modules
                const avgMastery = Math.round(students.reduce((acc, s) => {
                    const p = s.progression || {};
                    const adv = p.adventure || {};
                    const totalLevels = 
                        (adv.arithmeticTower?.highestLevelUnlocked || 0) + 
                        (adv.syntaxValley?.highestLevelUnlocked || 0) + 
                        (adv.loopCanyon?.highestLevelUnlocked || 0) + 
                        (adv.jsLab?.highestLevelUnlocked || 0) +
                        (adv.debuggingDungeon?.highestLevelUnlocked || 0);
                    // Assuming ~500 total levels across all themes
                    return acc + (totalLevels / 500) * 100;
                }, 0) / totalStudents) || 0;

                setStats(prev => ({
                    ...prev,
                    totalStudents,
                    avgMastery,
                    totalStars
                }));

                // 3. Prepare Chart Data
                
                // Bar Graph: Average Mastery per Module
                const modules = ['Arithmetic', 'Syntax', 'Loop Canyon', 'JS Lab', 'Debugging'];
                const avgLevels = [
                    students.reduce((acc, s) => acc + (s.progression?.adventure?.arithmeticTower?.highestLevelUnlocked || 0), 0) / totalStudents,
                    students.reduce((acc, s) => acc + (s.progression?.adventure?.syntaxValley?.highestLevelUnlocked || 0), 0) / totalStudents,
                    students.reduce((acc, s) => acc + (s.progression?.adventure?.loopCanyon?.highestLevelUnlocked || 0), 0) / totalStudents,
                    students.reduce((acc, s) => acc + (s.progression?.adventure?.jsLab?.highestLevelUnlocked || 0), 0) / totalStudents,
                    students.reduce((acc, s) => acc + (s.progression?.adventure?.debuggingDungeon?.highestLevelUnlocked || 0), 0) / totalStudents,
                ];

                // Pie Chart: Theme Popularity (Total Progress per Theme)
                const themePopularity = [
                    { 
                        value: students.reduce((acc, s) => acc + (s.progression?.adventure?.arithmeticTower?.highestLevelUnlocked || 0), 0), 
                        name: "Arithmetic Tower" 
                    },
                    { 
                        value: students.reduce((acc, s) => acc + (s.progression?.adventure?.syntaxValley?.highestLevelUnlocked || 0), 0), 
                        name: "Syntax Valley" 
                    },
                    { 
                        value: students.reduce((acc, s) => acc + (s.progression?.adventure?.loopCanyon?.highestLevelUnlocked || 0), 0), 
                        name: "Loop Canyon" 
                    },
                    { 
                        value: students.reduce((acc, s) => acc + (s.progression?.adventure?.jsLab?.highestLevelUnlocked || 0), 0), 
                        name: "JS Lab" 
                    },
                    { 
                        value: students.reduce((acc, s) => acc + (s.progression?.adventure?.debuggingDungeon?.highestLevelUnlocked || 0), 0), 
                        name: "Debugging Dungeon" 
                    },
                ];

                // Area Chart: Student XP Distribution Histogram
                const xpRanges = ["0-1k", "1k-3k", "3k-5k", "5k-8k", "8k-10k", "10k+"];
                const xpDistribution = [0, 0, 0, 0, 0, 0];
                
                students.forEach(s => {
                    const xp = s.stats?.currentXP || 0;
                    if (xp < 1000) xpDistribution[0]++;
                    else if (xp < 3000) xpDistribution[1]++;
                    else if (xp < 5000) xpDistribution[2]++;
                    else if (xp < 8000) xpDistribution[3]++;
                    else if (xp < 10000) xpDistribution[4]++;
                    else xpDistribution[5]++;
                });
                
                // Line Chart: Simulated Monthly Growth based on current total XP
                const scaleFactor = totalXP / 100000 || 1; 
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
                const sectionA_Trend = [120, 150, 180, 220, 280, 312].map(v => Math.round(v * scaleFactor)); 
                const sectionB_Trend = [100, 120, 160, 190, 210, 240].map(v => Math.round(v * scaleFactor));

                setChartData({
                    bar: {
                        labels: modules,
                        values: avgLevels.map(v => Math.round(v)) // Avg levels unlocked
                    },
                    pie: themePopularity,
                    area: {
                        labels: xpRanges,
                        values: xpDistribution
                    },
                    line: {
                        xAxis: months,
                        series: [
                            { name: "Section A", type: "line", smooth: true, data: sectionA_Trend },
                            { name: "Section B", type: "line", smooth: true, data: sectionB_Trend },
                            ]
                    }
                });

                setDataLoading(false);
            }, (error) => {
                console.error("Error listening to users:", error);
                setDataLoading(false);
            });

            // Cleanup subscription on unmount
            return () => {
                unsubscribeAdmins();
                unsubscribeTasks();
                unsubscribeUsers();
                unsubscribeFeedback();
            };
        }
    }, [admin, loading]);

    if (loading || dataLoading) return <Loader />;

    return (
        <div className="min-h-full w-full flex flex-col font-serif bg-[#1c1917] text-[#d6d3d1]">
            {/* Background Image with Overlay */}
            <div 
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "sepia(1) hue-rotate(-50deg) saturate(0.5) contrast(1.2)"
                }}
            />

            <div className="relative z-10 w-full">
                {/* Banner */}
                <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-8 md:py-12 px-4 md:px-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>
                    <div className="w-full text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-[#d4af37] tracking-widest uppercase mb-4 drop-shadow-md" style={{ textShadow: "2px 2px 0px #000" }}>
                            Admin Dashboard
                        </h1>
                        <p className="text-sm md:text-xl text-[#a8a29e] italic tracking-wider flex items-center justify-center gap-2">
                            <span className="h-[1px] w-8 md:w-12 bg-[#57534e]"></span>
                            Overview of Student Performance & Engagement
                            <span className="h-[1px] w-8 md:w-12 bg-[#57534e]"></span>
                        </p>
                    </div>
                </div>
                
                <div className="w-full px-4 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <StatCard 
                            title="Total Students" 
                            count={stats.totalStudents} 
                            icon={<User size={32} className="text-[#d4af37]" />} 
                            suffix=""
                        />
                         <StatCard 
                            title="Average Mastery" 
                            count={stats.avgMastery} 
                            icon={<Target size={32} className="text-[#2dd4bf]" />} 
                            suffix="%"
                        />
                        <StatCard 
                            title="Total Assignments" 
                            count={stats.totalAssignments} 
                            icon={<BookCheck size={32} className="text-[#a855f7]" />} 
                            suffix=""
                            subtext="Both Section A and B"
                        />
                         <StatCard 
                            title="Total Teachers" 
                            count={stats.totalTeachers} 
                            icon={<User size={32} className="text-[#fbbf24]" />} 
                            suffix=""
                            subtext="Section A and B"
                        />
                    </div>

                    {/* Main Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Line Chart - Wide */}
                        <div className="lg:col-span-2 bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1 relative group">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37] -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37] -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37] -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37] -mb-1 -mr-1"></div>
                            
                            <div className="bg-[#1c1917]/90 p-4 md:p-6 h-full backdrop-blur-sm">
                                <h3 className="text-xl md:text-2xl font-bold text-[#e7e5e4] mb-6 flex items-center gap-3 border-b border-[#44403c] pb-2">
                                    <ScrollText className="text-[#d4af37]" size={24}/>
                                    XP Growth Trends
                                </h3>
                                <LineChart data={chartData.line} />
                            </div>
                        </div>
                        
                        {/* Pie Chart - Side */}
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1 relative">
                            <div className="bg-[#1c1917]/90 p-4 md:p-6 h-full backdrop-blur-sm">
                                 <h3 className="text-xl md:text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    Popular Themes
                                 </h3>
                                 <PieChart data={chartData.pie} />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Charts Section */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-10">
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1">
                            <div className="bg-[#1c1917]/90 p-4 md:p-6 h-full backdrop-blur-sm">
                                <h3 className="text-xl md:text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    Average Levels per Module
                                </h3>
                                <BarGraph data={chartData.bar} />
                            </div>
                        </div>
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1">
                             <div className="bg-[#1c1917]/90 p-4 md:p-6 h-full backdrop-blur-sm">
                                 <h3 className="text-xl md:text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    XP Distribution Curve
                                 </h3>
                                 <AreaChart data={chartData.area} />
                            </div>
                        </div>
                    </div>

                    {/* Recent Feedback Section */}
                    <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1 relative mb-10">
                        <div className="bg-[#1c1917]/90 p-4 md:p-8 h-full backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-6 border-b border-[#44403c] pb-4">
                                <h3 className="text-xl md:text-2xl font-bold text-[#e7e5e4] flex items-center gap-3">
                                    <MessageSquare className="text-[#d4af37]" size={24}/>
                                    Recent Student Feedback
                                </h3>
                                <button 
                                    onClick={() => navigate("/feedback")}
                                    className="text-[#d4af37] hover:text-[#e8dcc0] transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2 group"
                                >
                                    View All
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {recentFeedback.length > 0 ? (
                                    recentFeedback.map((item) => {
                                        const user = studentsData.find(s => s.id === item.uid) || {};
                                        return (
                                            <div key={item.id} className="bg-[#0c0a09] border border-[#292524] p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#44403c] transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full border border-[#44403c] bg-[#1c1917] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {user.avatarUrl || user.photoURL ? (
                                                            <img src={user.avatarUrl || user.photoURL} alt="User" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <User size={18} className="text-[#57534e]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[#e7e5e4] font-bold text-sm">
                                                                {user.displayName || (user.firstName ? `${user.firstName} ${user.lastName}` : "Unknown User")}
                                                            </p>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${item.type === 'Bug' ? 'bg-[#7f1d1d]/20 border-[#ef4444]/50 text-[#ef4444]' : 'bg-[#1e3a8a]/20 border-[#3b82f6]/50 text-[#3b82f6]'}`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-[#a8a29e] text-xs line-clamp-1 italic mt-1">"{item.details}"</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between md:justify-end gap-6">
                                                    <span className="text-[10px] text-[#57534e] font-mono flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {item.submittedAt ? new Date(item.submittedAt.toDate()).toLocaleDateString() : "Unknown"}
                                                    </span>
                                                    <button 
                                                        onClick={() => navigate("/feedback")}
                                                        className="p-2 bg-[#1c1917] border border-[#292524] rounded text-[#a8a29e] hover:text-[#d4af37] hover:border-[#d4af37] transition-all"
                                                        title="View in Feedback Page"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 border-2 border-dashed border-[#292524] rounded-sm">
                                        <p className="text-[#57534e] italic">No recent feedback recorded in the scrolls.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable Ancient Stat Card Component
function StatCard({ title, count, icon, suffix, subtext }) {
    return (
        <div className="bg-[#292524] rounded-sm p-1 border-2 border-[#44403c] shadow-lg relative group transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')] opacity-10 pointer-events-none"></div>
            
            {/* Corner Ornaments */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#d4af37] opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="bg-[#1c1917] p-4 md:p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex items-center justify-between mb-4 border-b border-[#44403c] pb-3">
                    <h3 className="text-[#a8a29e] font-bold text-xs md:text-sm uppercase tracking-widest">{title}</h3>
                    <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c] shadow-inner">
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-extrabold text-[#e7e5e4] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <CountUp
                                from={0}
                                to={count}
                                separator=","
                                direction="up"
                                duration={1}
                                className="count-up-text"
                            />
                        </span>
                        <span className="text-lg md:text-xl font-medium text-[#d4af37]">{suffix}</span>
                    </div>
                    {subtext && <p className="text-[10px] md:text-xs text-[#57534e] mt-2 uppercase tracking-wide">{subtext}</p>}
                </div>
            </div>
        </div>
    )
}