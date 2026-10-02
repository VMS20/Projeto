const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const fail = (status, message) => Object.assign(new Error(message), { status });
const day = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const now = () => new Date().toISOString();
function text(value, label, max = 160, required = true) {
  const result = typeof value === 'string' ? value.trim() : '';
  if ((required && !result) || result.length > max) throw fail(400, `Confira o campo ${label}.`);
  return result;
}
function integer(value, label, min = 0, max = 1000000) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw fail(400, `Confira o campo ${label}.`);
  return value;
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value + 'T12:00:00Z')) || new Date(value + 'T12:00:00Z').toISOString().slice(0, 10) !== value) throw fail(400, 'Informe uma data válida.');
  return value;
}
function summary(state, dateKey) {
  const orders = state.orders.filter(order => day(order.createdAt) === dateKey);
  const entries = state.cash.filter(entry => day(entry.at) === dateKey);
  const payments = ['pix', 'cartao', 'dinheiro'].map(method => {
    const selected = entries.filter(entry => entry.method === method);
    const receivedCents = selected.filter(entry => entry.amountCents > 0).reduce((total, entry) => total + entry.amountCents, 0);
    const refundedCents = -selected.filter(entry => entry.amountCents < 0).reduce((total, entry) => total + entry.amountCents, 0);
    return { method, receivedCents, refundedCents, netCents: receivedCents - refundedCents };
  });
  return { date: dateKey, orderCount: orders.length, salesCents: orders.reduce((sum, order) => sum + order.totalCents, 0), payments,
    receivedCents: payments.reduce((sum, item) => sum + item.receivedCents, 0), refundedCents: payments.reduce((sum, item) => sum + item.refundedCents, 0),
    netCents: payments.reduce((sum, item) => sum + item.netCents, 0) };
}
function closePreviousDays(state) {
  const today = day(now());
  const dates = new Set([...state.orders.map(order => day(order.createdAt)), ...state.cash.map(entry => day(entry.at))]);
  for (const dateKey of [...dates].sort()) {
    if (dateKey < today && !state.closures.some(entry => entry.date === dateKey)) state.closures.push({ ...summary(state, dateKey), closedAt: now() });
  }
}
function customerView(order) {
  const { id, number, createdAt, items, subtotalCents, deliveryCents, totalCents, status, payment, delivery, customer, notes } = order;
  const { type, address, scheduledDate, window } = delivery;
  return { id, number, createdAt, items, subtotalCents, deliveryCents, totalCents, status, payment, customer, notes,
    delivery: { type, address, scheduledDate, window } };
}
function deliveryGroups(state) {
  const groups = new Map();
  for (const order of state.orders.filter(order => order.delivery.type === 'entrega' && !['cancelado', 'concluido'].includes(order.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const address = order.delivery.address;
    const key = [order.delivery.scheduledDate || '', address.state, address.city.toLocaleLowerCase('pt-BR'), address.neighborhood.toLocaleLowerCase('pt-BR')].join('|');
    if (!groups.has(key)) groups.set(key, { key, scheduledDate: order.delivery.scheduledDate || '', state: address.state, city: address.city, neighborhood: address.neighborhood, orders: [] });
    groups.get(key).orders.push(order);
  }
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key, 'pt-BR'));
}

function createOperations(dataDir) {
  const file = path.join(dataDir, 'operations.json');
  let writes = Promise.resolve();
  async function read() { return JSON.parse(await fs.readFile(file, 'utf8')); }
  function transaction(change) {
    const task = writes.then(async () => {
      const state = await read();
      closePreviousDays(state);
      const result = await change(state);
      const temporary = file + '.tmp';
      await fs.writeFile(temporary, JSON.stringify(state, null, 2), { mode: 0o600 });
      await fs.rename(temporary, file);
      return result;
    });
    writes = task.catch(() => {});
    return task;
  }
  async function initialize() {
    const initial = { version: 1, nextOrder: 1, deliveryCents: 300,
      products: [{ id: 'tradicional', name: 'Amendoim doce tradicional', unit: '100g', priceCents: 650, stock: 0, minimum: 10, active: true }], orders: [], movements: [], cash: [], closures: [] };
    try { await fs.writeFile(file, JSON.stringify(initial, null, 2), { flag: 'wx', mode: 0o600 }); }
    catch (err) { if (err.code !== 'EEXIST') throw err; }
    await transaction(() => {});
  }
  async function handle(req, user, pathname, payload) {
    if (pathname === '/api/catalog' && req.method === 'GET') {
      const state = await read();
      return { products: state.products.filter(product => product.active).map(({ id, name, unit, priceCents, stock }) => ({ id, name, unit, priceCents, available: stock })), deliveryCents: state.deliveryCents };
    }
    if (!user) throw fail(401, 'Entre na sua conta para continuar.');
    if (pathname.startsWith('/api/admin/') && user.role !== 'admin') throw fail(403, 'Esta área é exclusiva da administração.');
    if (pathname === '/api/orders' && req.method === 'GET') return { orders: (await read()).orders.filter(order => order.userId === user.id).reverse().map(customerView) };
    if (pathname === '/api/orders' && req.method === 'POST') {
      const key = text(payload.requestId, 'identificador', 80);
      if (!/^[a-zA-Z0-9-]{16,80}$/.test(key)) throw fail(400, 'Identificador de pedido inválido.');
      if (payload.terms !== true) throw fail(400, 'Aceite os termos para confirmar o pedido.');
      return transaction(state => {
        const existing = state.orders.find(order => order.userId === user.id && order.requestId === key);
        if (existing) return { order: customerView(existing) };
        if (!Array.isArray(payload.items) || payload.items.length < 1 || payload.items.length > 30) throw fail(400, 'Escolha os produtos do pedido.');
        const seen = new Set();
        const items = payload.items.map(item => {
          if (!item || seen.has(item.productId)) throw fail(400, 'Produto repetido ou inválido.');
          seen.add(item.productId);
          const product = state.products.find(product => product.id === item.productId && product.active);
          if (!product) throw fail(400, 'Produto indisponível. Atualize a página.');
          const quantity = integer(item.quantity, 'quantidade', 1, 99);
          if (product.stock < quantity) throw fail(409, `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`);
          if (item.priceCents !== product.priceCents) throw fail(409, 'O preço mudou. Atualize a página e confira o resumo antes de confirmar.');
          return { productId: product.id, name: product.name, unit: product.unit, quantity, priceCents: product.priceCents, subtotalCents: quantity * product.priceCents };
        });
        const type = payload.delivery?.type;
        if (!['entrega', 'retirada'].includes(type)) throw fail(400, 'Escolha entrega ou retirada.');
        let address = null;
        if (type === 'entrega') {
          const source = payload.delivery.address || {};
          address = { zip: text(source.zip, 'CEP', 9).replace(/\D/g, ''), state: text(source.state, 'estado', 2), city: text(source.city, 'cidade', 100), neighborhood: text(source.neighborhood, 'bairro', 100), street: text(source.street, 'rua'), number: text(source.number, 'número', 30), complement: text(source.complement, 'complemento', 100, false), reference: text(source.reference, 'referência', 160, false) };
          if (!/^\d{8}$/.test(address.zip) || !['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].includes(address.state)) throw fail(400, 'Confira o CEP e o estado.');
        }
        const method = payload.payment?.method;
        if (!['pix', 'cartao', 'dinheiro'].includes(method)) throw fail(400, 'Escolha a forma de pagamento.');
        const subtotalCents = items.reduce((sum, item) => sum + item.subtotalCents, 0);
        const deliveryCents = type === 'entrega' ? state.deliveryCents : 0;
        if (payload.deliveryCents !== deliveryCents) throw fail(409, 'A taxa de entrega mudou. Atualize a página e confira o resumo.');
        const totalCents = subtotalCents + deliveryCents;
        const changeForCents = method === 'dinheiro' && payload.payment.changeForCents != null ? integer(payload.payment.changeForCents, 'troco', totalCents, 10000000) : null;
        const customer = { name: text(payload.customer?.name, 'nome', 100), phone: text(payload.customer?.phone, 'telefone', 20).replace(/\D/g, ''), email: user.email };
        if (!/^(?:55)?\d{10,11}$/.test(customer.phone)) throw fail(400, 'Informe um telefone com DDD.');
        const order = { id: randomUUID(), number: state.nextOrder++, userId: user.id, requestId: key, createdAt: now(), items, subtotalCents, deliveryCents, totalCents, customer, notes: text(payload.notes, 'observações', 300, false), status: 'recebido', payment: { method, status: 'pendente', changeForCents }, delivery: { type, address, scheduledDate: '', window: '', driver: '' } };
        for (const item of items) {
          state.products.find(product => product.id === item.productId).stock -= item.quantity;
          state.movements.push({ id: randomUUID(), productId: item.productId, quantity: -item.quantity, reason: `Pedido #${order.number}`, orderId: order.id, at: now(), actor: user.id });
        }
        state.orders.push(order);
        return { order: customerView(order) };
      });
    }
    if (pathname === '/api/admin/dashboard' && req.method === 'GET') return transaction(state => ({ products: state.products, orders: [...state.orders].reverse(), movements: state.movements.slice(-100).reverse(), deliveryGroups: deliveryGroups(state), today: summary(state, day(now())), closures: [...state.closures].reverse(), deliveryCents: state.deliveryCents }));
    if (req.method !== 'POST') throw fail(405, 'Método não permitido.');
    if (pathname === '/api/admin/products') return transaction(state => {
      const product = { id: randomUUID(), name: text(payload.name, 'produto', 100), unit: text(payload.unit, 'embalagem', 40), priceCents: integer(payload.priceCents, 'preço', 1, 1000000), stock: 0, minimum: integer(payload.minimum, 'estoque mínimo', 0), active: true };
      state.products.push(product);
      return { product };
    });
    if (pathname === '/api/admin/inventory') return transaction(state => {
      const product = state.products.find(product => product.id === payload.productId);
      if (!product) throw fail(404, 'Produto não encontrado.');
      const quantity = integer(payload.quantity, 'ajuste', -1000000, 1000000);
      if (!quantity || product.stock + quantity < 0 || product.stock + quantity > 1000000) throw fail(400, 'O ajuste deve manter o estoque entre zero e um milhão.');
      const reason = text(payload.reason, 'motivo', 160);
      product.stock += quantity;
      state.movements.push({ id: randomUUID(), productId: product.id, quantity, reason, at: now(), actor: user.id });
      return { product };
    });
    if (pathname === '/api/admin/product-settings') return transaction(state => {
      const product = state.products.find(product => product.id === payload.productId);
      if (!product) throw fail(404, 'Produto não encontrado.');
      product.priceCents = integer(payload.priceCents, 'preço', 1, 1000000);
      product.minimum = integer(payload.minimum, 'estoque mínimo');
      if (typeof payload.active !== 'boolean') throw fail(400, 'Informe se o produto está ativo.');
      product.active = payload.active;
      return { product };
    });
    if (pathname === '/api/admin/settings') return transaction(state => {
      state.deliveryCents = integer(payload.deliveryCents, 'taxa de entrega', 0, 1000000);
      return { deliveryCents: state.deliveryCents };
    });
    if (pathname === '/api/admin/order') return transaction(state => {
      const order = state.orders.find(order => order.id === payload.orderId);
      if (!order) throw fail(404, 'Pedido não encontrado.');
      if (payload.action === 'payment') {
        if (order.status === 'cancelado') throw fail(409, 'Pedido cancelado não pode receber pagamento.');
        if (order.payment.status === 'pago') return { order };
        order.payment.status = 'pago';
        order.payment.paidAt = now();
        state.cash.push({ id: randomUUID(), orderId: order.id, method: order.payment.method, amountCents: order.totalCents, at: now(), actor: user.id });
      } else if (payload.action === 'cancel') {
        if (order.status === 'cancelado') return { order };
        if (order.status === 'concluido') throw fail(409, 'Pedido concluído não pode ser cancelado.');
        const reason = text(payload.reason, 'motivo do cancelamento');
        if (order.payment.status === 'pago' && payload.confirmRefund !== true) throw fail(409, 'Confirme a devolução do pagamento antes de cancelar.');
        for (const item of order.items) {
          state.products.find(product => product.id === item.productId).stock += item.quantity;
          state.movements.push({ id: randomUUID(), productId: item.productId, quantity: item.quantity, reason: `Cancelamento #${order.number}: ${reason}`, at: now(), actor: user.id, orderId: order.id });
        }
        if (order.payment.status === 'pago') {
          state.cash.push({ id: randomUUID(), orderId: order.id, method: order.payment.method, amountCents: -order.totalCents, at: now(), actor: user.id });
          order.payment.status = 'estornado';
        }
        order.status = 'cancelado';
        order.cancelReason = reason;
      } else if (payload.action === 'status') {
        const transitions = { recebido: ['preparando'], preparando: ['pronto'], pronto: order.delivery.type === 'entrega' ? ['em_entrega'] : ['concluido'], em_entrega: ['concluido'] };
        if (!transitions[order.status]?.includes(payload.status)) throw fail(409, 'Etapa inválida para este pedido. Atualize o painel.');
        if (payload.status === 'em_entrega' && (!order.delivery.scheduledDate || !order.delivery.driver)) throw fail(409, 'Agende a entrega e informe o responsável antes de sair.');
        if (payload.status === 'concluido' && order.payment.status !== 'pago') throw fail(409, 'Confirme o recebimento do pagamento antes de concluir.');
        order.status = payload.status;
      } else throw fail(400, 'Ação de pedido inválida.');
      order.updatedAt = now();
      return { order };
    });
    if (pathname === '/api/admin/deliveries') return transaction(state => {
      const scheduledDate = date(payload.scheduledDate);
      if (scheduledDate < day(now())) throw fail(400, 'Escolha hoje ou uma data futura.');
      const window = text(payload.window, 'período', 80);
      const driver = text(payload.driver, 'responsável', 100);
      if (!Array.isArray(payload.orderIds) || !payload.orderIds.length || payload.orderIds.length > 200 || new Set(payload.orderIds).size !== payload.orderIds.length) throw fail(400, 'Selecione os pedidos para entrega.');
      const orders = payload.orderIds.map(id => state.orders.find(order => order.id === id));
      if (orders.some(order => !order || order.delivery.type !== 'entrega' || ['em_entrega', 'concluido', 'cancelado'].includes(order.status))) throw fail(409, 'Um dos pedidos não pode ser agendado. Atualize o painel.');
      for (const order of orders) Object.assign(order.delivery, { scheduledDate, window, driver });
      return { updated: orders.length };
    });
    throw fail(404, 'Recurso não encontrado.');
  }
  return { initialize, handle, closeDays: () => transaction(() => {}) };
}
module.exports = { createOperations, day, summary };
