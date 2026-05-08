import { redirect } from "next/navigation";

type Params = { projectSlug: string };

export default async function InfoRedirect({
  params,
}: {
  params: Promise<Params>;
}) {
  const { projectSlug } = await params;
  redirect(`/${projectSlug}/documenten`);
}
