import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import ManageProducts from "./components/ManageProducts";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/manage-products" element={<ManageProducts />} />
      </Routes>
    </Suspense>
  );
}

export default App;
