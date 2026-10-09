import { redirect } from "next/navigation";

export default function AccountantRedirect() {
  redirect("/dashboard/finance");
}
