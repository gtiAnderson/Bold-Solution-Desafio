# Sistema de Tickets - Frontend

Frontend para gerenciamento de clientes e tickets, desenvolvido com HTML5, CSS3, JavaScript ES6+ e TailwindCSS.

## Características

- ✅ Interface moderna e responsiva
- ✅ Navegação SPA sem recarga de página
- ✅ Gerenciamento de clientes (CRUD)
- ✅ Gerenciamento de tickets (CRUD)
- ✅ Filtros por status e prioridade
- ✅ Histórico de interações
- ✅ Validação de formulários
- ✅ Estados de loading e vazio

## Estrutura do Projeto

```
frontend/
├── index.html          # HTML principal
├── css/
│   └── styles.css      # Estilos customizados
├── js/
│   ├── api.js         # Chamadas HTTP
│   ├── app.js         # Aplicação principal e navegação
│   ├── clientes.js    # Interface de clientes
│   ├── tickets.js     # Interface de tickets
│   └── README.md
└── README.md
```

## Tecnologias

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos customizados + TailwindCSS via CDN
- **JavaScript ES6+**: Módulos ES6, async/await
- **Fetch API**: Requisições HTTP
- **TailwindCSS**: Framework CSS utility-first

## Como Usar

### 1. Abrir a Aplicação

Simplesmente abra o arquivo `index.html` em um navegador moderno.

```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

Ou abra com um servidor local (recomendado):

```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server

# Usando VS Code
# Instale a extensão "Live Server" e clique em "Go Live"
```

Depois acesse: `http://localhost:8000` (ou a porta indicada)

### 2. Navegação

- **Sidebar**: Navegue entre "Chamados" e "Clientes"
- **Chamados**: Visualize, crie, filtre e gerencie tickets
- **Clientes**: Visualize e crie clientes

## Funcionalidades

### Clientes

- ✅ Listar clientes com nome, e-mail e telefone
- ✅ Criar novo cliente (validação de e-mail)
- ✅ Excluir cliente (com confirmação)
- ✅ Estado vazio quando nenhum cliente existe

### Chamados

- ✅ Listar todos os tickets
- ✅ Filtrar por status (aberto, em_atendimento, aguardando_cliente, resolvido, cancelado)
- ✅ Filtrar por prioridade (baixa, media, alta, urgente)
- ✅ Filtros combinados
- ✅ Criar novo ticket
- ✅ Ver detalhes completos do ticket
- ✅ Alterar status do ticket
- ✅ Histórico de interações
- ✅ Adicionar novas interações/mensagens
- ✅ Excluir ticket (com confirmação)
- ✅ Badges visuais para status e prioridade
- ✅ Estado vazio quando nenhum ticket existe

## API

A aplicação se conecta à seguinte API:

**Base URL**: `https://dev.boldsolution.com.br/webhook`

### Endpoints

#### Clientes
- `GET /clientes` - Listar clientes
- `POST /clientes` - Criar cliente
- `DELETE /clientes/:id` - Deletar cliente

#### Tickets
- `GET /tickets` - Listar tickets
- `GET /tickets?status=aberto` - Filtrar por status
- `GET /tickets?prioridade=alta` - Filtrar por prioridade
- `GET /tickets/:id` - Obter detalhes do ticket
- `POST /tickets` - Criar ticket
- `PATCH /tickets/:id/status` - Alterar status
- `DELETE /tickets/:id` - Deletar ticket

#### Interações
- `POST /tickets/:id/interacoes` - Adicionar interação

## Validações

### Clientes

- Nome obrigatório
- E-mail obrigatório e válido
- Telefone obrigatório

### Tickets

- Cliente obrigatório
- Título obrigatório
- Descrição obrigatória
- Prioridade obrigatória

### Interações

- Mensagem obrigatória

### Loading

Exibe "Carregando..." durante requisições

### Empty State

- Clientes: "Nenhum cliente cadastrado."
- Tickets: "Nenhum chamado encontrado."
- Interações: "Este ticket ainda não possui interações."

## Acessibilidade

- ✅ Labels associados aos inputs
- ✅ Buttons reais (não divs)
- ✅ Navegação por teclado
- ✅ ESC para fechar modais
- ✅ Focus visível
- ✅ Contraste adequado
- ✅ ARIA labels quando necessário

## Segurança

- ✅ Escape de HTML para prevenir XSS
- ✅ Validação de entrada no frontend
- ✅ Sem armazenamento de dados sensíveis
- ✅ Uso de textContent em vez de innerHTML com dados da API

## Suporte a Navegadores

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependências

Nenhuma dependência externa! A aplicação usa:

- Fetch API (nativa)
- ES6 Modules (nativa)
- TailwindCSS via CDN

## Estrutura de Módulos

### api.js

Centraliza todas as requisições HTTP com a função `request()` genérica.

### app.js

Gerencia:
- Inicialização
- Navegação entre views
- Modais e toasts
- Funções de formatação
- Validações globais

### clientes.js

Gerencia:
- Interface de clientes
- Listagem, criação e exclusão
- Modal de novo cliente

### tickets.js

Gerencia:
- Interface de tickets
- Listagem, filtros, criação, exclusão
- Detalhes, alteração de status
- Histórico de interações

## Debugging

Abra o DevTools (F12) para ver:

- Logs de erro no console
- Requisições de rede na aba Network
- DOM Inspector

## Troubleshooting

### Erro 404 ao carregar a página

Certifique-se de estar abrindo a página de um servidor local (não por file://)

### API retorna erro 

Verifique:
1. URL base está correta em `js/api.js`
2. Rede está conectada
3. Servidor da API está ativo
4. Dados enviados estão válidos

### Módulos não carregam

Certifique-se de que:
1. Está usando um servidor HTTP
2. Browser suporta ES6 modules
3. Não há erros no console

## Performance

- Sem frameworks pesados
- Sem build step
- Carregamento instantâneo
- Requisições otimizadas

## Créditos

Desenvolvido seguindo as especificações do "Desafio Desenvolvedor FullStack"

## Licença

Propriedade da Bold Solution
