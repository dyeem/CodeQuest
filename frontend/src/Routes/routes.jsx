import { useRoutes, Navigate } from "react-router-dom";
import RootLayout from "../Layouts/RootLayout";
import AdminLayout from "../Layouts/AdminLayout";
import Dashboard from "../Pages/Dashboard";
import Login from "../Auth/Login";
import StudentManagement from "../Pages/StudentManagement";
import AssignmentandChallenges from "../Pages/AssignmentandChallenges";
import UserManagement from "../Pages/UserManagement";

const Routes = () => {
  const routes = useRoutes([
    {
      path: "/",
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "auth/login", element: <Login /> },
        {
          element: <AdminLayout />,
          children: [
            { path: "dashboard", element: <Dashboard /> },
            { path: "student-management", element: <StudentManagement /> },
            { path: "assignment-and-challenges", element: <AssignmentandChallenges />},
            { path: "user-management", element: <UserManagement />},
          ],
        },
      ],
    },
  ]);

  return routes; 
};

export default Routes;
