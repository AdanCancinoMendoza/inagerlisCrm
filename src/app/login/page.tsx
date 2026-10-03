"use client";

import { useState } from "react";
import LoginForm from "@/components/login/LoginForm";
import ProfileSelector from "@/components/login/ProfileSelector";

export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState("");

  return (
    <main className="min-h-screen w-full lg:flex">
      <ProfileSelector onSelectProfileEmail={(email) => setSelectedEmail(email)} />
      <LoginForm initialEmail={selectedEmail} />
    </main>
  );
}