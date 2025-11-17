import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { User, Target, BookCheck, Star } from "lucide-react";
import bg from "../assets/dashboardbg.png";

import CountUp from "../Components/animation/countup";
import Loader from "../Components/Loader";

// charts
import BarGraph from "../Components/Charts/BarGraph";
import AreaChart from "../Components/Charts/AreaChart";
import PieChart from "../Components/Charts/PieGraph";
import Banner from "../Components/Banner";
import LineChart from "../Components/Charts/LineChart";

// auth hook
import useCurrentAdmin from "../hooks/auth";


export default function Dashboard() {
    const { admin, loading } = useCurrentAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Dashboard | CodeQuest";
    }, []);

    useEffect(() => {
        if (!loading && !admin) {
        navigate("/admin/auth/login");
        }
    }, [admin, loading, navigate]);

    if (loading) return <Loader />;

    return (
        <>
            <div
                className="font-rajdhani min-h-screen w-full flex tracking-wide justify-center bg-fixed"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="mt-14 w-full">
                    <Banner />
                    <div className="mx-80 mt-10">
                        <div className="">
                            <div className="flex items-center justify-center bg-white mb-10">
                                <div className="font-rajdhani text-4xl font-bold text-gray-800 p-3">
                                    <p>Dashboard Overview</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-xl font-bold mb-20">
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Total Students</p>
                                    <p className="flex items-center mt-2 gap-2">
                                        <User size={40} />
                                        <span className="text-4xl">
                                            <CountUp
                                                from={0}
                                                to={150}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Average Progress</p>
                                    <p className="flex items-center mt-2 gap-2">
                                        <Target size={40} />
                                        <span className="text-4xl">
                                            <CountUp
                                                from={0}
                                                to={70}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />
                                            %
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Recent Activity</p>
                                    <p className="flex items-center mt-2 gap-2">
                                        <BookCheck size={40} />
                                        <span className="text-4xl flex gap-2">
                                            <CountUp
                                                from={0}
                                                to={4}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />
                                            <p>New Assignments</p>
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center justify-center bg-white mb-10 ">
                                <div className="font-rajdhani text-4xl font-bold text-gray-800 p-3">
                                    <p>Performance Trends</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 mt-3 bg-white rounded-xl">
                                <div className="p-2">
                                    <BarGraph />
                                </div>
                                <div className="p-2">
                                    <AreaChart />
                                </div>
                                <div className="col-span-2 p-2 flex justify-center">
                                    <div className="w-full max-w-2xl">
                                        <LineChart />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div className="flex items-center justify-center bg-white my-10">
                                <div className="font-rajdhani text-4xl font-bold text-gray-800 p-3 flex flex-col items-center">
                                    <p>Class Performance Metrics</p>
                                    <p className="text-base">
                                        Analyze key metrics for you class
                                    </p>
                                    <button className="text-2xl cursor-pointer bg-[#212832] font-medium text-white px-4 py-2 rounded-md mt-4">
                                        Export Class Data
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-xl font-bold mb-20">
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Total Students</p>
                                    <p className="flex flex-col mt-2 ">
                                        <span className="flex gap-2 mb-2">
                                            <User size={40} />
                                            <span className="text-4xl">
                                                <CountUp
                                                    from={0}
                                                    to={150}
                                                    separator=","
                                                    direction="up"
                                                    duration={1}
                                                    className="count-up-text"
                                                />
                                            </span>
                                        </span>
                                        <span className="text-sm flex gap-1">
                                            +
                                            <CountUp
                                                from={0}
                                                to={5}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />
                                            <p>from last month</p>
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Average Progress</p>
                                    <p className="flex items-center mt-2 gap-2">
                                        <Target size={40} />
                                        <span className="text-4xl">
                                            <CountUp
                                                from={0}
                                                to={70}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />{" "}
                                            %
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white p-5 rounded-xl">
                                    <p>Total XP Earned</p>
                                    <p className="flex items-center mt-2 gap-2">
                                        <Star size={40} />
                                        <span className="text-4xl">
                                            <CountUp
                                                from={0}
                                                to={5000}
                                                separator=","
                                                direction="up"
                                                duration={1}
                                                className="count-up-text"
                                            />{" "}
                                            XP
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 bg-white rounded-xl p-4 mb-5">
                                <PieChart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
