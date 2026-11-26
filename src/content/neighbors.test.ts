import { describe, expect, it } from "vitest";
import { initials, neighbors } from "./neighbors";

describe("neighbors", () => {
  it("dá a volta nas pontas da lista", () => {
    expect(neighbors(["a", "b", "c"], 0)).toEqual({ previous: "c", next: "b" });
    expect(neighbors(["a", "b", "c"], 2)).toEqual({ previous: "b", next: "a" });
  });

  it("não tem vizinho quando só existe um projeto", () => {
    expect(neighbors(["a"], 0)).toBeUndefined();
  });
});

describe("initials", () => {
  it("usa a primeira e a última palavra do nome", () => {
    expect(initials("Ana Maria Exemplo")).toBe("AE");
    expect(initials("luanderson")).toBe("L");
  });

  it("ignora emoji e símbolos, sem partir um caractere ao meio", () => {
    expect(initials("Time Foguete 🚀")).toBe("TF");
    expect(initials("🚀 Ana")).toBe("A");
    expect(initials("Ágata Érica")).toBe("ÁÉ");
    expect(initials("𝒜na")).toBe("𝒜");
  });
});
