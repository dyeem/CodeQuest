import { useRoutes } from "react-router-dom";
import RootLayout from "../Layouts/RootLayout";
import AdminLayout from "../Layouts/AdminLayout";
import Dashboard from "../Pages/Dashboard";
import Login from "../Auth/Login";
import StudentManagement from "../Pages/StudentManagement";
import AssignmentandChallenges from "../Pages/AssignmentandChallenges";
import SystemandSettings from "../Pages/SystemandSettings";

const Routes = () => {
  const routes = useRoutes([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          path: "admin",
          children: [
            { path: "auth/login", element: <Login /> },
            {
              element: <AdminLayout />,
              children: [
                { path: "dashboard", element: <Dashboard /> },
                { path: "student-management", element: <StudentManagement /> },
                { path: "assignment-and-challenges", element: <AssignmentandChallenges />},
                { path: "system-and-settings", element: <SystemandSettings />}
              ],
            },
          ],
        },
      ],
    },
  ]);

  return routes; 
};

export default Routes;
