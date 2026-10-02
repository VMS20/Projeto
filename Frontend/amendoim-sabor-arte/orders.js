(() => {
  const { request, money } = Commerce;
  const form = document.getElementById('order-form');
  const quantity = document.getElementById('quantidade');
  const choice = document.getElementById('product-choice');
  const button = form.querySelector('.btn-finalizar');
  const status = document.getElementById('order-status');
  let catalog, busy = false, completed = false;
  const requestId = crypto.randomUUID();
  const product = () => catalog?.products.find(product => product.id === choice.value);
  const field = id => document.getElementById(id).value;
  function updatePreview() {
    const selected = product();
    const count = quantity.validity.valid && quantity.value !== '' ? Number(quantity.value) : null;
    const delivery = document.getElementById('entrega').checked;
    const subtotal = selected && count ? money(count * selected.priceCents) : '—';
    const deliveryCents = delivery ? catalog?.deliveryCents || 0 : 0;
    document.querySelector('.subtotal strong').textContent = subtotal;
    const cells = document.querySelectorAll('.tabela-resumo tbody td');
    cells[0].textContent = selected?.name || 'Selecione um produto';
    cells[1].textContent = count || '—';
    cells[2].textContent = subtotal;
    const totals = document.querySelectorAll('.valores strong');
    totals[0].textContent = subtotal;
    totals[1].textContent = catalog ? money(deliveryCents) : '—';
    totals[3].textContent = selected && count ? money(count * selected.priceCents + deliveryCents) : '—';
    if (selected) {
      document.getElementById('product-unit').textContent = `Embalagem: ${selected.unit}`;
      document.getElementById('product-price').textContent = money(selected.priceCents);
      document.getElementById('stock-notice').textContent = selected.available ? `${selected.available} unidades disponíveis.` : 'Produto sem estoque no momento.';
    }
    document.getElementById('troco').disabled = document.querySelector('[name="pagamento"]:checked').value !== 'dinheiro';
    for (const id of ['cep', 'rua', 'numero-endereco', 'bairro', 'cidade', 'estado', 'complemento', 'referencia']) document.getElementById(id).disabled = !delivery;
    button.disabled = busy || completed || !selected || !count || count > selected.available;
  }
  async function loadCatalog() {
    catalog = await request('/api/catalog');
    const previous = choice.value;
    choice.replaceChildren(...catalog.products.map(product => new Option(`${product.name} — ${money(product.priceCents)}`, product.id)));
    if (catalog.products.some(product => product.id === previous)) choice.value = previous;
    if (!catalog.products.length) document.getElementById('stock-notice').textContent = 'Nenhum produto disponível no momento.';
    updatePreview();
  }
  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    const selected = product();
    const method = document.querySelector('[name="pagamento"]:checked').value;
    const change = field('troco').trim().replace(/^R\$\s*/, '').replace(',', '.');
    if (method === 'dinheiro' && change && !/^\d+(\.\d{1,2})?$/.test(change)) {
      status.textContent = 'Informe o valor para troco, por exemplo 20,00.'; return;
    }
    const delivery = document.getElementById('entrega').checked;
    const payload = { requestId, terms: document.getElementById('order-terms').checked,
      items: [{ productId: selected.id, quantity: Number(quantity.value), priceCents: selected.priceCents }],
      customer: { name: field('nome'), phone: field('telefone') }, payment: { method, changeForCents: method === 'dinheiro' && change ? Math.round(Number(change) * 100) : null },
      deliveryCents: delivery ? catalog.deliveryCents : 0,
      delivery: { type: delivery ? 'entrega' : 'retirada', address: { zip: field('cep'), state: field('estado'), city: field('cidade'), neighborhood: field('bairro'), street: field('rua'), number: field('numero-endereco'), complement: field('complemento'), reference: field('referencia') } }, notes: field('observacao') };
    busy = true; updatePreview(); button.textContent = 'Enviando pedido…';
    try {
      const { order } = await request('/api/orders', payload);
      completed = true;
      status.textContent = `Pedido #${order.number} recebido! Total: ${money(order.totalCents)}. Acompanhe em Meus pedidos.`;
      const link = document.createElement('a'); link.href = 'meus-pedidos.html'; link.textContent = ' Acompanhar pedido'; status.append(link);
      button.textContent = 'Pedido confirmado';
    } catch (err) {
      status.textContent = err.message;
      button.textContent = 'Tentar novamente';
    } finally { busy = false; updatePreview(); }
  });
  loadCatalog().catch(err => { status.textContent = err.message + ' Recarregue a página para consultar os produtos.'; });
})();
