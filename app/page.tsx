import Tasks from "@/components/Tasks";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="size-4" />
          New task
        </Link>
      </header>
      <Suspense fallback={<Spinner />}>
        <Tasks />
      </Suspense>
    </>
  );
}
