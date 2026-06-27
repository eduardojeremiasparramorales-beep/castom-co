import { Header } from "@/components/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 bg-gray-50">{children}</main>
    </>
  );
}
