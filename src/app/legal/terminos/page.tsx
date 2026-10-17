import { redirect } from "next/navigation";

export default function TerminosPage() {
  redirect("/legal?tab=terminos");
}
