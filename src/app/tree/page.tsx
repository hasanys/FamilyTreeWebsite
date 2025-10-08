// app/tree/page.tsx
import { Suspense } from "react";
import Tree from "./TreeClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading tree…</div>}>
      <Tree />
    </Suspense>
  );
}
