import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import bg from "../assets/loginbg.png";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Login - JS CodeQuest";
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full flex flex-col items-center justify-center p-4 tracking-wide">
                
                {/* Title */}
                <div className="flex flex-col items-center mb-6 font-rajdhani text-white text-4xl sm:text-5xl md:text-6xl">
                    <p>JS</p>
                    <p>CodeQuest</p>
                </div>

                {/* Card */}
                <div className="bg-[#fcfcfc]/90 rounded-xl p-6 sm:p-10 md:p-12 shadow-2xl w-full max-w-2xl">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6 w-full px-4 sm:px-10 md:px-20"
                    >
                        <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-4 font-rajdhani">
                            Login
                        </h2>

                        {/* Username */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-gray-700 italic">
                                Username:
                            </label>
                            <div className="flex items-center bg-[#c4c4c4] border border-gray-300 rounded-xl px-3 sm:px-4 py-2 focus-within:ring-2 focus-within:ring-black">
                                <User className="w-5 h-5 text-gray-700 mr-2" />
                                <input
                                    type="text"
                                    className="w-full bg-transparent focus:outline-none"
                                    placeholder="Enter username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-2">
                            <label className="font-bold text-gray-700 italic">
                                Password:
                            </label>
                            <div className="flex items-center bg-[#c4c4c4] border border-gray-300 rounded-xl px-3 sm:px-4 py-2 focus-within:ring-2 focus-within:ring-black">
                                <Lock className="w-5 h-5 text-gray-700 mr-2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-transparent focus:outline-none"
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    className="ml-2 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-700" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-700" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Button */}
                        <div className="flex flex-col items-center">
                            <button
                                className="bg-[#222831] text-white py-2 px-8 rounded-xl text-lg font-semibold hover:bg-[#2c333d] mt-4 transition italic"
                                type="submit"
                                onClick={() => navigate("/admin/dashboard")}
                            >
                                Login <ArrowRight className="inline-block w-5 h-5" />
                            </button>
                        </div>

                        <hr className="my-2" />
                    </form>
                </div>
            </div>
        </div>
    );
}
