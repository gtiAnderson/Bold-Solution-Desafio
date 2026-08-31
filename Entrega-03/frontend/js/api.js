const API_BASE_URL = 'https://dev.boldsolution.com.br/webhook/';

async function request(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      ...options.headers
    }
  };

  if (options.body) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.mensagem || 'Erro na requisição');
    error.status = response.status;
  throw error;
}

  return data;
}

export const api = {
  buscarCliente: (id) =>
    request(`389e4f77-91b4-4002-8796-4d990471f457/clientes/${id}`),

  criarCliente: (cliente) =>
    request('cliente', {
      method: 'POST',
      body: JSON.stringify(cliente)
    }),

  excluirCliente: (id) =>
    request(`b6fa795a-dd40-415c-ae11-62e24a99dfdd/clientes/${id}`, {
      method: 'DELETE'
    }),

  criarTicket: (ticket) =>
    request('tickets', {
      method: 'POST',
      body: JSON.stringify(ticket)
    }),

  listarTickets: (filtros = {}) => {
    const params = new URLSearchParams();

    if (filtros.status) {
      params.append('status', filtros.status);
    }

    if (filtros.prioridade) {
      params.append('prioridade', filtros.prioridade);
    }

    const query = params.toString();

    return request(`tickets${query ? `?${query}` : ''}`);
  },

  buscarTicket: (id) =>
    request(`01e05f16-1b04-47d1-b206-10044b7ac4cf/tickets/${id}`),

  alterarStatus: (id, status) =>
    request(`3cbcc487-2e16-4ffd-b838-6995b9c6ec40/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  excluirTicket: (id) =>
    request(`b6fa795a-dd40-415c-ae11-62e24a99dfdd/tickets/${id}`, {
      method: 'DELETE'
    }),

  criarInteracao: (id, mensagem, tipo = 'mensagem') =>
    request(`3cbcc487-2e16-4ffd-b838-6995b9c6ec40/tickets/${id}/interacoes`, {
      method: 'POST',
      body: JSON.stringify({
        mensagem,
        tipo
      })
    })
};