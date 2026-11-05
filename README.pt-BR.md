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
  page.tsx                   Listagem renderizada no servidor
  tarefas/[id]/page.tsx       Formulário de criação e edição
  api/trpc/[trpc]/route.ts    Endpoint HTTP do tRPC
componentes/
  Tarefas.tsx                 Carrega a primeira página no servidor
  TarefasInfinitas.tsx        Carrega as próximas páginas ao rolar a tela
  Tarefa.tsx                  Uma tarefa: concluir, editar e excluir
  FormularioTarefa.tsx        Formulário de criação e edição
lib/schema-tarefa.ts           Schemas Zod compartilhados
servidor/armazenamento.ts      Armazenamento em memória (um Map)
trpc/                         Roteador, contexto e utilitários
```

### API tRPC

Os procedimentos estão em `trpc/roteadores/aplicacao.ts`.

| Procedimento | Tipo | Entrada | Erros |
| --- | --- | --- | --- |
| `listarTarefas` | query | `{ limite?, cursor? }` → `{ itens, proximoCursor }` | `BAD_REQUEST` |
| `obterTarefa` | query | `{ id }` | `NOT_FOUND` |
| `criarTarefa` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` (por exemplo, título vazio) |
| `atualizarTarefa` | mutation | `{ id, titulo?, descricao?, concluida? }` | `NOT_FOUND`, `BAD_REQUEST` |
| `excluirTarefa` | mutation | `{ id }` | `NOT_FOUND` |

Cada tarefa tem `id` (UUIDv7 gerado pelo servidor), `titulo` (obrigatório, de 1 a 80 caracteres), `descricao` (opcional, até 300 caracteres), `dataCriacao` e `concluida`. O título perde os espaços nas pontas antes da validação; títulos vazios ou compostos apenas por espaços são rejeitados.

## Decisões de implementação

- **Listagem renderizada no servidor.** `componentes/Tarefas.tsx` chama o roteador diretamente por meio de `chamador`, sem uma requisição HTTP adicional. O conteúdo é transmitido dentro de um `<Suspense>` com indicador de carregamento. As primeiras 30 tarefas iniciam uma consulta paginada; um `IntersectionObserver` carrega as próximas páginas quando o fim da lista chega a 1vh da borda inferior da área visível. A distância acompanha o redimensionamento da janela. Há também um botão manual e uma opção para tentar novamente em caso de falha. A paginação por cursor UUIDv7 continua funcionando se a tarefa na divisa entre páginas for excluída.
- **Um schema para cliente e servidor.** `lib/schema-tarefa.ts` valida as entradas no tRPC e no formulário, mantendo as regras consistentes.
- **Criação e edição compartilham página e formulário.** `/tarefas/nova` cria uma tarefa e `/tarefas/<id>` edita uma existente.
- **Retorno visual.** Erros de validação aparecem abaixo dos campos; erros do servidor, no início do formulário. A exclusão é confirmada acima da lista. As mutações invalidam o cache da consulta paginada para atualizar as páginas carregadas. Falhas ao excluir ou atualizar aparecem abaixo da tarefa.
- **Serialização com superjson.** Preserva valores `Date`, como `dataCriacao`, na comunicação entre servidor e cliente.
- **Armazenamento em `globalThis`.** Evita perder as tarefas a cada recarga de módulo durante o desenvolvimento.

## Observações

- **Next.js 16.** O enunciado menciona tanto Next.js 15 quanto “versões mais recentes”. Este projeto usa a versão 16.4.3.
- **Código em português.** Componentes, procedimentos tRPC e campos usam nomes em português: `titulo`, `descricao`, `dataCriacao` e `concluida`. Nomes exigidos pelas bibliotecas e pelo Next.js permanecem no formato original. As rotas são `/tarefas/nova` e `/tarefas/<id>`.
- **Não implementado:** autenticação.

> Esta versão altera os nomes dos procedimentos e campos da API e substitui as rotas `/tasks/*` por `/tarefas/*`. Clientes da API devem ser atualizados em conjunto.

## Versão com código em português

A branch [`refactor/portugues-completo`](https://github.com/zoeleu/task-manager-nextjs-trpc/tree/refactor/portugues-completo) contém a interface, os nomes de componentes e arquivos, os campos e procedimentos da API, as rotas, os comentários e os testes em português. Os nomes exigidos pelas bibliotecas permanecem no formato original.

Essa é uma versão alternativa permanente para quem prefere ler o código em português. Ela é mantida separadamente da `main` e não se destina a ser integrada a ela. Para usar essa versão, execute `git switch refactor/portugues-completo`. Mudanças na versão em português devem ter essa branch como destino das PRs.
