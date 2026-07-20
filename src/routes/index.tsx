import { createFileRoute } from "@tanstack/react-router";
import { RadioConsole } from "../components/RadioConsole";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <RadioConsole />;
}
