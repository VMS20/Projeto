const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
function setMenu(open) {
  navLinks.classList.toggle('active', open);
  mobileMenuBtn.setAttribute('aria-expanded', String(open));
  mobileMenuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}
mobileMenuBtn.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navLinks.classList.contains('active')) { setMenu(false); mobileMenuBtn.focus(); }
});
const contatoForm = document.getElementById('contatoForm');
contatoForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!contatoForm.reportValidity()) return;
  const data = new FormData(contatoForm);
  const text = `Nome: ${data.get('name')}\nE-mail para resposta: ${data.get('email')}\n\n${data.get('message')}`;
  const status = document.getElementById('contact-status');
  status.hidden = false;
  status.textContent = 'Seu aplicativo de e-mail será aberto. Confira o rascunho e envie a mensagem por ele. Se não abrir, escreva para edilsonrmaia@hotmail.com.';
  location.href = `mailto:edilsonrmaia@hotmail.com?subject=${encodeURIComponent('Contato pelo site Sabor Arte')}&body=${encodeURIComponent(text)}`;
});
