import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        errorElement: <NotFoundPage />,
        children: [{ index: true, element: <HomePage /> }],
    },
    { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
    return <RouterProvider router={router} />;
}