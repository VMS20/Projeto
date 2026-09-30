const quantity = document.getElementById('quantidade');
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
function updatePreview() {
  const valid = quantity.validity.valid && quantity.value !== '';
  const count = valid ? Number(quantity.value) : null;
  const subtotal = count === null ? '—' : currency.format(count * 6.5);
  const delivery = document.getElementById('entrega').checked ? 3 : 0;
  document.querySelector('.subtotal strong').textContent = subtotal;
  const cells = document.querySelectorAll('.tabela-resumo tbody td');
  cells[1].textContent = count === null ? '—' : count;
  cells[2].textContent = subtotal;
  const totals = document.querySelectorAll('.valores strong');
  totals[0].textContent = subtotal;
  totals[1].textContent = currency.format(delivery);
  totals[3].textContent = count === null ? '—' : currency.format(count * 6.5 + delivery);
  const cash = document.querySelector('[name="pagamento"]:checked').value === 'dinheiro';
  document.getElementById('troco').disabled = !cash;
  for (const id of ['cep', 'rua', 'numero-endereco', 'bairro', 'cidade', 'estado', 'complemento', 'referencia']) {
    const field = document.getElementById(id);
    if (field) field.disabled = !delivery;
  }
}
quantity.addEventListener('input', updatePreview);
document.querySelectorAll('[name="tipo-entrega"], [name="pagamento"]').forEach(input => input.addEventListener('change', updatePreview));
updatePreview();
