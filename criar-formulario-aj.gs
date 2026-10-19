/**
 * Cria o formulário de briefing da AJ Móveis no Google Forms.
 *
 * Como usar:
 * 1. Acesse https://script.google.com e clique em "Novo projeto".
 * 2. Apague o conteúdo e cole este arquivo inteiro.
 * 3. Clique em "Executar" (função criarFormularioAJ) e autorize o acesso.
 * 4. Os links do formulário aparecem em "Registro de execução".
 *    O formulário também fica salvo no seu Google Drive.
 */
function criarFormularioAJ() {
  const form = FormApp.create('Informações para o novo site da AJ Móveis');
  form.setDescription(
    'Oi! Com estas respostas consigo montar o novo site da AJ Móveis, pensado para trazer mais orçamentos pelo WhatsApp.\n\n' +
    'Leva uns 10 minutos. Nenhuma pergunta é obrigatória, exceto as marcadas com *. ' +
    'Se não souber alguma resposta, pode deixar em branco que a gente conversa depois.\n\n' +
    'Depois de enviar, você recebe um link para editar as respostas, então dá para completar o que faltar com calma.'
  );
  form.setProgressBar(true);
  // Permite voltar e completar ou corrigir depois de enviar.
  form.setAllowResponseEdits(true);
  form.setCollectEmail(false);

  const emailValido = FormApp.createTextValidation()
    .requireTextIsEmail()
    .setHelpText('Digite um e-mail válido.')
    .build();
  const linkValido = FormApp.createTextValidation()
    .requireTextIsUrl()
    .setHelpText('Cole o link completo, começando com https://')
    .build();

  // ---------- Seção 1: Empresa ----------
  secao(form, '1. Sobre a empresa', 'Informações que passam confiança para quem visita o site.');

  texto(form, 'Há quantos anos a AJ Móveis existe?', 'Ex.: 12 anos, ou desde 2012.');
  escolha(form, 'Quantos clientes, aproximadamente, vocês já atenderam?',
    ['Até 100', 'De 100 a 500', 'De 500 a 1.000', 'Mais de 1.000']);
  texto(form, 'Razão social e CNPJ', 'Como deve aparecer no rodapé do site.');
  paragrafo(form, 'Tem clientes conhecidos que posso citar no site?',
    'Ex.: nomes de mercados, empresas ou indústrias que já compraram de vocês.');
  escolha(form, 'Posso mostrar o nome ou a logo desses clientes no site?',
    ['Sim', 'Não', 'Preciso perguntar para eles']);
  escolha(form, 'Vocês fabricam todos os produtos ou revendem alguns?',
    ['Fabricamos tudo', 'Fabricamos a maioria e revendemos alguns', 'Mais revendemos do que fabricamos'], true);

  // ---------- Seção 2: Preço e pagamento ----------
  secao(form, '2. Preço e pagamento', 'Mostrar condições claras ajuda o cliente a decidir mais rápido.');

  escolha(form, 'Posso mostrar um preço "a partir de R$" nos produtos?',
    ['Sim', 'Não, prefiro só pelo WhatsApp', 'Só em alguns produtos']);
  caixas(form, 'Quais formas de pagamento vocês aceitam?',
    ['PIX', 'Dinheiro', 'Cartão de débito', 'Cartão de crédito', 'Boleto', 'Faturado para empresa (PJ)'], true);
  texto(form, 'No cartão, parcelam em até quantas vezes? Com ou sem juros?', 'Ex.: 10x sem juros.');
  texto(form, 'Tem desconto à vista ou no PIX? De quantos %?', 'Ex.: 5% no PIX.');
  paragrafo(form, 'Tem desconto por quantidade ou pedido mínimo?',
    'Ex.: acima de 10 módulos, 8% de desconto. Pedido mínimo de R$ 500.');
  escolha(form, 'Vocês emitem nota fiscal?', ['Sim, sempre', 'Sim, quando o cliente pede', 'Não']);

  // ---------- Seção 3: Entrega e montagem ----------
  secao(form, '3. Entrega e montagem', 'Prazo e frete são as dúvidas que mais travam a compra.');

  caixas(form, 'Para quais regiões vocês entregam?',
    ['Diadema', 'ABC (Santo André, São Bernardo, São Caetano, Mauá...)', 'Capital (São Paulo)',
      'Grande São Paulo', 'Interior de SP', 'Outros estados'], true);
  paragrafo(form, 'O frete é grátis em alguma região ou acima de algum valor?',
    'Ex.: grátis em Diadema e no ABC para pedidos acima de R$ 1.000.');
  texto(form, 'Prazo de entrega dos produtos a PRONTA ENTREGA', 'Ex.: 1 a 3 dias úteis.');
  texto(form, 'Prazo de entrega dos produtos SOB MEDIDA', 'Ex.: 7 a 10 dias úteis.');
  escolha(form, 'A montagem está inclusa?',
    ['Sim, sempre grátis', 'Grátis só em algumas regiões', 'Cobrada à parte', 'Não fazemos montagem'], true);
  escolha(form, 'O cliente pode retirar na fábrica ou visitar o showroom?',
    ['Pode retirar e visitar', 'Só retirar', 'Só com agendamento', 'Não']);
  texto(form, 'Qual o prazo de garantia dos produtos? O que ela cobre?', 'Ex.: 1 ano contra defeitos de fabricação.');

  // ---------- Seção 4: Atendimento e WhatsApp ----------
  secao(form, '4. Atendimento e WhatsApp',
    'Hoje o site tem 3 números. Aqui você define para onde vão as mensagens.');

  texto(form, 'Horário de atendimento de segunda a sexta', 'Ex.: 8h às 18h.');
  escolha(form, 'Vocês atendem aos sábados?', ['Não', 'Sim, meio período', 'Sim, o dia todo'], true);
  escolha(form, 'Quanto tempo, em média, vocês levam para responder no WhatsApp?',
    ['Até 15 minutos', 'Até 1 hora', 'No mesmo dia', 'No dia seguinte']);
  escolha(form, 'Fora do horário, as mensagens do WhatsApp têm resposta automática?',
    ['Sim', 'Não', 'Não sei configurar']);
  paragrafo(form, 'Liste todos os números de WhatsApp da empresa, com o nome de quem atende e a função *',
    'Um por linha. Ex.:\n(11) 95986-2349 — Jennifer — Vendas\n(11) 96221-7901 — Paula — Projetos', true);
  escolha(form, 'Como você prefere que as mensagens do site sejam distribuídas? *',
    [
      'Tudo para um número só',
      'Orçamentos para um número, dúvidas e pós-venda para outro',
      'Revezar entre os atendentes (cada contato vai para um)',
      'O cliente escolhe com quem quer falar (como é hoje)',
    ], true, true);
  texto(form, 'Se for um número só, qual deve ser o principal?');
  texto(form, 'Tem telefone fixo? Se sim, qual?');
  texto(form, 'E-mail comercial que pode aparecer no site', '', false, emailValido);

  // ---------- Seção 5: Contatos do site (leads) ----------
  secao(form, '5. Avisos de novos contatos',
    'O novo site pode enviar um e-mail sempre que alguém fizer uma simulação de orçamento.');

  paragrafo(form, 'Quais e-mails devem receber o aviso de novo orçamento? *',
    'Um por linha.', true);
  caixas(form, 'Que informações devo pedir ao cliente no simulador de orçamento?',
    ['Nome', 'WhatsApp', 'Cidade ou CEP (para calcular frete e prazo)', 'Nome da empresa / CNPJ', 'E-mail']);

  // ---------- Seção 6: Logo e cores ----------
  secao(form, '6. Logo e cores',
    'Hoje o logo é preto e dourado e o site é azul. Aqui você escolhe como quer a identidade do novo site.');

  escolha(form, 'Você tem o arquivo original do logo?',
    [
      'Sim, em arquivo editável (AI, PDF, SVG ou CDR)',
      'Só em imagem (PNG ou JPG)',
      'Só o que está no site ou no Instagram',
      'Não tenho',
    ]);
  escolha(form, 'O que você quer fazer com o logo?',
    [
      'Manter exatamente como está',
      'Manter, mas pode dar uma modernizada',
      'Quero um logo novo',
      'Fica a seu critério',
    ]);
  escolha(form, 'Quais cores você quer no site?',
    [
      'Manter o azul do site atual',
      'Preto e dourado, combinando com o logo',
      'Grafite e prata (visual de aço, industrial)',
      'Fica a seu critério',
    ], true);
  texto(form, 'Tem alguma cor que você NÃO quer de jeito nenhum?');
  paragrafo(form, 'Tem algum site ou Instagram que você acha bonito e gostaria de usar como referência?',
    'Pode ser de qualquer área, não precisa ser de móveis. Cole os links, um por linha.');

  // ---------- Seção 7: Google, Meta e anúncios ----------
  secao(form, '7. Google, Meta e anúncios',
    'Para medir quantas pessoas clicam no WhatsApp e de onde elas vêm (Google, Instagram, anúncios).');

  escolha(form, 'A empresa tem uma conta Google (Gmail) própria?', ['Sim', 'Não', 'Uso a minha pessoal']);
  texto(form, 'Qual é o e-mail dessa conta Google?', '', false, emailValido);
  escolha(form, 'A AJ aparece no Google Maps com perfil próprio (Google Meu Negócio)?', ['Sim', 'Não', 'Não sei'], true);
  texto(form, 'Se sim, cole o link do perfil no Google Maps');
  escolha(form, 'Vocês já têm conta no Google Analytics?', ['Sim', 'Não', 'Não sei']);
  escolha(form, 'Vocês já anunciam no Google (Google Ads)?', ['Sim', 'Já anunciamos, mas paramos', 'Nunca anunciamos']);
  escolha(form, 'Vocês já anunciam no Instagram/Facebook (Meta)?', ['Sim', 'Só impulsiono posts', 'Já anunciamos, mas paramos', 'Nunca anunciamos']);
  escolha(form, 'Quanto investem (ou pretendem investir) em anúncios por mês?',
    ['Nada por enquanto', 'Até R$ 500', 'De R$ 500 a R$ 1.500', 'De R$ 1.500 a R$ 5.000', 'Mais de R$ 5.000']);
  escolha(form, 'Quem cuida das redes sociais e dos anúncios hoje?',
    ['Eu mesmo', 'Alguém da equipe', 'Uma agência ou freelancer', 'Ninguém'], true);
  escolha(form, 'Você autoriza dar acesso a essas contas (Google e Meta) para eu configurar o site?',
    ['Sim', 'Sim, mas quero conversar antes', 'Não']);

  // ---------- Seção 8: Catálogo, fotos e redes sociais ----------
  // Fica por último porque pede para sair do formulário (criar pasta, copiar links).
  secao(form, '8. Catálogo, fotos e redes sociais',
    'Fotos reais de produtos e de instalações são o que mais gera confiança no site.\n\n' +
    'Se precisar buscar algum link, abra em outra aba para não perder o que já preencheu. ' +
    'Se preferir, pode enviar o formulário agora e mandar fotos e links depois pelo WhatsApp.');

  texto(form, 'Link do catálogo de produtos', 'Cole o link do site ou do catálogo atual.', false, linkValido);
  texto(form, 'Link da pasta com fotos, vídeos e logo',
    'Crie uma pasta no Google Drive com fotos dos produtos, de instalações entregues, da fábrica e o arquivo do logo. ' +
    'Compartilhe como "Qualquer pessoa com o link" e cole o link aqui.');
  escolha(form, 'Vocês têm depoimentos ou avaliações de clientes?',
    ['Sim, no Google', 'Sim, em prints de WhatsApp', 'Sim, em vídeo', 'Ainda não'], true);
  caixas(form, 'Quais redes sociais a AJ Móveis tem?',
    ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Nenhuma'], true);
  texto(form, 'Instagram', 'Coloque o @ ou o link. Deixe em branco se não tiver.');
  texto(form, 'Facebook', 'Nome da página ou link. Deixe em branco se não tiver.');
  texto(form, 'TikTok', 'Coloque o @ ou o link. Deixe em branco se não tiver.');
  texto(form, 'YouTube', 'Link do canal. Deixe em branco se não tiver.');
  texto(form, 'LinkedIn', 'Link da página. Deixe em branco se não tiver.');
  escolha(form, 'A AJ tem um domínio próprio (ex.: ajmoveis.com.br)?', ['Sim', 'Não', 'Não sei']);
  texto(form, 'Se tiver, qual é o domínio e quem tem acesso a ele?', 'Ex.: ajmoveis.com.br — registrado no Registro.br pelo João.');

  // ---------- Seção 9: Final ----------
  secao(form, '9. Para finalizar');

  escolha(form, 'Autoriza usar no site as fotos e os depoimentos que você enviar?', ['Sim', 'Não', 'Quero ver antes']);
  paragrafo(form, 'Tem mais alguma coisa que você gostaria que o site tivesse ou mostrasse?');
  form.setConfirmationMessage('Obrigada! Recebi suas respostas e logo falo com você.');

  // Formulários novos podem ser criados como "não publicados"; publica se a API permitir.
  if (typeof form.setPublished === 'function') form.setPublished(true);

  Logger.log('Link para responder: ' + form.getPublishedUrl());
  Logger.log('Link para editar: ' + form.getEditUrl());
}

// ---------- Funções auxiliares ----------

function secao(form, titulo, descricao) {
  const item = form.addPageBreakItem().setTitle(titulo);
  if (descricao) item.setHelpText(descricao);
}

function texto(form, titulo, ajuda, obrigatorio, validacao) {
  const item = form.addTextItem().setTitle(titulo).setRequired(!!obrigatorio);
  if (ajuda) item.setHelpText(ajuda);
  if (validacao) item.setValidation(validacao);
}

function paragrafo(form, titulo, ajuda, obrigatorio) {
  const item = form.addParagraphTextItem().setTitle(titulo).setRequired(!!obrigatorio);
  if (ajuda) item.setHelpText(ajuda);
}

function escolha(form, titulo, opcoes, permiteOutro, obrigatorio) {
  form.addMultipleChoiceItem()
    .setTitle(titulo)
    .setChoiceValues(opcoes)
    .showOtherOption(!!permiteOutro)
    .setRequired(!!obrigatorio);
}

function caixas(form, titulo, opcoes, permiteOutro) {
  form.addCheckboxItem()
    .setTitle(titulo)
    .setChoiceValues(opcoes)
    .showOtherOption(!!permiteOutro);
}
