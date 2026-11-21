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

## Deploy

O site vira uma imagem Docker com nginx, publicada atrás do Traefik.

No servidor, dentro da pasta do repo:

```bash
git pull
HUB_DOMAIN=hub.exemplo.com docker compose up -d --build
```

| Variável               | Para que serve                               | Padrão        |
| ---------------------- | -------------------------------------------- | ------------- |
| `HUB_DOMAIN`           | Domínio público do site. Obrigatória.        | sem padrão    |
| `TRAEFIK_NETWORK`      | Rede Docker externa em que o Traefik escuta. | `traefik`     |
| `TRAEFIK_ENTRYPOINT`   | Entrypoint HTTPS do Traefik.                 | `websecure`   |
| `TRAEFIK_CERTRESOLVER` | Resolvedor de certificado do Traefik.        | `letsencrypt` |

Antes do primeiro deploy, confira os três nomes do Traefik no servidor (`docker network ls` e a configuração do Traefik) e aponte o DNS do domínio para o servidor.

Para testar a imagem na sua máquina, sem Traefik:

```bash
docker build --build-arg SITE_URL=http://localhost:3300 -t hub-acelera:local .
docker run --rm -p 3300:80 hub-acelera:local
```

O build falha se `SITE_URL` não for informada, porque ela entra nos links de compartilhamento.

## Medir performance

Com o build servido em `npm run preview`:

```bash
npm run measure -- docs/evidence/<ISSUE>/lighthouse   # Lighthouse, 5 rodadas por página, desktop e celular
npm run measure:fps                                   # quadros por segundo do hero, com CPU limitada
```

`measure` precisa do Google Chrome instalado. Ele imprime a mediana e a faixa de cada métrica e grava `resumo.json`. As medições brutas não são versionadas.

## Variáveis de ambiente

| Variável   | Para que serve                                                                 | Padrão                  |
| ---------- | ------------------------------------------------------------------------------ | ----------------------- |
| `SITE_URL` | Endereço público do site. Usado nos links de compartilhamento de cada projeto. | `http://localhost:3100` |

Defina no build de produção: `SITE_URL=https://seu-dominio npm run build`.

## Como adicionar um projeto

Cada projeto é um arquivo JSON em `content/projects/`. O nome do arquivo vira a URL: `content/projects/meu-projeto.json` aparece em `/projetos/meu-projeto/`.

1. Coloque as imagens em `public/projects/meu-projeto/`. A capa é obrigatória.
2. Crie `content/projects/meu-projeto.json`:

```json
{
  "name": "Meu Projeto",
  "tagline": "Uma frase curta, até 120 caracteres.",
  "description": "Um parágrafo sobre o que o projeto faz e para quem.",
  "highlights": ["De 1 a 6 destaques", "Cada um em uma frase"],
  "stack": ["Next.js", "Postgres"],
  "links": { "site": "https://meu-projeto.com", "repo": "https://github.com/voce/meu-projeto" },
  "cover": "/projects/meu-projeto/cover.png",
  "authors": [
    {
      "name": "Seu Nome",
      "role": "Fullstack",
      "contacts": [{ "kind": "github", "url": "https://github.com/voce" }]
    }
  ]
}
```

3. Rode `npm run build`. Se faltar um campo ou uma imagem, o build para e diz qual arquivo e qual campo.

Campos opcionais: `previewVideo` (`.mp4` ou `.webm` curto, usado no preview), `screenshots` (lista de imagens), `order` (número, menor aparece primeiro, padrão 100), e em cada autor `role`, `avatar` e `contacts`.

Em `links`, informe `site`, `repo` ou os dois. Os tipos de contato aceitos são `github`, `linkedin`, `site`, `instagram` e `email`. Publique só contatos que a pessoa já deixa públicos ou que ela autorizou.

O formato completo está em `src/content/schema.ts`.

## Stack

- Next.js com App Router, exportado como site estático (`output: "export"`).
- TypeScript estrito, ESLint com regras `strictTypeChecked` e Prettier.
- Tailwind CSS e Motion para as animações.
- Vitest para testes unitários e Playwright para testes de ponta a ponta.

## Como contribuir

Todo trabalho entra por pull request. O CI roda lint, typecheck, formatação, testes, build e testes de ponta a ponta. Um PR só entra com o CI verde.
