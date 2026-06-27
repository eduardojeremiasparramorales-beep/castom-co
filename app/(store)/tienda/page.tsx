import { Suspense } from "react";
import { TiendaClient } from "./tienda-client";

export default function TiendaPage() {
  return (
    <Suspense fallback={<div className="max-w-[1200px] mx-auto px-4 py-12"><div className="animate-pulse h-8 w-32 bg-gray-200 rounded" /></div>}>
      <TiendaClient />
    </Suspense>
  );
}
