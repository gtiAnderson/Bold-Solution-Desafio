# Bold Solution - Desafio

Sistema de gerenciamento de tickets, composto por frontend em HTML/CSS/JS, orquestração de API via n8n e persistência de dados em PostgreSQL (Supabase).

## Estrutura do projeto

```
Bold-Solution-Desafio/
│
├── Entrega-01/
├── Entrega-02/
├── Entrega-03/
│   └── frontend/
│       ├── index.html
│       ├── css/
│       └── js/
│
├── n8n/
│   └── workflows/
│
├── database/
│   └── schema.sql
│
├── requests/
│   └── Bold-Solution-Tickets_collection.json
│
└── README.md
```

## Arquitetura

```
                    ┌─────────────────┐
                    │    Frontend     │
                    │ HTML/CSS/JS     │
                    └────────┬────────┘
                             │ HTTP
                             ▼
                    ┌─────────────────┐
                    │      n8n        │
                    │   Webhooks/API  │
                    └───────┬─────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌─────────────────┐    ┌─────────────────┐
       │   PostgreSQL     │    │ Webhook Externo │
       │    Supabase      │    │   Webhook.site  │
       └─────────────────┘    └─────────────────┘
```

O frontend se comunica com o n8n via requisições HTTP. O n8n atua como camada de orquestração da API, realizando validações, operações no banco de dados (PostgreSQL/Supabase) e integrações com serviços HTTP externos (Webhook.site).

## Visão geral

O projeto é um sistema de gerenciamento de tickets, permitindo:

- Cadastro de clientes
- Consulta de cliente por ID
- Criação de tickets
- Consulta/listagem de tickets
- Filtros
- Alteração de status
- Histórico de interações
- Exclusão de tickets
- Exclusão de clientes com cascata
- Integração HTTP externa após alteração de status

## Tecnologias

- HTML5
- CSS3
- JavaScript
- TailwindCSS
- n8n
- PostgreSQL
- Supabase
- GitHub Pages
- Postman
- Webhook.site

### HTML5, CSS3 e JavaScript

Utilizados para a construção do frontend da aplicação, responsável pela interface de cadastro, consulta e gerenciamento de tickets e clientes.

### TailwindCSS

Utilizado para estilização da interface, agilizando o desenvolvimento através de classes utilitárias e garantindo consistência visual.

### n8n

O n8n foi utilizado como camada de orquestração da API, permitindo receber requisições HTTP através de Webhooks, executar validações, realizar operações no banco de dados e integrar o sistema com serviços HTTP externos.

### PostgreSQL

O PostgreSQL foi utilizado para persistência dos dados, garantindo integridade relacional entre clientes, tickets e interações.

### Supabase

O Supabase foi utilizado como provedor de hospedagem do banco de dados PostgreSQL, facilitando o gerenciamento e o acesso à infraestrutura de banco de dados na nuvem.

### GitHub Pages

Utilizado para hospedagem e disponibilização do frontend da aplicação de forma pública e gratuita.

### Bruno

Utilizado para testes e documentação das requisições HTTP realizadas aos Webhooks do n8n.

### Webhook.site

Utilizado como serviço externo para simular e validar a integração HTTP disparada após a alteração de status de um ticket.

### ON DELETE CASCADE

A utilização de `ON DELETE CASCADE` permite que, ao remover um cliente, seus tickets e respectivas interações associadas sejam removidos automaticamente, mantendo a consistência dos dados.

## Como rodar

### Frontend

O frontend está disponível através do GitHub Pages.

Também é possível executá-lo localmente utilizando qualquer servidor HTTP estático.

Exemplo utilizando Live Server:

1. Abra a pasta `Entrega-03/frontend`.
2. Abra `index.html` utilizando o Live Server.
3. A aplicação será carregada no navegador.

### Backend

O backend é executado através de workflows no n8n.

Os workflows devem ser importados no ambiente n8n utilizado pelo projeto.

Após a importação, os Webhooks estarão disponíveis através da URL configurada no ambiente.

### Banco de dados

O banco utilizado é PostgreSQL através do Supabase.

O script de criação das tabelas está disponível em:

```
database/schema.sql
```

### Variáveis de ambiente

O frontend não utiliza variáveis de ambiente em runtime.

A URL base da API é configurada no arquivo:

```
Entrega-03/frontend/js/api.js
```

As credenciais do banco de dados não são utilizadas pelo frontend. A comunicação com o PostgreSQL ocorre exclusivamente através do n8n.