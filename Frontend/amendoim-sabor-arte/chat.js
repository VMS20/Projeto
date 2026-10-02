(() => {
  const pending = 'Essa informação ainda precisa ser confirmada pela equipe. Use “Falar com atendente” para consultar antes de comprar.';
  const groups = [
    ['Produtos', [
      ['O que é o amendoim caramelizado?', 'É o amendoim coberto por uma camada doce e crocante. A apresentação do Sabor Arte descreve uma produção artesanal com açúcar e corante vermelho.'],
      ['Quais são os ingredientes?', 'A apresentação do produto menciona amendoim, açúcar e corante vermelho. Confirme com a equipe a lista completa de ingredientes e o rótulo.'],
      ['É feito artesanalmente?', 'Sim. O produto é apresentado pela marca como amendoim caramelizado artesanal.'],
      ['Quais sabores estão disponíveis?', 'O site apresenta amendoim caramelizado. Consulte o atendimento para confirmar os sabores disponíveis hoje.'],
      ['Quais são os pesos das embalagens?', 'A tela de pedidos apresenta uma embalagem de 100 g. Confirme com a equipe os tamanhos disponíveis para compra.'],
      ['Quanto custa?', 'Na tela Fazer pedido, escolha um produto para consultar o preço atual e o total com a entrega. Confira o resumo antes de confirmar.'],
      ['Contém corante?', 'A descrição do produto menciona corante vermelho. Consulte o rótulo ou o atendimento para saber qual corante é utilizado.'],
      ['Contém glúten, leite ou lactose?', 'Ainda não temos o rótulo completo cadastrado. Confirme os ingredientes e avisos de alergênicos com a equipe antes de consumir.'],
      ['Pode haver contato com outros alergênicos?', 'O produto contém amendoim. As informações sobre outros alergênicos e contato durante a produção precisam ser confirmadas com a equipe.'],
      ['Existe opção sem açúcar ou sem corante?', pending],
      ['Onde encontro a tabela nutricional?', 'A tabela nutricional ainda não está disponível no site. Solicite uma foto do rótulo ao atendimento.']
    ]],
    ['Conservação', [
      ['Qual é a validade?', 'Consulte a validade na embalagem do seu lote ou confirme com a equipe. Não há um prazo validado cadastrado neste site.'],
      ['Como devo guardar o amendoim?', 'Siga as orientações de conservação da embalagem. A equipe pode informar as condições adequadas para este produto.'],
      ['Quanto tempo dura depois de aberto?', pending],
      ['Precisa ficar na geladeira?', 'Confirme a orientação de armazenamento no rótulo ou com a equipe.'],
      ['Como conservar a crocância?', 'Peça à equipe as orientações de fechamento e armazenamento da embalagem utilizada.'],
      ['A embalagem informa fabricação e validade?', pending]
    ]],
    ['Como comprar', [
      ['Como faço um pedido pelo site?', 'Crie uma conta e entre. Em Fazer pedido, escolha o produto e a quantidade, preencha os dados de entrega ou selecione retirada, escolha o pagamento e confirme. O site mostrará o número do pedido.'],
      ['Preciso criar uma conta?', 'Você pode conhecer os produtos sem entrar. Para acessar a página de pedidos, crie sua conta em “Criar conta” e entre com seu e-mail e senha.'],
      ['Posso pedir pelo WhatsApp?', 'O planejamento prevê atendimento pelo WhatsApp. Confirme esse canal pelo telefone de contato informado no site: (11) 99901-6165.'],
      ['Existe pedido mínimo?', pending],
      ['Como consulto a disponibilidade?', 'A tela Fazer pedido mostra as unidades disponíveis do produto selecionado. A quantidade é conferida novamente ao confirmar para evitar pedidos sem estoque.'],
      ['Posso alterar a quantidade após confirmar?', 'Fale com o atendimento e informe seu pedido e a alteração desejada. A equipe precisa confirmar se ainda é possível alterá-lo.'],
      ['Como sei se meu pedido foi recebido?', 'Após confirmar, o site mostra o número do pedido. Ele também aparece em Meus pedidos, com o status Recebido. Se houver erro, confira a mensagem antes de tentar novamente.'],
      ['Como acompanho meu pedido?', 'Entre na sua conta e abra Meus pedidos. Você verá o preparo, a situação do pagamento e a previsão de entrega quando a loja agendar.']
    ]],
    ['Pagamento', [
      ['Quais formas de pagamento são aceitas?', 'A tela prevê Pix, cartão e dinheiro, mas ainda não processa pagamentos. Confirme as formas aceitas com a equipe.'],
      ['Como pago por Pix?', 'Solicite os dados de pagamento à equipe. Este chat não gera chave Pix nem confirma pagamentos.'],
      ['Posso pagar na entrega?', pending],
      ['Aceitam crédito e débito?', 'Essas opções aparecem no protótipo. A disponibilidade precisa ser confirmada com o atendimento.'],
      ['Posso parcelar?', pending],
      ['Como solicito troco?', 'Selecione Dinheiro em Fazer pedido e informe no campo Troco o valor que você entregará. Esse valor precisa ser igual ou maior que o total do pedido.'],
      ['Paguei, mas aparece pendente. O que faço?', 'Peça ao atendimento para verificar a compra. Este chat não tem acesso a transações. Não envie senha ou dados completos de cartão.']
    ]],
    ['Entrega', [
      ['Entregam no meu bairro ou cidade?', 'A área de entrega ainda não está cadastrada. Informe seu bairro ou CEP diretamente ao atendimento para consultar.'],
      ['Quanto custa a entrega?', 'A taxa configurada pela loja aparece no resumo em Fazer pedido. Selecionar Retirada no local remove essa taxa.'],
      ['Qual é o prazo de entrega?', pending],
      ['Posso agendar uma entrega?', pending],
      ['Posso retirar no local?', 'O protótipo prevê retirada. Confirme disponibilidade, endereço e horário com a equipe antes de se deslocar.'],
      ['Qual é o endereço e horário de retirada?', pending],
      ['Posso corrigir o endereço do pedido?', 'Entre em contato com a equipe assim que possível e solicite a alteração. Aguarde a confirmação do atendimento.'],
      ['E se ninguém puder receber?', 'Combine com o atendimento como proceder. As condições de nova entrega ainda não estão publicadas.'],
      ['Meu pedido está atrasado. O que faço?', 'Fale com o atendimento e informe a identificação do pedido para que a equipe verifique a entrega.']
    ]],
    ['Encomendas', [
      ['Aceitam encomendas para festas?', pending],
      ['Qual é a antecedência para encomendar?', pending],
      ['Há desconto para grandes quantidades?', pending],
      ['Vendem para revendedores?', pending],
      ['Fazem embalagens personalizadas?', pending],
      ['Posso enviar como presente?', pending]
    ]],
    ['Conta e ajuda', [
      ['Como faço meu cadastro?', 'Clique em “Criar conta” no menu ou em “Criar conta” na página de login. Preencha nome, e-mail, telefone com DDD, senha e confirmação, aceite os termos e envie. Depois entre para acessar os pedidos.'],
      ['Esqueci minha senha. Como recupero?', 'A recuperação automática de senha ainda não está disponível. Consulte a equipe para solicitar ajuda com o acesso.'],
      ['Como atualizo telefone ou endereço?', 'Ainda não há edição de conta. Se já combinou uma compra, informe a atualização diretamente à equipe.'],
      ['Como cancelo um pedido?', 'Solicite o cancelamento diretamente ao atendimento. Este chat não altera pedidos; a equipe precisa verificar a solicitação.'],
      ['O pedido veio errado ou danificado. E agora?', 'Entre em contato com a equipe, descreva o problema e informe o pedido. Se possível, tenha fotos do produto e da embalagem para ajudar na análise.'],
      ['Como solicito troca ou reembolso?', 'Fale com o atendimento para registrar sua solicitação. As condições da empresa ainda não estão publicadas neste protótipo.'],
      ['Qual é o horário de atendimento?', pending],
      ['Como falo com uma pessoa?', 'O atendimento humano ainda não está integrado a este chat. O botão “Falar com atendente” mostra o telefone e o e-mail informados no site.']
    ]]
  ];
  const launcher = document.createElement('button');
  launcher.className = 'chat-launcher';
  launcher.textContent = 'Tire suas dúvidas';
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'sabor-chat');
  const panel = document.createElement('aside');
  panel.id = 'sabor-chat';
  panel.className = 'chat-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Chat de dúvidas Sabor Arte');
  panel.innerHTML = `<header class="chat-header"><span class="chat-avatar" aria-hidden="true">SA</span><div><strong>Olá, somos a Sabor Arte!</strong><small>Seu guia de dúvidas e pedidos</small></div><button class="chat-close" aria-label="Fechar chat">×</button></header><div class="chat-log" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversa"></div><div class="chat-footer"><button class="chat-home">Ver todos os assuntos</button><form class="chat-form"><input class="chat-input" aria-label="Sua pergunta" placeholder="Digite sua dúvida…" maxlength="300" autocomplete="off"><button class="chat-send" type="submit">Enviar</button></form><p class="chat-note">Respostas automáticas • Não envie dados pessoais aqui.</p></div>`;
  document.body.append(panel, launcher);
  const log = panel.querySelector('.chat-log');
  const input = panel.querySelector('.chat-input');
  // Keep long conversations responsive and retain only the most recent messages.
  const maxHistory = 120;
  const scroll = () => {
    while (log.children.length > maxHistory) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  };
  function message(text, user = false) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-message' + (user ? ' user' : '');
    bubble.textContent = text;
    log.append(bubble);
    scroll();
    return bubble;
  }
  function options(items) {
    // Only the current choices remain interactive, including for keyboard users.
    log.querySelectorAll('.chat-options').forEach(element => element.remove());
    const box = document.createElement('div');
    box.className = 'chat-options';
    for (const [label, action] of items) {
      const button = document.createElement('button');
      button.className = 'chat-option';
      button.textContent = label;
      button.addEventListener('click', () => {
        action();
        log.querySelector('.chat-options button')?.focus({ preventScroll: true });
      });
      box.append(button);
    }
    log.append(box);
    scroll();
    // Show the beginning of a long list instead of jumping past its first items.
    log.scrollTop += box.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
  }
  function contact() {
    message('Falar com atendente', true);
    const bubble = message('Ainda não há transferência para um atendente neste chat. Estes são os contatos informados no site; nenhuma mensagem é enviada automaticamente:');
    for (const [label, href] of [['Ligar: (11) 99901-6165', 'tel:+5511999016165'], ['E-mail: edilsonrmaia@hotmail.com', 'mailto:edilsonrmaia@hotmail.com']]) {
      const link = document.createElement('a');
      link.className = 'chat-contact';
      link.textContent = label;
      link.href = href;
      bubble.append(link);
    }
    options([['Voltar aos assuntos', home]]);
  }
  function answer(item) {
    message(item[0], true);
    message(item[1]);
    options([['Falar com atendente', contact], ['Outra dúvida', home]]);
  }
  function home() {
    message('Como podemos ajudar? Escolha um assunto ou digite uma pergunta.');
    options(groups.map(([name, questions]) => [name, () => {
      message(name, true);
      message('Escolha a dúvida que você quer esclarecer:');
      options(questions.map(item => [item[0], () => answer(item)]));
    }]).concat([['Falar com atendente', contact]]));
  }
  function toggle(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) {
      input.focus({ preventScroll: true });
      const choices = log.querySelector('.chat-options');
      if (choices) log.scrollTop += choices.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
    } else launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener('click', () => toggle(panel.hidden));
  panel.querySelector('.chat-close').addEventListener('click', () => toggle(false));
  panel.querySelector('.chat-home').addEventListener('click', () => {
    home();
    log.querySelector('.chat-options button')?.focus({ preventScroll: true });
  });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') toggle(false); });
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const stop = new Set('a o os as e de do da dos das um uma que qual quais como meu minha meus minhas para por em no na com se eu voces posso tem sao quanto'.split(' '));
  const aliases = {
    preco: 'custa', precos: 'custa', valor: 'custa', valores: 'custa', custa: 'custa', custam: 'custa',
    comprar: 'pedido', compra: 'pedido', pedidos: 'pedido',
    alergia: 'alergenicos', alergias: 'alergenicos', alergico: 'alergenicos', alergenico: 'alergenicos',
    cancelar: 'cancelo', cancelamento: 'cancelo', cancela: 'cancelo',
    humano: 'pessoa', atendente: 'pessoa', atendentes: 'pessoa',
    cartoes: 'cartao', credito: 'cartao', debito: 'cartao',
    tamanhos: 'tamanho', peso: 'tamanho', pesos: 'tamanho', gramas: 'tamanho', gramatura: 'tamanho',
    conservar: 'guardar', conservacao: 'guardar', armazenar: 'guardar', armazenamento: 'guardar',
    rastrear: 'acompanho', rastreamento: 'acompanho', acompanhar: 'acompanho', status: 'acompanho',
    estoque: 'disponibilidade', disponivel: 'disponibilidade', disponiveis: 'disponibilidade',
    cadastro: 'cadastro', cadastrar: 'cadastro', registro: 'cadastro',
    vencimento: 'validade', vence: 'validade', durabilidade: 'validade',
    retirar: 'retirada', parcelamento: 'parcelar', parcelas: 'parcelar',
    atrasou: 'atrasado', atraso: 'atrasado', atrasada: 'atrasado',
    devolucao: 'reembolso', devolver: 'reembolso', trocar: 'troca',
    sabores: 'sabor', ingredientes: 'ingrediente', embalagens: 'embalagem'
  };
  function tokens(text) { return [...new Set(normalize(text).split(/\s+/).filter(t => t && !stop.has(t)).map(t => aliases[t] || t))]; }
  const keywords = new Map([
    ['Quais formas de pagamento são aceitas?', 'pagar dinheiro boleto'],
    ['Quanto custa a entrega?', 'frete taxa'],
    ['Como consulto a disponibilidade?', 'esgotado produto falta'],
    ['Quais são os pesos das embalagens?', 'pacote gramas tamanho'],
    ['Qual é o prazo de entrega?', 'demora dias chegar tempo'],
    ['Como falo com uma pessoa?', 'contato suporte ajuda telefone email'],
    ['Como faço meu cadastro?', 'criar conta registrar'],
    ['Como acompanho meu pedido?', 'onde esta pedido rastrear'],
    ['Posso pedir pelo WhatsApp?', 'zap whats'],
    ['Existe opção sem açúcar ou sem corante?', 'diet zero acucar'],
    ['O pedido veio errado ou danificado. E agora?', 'quebrado embalagem aberta estragado'],
    ['Qual é o endereço e horário de retirada?', 'localizacao loja endereco'],
    ['Há desconto para grandes quantidades?', 'atacado promocao cupom']
  ]);
  const searchIndex = groups.flatMap(([, items]) => items).map(item => ({item, words: tokens(item[0] + ' ' + (keywords.get(item[0]) || ''))}));
  const frequencies = new Map();
  searchIndex.forEach(({words}) => words.forEach(word => frequencies.set(word, (frequencies.get(word) || 0) + 1)));
  panel.querySelector('.chat-form').addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim().slice(0, 300);
    if (!query) return;
    input.value = '';
    message(query, true);
    if (/^(oi|ola|bom dia|boa tarde|boa noite|menu)$/.test(normalize(query).trim())) { home(); return; }
    const words = tokens(query);
    const ranked = searchIndex.map(({item, words: indexedWords}) => ({
      item,
      score: normalize(query) === normalize(item[0]) ? 1000 : words.reduce((score, word) => score + (indexedWords.includes(word) ? 1 + Math.log(searchIndex.length / frequencies.get(word)) : 0), 0)
    })).filter(match => match.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
    if (ranked.length) {
      message('Encontrei estas perguntas. Qual delas corresponde à sua dúvida?');
      options(ranked.map(({item}) => [item[0], () => answer(item)]));
    } else {
      message('Ainda não encontrei uma resposta para essa pergunta. Você pode escolher um assunto ou falar com a equipe.');
      options([['Ver assuntos', home], ['Falar com atendente', contact]]);
    }
  });
  message('Bem-vindo à Sabor Arte! Escolha um assunto ou escreva sua dúvida. As respostas são automáticas; este chat não registra pedidos.');
  home();
  if (location.hash === '#chat') toggle(true);
})();
