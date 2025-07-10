import { MadeWithDyad } from "@/components/made-with-dyad";
import Fretboard from "@/components/Fretboard";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Fretboard />
      <MadeWithDyad />
    </div>
  );
};

export default Index;