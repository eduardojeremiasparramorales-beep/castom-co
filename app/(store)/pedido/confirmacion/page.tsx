import { Suspense } from "react";
import { ConfirmacionClient } from "./confirmacion-client";

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div className="max-w-[600px] mx-auto px-4 py-16 text-center"><div className="animate-pulse h-16 w-16 bg-gray-200 rounded-full mx-auto" /></div>}>
      <ConfirmacionClient />
    </Suspense>
  );
}
