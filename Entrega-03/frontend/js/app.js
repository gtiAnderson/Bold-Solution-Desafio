import { api } from './api.js';
import { initClientesUI, showNovoClienteModal } from './clientes.js';
import { initTicketsUI, showNovoTicketModal } from './tickets.js';

let currentView = 'tickets';

const navTickets = document.getElementById('nav-tickets');
const navClientes = document.getElementById('nav-clientes');
const ticketsView = document.getElementById('tickets-view');
const clientesView = document.getElementById('clientes-view');
const btnNovoTicket = document.getElementById('btn-novo-ticket');
const btnNovoCliente = document.getElementById('btn-novo-cliente');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

export async function initApp() {
  setupEventListeners();
  await initTicketsUI();
  showTicketsView();
}

function setupEventListeners() {
  navTickets.addEventListener('click', showTicketsView);
  navClientes.addEventListener('click', showClientesView);
  btnNovoTicket.addEventListener('click', showNovoTicketModal);
  btnNovoCliente.addEventListener('click', showNovoClienteModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
      closeModal();
    }
  });

  toast.addEventListener('mouseover', () => {
    clearToastTimeout();
  });

  toast.addEventListener('mouseout', () => {
    scheduleToastClose();
  });
}

export function showTicketsView() {
  currentView = 'tickets';
  ticketsView.classList.remove('hidden');
  clientesView.classList.add('hidden');
  navTickets.classList.add('active');
  navClientes.classList.remove('active');
  initTicketsUI();
}

export function showClientesView() {
  currentView = 'clientes';
  ticketsView.classList.add('hidden');
  clientesView.classList.remove('hidden');
  navTickets.classList.remove('active');
  navClientes.classList.add('active');
  initClientesUI();
}

export function openModal(content) {
  modalContent.innerHTML = content;
  modalOverlay.classList.remove('hidden');
  
  const closeBtn = modalContent.querySelector('[data-close]');
  if (closeBtn) {
    closeBtn.focus();
  }
}

export function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContent.innerHTML = '';
}

let toastTimeout;

export function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  
  const borderElement = toast.querySelector('div');
  if (type === 'success') {
    borderElement.classList.remove('border-red-500');
    borderElement.classList.add('border-green-500');
  } else {
    borderElement.classList.remove('border-green-500');
    borderElement.classList.add('border-red-500');
  }

  toast.classList.remove('hidden');
  scheduleToastClose();
}

function scheduleToastClose() {
  clearToastTimeout();
  toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

function clearToastTimeout() {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
}

export function formatStatus(status) {
  const statusMap = {
    'aberto': 'Aberto',
    'em_atendimento': 'Em atendimento',
    'aguardando_cliente': 'Aguardando cliente',
    'resolvido': 'Resolvido',
    'cancelado': 'Cancelado'
  };
  return statusMap[status] || status;
}

export function formatPriority(priority) {
  const priorityMap = {
    'baixa': 'Baixa',
    'media': 'Média',
    'alta': 'Alta',
    'urgente': 'Urgente'
  };
  return priorityMap[priority] || priority;
}

export function formatDate(dateString) {
  if (!dateString) return '';

  const normalized = String(dateString).trim().replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

//Validando Email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function truncate(text, length = 50) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

document.addEventListener('DOMContentLoaded', initApp);