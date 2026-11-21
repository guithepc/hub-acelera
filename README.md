# Hub Acelera

Vitrine dos projetos da comunidade Acelera Dev. Mostra o que os membros construíram e quem construiu.

O plano e o andamento ficam no Linear, projeto "Hub Acelera".

## Rodar localmente

Requisitos: Node.js 22 ou mais novo e npm.

```bash
git clone https://github.com/guithepc/hub-acelera.git
cd hub-acelera
npm ci
npm run dev
```

Abra http://localhost:3000.

## Comandos

| Comando            | O que faz                                                           |
| ------------------ | ------------------------------------------------------------------- |
| `npm run dev`      | Sobe o site em modo de desenvolvimento.                             |
| `npm run build`    | Gera o site estático na pasta `out/`.                               |
| `npm run preview`  | Serve a pasta `out/` em http://localhost:3100.                      |
| `npm run check`    | Roda lint, typecheck, formatação e testes unitários.                |
| `npm run test:e2e` | Roda os testes de ponta a ponta contra o build. Rode o build antes. |
| `npm run format`   | Formata o código com Prettier.                                      |

Na primeira vez, os testes de ponta a ponta pedem o navegador:

```bash
npx playwright install chromium
```

## Stack

- Next.js com App Router, exportado como site estático (`output: "export"`).
- TypeScript estrito, ESLint com regras `strictTypeChecked` e Prettier.
- Tailwind CSS e Motion para as animações.
- Vitest para testes unitários e Playwright para testes de ponta a ponta.

## Como contribuir

Todo trabalho entra por pull request. O CI roda lint, typecheck, formatação, testes, build e testes de ponta a ponta. Um PR só entra com o CI verde.
