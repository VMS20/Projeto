const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomBytes, randomUUID, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const scrypt = promisify(scryptCallback);
const root = __dirname;
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
const usersFile = path.join(dataDir, 'users.json');
const port = Number(process.env.PORT || 3000);
const sessions = new Map();
const attempts = new Map();
const sessionLifetime = 8 * 60 * 60 * 1000;
let writes = Promise.resolve();
const publicFiles = new Set(['index.html', 'login.html', 'register.html', 'styles.css', 'account.css', 'amendoim-caramelizado.png', 'script.js', 'orders.js', 'auth.js', 'chat.js', 'chat.css', 'pedidos.css']);
const protectedFiles = new Set(['pedidos.html', 'pedidos copy.html']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function reply(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}
function error(status, message) { return Object.assign(new Error(message), { status }); }
function userView(user) { return { id: user.id, name: user.name, email: user.email, phone: user.phone }; }
function session(req) {
  const token = /(?:^|;\s*)sabor_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  const entry = sessions.get(token);
  if (entry && entry.expires > Date.now()) return { token, ...entry };
  if (token) sessions.delete(token);
  return null;
}
function setSession(req, res, user) {
  const old = session(req);
  if (old) sessions.delete(old.token);
  for (const [token, entry] of sessions) if (entry.expires <= Date.now()) sessions.delete(token);
  if (sessions.size >= 4096) sessions.delete(sessions.keys().next().value);
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { user: userView(user), expires: Date.now() + sessionLifetime });
  res.setHeader('Set-Cookie', `sabor_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionLifetime / 1000}`);
}
async function body(req) {
  if (req.headers['content-type']?.split(';')[0] !== 'application/json' || req.headers['x-sabor-request'] !== '1') throw error(415, 'Envie os dados pelo formulário do site.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8192) throw error(413, 'Dados enviados excedem o limite permitido.');
    chunks.push(chunk);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString());
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
    return parsed;
  } catch { throw error(400, 'Dados inválidos.'); }
}
async function readUsers() {
  const users = JSON.parse(await fs.readFile(usersFile, 'utf8'));
  if (!Array.isArray(users)) throw new Error('Arquivo de usuários inválido.');
  return users;
}
function rateLimit(req) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const key = req.socket.remoteAddress;
  const record = attempts.get(key) || { count: 0, until: now + 60000 };
  attempts.set(key, record);
  if (++record.count > 20) throw error(429, 'Muitas tentativas. Aguarde um minuto e tente novamente.');
}
async function api(req, res, pathname) {
  if (pathname === '/api/session' && req.method === 'GET') return reply(res, 200, { user: session(req)?.user || null });
  if (!['/api/register', '/api/login', '/api/logout'].includes(pathname)) return reply(res, 404, { message: 'Recurso não encontrado.' });
  if (req.method !== 'POST') return reply(res, 405, { message: 'Método não permitido.' });
  const payload = await body(req);
  if (pathname === '/api/logout') {
    const current = session(req);
    if (current) sessions.delete(current.token);
    res.setHeader('Set-Cookie', 'sabor_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return reply(res, 200, { message: 'Você saiu da conta.' });
  }
  rateLimit(req);
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const password = payload.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 6 || password.length > 128) throw error(400, 'Informe um e-mail válido e uma senha de 6 a 128 caracteres.');
  if (pathname === '/api/register') {
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const phone = typeof payload.phone === 'string' ? payload.phone.replace(/\D/g, '') : '';
    if (name.length < 2 || name.length > 100 || !/^(?:55)?\d{10,11}$/.test(phone) || payload.terms !== true) throw error(400, 'Preencha nome, telefone com DDD e aceite os termos.');
    const salt = randomBytes(16).toString('hex');
    const passwordHash = (await scrypt(password, salt, 64)).toString('hex');
    const user = { id: randomUUID(), name, email, phone, salt, passwordHash, createdAt: new Date().toISOString() };
    const save = writes.then(async () => {
      const users = await readUsers();
      if (users.some(entry => entry.email === email)) throw error(409, 'Este e-mail já está cadastrado. Entre na sua conta.');
      const temporary = usersFile + '.tmp';
      await fs.writeFile(temporary, JSON.stringify([...users, user], null, 2), { mode: 0o600 });
      await fs.rename(temporary, usersFile);
    });
    writes = save.catch(() => {});
    await save;
    return reply(res, 201, { message: 'Cadastro realizado. Entre para fazer seu pedido.' });
  }
  const user = (await readUsers()).find(entry => entry.email === email);
  const candidate = await scrypt(password, user?.salt || '00000000000000000000000000000000', 64);
  const expected = Buffer.from(user?.passwordHash || '00'.repeat(64), 'hex');
  if (!user || expected.length !== candidate.length || !timingSafeEqual(candidate, expected)) throw error(401, 'E-mail ou senha incorretos.');
  setSession(req, res, user);
  return reply(res, 200, { user: userView(user) });
}
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  try {
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host || '')) throw error(403, 'Acesso permitido apenas pelo endereço local.');
    if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) throw error(403, 'Origem não permitida.');
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { throw error(400, 'Endereço inválido.'); }
    if (pathname.startsWith('/api/')) return await api(req, res, pathname);
    if (!['GET', 'HEAD'].includes(req.method)) return reply(res, 405, { message: 'Método não permitido.' });
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (file === 'pedido.html') { res.writeHead(302, { Location: '/pedidos.html' }); return res.end(); }
    if (!publicFiles.has(file) && !protectedFiles.has(file)) return reply(res, 404, { message: 'Página não encontrada.' });
    if (protectedFiles.has(file) && !session(req)) {
      res.writeHead(302, { Location: '/login.html?next=pedidos.html' });
      return res.end();
    }
    if (file === 'pedidos copy.html') {
      res.writeHead(302, { Location: '/pedidos.html' });
      return res.end();
    }
    const contents = await fs.readFile(path.join(root, file));
    if (file.endsWith('.png')) res.setHeader('Cache-Control', 'public, max-age=3600');
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] });
    res.end(req.method === 'HEAD' ? undefined : contents);
  } catch (err) {
    reply(res, err.status || 500, { message: err.status ? err.message : 'Não foi possível concluir agora. Tente novamente.' });
    if (!err.status) console.error('Falha no servidor:', err.message);
  }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
async function start() {
  await fs.mkdir(dataDir, { recursive: true });
  try { await fs.writeFile(usersFile, '[]\n', { flag: 'wx', mode: 0o600 }); } catch (err) { if (err.code !== 'EEXIST') throw err; }
  await readUsers();
  server.listen(port, '127.0.0.1', () => console.log(`Site disponível em http://localhost:${server.address().port}`));
}
server.on('error', err => { console.error('Não foi possível iniciar:', err.message); process.exitCode = 1; });
start().catch(err => { console.error('Não foi possível carregar os usuários:', err.message); process.exitCode = 1; });
