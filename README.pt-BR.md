# Gerenciador de tarefas

[Read in English](README.md)

Um gerenciador de tarefas simples, desenvolvido com Next.js e tRPC. As tarefas ficam em memória no servidor e são disponibilizadas por uma API tRPC.

## Como executar

Requer [Bun](https://bun.sh) (o repositório fixa a versão `bun@1.4.4`). npm, pnpm e yarn também devem funcionar.

```bash
bun install
bun dev
```

Depois, acesse [http://localhost:3000](http://localhost:3000).

Execute as verificações com `bun test`, `bun run lint` e `bunx --no-install tsc --noEmit`.

Para gerar e executar a versão de produção: `bun run build && bun start`.

> As tarefas ficam em memória e são perdidas quando o servidor reinicia.

## Como funciona

```text
app/
  page.tsx                 Listagem de tarefas renderizada no servidor
  tasks/[id]/page.tsx      Formulário de criação (/tasks/new) e edição (/tasks/<id>)
  api/trpc/[trpc]/route.ts Endpoint HTTP do tRPC
components/
  Tasks.tsx                Carrega a primeira página no servidor
  InfiniteTasks.tsx        Carrega as próximas páginas ao rolar a tela
  Task.tsx                 Uma tarefa: concluir, editar e excluir
  TaskForm.tsx             Formulário compartilhado de criação e edição
lib/task-schema.ts         Schemas Zod compartilhados entre cliente e servidor
server/store.ts            Armazenamento em memória (um Map)
trpc/                      Configuração do tRPC, roteador, contexto e utilitários
```

### API tRPC

Os procedimentos estão em `trpc/routers/_app.ts`.

| Procedimento | Tipo | Entrada | Erros |
| --- | --- | --- | --- |
| `listTasks` | query | `{ limit?, cursor? }` → `{ items, nextCursor }` | `BAD_REQUEST` |
| `getTask` | query | `{ id }` | `NOT_FOUND` |
| `createTask` | mutation | `{ title, description? }` | `BAD_REQUEST` (por exemplo, título vazio) |
| `updateTask` | mutation | `{ id, title?, description?, completed? }` | `NOT_FOUND`, `BAD_REQUEST` |
| `deleteTask` | mutation | `{ id }` | `NOT_FOUND` |

Cada tarefa tem `id` (UUIDv7 gerado pelo servidor), `title` (obrigatório, de 1 a 80 caracteres), `description` (opcional, até 300 caracteres), `createdAt` e `completed`. O título perde os espaços nas pontas antes da validação; títulos vazios ou compostos apenas por espaços são rejeitados.

## Decisões de implementação

- **Listagem renderizada no servidor.** `components/Tasks.tsx` chama o roteador diretamente por meio de `caller`, sem uma requisição HTTP adicional. O conteúdo é transmitido dentro de um `<Suspense>` com indicador de carregamento. As primeiras 20 tarefas iniciam uma consulta paginada; um `IntersectionObserver` carrega as próximas páginas ao rolar a tela. Há também um botão manual e uma opção para tentar novamente em caso de falha. A paginação por cursor UUIDv7 continua funcionando se a tarefa na divisa entre páginas for excluída.
- **Um schema para cliente e servidor.** `lib/task-schema.ts` valida as entradas no tRPC e no formulário, mantendo as regras consistentes.
- **Criação e edição compartilham página e formulário.** `/tasks/new` cria uma tarefa e `/tasks/<id>` edita uma existente.
- **Retorno visual.** Erros de validação aparecem abaixo dos campos; erros do servidor, no início do formulário. A exclusão é confirmada acima da lista. As mutações invalidam o cache da consulta paginada para atualizar as páginas carregadas. Falhas ao excluir ou atualizar aparecem abaixo da tarefa.
- **Serialização com superjson.** Preserva valores `Date`, como `createdAt`, na comunicação entre servidor e cliente.
- **Armazenamento em `globalThis`.** Evita perder as tarefas a cada recarga de módulo durante o desenvolvimento.

## Observações

- **Next.js 16.** O enunciado menciona tanto Next.js 15 quanto “versões mais recentes”. Este projeto usa a versão 16.4.3.
- **Campos em inglês.** O enunciado usa `titulo`, `descricao` e `dataCriacao`; o projeto usa `title`, `description` e `createdAt` para manter o código em um único idioma. O campo `completed` permite marcar tarefas como concluídas.
- **Não implementado:** autenticação.
