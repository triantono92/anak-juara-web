import { redirect } from "next/navigation";
import { getParentUser } from "@/lib/auth";
import { OrtuBottomNav } from "@/components/OrtuBottomNav";

export default async function OrtuAppLayout({ children }: { children: React.ReactNode }) {
  const user = await getParentUser();
  if (!user) redirect("/masuk");

  return (
    <div className="min-h-screen flex justify-center bg-page-bg">
      <div className="w-full max-w-[480px] min-h-screen bg-grey-bg flex flex-col relative">
        <div className="flex-1 overflow-y-auto pb-[74px]">{children}</div>
        <OrtuBottomNav />
      </div>
    </div>
  );
}
