import { api } from './api.js';
import { openModal, closeModal, showToast, formatStatus, formatPriority, formatDate, truncate } from './app.js';

const ticketsTable = document.getElementById('tickets-table');
const ticketsTbody = document.getElementById('tickets-tbody');
const ticketsLoading = document.getElementById('tickets-loading');
const ticketsEmpty = document.getElementById('tickets-empty');
const filterStatus = document.getElementById('filter-status');
const filterPrioridade = document.getElementById('filter-prioridade');
const btnFiltrar = document.getElementById('btn-filtrar');

let tickets = [];

export async function initTicketsUI() {
  try {
    await loadTickets();

    if (!btnFiltrar.hasListener) {
      btnFiltrar.addEventListener('click', loadTickets);
      btnFiltrar.hasListener = true;
    }
  } catch (error) {
    console.error('Erro ao inicializar tickets:', error);
    showToast('Não foi possível carregar os tickets.', 'error');
  }
}

async function loadTickets() {
  try {
    ticketsLoading.classList.remove('hidden');
    ticketsTable.classList.add('hidden');
    ticketsEmpty.classList.add('hidden');

    const status = filterStatus.value;
    const prioridade = filterPrioridade.value;

    const filtros = {};
    if (status) filtros.status = status;
    if (prioridade) filtros.prioridade = prioridade;

    tickets = await api.listarTickets(filtros);

    if (tickets.length === 0) {
      showEmptyState();
    } else {
      renderTicketsTable();
    }
  } catch (error) {
    console.error('Erro ao carregar tickets:', error);
    showToast('Não foi possível carregar os tickets.', 'error');
    ticketsEmpty.classList.remove('hidden');
  } finally {
    ticketsLoading.classList.add('hidden');
  }
}

function renderTicketsTable() {
  ticketsTbody.innerHTML = '';

  tickets.forEach(ticket => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';

    row.innerHTML = `
      <td class="px-6 py-4 text-sm font-medium text-gray-900">${escapeHtml(ticket.protocolo || `TCK-${ticket.id}`)}</td>
      <td class="px-6 py-4 text-sm text-gray-900">${escapeHtml(truncate(ticket.titulo, 30))}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(String(ticket.cliente_id))}</td>
      <td class="px-6 py-4 text-sm">
        <span class="badge badge-status-${ticket.status}">${formatStatus(ticket.status)}</span>
      </td>
      <td class="px-6 py-4 text-sm">
        <span class="badge badge-prioridade-${ticket.prioridade}">${formatPriority(ticket.prioridade)}</span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-600">${formatDate(ticket.criado_em)}</td>
      <td class="px-6 py-4 text-sm space-x-3">
        <button class="btn-detalhes-ticket text-blue-600 hover:text-blue-800 font-medium transition-colors" data-id="${ticket.id}">
          Detalhes
        </button>
        <button class="btn-excluir-ticket text-red-600 hover:text-red-800 font-medium transition-colors" data-id="${ticket.id}">
          Excluir
        </button>
      </td>
    `;

    const btnDetalhes = row.querySelector('.btn-detalhes-ticket');
    const btnExcluir = row.querySelector('.btn-excluir-ticket');

    btnDetalhes.addEventListener('click', () => showTicketDetalhes(ticket.id));
    btnExcluir.addEventListener('click', () => showConfirmDeleteTicket(ticket));

    ticketsTbody.appendChild(row);
  });

  ticketsTable.classList.remove('hidden');
  ticketsEmpty.classList.add('hidden');
}

function showEmptyState() {
  ticketsTable.classList.add('hidden');
  ticketsEmpty.classList.remove('hidden');
}

export function showNovoTicketModal() {
  const html = `
    <div class="modal-header">
      <h2 class="modal-title">Novo Chamado</h2>
      <button class="modal-close-btn" data-close type="button" aria-label="Fechar">×</button>
    </div>
    <div class="modal-body">
      <form id="form-novo-ticket" class="space-y-4">
        <div class="form-group">
          <label for="ticket-cliente">ID do Cliente *</label>
          <input type="number" id="ticket-cliente" name="cliente_id" required autofocus>
          <span class="error-text hidden" id="error-cliente_id"></span>
        </div>

        <div class="form-group">
          <label for="ticket-titulo">Título *</label>
          <input type="text" id="ticket-titulo" name="titulo" required>
          <span class="error-text hidden" id="error-titulo"></span>
        </div>

        <div class="form-group">
          <label for="ticket-descricao">Descrição *</label>
          <textarea id="ticket-descricao" name="descricao" required></textarea>
          <span class="error-text hidden" id="error-descricao"></span>
        </div>

        <div class="form-group">
          <label for="ticket-prioridade">Prioridade *</label>
          <select id="ticket-prioridade" name="prioridade" required>
            <option value="">Selecione uma prioridade</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
          <span class="error-text hidden" id="error-prioridade"></span>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" id="btn-cancelar-ticket">Cancelar</button>
      <button type="button" class="btn btn-primary" id="btn-criar-ticket">
        <span id="btn-text">Abrir Chamado</span>
        <span id="btn-spinner" class="hidden spinner"></span>
      </button>
    </div>
  `;

  openModal(html);

  const form = document.getElementById('form-novo-ticket');
  const btnCancelar = document.getElementById('btn-cancelar-ticket');
  const btnCriar = document.getElementById('btn-criar-ticket');
  const closeBtn = document.querySelector('[data-close]');

  btnCancelar.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  btnCriar.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleCriarTicket(form, btnCriar);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCriarTicket(form, btnCriar);
  });
}

async function handleCriarTicket(form, btn) {
  document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error-input'));

  const cliente_id = parseInt(document.getElementById('ticket-cliente').value);
  const titulo = document.getElementById('ticket-titulo').value.trim();
  const descricao = document.getElementById('ticket-descricao').value.trim();
  const prioridade = document.getElementById('ticket-prioridade').value;

  let hasError = false;

  if (!cliente_id) {
    showTicketError('error-cliente_id', 'Cliente é obrigatório');
    hasError = true;
  }

  if (!titulo) {
    showTicketError('error-titulo', 'Título é obrigatório');
    hasError = true;
  }

  if (!descricao) {
    showTicketError('error-descricao', 'Descrição é obrigatória');
    hasError = true;
  }

  if (!prioridade) {
    showTicketError('error-prioridade', 'Prioridade é obrigatória');
    hasError = true;
  }

  if (hasError) return;

  btn.disabled = true;
  document.getElementById('btn-text').classList.add('hidden');
  document.getElementById('btn-spinner').classList.remove('hidden');

  try {
    await api.criarTicket({
      cliente_id,
      titulo,
      descricao,
      prioridade
    });

    showToast('Ticket criado com sucesso.');
    closeModal();
    await loadTickets();
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    showToast('Não foi possível criar o ticket.', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('btn-text').classList.remove('hidden');
    document.getElementById('btn-spinner').classList.add('hidden');
  }
}

async function showTicketDetalhes(ticketId) {
  try {
    const ticket = await api.buscarTicket(ticketId);

    const interacoesHtml = renderInteracoes(ticket.interacoes || []);

    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Ticket #${ticket.id}</h2>
        <button class="modal-close-btn" data-close type="button" aria-label="Fechar">×</button>
      </div>
      <div class="modal-body space-y-6">
        <div>
          <p class="text-sm text-gray-600">Protocolo</p>
          <p class="text-lg font-semibold text-gray-900">${escapeHtml(ticket.protocolo || `TCK-${ticket.id}`)}</p>
        </div>

        <div class="space-y-2">
          <p class="text-sm text-gray-600">Dados do Cliente</p>
          <div class="bg-gray-50 p-3 rounded-lg">
            <p class="font-medium text-gray-900">${escapeHtml(String(`ID: ${ticket.cliente_id}`))}</p>
            <p class="font-medium text-gray-900">${escapeHtml(String(`Email: ${ticket.cliente_email}`))}</p>
            <p class="font-medium text-gray-900">${escapeHtml(String(`Nome: ${ticket.cliente_nome}`))}</p>
            <p class="font-medium text-gray-900">${escapeHtml(String(`Telefone: ${ticket.cliente_telefone}`))}</p>
          </div>
        </div>

        <div>
          <p class="text-sm text-gray-600">Título</p>
          <p class="font-medium text-gray-900">${escapeHtml(ticket.titulo)}</p>
        </div>

        <div>
          <p class="text-sm text-gray-600">Descrição</p>
          <p class="text-gray-700 whitespace-pre-wrap">${escapeHtml(ticket.descricao)}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Prioridade</p>
            <p class="mt-1">
              <span class="badge badge-prioridade-${ticket.prioridade}">${formatPriority(ticket.prioridade)}</span>
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-600">Status</p>
            <select id="status-select" class="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" data-ticket-id="${ticket.id}">
              <option value="aberto" ${ticket.status === 'aberto' ? 'selected' : ''}>Aberto</option>
              <option value="em_atendimento" ${ticket.status === 'em_atendimento' ? 'selected' : ''}>Em atendimento</option>
              <option value="aguardando_cliente" ${ticket.status === 'aguardando_cliente' ? 'selected' : ''}>Aguardando cliente</option>
              <option value="resolvido" ${ticket.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
              <option value="cancelado" ${ticket.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
            <span id="status-loading" class="hidden text-xs text-gray-600 mt-1 block">Salvando...</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p>Criado em</p>
            <p>${formatDate(ticket.criado_em)}</p>
          </div>
          <div>
            <p>Atualizado em</p>
            <p>${formatDate(ticket.atualizado_em)}</p>
          </div>
        </div>

        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Histórico de Interações</h3>
          <div id="interacoes-container">
            ${interacoesHtml}
          </div>
        </div>

        <div class="border-t pt-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Nova Mensagem</h3>
          <form id="form-nova-interacao" class="space-y-4">
            <div class="form-group">
              <label for="interacao-mensagem">Mensagem *</label>
              <textarea id="interacao-mensagem" name="mensagem" required></textarea>
              <span class="error-text hidden" id="error-mensagem"></span>
            </div>
          </form>
          <button type="button" class="btn btn-primary" id="btn-enviar-interacao">
            <span id="interacao-btn-text">Enviar Mensagem</span>
            <span id="interacao-btn-spinner" class="hidden spinner"></span>
          </button>
        </div>
      </div>
    `;

    openModal(html);

    const statusSelect = document.getElementById('status-select');
    const btnEnviarInteracao = document.getElementById('btn-enviar-interacao');
    const closeBtn = document.querySelector('[data-close]');

    closeBtn.addEventListener('click', closeModal);

    statusSelect.addEventListener('change', async () => {
      await handleStatusChange(ticket.id, statusSelect);
    });

    btnEnviarInteracao.addEventListener('click', async () => {
      await handleNovaInteracao(ticket.id, btnEnviarInteracao);
    });
  } catch (error) {
    console.error('Erro ao carregar detalhes do ticket:', error);
    showToast('Não foi possível carregar os detalhes do ticket.', 'error');
  }
}

async function handleStatusChange(ticketId, selectElement) {
  const novoStatus = selectElement.value;
  const oldStatus = selectElement.dataset.oldStatus || selectElement.value;
  selectElement.dataset.oldStatus = oldStatus;

  const statusLoadingEl = document.getElementById('status-loading');
  selectElement.disabled = true;
  statusLoadingEl.classList.remove('hidden');

  try {
    await api.alterarStatus(ticketId, novoStatus);
    showToast('Status atualizado com sucesso.');
    selectElement.dataset.oldStatus = novoStatus;
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    showToast('Não foi possível alterar o status.', 'error');
    selectElement.value = oldStatus;
  } finally {
    selectElement.disabled = false;
    statusLoadingEl.classList.add('hidden');
  }
}

async function handleNovaInteracao(ticketId, btn) {
  const mensagemEl = document.getElementById('interacao-mensagem');
  const errorEl = document.getElementById('error-mensagem');
  const mensagem = mensagemEl.value.trim();

  if (!mensagem) {
    errorEl.textContent = 'Mensagem é obrigatória';
    errorEl.classList.remove('hidden');
    return;
  }

  errorEl.classList.add('hidden');

  btn.disabled = true;
  document.getElementById('interacao-btn-text').classList.add('hidden');
  document.getElementById('interacao-btn-spinner').classList.remove('hidden');

  try {
    await api.criarInteracao(ticketId, mensagem, 'mensagem');
    showToast('Mensagem enviada com sucesso.');
    mensagemEl.value = '';

    setTimeout(() => {
      showTicketDetalhes(ticketId);
    }, 500);
  } catch (error) {
    console.error('Erro ao enviar interacao:', error);
    showToast('Não foi possível enviar a mensagem.', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('interacao-btn-text').classList.remove('hidden');
    document.getElementById('interacao-btn-spinner').classList.add('hidden');
  }
}

function renderInteracoes(interacoes) {
  if (!interacoes || interacoes.length === 0) {
    return '<p class="text-gray-600">Este ticket ainda não possui interações.</p>';
  }

  return `
    <div class="timeline">
      ${interacoes.map((interacao, index) => `
        <div class="timeline-item">
          <div class="timeline-dot">${index + 1}</div>
          <div class="timeline-content">
            <p class="timeline-date">${formatDate(interacao.created_at)}</p>
            <div class="timeline-message">${escapeHtml(interacao.mensagem)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function showConfirmDeleteTicket(ticket) {
  const html = `
    <div class="modal-header">
      <h2 class="modal-title">Confirmar Exclusão</h2>
      <button class="modal-close-btn" data-close type="button" aria-label="Fechar">×</button>
    </div>
    <div class="modal-body">
      <p class="text-gray-700 mb-4">
        Tem certeza que deseja excluir o chamado <strong>${escapeHtml(ticket.titulo)}</strong>?
      </p>
      <p class="text-sm text-gray-600">
        Esta ação não pode ser desfeita.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" id="btn-cancelar-delete-ticket">Cancelar</button>
      <button type="button" class="btn btn-danger" id="btn-confirmar-delete-ticket">
        <span id="btn-delete-ticket-text">Excluir</span>
        <span id="btn-delete-ticket-spinner" class="hidden spinner"></span>
      </button>
    </div>
  `;

  openModal(html);

  const btnCancelar = document.getElementById('btn-cancelar-delete-ticket');
  const btnConfirmar = document.getElementById('btn-confirmar-delete-ticket');
  const closeBtn = document.querySelector('[data-close]');

  btnCancelar.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  btnConfirmar.addEventListener('click', async () => {
    btnConfirmar.disabled = true;
    document.getElementById('btn-delete-ticket-text').classList.add('hidden');
    document.getElementById('btn-delete-ticket-spinner').classList.remove('hidden');

    try {
      await api.excluirTicket(ticket.id);
      showToast('Ticket removido com sucesso.');
      closeModal();
      await loadTickets();
    } catch (error) {
      console.error('Erro ao excluir ticket:', error);
      showToast('Não foi possível excluir o ticket.', 'error');
      btnConfirmar.disabled = false;
      document.getElementById('btn-delete-ticket-text').classList.remove('hidden');
      document.getElementById('btn-delete-ticket-spinner').classList.add('hidden');
    }
  });
}

function showTicketError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  const inputName = elementId.replace('error-', '');
  const inputEl = document.getElementById(`ticket-${inputName}`);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  if (inputEl) {
    inputEl.classList.add('error-input');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
