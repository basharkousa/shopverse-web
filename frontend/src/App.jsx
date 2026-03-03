import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProfilePage from "./features/auth/pages/ProfilePage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <NotFoundPage/>,
        children: [
            {index: true, element: <HomePage/>},
            {path: "login", element: <LoginPage/>},
            {path: "signup", element: <SignupPage/>},
            {path: "profile", element:
                    <ProtectedRoute>
                        <ProfilePage/>
                    </ProtectedRoute>}
        ],
    },
    {path: "*", element: <NotFoundPage/>},
]);

export default function App() {
    return <RouterProvider router={router}/>;
}