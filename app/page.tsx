import { redirect } from "next/navigation";

// REPP heeft (nog) één project — direct doorsturen naar De Hofman.
// Later: project-overview pagina.
export default function RootPage() {
  redirect("/de-hofman");
}
