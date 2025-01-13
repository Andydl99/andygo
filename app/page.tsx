import { ThemeToggle } from "./components/ThemeToggle";
import { AuroraBackground } from "@/components/ui/aurora-background";
// import { Button } from "@/components/ui/button";
export default function Home() {
  return (
    <AuroraBackground>
      <div className="relative w-full h-full">
        <main className=" z-10 w-full min-h-screen dark:text-white">
          <nav className="p-4">
            <ThemeToggle />
          </nav>
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold">你的内容</h1>
          </div>
          <div className="dark:text-white">1</div>
        </main>
      </div>
    </AuroraBackground>
  );
}
