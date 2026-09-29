import { Suspense } from "react";
import { AskConsole } from "@/components/ask/ask-console";

export const metadata = { title: "Ask" };

export default function AskPage() {
  return (
    <Suspense>
      <AskConsole />
    </Suspense>
  );
}
