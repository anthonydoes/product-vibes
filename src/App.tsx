import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import ManageProducts from "./components/ManageProducts";
import ProductPage from "./components/ProductPage";
import UserProfilePage from "./components/UserProfilePage";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manage-products" element={<ManageProducts />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/user/:username" element={<UserProfilePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
