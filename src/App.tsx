import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import UpvoteDemo from "./components/UpvoteDemo";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upvote-demo" element={<UpvoteDemo />} />
      </Routes>
    </Suspense>
  );
}

export default App;
