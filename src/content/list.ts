import { getProjects } from "./projects";

export function getListProjects() {
  return getProjects().map((project) => ({
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    cover: project.cover,
    previewVideo: project.previewVideo,
    authorNames: project.authors.map((author) => author.name),
  }));
}
