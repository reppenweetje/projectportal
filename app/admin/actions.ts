"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  getAdminPassword,
  setAdminSession,
} from "@/lib/admin/auth";

export async function loginAdmin(formData: FormData): Promise<void> {
  const password = formData.get("password");
  if (typeof password !== "string") {
    redirect("/admin?error=invalid");
  }
  if (password !== getAdminPassword()) {
    redirect("/admin?error=wrong");
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin");
}
