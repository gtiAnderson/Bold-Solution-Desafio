import { api } from './api.js';
import { openModal, closeModal, showToast, validateEmail } from './app.js';

// DOM Elements
const clienteBuscaId = document.getElementById('cliente-busca-id');
const btnBuscarCliente = document.getElementById('btn-buscar-cliente');
const btnNovoCliente = document.getElementById('btn-novo-cliente');
const btnExcluirCliente = document.getElementById('btn-excluir-cliente');
const clientesInicialMsg = document.getElementById('clientes-inicial-msg');
const clientesDetalhesContainer = document.getElementById('clientes-detalhes-container');
const clientesDetalhes = document.getElementById('clientes-detalhes');
const clientesErro = document.getElementById('clientes-erro');
const clientesErroMsg = document.getElementById('clientes-erro-msg');
const clientesLoading = document.getElementById('clientes-loading');

let clienteAtual = null;

// Initialize Clients UI
export async function initClientesUI() {
  // Reset state
  clienteAtual = null;
  clienteBuscaId.value = '';
  clientesInicialMsg.classList.remove('hidden');
  clientesDetalhesContainer.classList.add('hidden');
  clientesErro.classList.add('hidden');
  clientesLoading.classList.add('hidden');

  // Setup event listeners (only once)
  if (!btnBuscarCliente.hasListener) {
    btnBuscarCliente.addEventListener('click', handleBuscarCliente);
    btnNovoCliente.addEventListener('click', showNovoClienteModal);
    btnExcluirCliente.addEventListener('click', showConfirmDeleteCliente);
    clienteBuscaId.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleBuscarCliente();
      }
    });
    btnBuscarCliente.hasListener = true;
  }
}

// Handle Search Client
async function handleBuscarCliente() {
  const id = parseInt(clienteBuscaId.value.trim());

  if (!id || id <= 0) {
    mostrarErro('Por favor, informe um ID válido.');
    return;
  }

  clientesLoading.classList.remove('hidden');
  clientesInicialMsg.classList.add('hidden');
  clientesDetalhesContainer.classList.add('hidden');
  clientesErro.classList.add('hidden');

  try {
    const cliente = await api.buscarCliente(id);
    clienteAtual = cliente;
    exibirDetalhesCliente(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    
    if (error.status === 404) {
      mostrarErro('Cliente não encontrado.');
    } else {
      mostrarErro('Não foi possível buscar o cliente. Tente novamente.');
    }
  } finally {
    clientesLoading.classList.add('hidden');
  }
}

// Display Client Details
function exibirDetalhesCliente(cliente) {
  clientesDetalhes.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <p class="text-sm text-gray-600">ID</p>
        <p class="text-lg font-medium text-gray-900">${escapeHtml(cliente.id)}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Nome</p>
        <p class="text-lg font-medium text-gray-900">${escapeHtml(cliente.nome)}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">E-mail</p>
        <p class="text-lg font-medium text-gray-900">${escapeHtml(cliente.email)}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Telefone</p>
        <p class="text-lg font-medium text-gray-900">${escapeHtml(cliente.telefone)}</p>
      </div>
    </div>
  `;

  clientesDetalhesContainer.classList.remove('hidden');
  clientesErro.classList.add('hidden');
  clientesInicialMsg.classList.add('hidden');
}

// Show Error
function mostrarErro(mensagem) {
  clientesErroMsg.textContent = mensagem;
  clientesErro.classList.remove('hidden');
  clientesDetalhesContainer.classList.add('hidden');
  clientesInicialMsg.classList.add('hidden');
  clienteAtual = null;
}

// Show New Client Modal
export function showNovoClienteModal() {
  const html = `
    <div class="modal-header">
      <h2 class="modal-title">Novo Cliente</h2>
      <button class="modal-close-btn" data-close type="button" aria-label="Fechar">×</button>
    </div>
    <div class="modal-body">
      <form id="form-novo-cliente" class="space-y-4">
        <div class="form-group">
          <label for="cliente-nome">Nome *</label>
          <input type="text" id="cliente-nome" name="nome" required autofocus>
          <span class="error-text hidden" id="error-nome"></span>
        </div>

        <div class="form-group">
          <label for="cliente-email">E-mail *</label>
          <input type="email" id="cliente-email" name="email" required>
          <span class="error-text hidden" id="error-email"></span>
        </div>

        <div class="form-group">
          <label for="cliente-telefone">Telefone *</label>
          <input type="tel" id="cliente-telefone" name="telefone" required>
          <span class="error-text hidden" id="error-telefone"></span>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" id="btn-cancelar-cliente">Cancelar</button>
      <button type="button" class="btn btn-primary" id="btn-cadastrar-cliente">
        <span id="btn-text">Cadastrar</span>
        <span id="btn-spinner" class="hidden spinner"></span>
      </button>
    </div>
  `;

  openModal(html);

  const form = document.getElementById('form-novo-cliente');
  const btnCancelar = document.getElementById('btn-cancelar-cliente');
  const btnCadastrar = document.getElementById('btn-cadastrar-cliente');
  const closeBtn = document.querySelector('[data-close]');

  btnCancelar.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  btnCadastrar.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleCriarCliente(form, btnCadastrar);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCriarCliente(form, btnCadastrar);
  });
}

// Handle Create Client
async function handleCriarCliente(form, btn) {
  // Clear previous errors
  document.querySelectorAll('.error-text').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('input').forEach(el => el.classList.remove('error-input'));

  const nome = document.getElementById('cliente-nome').value.trim();
  const email = document.getElementById('cliente-email').value.trim();
  const telefone = document.getElementById('cliente-telefone').value.trim();

  // Validate
  let hasError = false;

  if (!nome) {
    showError('error-nome', 'Nome é obrigatório');
    hasError = true;
  }

  if (!email) {
    showError('error-email', 'E-mail é obrigatório');
    hasError = true;
  } else if (!validateEmail(email)) {
    showError('error-email', 'E-mail inválido');
    hasError = true;
  }

  if (!telefone) {
    showError('error-telefone', 'Telefone é obrigatório');
    hasError = true;
  }

  if (hasError) return;

  // Set loading state
  btn.disabled = true;
  document.getElementById('btn-text').classList.add('hidden');
  document.getElementById('btn-spinner').classList.remove('hidden');

  try {
    const resposta = await api.criarCliente({
      nome,
      email,
      telefone
    });

    showToast('Cliente cadastrado com sucesso.');
    closeModal();

    // Se a API retornar o ID, preencher o campo de busca e buscar
    if (resposta && resposta.id) {
      clienteBuscaId.value = resposta.id;
      setTimeout(() => {
        handleBuscarCliente();
      }, 500);
    }
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    showToast('Não foi possível cadastrar o cliente.', 'error');
  } finally {
    btn.disabled = false;
    document.getElementById('btn-text').classList.remove('hidden');
    document.getElementById('btn-spinner').classList.add('hidden');
  }
}

// Show Confirm Delete
function showConfirmDeleteCliente() {
  if (!clienteAtual) return;

  const html = `
    <div class="modal-header">
      <h2 class="modal-title">Confirmar Exclusão</h2>
      <button class="modal-close-btn" data-close type="button" aria-label="Fechar">×</button>
    </div>
    <div class="modal-body">
      <p class="text-gray-700 mb-4">
        Tem certeza que deseja excluir o cliente <strong>${escapeHtml(clienteAtual.nome)}</strong>?
      </p>
      <p class="text-sm text-gray-600">
        Esta ação não pode ser desfeita.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" id="btn-cancelar-delete">Cancelar</button>
      <button type="button" class="btn btn-danger" id="btn-confirmar-delete">
        <span id="btn-delete-text">Excluir</span>
        <span id="btn-delete-spinner" class="hidden spinner"></span>
      </button>
    </div>
  `;

  openModal(html);

  const btnCancelar = document.getElementById('btn-cancelar-delete');
  const btnConfirmar = document.getElementById('btn-confirmar-delete');
  const closeBtn = document.querySelector('[data-close]');

  btnCancelar.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  btnConfirmar.addEventListener('click', async () => {
    btnConfirmar.disabled = true;
    document.getElementById('btn-delete-text').classList.add('hidden');
    document.getElementById('btn-delete-spinner').classList.remove('hidden');

    try {
      await api.excluirCliente(clienteAtual.id);
      showToast('Cliente removido com sucesso.');
      closeModal();
      
      // Reset UI state
      clienteAtual = null;
      clienteBuscaId.value = '';
      clientesDetalhesContainer.classList.add('hidden');
      clientesInicialMsg.classList.remove('hidden');
      clientesErro.classList.add('hidden');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      showToast('Não foi possível excluir o cliente.', 'error');
      btnConfirmar.disabled = false;
      document.getElementById('btn-delete-text').classList.remove('hidden');
      document.getElementById('btn-delete-spinner').classList.add('hidden');
    }
  });
}

// Helper: Show Error
function showError(elementId, message) {
  const errorEl = document.getElementById(elementId);
  const inputName = elementId.replace('error-', '');
  const inputEl = document.getElementById(`cliente-${inputName}`);

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  if (inputEl) {
    inputEl.classList.add('error-input');
  }
}

// Helper: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
