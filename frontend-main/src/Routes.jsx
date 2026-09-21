import React from "react";
import { useEffect } from "react";
import { useRoutes } from 'react-router-dom';

// Layout
import AppShell from "./components/layout/AppShell";
import Landing from "./components/landing/Landing";

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepository from "./components/repository/CreateRepository";
import RepositoryDetail from "./components/repository/RepositoryDetail";

// Foundations
import Issues from "./components/foundations/Issues";
import PullRequests from "./components/foundations/PullRequests";
import GlobalSearch from "./components/foundations/GlobalSearch";
import Settings from "./components/foundations/Settings";
import Notifications from "./components/foundations/Notifications";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    
    const userIdFromStorage = localStorage.getItem("userId");

    useEffect(() => {
        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }
    }, [currentUser, setCurrentUser, userIdFromStorage]);

    const publicRoutes = [
        { path: "/", element: <Landing /> },
        { path: "/auth", element: <Login /> },
        { path: "/signup", element: <Signup /> },
    ];

    const privateRoutes = [
        { path: "/", element: <Dashboard /> },
        { path: "/create", element: <CreateRepository /> },
        { path: "/profile", element: <Profile /> },
        { path: "/repo/:id", element: <RepositoryDetail /> },
        { path: "/repo/all", element: <GlobalSearch /> }, // placeholder for repo search
        { path: "/issues", element: <Issues /> },
        { path: "/pulls", element: <PullRequests /> },
        { path: "/settings", element: <Settings /> },
        { path: "/notifications", element: <Notifications /> },
    ];

    let element = useRoutes([
        ...(userIdFromStorage 
            ? privateRoutes.map(route => ({ ...route, element: <AppShell>{route.element}</AppShell> })) 
            : publicRoutes),
        // Fallback catch-all for when not authenticated
        ...(!userIdFromStorage ? [
             { path: "*", element: <Landing /> }
        ] : [
             { path: "*", element: <AppShell><Dashboard /></AppShell> }
        ])
    ]);

    return element;
}

export default ProjectRoutes;