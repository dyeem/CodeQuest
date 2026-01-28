# CodeQuest Frontend

## Project Overview

CodeQuest is an educational platform designed to manage students, assignments, and track performance. This repository contains the frontend application built with **React** and **Vite**. It serves as an administrative dashboard for teachers or administrators to oversee the educational process.

### Key Features
*   **Dashboard:** Visual analytics of student performance and engagement using **ECharts**.
*   **Student Management:** Tools to view and manage student profiles and progress.
*   **Assignment & Challenges:** Creation and management of coding challenges, quizzes, and debugging tasks. Includes a code editor powered by **Monaco Editor**.
*   **Grading:** Interfaces for reviewing and grading student submissions.
*   **User Management:** Administration of user accounts and roles.

### Tech Stack
*   **Core:** React 19, Vite 7
*   **Routing:** React Router DOM 7
*   **Styling:** Tailwind CSS 4, Lucide React (Icons), Framer Motion (Animations)
*   **Backend & Auth:** Firebase (Authentication, Firestore)
*   **Visualization:** Apache ECharts
*   **Code Editor:** Monaco Editor

## Building and Running

The project uses `npm` for dependency management and scripts.

### Prerequisites
*   Node.js (Ensure a compatible version for React 19/Vite 7)
*   npm

### Key Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install project dependencies. |
| `npm run dev` | Start the development server with Hot Module Replacement (HMR). |
| `npm run build` | Build the application for production. |
| `npm run preview` | Locally preview the production build. |
| `npm run lint` | Run ESLint to check for code quality and style issues. |

## Project Structure

```text
src/
├── api/            # API interaction logic (e.g., login)
├── assets/         # Static assets (images, icons)
├── Auth/           # Authentication pages and components (Login)
├── Components/     # Reusable UI components
│   ├── Challenge/  # Components for different challenge types (Coding, Quiz, Debug)
│   ├── Charts/     # ECharts wrapper components
│   ├── Grading/    # Grading interface components
│   └── ...
├── config/         # Configuration files (Firebase setup)
├── context/        # React Context providers (e.g., ToastContext)
├── data/           # Static or sample data
├── hooks/          # Custom React hooks (useAuth, useGradebook)
├── Layouts/        # Page layout wrappers (AdminLayout, RootLayout)
├── Pages/          # Main route components (Dashboard, StudentManagement, etc.)
└── Routes/         # Router configuration
```

## Development Conventions

*   **Styling:** The project relies heavily on **Tailwind CSS** for styling. Utility classes are applied directly to JSX elements. Custom colors (e.g., `#d4af37` gold, `#1c1917` dark backgrounds) are frequently used to maintain a consistent theme.
*   **State Management:** React's built-in `useState` and `useEffect` are the primary state management tools. Complex logic is often abstracted into custom hooks (e.g., `src/hooks/`).
*   **Data Fetching:** Firebase SDK is used directly within components or hooks for real-time data synchronization (`onSnapshot`) and CRUD operations.
*   **Routing:** Application routes are defined centrally in `src/Routes/routes.jsx` using the `useRoutes` hook.
