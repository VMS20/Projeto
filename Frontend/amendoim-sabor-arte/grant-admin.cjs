const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

(async () => {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) throw new Error('Use: npm run admin -- email-da-conta-cadastrada');
  const dir = process.env.DATA_DIR || path.join(__dirname, 'data');
  const users = JSON.parse(await fs.readFile(path.join(dir, 'users.json'), 'utf8'));
  const user = users.find(user => user.email === email);
  if (!user) throw new Error('Cadastre essa conta no site antes de conceder o acesso.');
  const file = path.join(dir, 'admins.json');
  let ids;
  try { ids = JSON.parse(await fs.readFile(file, 'utf8')); }
  catch (err) { if (err.code !== 'ENOENT') throw err; ids = []; }
  if (!ids.includes(user.id)) {
    const temporary = file + '.' + randomUUID() + '.tmp';
    await fs.writeFile(temporary, JSON.stringify([...ids, user.id], null, 2), { mode: 0o600 });
    await fs.rename(temporary, file);
  }
  console.log(`Acesso administrativo concedido a ${email}. Entre pela página de login.`);
})().catch(err => { console.error(err.message); process.exitCode = 1; });
