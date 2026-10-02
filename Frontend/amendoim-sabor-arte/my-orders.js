(() => {
  const { request, money, date, escape: e, labels } = Commerce;
  async function load() {
    const button = document.getElementById('refresh'); button.disabled = true;
    try {
      const { user } = await request('/api/session');
      if (!user) return location.replace('login.html?next=meus-pedidos.html');
      const { orders } = await request('/api/orders');
      document.querySelector('main').hidden = false;
      document.getElementById('customer-orders').innerHTML = orders.map(order => `<article class="order-row"><div class="order-heading"><h2>Pedido #${order.number}</h2><span class="badge" data-status="${e(order.status)}">${e(labels[order.status])}</span></div><div class="order-details"><div><p>${e(date(order.createdAt))}</p>${order.items.map(item => `<p>${item.quantity} × ${e(item.name)} (${e(item.unit)})</p>`).join('')}<p><strong>Total: ${money(order.totalCents)}</strong> · Entrega: ${money(order.deliveryCents)}</p><p>${e(labels[order.payment.method])} · Pagamento ${e(labels[order.payment.status]).toLowerCase()}</p></div><div><p><strong>${order.delivery.type === 'entrega' ? 'Entrega' : 'Retirada no local'}</strong></p>${order.delivery.address ? `<p>${e(order.delivery.address.street)}, ${e(order.delivery.address.number)} — ${e(order.delivery.address.neighborhood)}, ${e(order.delivery.address.city)}/${e(order.delivery.address.state)}</p>` : ''}<p>${order.delivery.type === 'entrega' ? e(date(order.delivery.scheduledDate)) + (order.delivery.window ? ' · ' + e(order.delivery.window) : '') : 'Aguarde o status Pronto para retirar.'}</p>${order.status === 'cancelado' ? '<p>Pedido cancelado pela loja.</p>' : ''}</div></div></article>`).join('') || '<p class="empty">Você ainda não tem pedidos. <a href="pedidos.html">Escolher um produto</a>.</p>';
      document.getElementById('load-error').hidden = true;
      document.getElementById('feedback').hidden = true;
    } catch (err) {
      const target = document.querySelector('main').hidden ? document.getElementById('load-error') : document.getElementById('feedback'); target.textContent = err.message + ' Tente atualizar os pedidos.'; target.hidden = false;
    } finally { button.disabled = false; }
  }
  document.getElementById('refresh').addEventListener('click', load);
  window.addEventListener('pageshow', load);
  setInterval(() => { if (!document.hidden && !document.getElementById('refresh').disabled) load(); }, 30000);
})();
