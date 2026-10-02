window.Commerce = {
  money: cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100),
  date: value => value ? new Date(value.length === 10 ? value + 'T12:00:00' : value).toLocaleString('pt-BR', value.length === 10 ? { dateStyle: 'short' } : { dateStyle: 'short', timeStyle: 'short' }) : 'Ainda não agendada',
  labels: { recebido: 'Recebido', preparando: 'Em preparo', pronto: 'Pronto', em_entrega: 'Saiu para entrega', concluido: 'Concluído', cancelado: 'Cancelado', pendente: 'Pendente', pago: 'Recebido', estornado: 'Estornado', pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' },
  escape: value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])),
  async request(url, payload) {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000), ...(payload === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sabor-Request': '1' }, body: JSON.stringify(payload) }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Não foi possível concluir. Tente novamente.');
    return data;
  }
};
