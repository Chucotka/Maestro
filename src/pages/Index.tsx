import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 dark:bg-slate-900 p-4 transition-colors duration-300">
      <Fretboard />
      <MadeWithDyad />
    </div>
  );
};

export default Index;