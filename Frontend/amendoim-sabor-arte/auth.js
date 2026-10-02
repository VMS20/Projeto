(() => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const isOrders = document.body.dataset.page === 'orders';
  const errorBox = document.getElementById('error-message');
  const showError = message => {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.style.display = 'block';
  };
  async function request(url, payload) {
    if (location.protocol === 'file:') throw new Error('Abra o site pelo endereço http://localhost:3000 para entrar ou cadastrar sua conta.');
    let response;
    try {
      response = await fetch(url, {
        credentials: 'same-origin', cache: 'no-store',
        ...(payload ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sabor-Request': '1' }, body: JSON.stringify(payload) } : {}),
        signal: AbortSignal.timeout(10000)
      });
    } catch { throw new Error('Não foi possível conectar. Verifique se o site está funcionando e tente novamente.'); }
    let data;
    try { data = await response.json(); } catch { throw new Error('Serviço indisponível. Abra o site em http://localhost:3000 e tente novamente.'); }
    if (!response.ok) throw new Error(data.message || 'Não foi possível concluir. Tente novamente.');
    return data;
  }
  const form = loginForm || registerForm;
  if (form) {
    if (loginForm && new URLSearchParams(location.search).get('registered') === '1') {
      const notice = document.getElementById('login-notice');
      notice.textContent = 'Cadastro realizado! Entre para fazer seu pedido.';
      notice.hidden = false;
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (button.disabled || !form.reportValidity()) return;
      errorBox.style.display = 'none';
      const password = document.getElementById('password').value;
      if (registerForm && password !== document.getElementById('confirm-password').value) return showError('As senhas não coincidem.');
      const payload = { email: document.getElementById('email').value, password };
      if (registerForm) Object.assign(payload, { name: document.getElementById('nome').value, phone: document.getElementById('tel').value, terms: document.getElementById('terms').checked });
      const label = button.textContent;
      button.disabled = true;
      button.textContent = 'Aguarde…';
      try {
        const result = await request(registerForm ? '/api/register' : '/api/login', payload);
        const next = new URLSearchParams(location.search).get('next');
        const destination = ['pedidos.html', 'meus-pedidos.html', 'admin.html'].includes(next) && (next !== 'admin.html' || result.user?.role === 'admin') ? next : result.user?.role === 'admin' ? 'admin.html' : 'pedidos.html';
        location.assign(registerForm ? 'login.html?registered=1&next=pedidos.html' : destination);
      } catch (err) { showError(err.message); }
      finally { button.disabled = false; button.textContent = label; }
    });
  }
  async function refreshSession() {
    if (isOrders) document.querySelector('main').hidden = true;
    try {
      const { user } = await request('/api/session');
      if (isOrders && !user) { location.replace('login.html?next=pedidos.html'); return; }
      document.querySelectorAll('[data-guest]').forEach(element => { element.hidden = !!user; });
      document.querySelectorAll('[data-member]').forEach(element => { element.hidden = !user; });
      document.querySelectorAll('[data-admin]').forEach(element => { element.hidden = user?.role !== 'admin'; });
      if (user) {
        document.querySelectorAll('[data-user-name]').forEach(element => { element.textContent = `Olá, ${user.name}`; });
        if (isOrders) {
          document.getElementById('session-notice').hidden = true;
          for (const [id, value] of [['nome', user.name], ['email', user.email], ['telefone', user.phone]]) {
            const input = document.getElementById(id);
            if (input && !input.value) input.value = value;
          }
          document.querySelector('main').hidden = false;
        }
      }
    } catch (err) {
      if (isOrders) {
        const notice = document.getElementById('session-notice');
        notice.hidden = false;
        notice.textContent = err.message + ' Recarregue a página para verificar sua sessão.';
      }
    }
  }
  document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', async () => {
    button.disabled = true;
    try { await request('/api/logout', {}); location.assign('index.html'); }
    catch (err) { button.disabled = false; alert(err.message); }
  }));
  window.addEventListener('pageshow', refreshSession);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSession(); });
})();
