# Entrega - Etapa 1
## Sistema de Gestão de Tickets

## 1. Objetivo

Descrever a implementação realizada na Etapa 1, contemplando:

- Modelagem e criação do banco de dados no Supabase;
- Estrutura das tabelas e relacionamentos;
- Implementação das rotas REST utilizando n8n;
- Validações de entrada;
- Criação e consulta de clientes;
- Criação e consulta de tickets;
- Filtros de tickets por status e prioridade.

## 2. Arquitetura

```
       Cliente
          |
          v
         n8n
          |
          v
       Supabase
```

O n8n é utilizado como camada de API/orquestração, enquanto o Supabase fornece a persistência dos dados.

A integração foi realizada utilizando o nó nativo do Supabase no n8n. Isso está inclusive refletido no workflow exportado, com operações de criação e consulta diretamente nas tabelas `clientes` e `tickets`.

## 3. Modelagem do Banco de Dados

Foram criadas três tabelas principais:

### `clientes`

Responsável pelo cadastro dos clientes.

- `id`
- `nome`
- `email`
- `telefone`
- `criado_em`

O `email` possui restrição `UNIQUE`, evitando cadastros duplicados.

### `tickets`

Responsável pelo armazenamento dos chamados.

- `id`
- `protocolo`
- `cliente_id`
- `titulo`
- `descricao`
- `prioridade`
- `status`
- `criado_em`
- `atualizado_em`

A tabela possui relacionamento com `clientes` através de `cliente_id`, além de restrições para os valores permitidos de prioridade e status.

### `interacoes`

Responsável pelo histórico de interações dos tickets.

- `id`
- `ticket_id`
- `tipo`
- `mensagem`
- `criado_em`

Existe relacionamento com `tickets` através de `ticket_id`.

### Relacionamentos

```
CLIENTES
   │
   │ 1:N
   ▼
TICKETS
   │
   │ 1:N
   ▼
INTERAÇÕES
```

Foi utilizada a estratégia `ON DELETE CASCADE` para evitar registros órfãos quando um cliente ou ticket é removido.

## 4. Rotas implementadas

### `POST /clientes`

Criação de um novo cliente.

**Entrada**

```json
{
  "nome": "Anderson",
  "email": "anderson@email.com",
  "telefone": "7599999999"
}
```

**Fluxo**

```
Webhook
   ↓
Validação dos campos
   ↓
IF
 ┌─┴──────────────┐
 ↓                ↓
Válido          Inválido
 ↓                ↓
Supabase       HTTP 400
 ↓
HTTP 201
```

A validação verifica `nome`, `email` e `telefone`, retornando os campos ausentes quando necessário.

### `GET /clientes/:id`

Consulta um cliente pelo ID.

**Exemplo:**

```
GET /clientes/1
```

O nó Supabase realiza a busca na tabela `clientes` utilizando o `id` recebido pelo parâmetro da rota.

**Respostas**

Encontrado:

```
200 OK
```

```json
{
  "id": 1,
  "nome": "Anderson",
  "email": "anderson@email.com",
  "telefone": "7599999999"
}
```

Não encontrado:

```
404 Not Found
```

```json
{
  "mensagem": "Cliente Não Encontrado"
}
```

O workflow possui tratamento específico para os dois cenários.

## 5. `POST /tickets`

Criação de um novo ticket.

**Entrada**

```json
{
  "cliente_id": 1,
  "titulo": "Problema no acesso",
  "descricao": "Não consigo acessar minha conta",
  "prioridade": "alta"
}
```

**Regras implementadas**

- `cliente_id`, `titulo` e `descricao` são obrigatórios;
- `prioridade` assume `media` quando não informada;
- `status` inicia como `aberto`;
- protocolo é gerado automaticamente;
- protocolo segue o formato:

```
TCK-ANO-TIMESTAMP
```

Essas regras estão implementadas no nó Code do workflow.

**Resposta**

```
201 Created
```

## 6. `GET /tickets`

Responsável pela listagem dos tickets.

```
GET /tickets
```

Também foram implementados filtros opcionais:

```
GET /tickets?status=aberto
GET /tickets?prioridade=alta
GET /tickets?status=aberto&prioridade=alta
```

Como a integração está utilizando o nó Supabase, a busca retorna os registros da tabela `tickets` e um nó Code realiza a filtragem dos resultados conforme os parâmetros recebidos.

A filtragem implementada verifica separadamente `status` e `prioridade`, permitindo utilizar nenhum, um ou ambos os filtros.

A resposta da rota é:

```
200 OK
```

com um array de tickets.
