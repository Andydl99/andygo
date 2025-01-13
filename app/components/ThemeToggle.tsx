"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "system";
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;
    const isDark =
      newTheme === "dark" ||
      (newTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme);
  };

  const setThemeMode = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setThemeMode("light")}
        className={`rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          theme === "light" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="浅色模式"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        onClick={() => setThemeMode("dark")}
        className={`rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          theme === "dark" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="深色模式"
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        onClick={() => setThemeMode("system")}
        className={`rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
          theme === "system" ? "bg-gray-200 dark:bg-gray-700" : ""
        }`}
        title="跟随系统"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}
