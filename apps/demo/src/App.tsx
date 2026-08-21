import { Route, Routes } from "react-router-dom";
import { ComponentsPage } from "./pages/Components";
import { DocsPage } from "./pages/Docs";
import { HomePage } from "./pages/Home";
import { SiteShell } from "./site/SiteShell";

export function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/components" element={<ComponentsPage />} />
      </Route>
    </Routes>
  );
}
