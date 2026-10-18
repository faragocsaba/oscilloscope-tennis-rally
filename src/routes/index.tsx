import { createFileRoute } from "@tanstack/react-router";
import { TennisForTwo } from "@/components/TennisForTwo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tennis for Two — 1958 Oscilloscope Game" },
      { name: "description", content: "Play Higinbotham's 1958 Tennis for Two on a glowing green oscilloscope screen. Two players, one keyboard." },
      { property: "og:title", content: "Tennis for Two — 1958 Oscilloscope Game" },
      { property: "og:description", content: "The first video game for fun, recreated with phosphor-glow oscilloscope graphics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="lab-bg flex min-h-screen flex-col items-center gap-6 px-4 py-8">
      <header className="text-center">
        <h1 className="font-mono text-2xl tracking-[0.4em] text-panel-label">TENNIS FOR TWO</h1>
        <p className="mt-1 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          BROOKHAVEN NATIONAL LABORATORY · 1958
        </p>
      </header>
      <TennisForTwo />
    </main>
  );
}
