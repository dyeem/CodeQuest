import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Student Management", to: "/students" },
    { label: "Assignment & Challenges", to: "/assignments" },
    { label: "System and Settings", to: "/settings" },
  ];

  return (
    <div className="w-full flex flex-col justify-center items-center bg-[#1A202C] text-white py-10 font-rajdhani">
      <div className="w-full flex justify-center items-center gap-8 bg-[#212832] py-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`text-sm transition-all ${
              pathname === item.to
                ? "text-blue-400 font-semibold underline underline-offset-4"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center text-gray-400 text-sm">
        © 2025 CodeQuest. All rights reserved.
      </div>
    </div>
  );
}
