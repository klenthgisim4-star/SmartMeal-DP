import { Link, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import Home from "./screens/Home";
import Planner from "./screens/Planner";
import Visualization from "./screens/Visualization";
import Results from "./screens/Results";
import Algorithm from "./screens/Algorithm";
import Complexity from "./screens/Complexity";
import Challenge from "./screens/Challenge";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/visualization" element={<Visualization />} />
        <Route path="/results" element={<Results />} />
        <Route path="/algorithm" element={<Algorithm />} />
        <Route path="/complexity" element={<Complexity />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center gap-2 py-24">
              <p className="text-lg font-semibold">Page not found</p>
              <Link to="/" className="text-primary font-semibold underline">Back to home</Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
