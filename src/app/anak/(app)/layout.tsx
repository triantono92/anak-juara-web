import { redirect } from "next/navigation";
import { getChildSession } from "@/lib/auth";
import { AnakBottomNav } from "@/components/AnakBottomNav";


export default async function AnakAppLayout({ children }: { children: React.ReactNode }) {
  const session = await getChildSession();
  if (!session) redirect("/masuk");

  return (
    <div className="min-h-screen flex justify-center bg-page-bg">
      <div className="w-full max-w-[480px] min-h-screen bg-cream flex flex-col relative">
        <div className="flex-1 overflow-y-auto pb-[74px]">{children}</div>
        <AnakBottomNav />
      </div>
    </div>
  );
}
