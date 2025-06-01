import { Grid } from "@/components/grid";

export default function Home() {
  return (
    <div className="flex-1 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative">
          <Grid />
        </div>
      </div>
    </div>
  );
}
