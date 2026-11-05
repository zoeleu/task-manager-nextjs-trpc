import { caller } from "@/trpc/server";
import InfiniteTasks from "@/components/InfiniteTasks";

export default async function Tasks() {
    const firstPage = await caller.listTasks({ limit: 30 });
    return <InfiniteTasks firstPage={firstPage} />;
}
