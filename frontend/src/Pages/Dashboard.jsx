import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Target, BookCheck, Star, ScrollText, FileText } from "lucide-react";
import bg from "../assets/dashboardbg.png"; 

import CountUp from "../Components/animation/countup";
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
        avgMastery: 0,
        totalAssignments: 0, 
        totalXP: 0
    });
    const [chartData, setChartData] = useState({
        line: { xAxis: [], series: [] },
        pie: [],
        bar: { labels: [], values: [] },
        area: { labels: [], values: [] }
    });
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        document.title = "Dashboard | CodeQuest";
    }, []);

    useEffect(() => {
        if (!loading && !admin) {
            navigate("/auth/login");
        }
    }, [admin, loading, navigate]);

    // Real-time listener for users collection
    useEffect(() => {
        if (!loading && admin) {
            const usersCollection = collection(db, "users");
            
            const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
                const students = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (students.length === 0) {
                    setDataLoading(false);
                    return;
                }

                // 2. Calculate Dashboard Stats
                const totalStudents = students.length;
                const totalXP = students.reduce((acc, s) => acc + (s.stats?.totalXP || 0), 0);
                
                // Calculate Average Mastery across all 5 modules (max ~100 levels per module for simplicity in calc)
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

                setStats({
                    totalStudents,
                    avgMastery,
                    totalAssignments: 5, // Currently representing the 5 main Adventure Mode themes
                    totalXP
                });

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

                // Pie Chart: Online Status
                const onlineCount = students.filter(s => s.isOnline).length;
                const offlineCount = totalStudents - onlineCount;

                // Area Chart: Student Level Distribution (Grouped by 10s)
                const levels = students.map(s => Math.floor((s.stats?.totalXP || 0) / 1000) + 1);
                // Create buckets for levels (e.g., 1-10, 11-20) - actually, just sorting raw XP for the "Mana Curve" visual is fine for now
                const sortedXP = students.map(s => s.stats?.totalXP || 0).sort((a, b) => a - b);
                
                // Line Chart: Simulated Monthly Growth based on current total XP
                const scaleFactor = totalXP / 100000 || 1; 
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
                const sectionA_Trend = [120, 150, 180, 220, 280, 312].map(v => Math.round(v * scaleFactor)); 
                const sectionB_Trend = [100, 120, 160, 190, 210, 240].map(v => Math.round(v * scaleFactor));
                const sectionC_Trend = [80, 110, 130, 160, 250, 290].map(v => Math.round(v * scaleFactor));

                setChartData({
                    bar: {
                        labels: modules,
                        values: avgLevels.map(v => Math.round(v)) // Avg levels unlocked
                    },
                    pie: [
                        { value: onlineCount, name: "Online" },
                        { value: offlineCount, name: "Offline" },
                    ],
                    area: {
                        labels: students.map((_, i) => `S${i+1}`), // Simplified labels
                        values: sortedXP
                    },
                    line: {
                        xAxis: months,
                        series: [
                            { name: "Section A", type: "line", smooth: true, data: sectionA_Trend },
                            { name: "Section B", type: "line", smooth: true, data: sectionB_Trend },
                            { name: "Section C", type: "line", smooth: true, data: sectionC_Trend },
                            ]
                    }
                });

                setDataLoading(false);
            }, (error) => {
                console.error("Error listening to users:", error);
                setDataLoading(false);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
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
                <div className="w-full bg-[#0c0a09] border-b-4 border-[#292524] py-12 px-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-5xl font-bold text-[#d4af37] tracking-widest uppercase mb-4 drop-shadow-md" style={{ textShadow: "2px 2px 0px #000" }}>
                            Admin Dashboard
                        </h1>
                        <p className="text-xl text-[#a8a29e] italic tracking-wider flex items-center justify-center gap-2">
                            <span className="h-[1px] w-12 bg-[#57534e]"></span>
                            Overview of Student Performance & Engagement
                            <span className="h-[1px] w-12 bg-[#57534e]"></span>
                        </p>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            icon={<FileText size={32} className="text-[#a855f7]" />} 
                            suffix=""
                            subtext="Active Modules"
                        />
                         <StatCard 
                            title="Total XP Earned" 
                            count={stats.totalXP} 
                            icon={<Star size={32} className="text-[#fbbf24]" />} 
                            suffix=""
                        />
                    </div>

                    {/* Main Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Line Chart - Wide */}
                        <div className="lg:col-span-2 bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1 relative group">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37] -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37] -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37] -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37] -mb-1 -mr-1"></div>
                            
                            <div className="bg-[#1c1917]/90 p-6 h-full backdrop-blur-sm">
                                <h3 className="text-2xl font-bold text-[#e7e5e4] mb-6 flex items-center gap-3 border-b border-[#44403c] pb-2">
                                    <ScrollText className="text-[#d4af37]" size={24}/>
                                    XP Growth Trends
                                </h3>
                                <LineChart data={chartData.line} />
                            </div>
                        </div>
                        
                        {/* Pie Chart - Side */}
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1 relative">
                            <div className="bg-[#1c1917]/90 p-6 h-full backdrop-blur-sm">
                                 <h3 className="text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    Student Status
                                 </h3>
                                 <PieChart data={chartData.pie} />
                            </div>
                        </div>
                    </div>

                    {/* Secondary Charts Section */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1">
                            <div className="bg-[#1c1917]/90 p-6 h-full backdrop-blur-sm">
                                <h3 className="text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    Average Levels per Module
                                </h3>
                                <BarGraph data={chartData.bar} />
                            </div>
                        </div>
                        <div className="bg-[#292524] rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-2 border-[#44403c] p-1">
                             <div className="bg-[#1c1917]/90 p-6 h-full backdrop-blur-sm">
                                 <h3 className="text-2xl font-bold text-[#e7e5e4] mb-6 border-b border-[#44403c] pb-2">
                                    XP Distribution Curve
                                 </h3>
                                 <AreaChart data={chartData.area} />
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

            <div className="bg-[#1c1917] p-6 h-full flex flex-col justify-between relative z-10">
                <div className="flex items-center justify-between mb-4 border-b border-[#44403c] pb-3">
                    <h3 className="text-[#a8a29e] font-bold text-sm uppercase tracking-widest">{title}</h3>
                    <div className="p-2 bg-[#0c0a09] rounded-full border border-[#44403c] shadow-inner">
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[#e7e5e4] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                            <CountUp
                                from={0}
                                to={count}
                                separator=","
                                direction="up"
                                duration={1}
                                className="count-up-text"
                            />
                        </span>
                        <span className="text-xl font-medium text-[#d4af37]">{suffix}</span>
                    </div>
                    {subtext && <p className="text-xs text-[#57534e] mt-2 uppercase tracking-wide">{subtext}</p>}
                </div>
            </div>
        </div>
    )
}