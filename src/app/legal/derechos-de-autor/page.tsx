import { redirect } from "next/navigation";

export default function DerechosPage() {
  redirect("/legal?tab=derechos");
}
