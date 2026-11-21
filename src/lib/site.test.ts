import { describe, expect, it } from "vitest";
import { pageTitle } from "./site";

describe("pageTitle", () => {
  it("usa só o nome do site na home", () => {
    expect(pageTitle()).toBe("Hub Acelera");
  });

  it("coloca a seção antes do nome do site", () => {
    expect(pageTitle("Projetos")).toBe("Projetos · Hub Acelera");
  });
});
