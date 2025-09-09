"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard
    router.push("/admin/dashboard");
  }, [router]);

  // Return null or loading state while redirecting
  return null;
}
