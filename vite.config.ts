import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function getGithubPagesBase(): string {
  const repository = Deno.env.get("GITHUB_REPOSITORY");

  if (!repository) {
    return "/";
  }

  const [owner, repo] = repository.split("/");

  if (!owner || !repo || repo === `${owner}.github.io`) {
    return "/";
  }

  return `/${repo}/`;
}

export default defineConfig({
  plugins: [react()],
  base: getGithubPagesBase(),
});
