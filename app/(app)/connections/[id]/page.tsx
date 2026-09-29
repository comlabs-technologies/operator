import { Suspense } from "react";
import { ConnectionDetail } from "@/components/connections/connection-detail";
import { connections, getConnection } from "@/lib/mock/connections";

export function generateStaticParams() {
  return connections.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: getConnection(id)?.name ?? "Connection" };
}

export default async function ConnectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
      <Suspense>
        <ConnectionDetail id={id} />
      </Suspense>
    </div>
  );
}
