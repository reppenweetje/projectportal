import { redirect } from "next/navigation";

type Params = { projectSlug: string };

export default async function InfoRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  await params;
  redirect(`/documenten`);
}
