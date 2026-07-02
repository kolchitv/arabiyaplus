import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import DashboardPage from "@/pages/DashboardPage";
import BookInfoPage from "@/pages/BookInfoPage";
import EditorPage from "@/pages/EditorPage";
import ReaderPage from "@/pages/ReaderPage";
import { useUiStore } from "@/store/uiStore";

export default function App() {
  const darkMode = useUiStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/book-info" element={<BookInfoPage />} />
      <Route path="/editor/:bookId" element={<EditorPage />} />
      <Route path="/read/:bookId" element={<ReaderPage />} />
    </Routes>
  );
}
