import { redirect } from "next/navigation";

export default function PrivacidadPage() {
  redirect("/legal?tab=privacidad");
}
