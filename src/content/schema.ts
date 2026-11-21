import { z } from "zod";

const text = z.string().trim().min(1);
const publicImage = z.string().regex(/^\/projects\/[a-z0-9-]+\/[\w.-]+\.(png|jpg|jpeg|webp|svg)$/);
const publicVideo = z.string().regex(/^\/projects\/[a-z0-9-]+\/[\w.-]+\.(mp4|webm)$/);

export const contactKinds = ["github", "linkedin", "site", "instagram", "email"] as const;

const webUrl = z.url({ protocol: /^https?$/, error: "use um endereço http ou https" });
const mailUrl = z.url({ protocol: /^mailto$/, error: "contato de e-mail usa mailto:" });

const contactSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("email"), url: mailUrl }),
  z.strictObject({ kind: z.enum(["github", "linkedin", "site", "instagram"]), url: webUrl }),
]);

const authorSchema = z.strictObject({
  name: text,
  role: text.optional(),
  avatar: publicImage.optional(),
  contacts: z.array(contactSchema).default([]),
});

const linksSchema = z
  .strictObject({
    site: webUrl.optional(),
    repo: webUrl.optional(),
  })
  .refine((links) => links.site !== undefined || links.repo !== undefined, {
    message: "informe pelo menos um link: site ou repo",
  });

export const projectFileSchema = z.strictObject({
  name: text,
  tagline: text.max(120),
  description: text,
  highlights: z.array(text).min(1).max(6),
  stack: z.array(text).min(1),
  links: linksSchema,
  cover: publicImage,
  previewVideo: publicVideo.optional(),
  screenshots: z.array(publicImage).default([]),
  authors: z.array(authorSchema).min(1),
  order: z.number().int().default(100),
});

export type ProjectFile = z.infer<typeof projectFileSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Project = ProjectFile & { slug: string };

export function mediaPaths(project: ProjectFile): string[] {
  return [
    project.cover,
    ...(project.previewVideo ? [project.previewVideo] : []),
    ...project.screenshots,
    ...project.authors.flatMap((author) => (author.avatar ? [author.avatar] : [])),
  ];
}
