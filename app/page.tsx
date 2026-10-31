import Image from "next/image";
import Tasks from "@/components/Tasks";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Tasks</h1>
      <Link href="/create">
        Create task
      </Link>
      <hr />
      <Suspense fallback={<Spinner />}>
        <Tasks />
      </Suspense>
    </div >
  );
}
