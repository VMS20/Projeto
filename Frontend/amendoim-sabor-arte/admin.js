(() => {
  const { request, money, date, escape: e, labels } = Commerce;
  let data, loading = false;
  const feedback = document.getElementById('feedback');
  function notice(message, isError = false) { feedback.textContent = message; feedback.dataset.error = String(isError); feedback.hidden = false; }
  const badge = status => `<span class="badge" data-status="${e(status)}">${e(labels[status] || status)}</span>`;
  const cents = value => Math.round(Number(value) * 100);
  const inputPrice = value => (value / 100).toFixed(2);
  function orderList() {
    const filter = document.getElementById('order-filter').value;
    const orders = data.orders.filter(order => filter === 'all' || (filter === 'open' ? !['concluido', 'cancelado'].includes(order.status) : order.status === filter));
    document.getElementById('admin-orders').innerHTML = orders.map(order => {
      const next = { recebido: 'preparando', preparando: 'pronto', pronto: order.delivery.type === 'entrega' ? 'em_entrega' : 'concluido', em_entrega: 'concluido' }[order.status];
      const address = order.delivery.address;
      return `<article class="order-row"><div class="order-heading"><h3>Pedido #${order.number} · ${e(order.customer.name)}</h3>${badge(order.status)}</div><div class="order-details"><div><p>${e(date(order.createdAt))} · ${e(order.customer.phone)}</p>${order.items.map(item => `<p>${item.quantity} × ${e(item.name)} (${e(item.unit)}) — ${money(item.subtotalCents)}</p>`).join('')}<p><strong>Total ${money(order.totalCents)}</strong> · Entrega ${money(order.deliveryCents)}</p><p>${e(labels[order.payment.method])} ${badge(order.payment.status)}${order.payment.changeForCents ? ' · Troco para ' + money(order.payment.changeForCents) : ''}</p></div><div><p><strong>${address ? 'Entrega' : 'Retirada no local'}</strong></p>${address ? `<p>${e(address.street)}, ${e(address.number)} · ${e(address.neighborhood)}, ${e(address.city)}/${e(address.state)} · CEP ${e(address.zip)}</p><p>${e(address.complement)} ${e(address.reference)}</p><p>${e(date(order.delivery.scheduledDate))}${order.delivery.window ? ' · ' + e(order.delivery.window) : ''}${order.delivery.driver ? ' · ' + e(order.delivery.driver) : ''}</p>` : ''}${order.notes ? '<p>Observação: ' + e(order.notes) + '</p>' : ''}${order.cancelReason ? '<p>Cancelamento: ' + e(order.cancelReason) + '</p>' : ''}</div></div><div class="order-actions">${order.payment.status === 'pendente' && order.status !== 'cancelado' ? `<button class="secondary" data-order="${e(order.id)}" data-action="payment">Confirmar pagamento recebido</button>` : ''}${next ? `<button class="primary" data-order="${e(order.id)}" data-action="status" data-next="${next}">${{ preparando: 'Iniciar preparo', pronto: 'Marcar como pronto', em_entrega: 'Saiu para entrega', concluido: 'Concluir pedido' }[next]}</button>` : ''}</div>${next ? `<details class="form-disclosure"><summary>Cancelar pedido</summary><form class="inline-form cancel-form" data-order="${e(order.id)}"><label>Motivo<input name="reason" maxlength="160" required></label>${order.payment.status === 'pago' ? '<label><span><input name="refund" type="checkbox" required> Já devolvi o pagamento ao cliente. Registrar estorno no caixa.</span></label>' : ''}<button class="danger">Cancelar e devolver ao estoque</button></form></details>` : ''}</article>`;
    }).join('') || '<p class="empty">Nenhum pedido nesta lista. Novos pedidos aparecem aqui assim que o cliente confirma.</p>';
  }
  function inventory() {
    const low = data.products.filter(product => product.active && product.stock <= product.minimum);
    document.getElementById('inventory-notice').textContent = low.length ? `${low.length} produto(s) no limite de reposição ou sem estoque. Cadastre o saldo real antes de receber pedidos.` : 'O estoque dos produtos ativos está acima do limite de reposição.';
    document.getElementById('inventory-list').innerHTML = data.products.map(product => `<article class="stock-row"><div class="stock-heading"><div><h3>${e(product.name)}</h3><p class="small">${e(product.unit)} · ${money(product.priceCents)} · Mínimo ${product.minimum}${!product.active ? ' · Fora do catálogo' : ''}</p></div><p class="stock-count">${product.stock} unidades${product.stock <= product.minimum ? ' · Repor' : ''}</p></div><form class="inline-form stock-form" data-product="${e(product.id)}"><label>Ajuste de unidades<input name="quantity" type="number" min="-1000000" max="1000000" step="1" placeholder="Ex.: 20 ou -2" required></label><label>Motivo<input name="reason" maxlength="160" placeholder="Produção, perda, correção…" required></label><button class="primary">Registrar ajuste</button></form><details><summary>Preço e disponibilidade</summary><form class="inline-form product-form" data-product="${e(product.id)}"><label>Preço (R$)<input name="price" type="number" min="0.01" max="10000" step="0.01" value="${inputPrice(product.priceCents)}" required></label><label>Estoque mínimo<input name="minimum" type="number" min="0" max="1000000" value="${product.minimum}" required></label><label>Catálogo<select name="active"><option value="true"${product.active ? ' selected' : ''}>Disponível para clientes</option><option value="false"${!product.active ? ' selected' : ''}>Oculto</option></select></label><button class="secondary">Salvar produto</button></form></details></article>`).join('');
    document.getElementById('movements').innerHTML = data.movements.map(movement => `<tr><td>${e(date(movement.at))}</td><td>${e(data.products.find(product => product.id === movement.productId)?.name || 'Produto')}</td><td>${movement.quantity > 0 ? '+' : ''}${movement.quantity}</td><td>${e(movement.reason)}</td></tr>`).join('') || '<tr><td colspan="4">Nenhuma movimentação registrada.</td></tr>';
  }
  function deliveries() {
    const input = document.querySelector('[name="scheduledDate"]'); input.min = data.today.date;
    if (!input.value) input.value = data.today.date;
    document.querySelector('[name="fee"]').value = inputPrice(data.deliveryCents);
    document.getElementById('delivery-groups').innerHTML = data.deliveryGroups.map(group => `<section class="delivery-group"><h3>${e(group.neighborhood)} · ${e(group.city)}/${e(group.state)}</h3><p class="small">${group.scheduledDate ? e(date(group.scheduledDate)) : 'Aguardando agendamento'} · ${group.orders.length} pedido(s)</p>${group.orders.map(order => `<label class="delivery-item"><input type="checkbox" name="order" value="${e(order.id)}"${order.status === 'em_entrega' ? ' disabled' : ''}><span><strong>Pedido #${order.number} · ${e(order.customer.name)}</strong> ${badge(order.status)}<span>${e(order.delivery.address.street)}, ${e(order.delivery.address.number)} · ${e(order.customer.phone)}</span><span>${e(order.delivery.address.complement)} ${e(order.delivery.address.reference)}</span><span>${order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades · ${e(labels[order.payment.method])} · ${money(order.totalCents)} · ${e(labels[order.payment.status])}${order.payment.changeForCents ? ' · Troco para ' + money(order.payment.changeForCents) : ''}</span>${order.delivery.driver ? '<span>Responsável: ' + e(order.delivery.driver) + ' · ' + e(order.delivery.window) + '</span>' : ''}${order.notes ? '<span>Observação: ' + e(order.notes) + '</span>' : ''}</span></label>`).join('')}</section>`).join('') || '<p class="empty">Não há entregas em andamento. Pedidos para retirada ficam na área de pedidos.</p>';
  }
  function dailyTable(summary) {
    return `<div class="table-scroll"><table><caption class="visually-hidden">Fechamento de ${e(date(summary.date))}</caption><thead><tr><th>Pagamento</th><th>Recebido</th><th>Estornado</th><th>Saldo</th></tr></thead><tbody>${summary.payments.map(payment => `<tr><td>${e(labels[payment.method])}</td><td>${money(payment.receivedCents)}</td><td>${money(payment.refundedCents)}</td><td>${money(payment.netCents)}</td></tr>`).join('')}</tbody></table></div><div class="totals-line"><p>Pedidos criados: <strong>${summary.orderCount}</strong></p><p>Recebido: <strong>${money(summary.receivedCents)}</strong></p><p>Estornos: <strong>${money(summary.refundedCents)}</strong></p><p>Saldo do caixa: <strong>${money(summary.netCents)}</strong></p></div>`;
  }
  function closing() {
    document.getElementById('daily-summary').innerHTML = `<h3>Hoje, ${e(date(data.today.date))} · Em andamento</h3>${dailyTable(data.today)}`;
    document.getElementById('closing-history').innerHTML = data.closures.map(summary => `<details class="form-disclosure"><summary>${e(date(summary.date))} · ${money(summary.netCents)} · ${summary.orderCount} pedidos</summary><p class="small">Fechado automaticamente em ${e(date(summary.closedAt))}.</p>${dailyTable(summary)}</details>`).join('') || '<p class="empty">O primeiro fechamento aparece após a mudança do dia. Se o servidor estiver desligado, ele será gerado na próxima inicialização.</p>';
  }
  async function load() {
    if (loading) return;
    loading = true; document.getElementById('refresh').disabled = true;
    try {
      const { user } = await request('/api/session');
      if (!user) { location.replace('login.html?next=admin.html'); return; }
      if (user.role !== 'admin') throw new Error('Acesso exclusivo da administração. Entre com uma conta autorizada.');
      data = await request('/api/admin/dashboard');
      document.querySelector('main').hidden = false; document.getElementById('load-error').hidden = true;
      orderList(); inventory(); deliveries(); closing();
    } catch (err) {
      if (document.querySelector('main').hidden) { const target = document.getElementById('load-error'); target.textContent = err.message; target.hidden = false; }
      else notice(err.message + ' Tente atualizar os dados.', true);
    } finally { loading = false; document.getElementById('refresh').disabled = false; }
  }
  async function save(button, route, payload, message) {
    button.disabled = true;
    try { await request(route, payload); notice(message); await load(); }
    catch (err) { notice(err.message, true); feedback.scrollIntoView({ block: 'nearest' }); }
    finally { button.disabled = false; }
  }
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches('form') || !form.reportValidity()) return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const button = form.querySelector('button');
    if (button.disabled) return;
    if (form.classList.contains('stock-form')) save(button, '/api/admin/inventory', { productId: form.dataset.product, quantity: Number(values.quantity), reason: values.reason }, 'Estoque atualizado e movimentação registrada.');
    else if (form.classList.contains('product-form')) save(button, '/api/admin/product-settings', { productId: form.dataset.product, priceCents: cents(values.price), minimum: Number(values.minimum), active: values.active === 'true' }, 'Produto atualizado.');
    else if (form.classList.contains('cancel-form')) save(button, '/api/admin/order', { orderId: form.dataset.order, action: 'cancel', reason: values.reason, confirmRefund: values.refund === 'on' }, 'Pedido cancelado e estoque devolvido.');
    else if (form.id === 'new-product') save(button, '/api/admin/products', { name: values.name, unit: values.unit, priceCents: cents(values.price), minimum: Number(values.minimum) }, 'Produto cadastrado. Registre as unidades disponíveis no estoque.').then(() => { if (feedback.dataset.error !== 'true') form.reset(); });
    else if (form.id === 'delivery-fee') save(button, '/api/admin/settings', { deliveryCents: cents(values.fee) }, 'Taxa de entrega atualizada para novos pedidos.');
    else if (form.id === 'delivery-schedule') {
      const orderIds = new FormData(form).getAll('order');
      if (!orderIds.length) return notice('Selecione pelo menos um pedido para agendar.', true);
      save(button, '/api/admin/deliveries', { orderIds, scheduledDate: values.scheduledDate, window: values.window, driver: values.driver }, 'Entregas agendadas. Os clientes já podem consultar a previsão.');
    }
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    save(button, '/api/admin/order', { orderId: button.dataset.order, action: button.dataset.action, status: button.dataset.next }, button.dataset.action === 'payment' ? 'Pagamento registrado no caixa.' : 'Etapa do pedido atualizada.');
  });
  function changeSection() {
    const active = ['pedidos', 'estoque', 'entregas', 'fechamento'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'pedidos';
    document.querySelectorAll('.management-section').forEach(section => { section.hidden = section.id !== active; });
    document.querySelectorAll('.section-nav a').forEach(link => { if (link.hash === '#' + active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  }
  document.getElementById('refresh').addEventListener('click', () => { feedback.hidden = true; load(); });
  document.getElementById('order-filter').addEventListener('change', () => { if (data) orderList(); });
  document.getElementById('export-closing').addEventListener('click', () => {
    if (!data) return;
    const rows = [['Data', 'Situação', 'Pedidos', 'Forma de pagamento', 'Recebido (R$)', 'Estornado (R$)', 'Saldo (R$)']];
    for (const summary of [data.today, ...data.closures]) for (const payment of summary.payments) rows.push([summary.date, summary.closedAt ? 'Fechado' : 'Em andamento', summary.orderCount, labels[payment.method], inputPrice(payment.receivedCents), inputPrice(payment.refundedCents), inputPrice(payment.netCents)]);
    const csv = '\ufeff' + rows.map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fechamento-' + data.today.date + '.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('hashchange', changeSection);
  window.addEventListener('pageshow', load);
  changeSection();
})();
