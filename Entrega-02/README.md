# Entrega - Etapa 2
## Sistema de Atendimento / Gestão de Tickets

## 1. Objetivo

Descrever a implementação realizada na Etapa 2, contemplando a evolução do sistema de gestão de tickets com as seguintes funcionalidades:

- Consulta detalhada do chamado;
- Registro de interações;
- Atualização de status do ticket;
- Exclusão de ticket;
- Exclusão de cliente.

## 2. Funcionalidades implementadas

### ✅ Consulta detalhada do chamado — `GET /tickets/:id`

- Busca dos dados principais do ticket integrados aos dados do cliente.
- Consulta e retorno do histórico completo de interações em ordem cronológica.
- Tratamento de erro com status `404` caso o ID não exista no banco.

### ✅ Registro de interações — `POST /tickets/:id/interacoes`

- Validação de campos obrigatórios (`ticket_id` e `mensagem`).
- Verificação prévia da existência do chamado antes da inserção (`404` se não existir).
- Persistência da mensagem na tabela `interacoes` vinculada ao ticket.

### ✅ Atualização de status — `PATCH /tickets/:id/status`

- Validação estrita para aceitar apenas os valores permitidos: `aberto`, `em_atendimento`, `aguardando_cliente`, `resolvido`, `cancelado`.
- Retorno de erro `400` para status inválidos e `404` para ticket inexistente.
- Atualização da data de modificação (`atualizado_em`) no banco de dados.

### ✅ Exclusão de ticket — `DELETE /tickets/:id`

- Remoção do chamado e limpeza automática do histórico de interações via `ON DELETE CASCADE`.
- Retorno de status `404` caso o ticket não seja encontrado e `200` em caso de sucesso.

### ✅ Exclusão de cliente — `DELETE /clientes/:id`

- Remoção do cliente com eliminação em cascata de todos os tickets e interações vinculados.
- Tratamento adequado para IDs inexistentes (`404`).

## 3. Resumo das rotas

| Método | Rota                          | Descrição                                      |
|--------|-------------------------------|-------------------------------------------------|
| GET    | `/tickets/:id`                | Consulta detalhada do ticket + histórico         |
| POST   | `/tickets/:id/interacoes`     | Registra uma nova interação no ticket            |
| PATCH  | `/tickets/:id/status`         | Atualiza o status do ticket                      |
| DELETE | `/tickets/:id`                | Remove um ticket e suas interações               |
| DELETE | `/clientes/:id`               | Remove um cliente e todos os dados vinculados    |

## 4. Tratamento de erros

Todas as rotas seguem o padrão de resposta já estabelecido na Etapa 1:

- `400 Bad Request` — dados inválidos ou ausentes na requisição;
- `404 Not Found` — recurso (ticket ou cliente) não encontrado;
- `200 OK` — operação realizada com sucesso;
- `201 Created` — recurso criado com sucesso (quando aplicável).

## 5. Integridade referencial

As exclusões em cascata (`ON DELETE CASCADE`) garantem que não existam registros órfãos no banco:

- Ao excluir um **ticket**, todas as suas **interações** são removidas automaticamente.
- Ao excluir um **cliente**, todos os seus **tickets** e as **interações** vinculadas a eles são removidos automaticamente.