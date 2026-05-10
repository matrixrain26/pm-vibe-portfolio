import LoginForm from "./ui";

export default function LoginPage() {
  return (
    <main className="admin-page">
      <p className="eyebrow">Admin Access</p>
      <h1>Content Studio</h1>
      <p>Sign in to edit your portfolio sections, project cards, blog prompts, and contact details.</p>
      <LoginForm />
    </main>
  );
}
