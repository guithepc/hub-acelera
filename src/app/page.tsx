import { site } from "@/lib/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-semibold tracking-tight">{site.name}</h1>
      <p className="text-lg opacity-70">{site.description}</p>
    </main>
  );
}
