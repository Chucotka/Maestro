import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <Fretboard />
      <MadeWithDyad />
    </div>
  );
};

export default Index;