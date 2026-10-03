"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function POSConsoleRedirectPage() {
  useEffect(() => {
    redirect("/pos/configuracion");
  }, []);

  return null;
}
