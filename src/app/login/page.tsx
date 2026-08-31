import LoginForm from "@/components/login/LoginForm";
import ProfileSelector from "@/components/login/ProfileSelector";

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full lg:flex">
      <ProfileSelector />
      <LoginForm />
    </main>
  );
}