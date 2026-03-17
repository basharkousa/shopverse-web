import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ProfilePage from "./features/auth/pages/ProfilePage.jsx";
import CatalogPage from "./features/products/pages/CatalogPage.jsx";
import ProductDetailsPage from "./features/products/pages/ProductDetailsPage.jsx";
import CartPage from "./features/cart/pages/CartPage.jsx";
import CheckoutPage from "./features/checkout/pages/CheckoutPage.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout/>,
        errorElement: <NotFoundPage/>,
        children: [
            {index: true, element: <HomePage/>},
            {path: "login", element: <LoginPage/>},
            {path: "signup", element: <SignupPage/>},
            { path: "catalog", element: <CatalogPage /> },
            { path: "products/:id", element: <ProductDetailsPage /> },
            {path: "profile", element:
                    <ProtectedRoute>
                        <ProfilePage/>
                    </ProtectedRoute>},
            {path: "cart", element:
                    <ProtectedRoute>
                    <CartPage/>
                    </ProtectedRoute>
            },
            {path: "checkout", element:
                    <ProtectedRoute>
                    <CheckoutPage/>
                    </ProtectedRoute>
            },

        ],
    },
    {path: "*", element: <NotFoundPage/>},
]);

export default function App() {
    return <RouterProvider router={router}/>;
}