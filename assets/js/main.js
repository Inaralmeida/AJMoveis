(function () {
  'use strict';

  var cfg = window.AJ_CONFIG || {};
  var products = window.PRODUCTS || [];

  var CATEGORIES = [
    { id: 'estantes', label: 'Estantes de aço' },
    { id: 'gondolas', label: 'Gôndolas' },
    { id: 'aco', label: 'Roupeiros e armários de aço' },
    { id: 'escritorio', label: 'Mesas e escritório' },
    { id: 'cadeiras', label: 'Cadeiras' },
  ];
  var PAGE = 12;
  var FRETE_GRATIS_MIN = 10;

  // ---------- Rastreamento (Google Tag Manager) ----------
  window.dataLayer = window.dataLayer || [];
  if (cfg.gtmId) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(cfg.gtmId);
    document.head.appendChild(s);
  }
  function track(event, data) {
    var payload = { event: event };
    for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
  }

  // ---------- WhatsApp com rodízio de atendentes ----------
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* navegação privada */ }
  }

  // Sorteia uma atendente na primeira visita e mantém a mesma nas próximas.
  var attendant = (function () {
    var list = cfg.atendentes || [];
    var i = parseInt(storageGet('aj_atendente'), 10);
    if (!(i >= 0 && i < list.length)) {
      i = Math.floor(Math.random() * list.length);
      storageSet('aj_atendente', String(i));
    }
    return list[i] || { nome: '', numero: '' };
  })();

  function waUrl(msg) {
    return 'https://wa.me/' + attendant.numero + '?text=' + encodeURIComponent(msg);
  }

  function bindWa(el, msg) {
    el.href = waUrl(msg);
    el.target = '_blank';
    el.rel = 'noopener';
  }

  document.querySelectorAll('[data-wa][data-msg]').forEach(function (el) {
    bindWa(el, el.getAttribute('data-msg'));
  });

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-wa]');
    if (!el) return;
    track('whatsapp_click', {
      origem: el.getAttribute('data-wa'),
      produto: el.getAttribute('data-produto') || '',
      atendente: attendant.nome,
    });
  });

  // ---------- Menu mobile ----------
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // ---------- Produtos ----------
  function normalize(s) {
    return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Extrai carga, medidas e garantia da descrição para mostrar em destaque.
  function specs(p) {
    var out = [];
    var carga = p.d.match(/(?:suporta até|capacidade(?: de)?:?)\s*([\d.,]+\s*(?:kg|pastas AZ)[^.]*)/i);
    if (carga) out.push(['Carga', carga[1].trim()]);
    var dim = p.d.match(/Dimensões(?: externas)?:\s*(.+?)(?:\.(?:\s|$)|$)/i);
    if (dim) out.push(['Medidas', dim[1].trim()]);
    if (/garantia de 5 anos/i.test(p.d)) out.push(['Garantia', '5 anos do fabricante']);
    return out;
  }

  function productLabel(p) {
    return p.n + (p.c ? ' (cód. ' + p.c + ')' : '');
  }

  function productMsg(p) {
    return 'Olá! Vim pelo site da AJ Móveis e quero um orçamento de:\n\n' +
      '*' + productLabel(p) + '*\n' +
      'Quantidade: \nCidade de entrega: ';
  }

  function specsHtml(list) {
    return list.map(function (s) {
      return '<li><b>' + s[0] + ':</b> <span>' + escapeHtml(s[1]) + '</span></li>';
    }).join('');
  }

  var PROMOS = [
    {
      at: 6,
      html: '<article class="card card--promo reveal">' +
        '<span class="card--promo__kicker">Vantagem AJ</span>' +
        '<h3>Leve 10 peças e o frete é grátis</h3>' +
        '<p>Vale para estantes, cadeiras, mesas e tudo do catálogo.</p>' +
        '<a class="btn btn--ink" href="#orcamento">Montar meu orçamento</a>' +
      '</article>',
    },
    {
      at: 17,
      html: '<article class="card card--promo card--promo-alt reveal">' +
        '<span class="card--promo__kicker">Sem risco</span>' +
        '<h3>Você só paga quando receber</h3>' +
        '<p>E no pagamento à vista ainda ganha 3% de desconto.</p>' +
        '<a class="btn btn--ink" data-wa="card-promo" data-msg="Olá! Vim pelo site da AJ Móveis e quero fazer um pedido com pagamento na entrega.">Pedir no WhatsApp</a>' +
      '</article>',
    },
  ];
  var grid = document.getElementById('grid');
  var filters = document.getElementById('filters');
  var search = document.getElementById('search');
  var moreBtn = document.getElementById('more');
  var empty = document.getElementById('empty');
  var state = { cat: 'todos', q: '', limit: PAGE, showAll: false };

  // Destaques da aba "Todos": um ou dois produtos de cada categoria.
  var FEATURED = [
    'Estante de Aço 30 cm Leve',
    'Estante de Aço 58/60 cm Pesada',
    'Gôndola Central',
    'Roupeiro de Aço 8 Portas Grandes',
    'Armário de Aço 2 Portas PC 90',
    'Mesa Reta Econômica com Gaveta',
    'Cadeira Executiva Ergonômica Back System',
  ].map(function (name) {
    return products.filter(function (p) { return p.n === name; })[0];
  }).filter(Boolean);
  var FEATURED_PROMO_AT = 5;

  function isFeaturedView() {
    return state.cat === 'todos' && !state.q && !state.showAll;
  }

  function filtered() {
    var q = normalize(state.q);
    return products.filter(function (p) {
      if (state.cat !== 'todos' && p.g !== state.cat) return false;
      if (q && normalize(p.n + ' ' + p.c).indexOf(q) === -1) return false;
      return true;
    });
  }

  function renderFilters() {
    var all = [{ id: 'todos', label: 'Todos' }].concat(CATEGORIES);
    filters.innerHTML = all.map(function (c) {
      var n = c.id === 'todos' ? products.length : products.filter(function (p) { return p.g === c.id; }).length;
      return '<button class="chip" role="tab" data-cat="' + c.id + '" aria-selected="' + (state.cat === c.id) + '">' +
        c.label + '<span>' + n + '</span></button>';
    }).join('');
  }

  function renderGrid() {
    var featured = isFeaturedView();
    var list = featured ? FEATURED : filtered();
    var visible = featured ? list : list.slice(0, state.limit);
    var cards = visible.map(function (p) {
      var i = products.indexOf(p);
      var sp = specs(p).filter(function (s) { return s[0] !== 'Garantia'; }).slice(0, 2);
      return '<article class="card reveal">' +
        '<button class="card__img" data-open="' + i + '" aria-label="Ver detalhes de ' + escapeHtml(p.n) + '">' +
          (p.tag ? '<span class="card__tag">' + escapeHtml(p.tag) + '</span>' : '') +
          '<img src="' + p.img + '" alt="' + escapeHtml(p.n) + '" loading="lazy" width="500" height="500">' +
        '</button>' +
        '<div class="card__body">' +
          (p.c ? '<span class="card__code">Cód. ' + escapeHtml(p.c) + '</span>' : '') +
          '<h3>' + escapeHtml(p.n) + '</h3>' +
          (sp.length ? '<ul class="specs">' + specsHtml(sp) + '</ul>' : '<ul class="specs"><li>Medidas e acabamentos sob consulta</li></ul>') +
          '<div class="card__actions">' +
            '<a class="btn btn--wa" data-wa="card-produto" data-produto="' + escapeHtml(productLabel(p)) + '" data-idx="' + i + '">' +
              '<svg><use href="#i-wa"/></svg> Cotar</a>' +
            '<button class="btn card__more" data-open="' + i + '">Detalhes</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    });
    // Cards de vantagem no meio do catálogo.
    if (featured) {
      cards.splice(FEATURED_PROMO_AT, 0, PROMOS[0].html);
    } else {
      PROMOS.forEach(function (promo) {
        if (cards.length > promo.at) cards.splice(promo.at, 0, promo.html);
      });
    }
    grid.innerHTML = cards.join('');

    grid.querySelectorAll('.card--promo [data-msg]').forEach(function (a) { bindWa(a, a.getAttribute('data-msg')); });
    grid.querySelectorAll('a[data-idx]').forEach(function (a) {
      bindWa(a, productMsg(products[+a.getAttribute('data-idx')]));
    });

    empty.hidden = list.length > 0;
    if (featured) {
      moreBtn.hidden = false;
      moreBtn.textContent = 'Ver todos os ' + products.length + ' produtos';
    } else {
      moreBtn.hidden = list.length <= state.limit;
      moreBtn.textContent = 'Ver mais produtos (' + (list.length - state.limit) + ')';
    }
    if (typeof revealObserver !== 'undefined') observeReveals(grid);
  }

  filters.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]');
    if (!b) return;
    state.cat = b.getAttribute('data-cat');
    state.limit = PAGE;
    state.showAll = false;
    renderFilters();
    renderGrid();
    track('filtro_catalogo', { categoria: state.cat });
  });

  var searchTimer;
  search.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      state.q = search.value;
      state.limit = PAGE;
      renderGrid();
    }, 150);
  });

  moreBtn.addEventListener('click', function () {
    if (isFeaturedView()) {
      state.showAll = true;
      state.limit = PAGE;
      renderGrid();
      return;
    }
    state.limit += PAGE;
    renderGrid();
  });

  // ---------- Modal de detalhes ----------
  var modal = document.getElementById('modal');
  var mCta = document.getElementById('mCta');

  function openModal(p) {
    document.getElementById('mImg').src = p.img;
    document.getElementById('mImg').alt = p.n;
    document.getElementById('mCode').textContent = p.c ? 'Código ' + p.c : '';
    document.getElementById('mTitle').textContent = p.n;
    document.getElementById('mSpecs').innerHTML = specsHtml(specs(p));
    document.getElementById('mDesc').textContent = p.d || 'Fale com a gente pelo WhatsApp para saber medidas, cores e acabamentos disponíveis.';
    mCta.setAttribute('data-produto', productLabel(p));
    bindWa(mCta, productMsg(p));
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    track('ver_produto', { produto: productLabel(p) });
  }

  grid.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]');
    if (b) openModal(products[+b.getAttribute('data-open')]);
  });
  document.getElementById('mClose').addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  // ---------- Simulador de orçamento ----------
  var form = document.getElementById('quoteForm');
  var qCat = document.getElementById('qCat');
  var qProd = document.getElementById('qProd');
  var qQtd = document.getElementById('qQtd');
  var qCity = document.getElementById('qCity');
  var qName = document.getElementById('qName');
  var qSummary = document.getElementById('qSummary');
  var qError = document.getElementById('qError');

  qCat.innerHTML = '<option value="">Selecione</option>' +
    CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join('') +
    '<option value="varios">Mais de um tipo de produto</option>';

  // Sem categoria escolhida, mostra todos os modelos agrupados; com categoria, só os dela.
  function fillModels(keep) {
    var cats = CATEGORIES.filter(function (c) {
      return !qCat.value || qCat.value === 'varios' || c.id === qCat.value;
    });
    qProd.innerHTML = '<option value="">Ainda não sei / quero indicação</option>' +
      cats.map(function (c) {
        return '<optgroup label="' + c.label + '">' +
          products.map(function (p, i) {
            return p.g === c.id ? '<option value="' + i + '">' + escapeHtml(productLabel(p)) + '</option>' : '';
          }).join('') +
          '</optgroup>';
      }).join('');
    if (keep !== undefined) qProd.value = keep;
  }

  // Escolher o modelo primeiro também preenche a categoria.
  qProd.addEventListener('change', function () {
    if (qProd.value === '') return;
    var p = products[+qProd.value];
    if (qCat.value !== p.g && qCat.value !== 'varios') {
      var chosen = qProd.value;
      qCat.value = p.g;
      fillModels(chosen);
    }
    updateSummary();
  });

  function cityZone() {
    var opt = qCity.options[qCity.selectedIndex];
    return opt ? opt.getAttribute('data-zone') : null;
  }

  function line(text) {
    return '<div><svg><use href="#i-check"/></svg><span>' + text + '</span></div>';
  }

  function updateSummary() {
    var html = '';
    var zone = cityZone();
    var city = qCity.value;
    if (zone === 'abc') html += line('<b>Entrega no mesmo dia</b> em ' + escapeHtml(city));
    else if (zone === 'gsp') html += line('<b>Entrega em até 5 dias úteis</b>');
    else if (zone === 'outra') html += line('Prazo de entrega <b>combinado com você</b>');

    var q = parseInt(qQtd.value, 10) || 0;
    if (q >= FRETE_GRATIS_MIN) html += line('<b>Frete grátis</b> (10 peças ou mais)');
    else if (q > 0 && qCat.value) {
      var falta = FRETE_GRATIS_MIN - q;
      html += line('Faltam <b>' + falta + (falta === 1 ? ' peça' : ' peças') + '</b> para ganhar frete grátis');
    }
    if (html) html += line('Pagamento na entrega, com <b>3% de desconto</b> à vista');
    qSummary.innerHTML = html;
  }

  qCat.addEventListener('change', function () { fillModels(); updateSummary(); });
  [qQtd, qCity].forEach(function (el) {
    el.addEventListener('input', updateSummary);
    el.addEventListener('change', updateSummary);
  });
  fillModels();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = parseInt(qQtd.value, 10);
    if (!qCat.value || !qCity.value || !qName.value.trim() || !(q > 0)) {
      qError.hidden = false;
      return;
    }
    qError.hidden = true;

    var catLabel = qCat.options[qCat.selectedIndex].text;
    var prod = qProd.value !== '' ? productLabel(products[+qProd.value]) : 'Quero uma indicação';
    var msg = 'Olá! Meu nome é ' + qName.value.trim() + '. Montei um pedido no site da AJ Móveis:\n\n' +
      '• *Produto:* ' + catLabel + '\n' +
      '• *Modelo:* ' + prod + '\n' +
      '• *Quantidade:* ' + q + '\n' +
      '• *Entrega em:* ' + qCity.value + '\n\n' +
      'Pode me passar o valor e o prazo de entrega?';

    track('whatsapp_click', { origem: 'simulador', produto: prod, atendente: attendant.nome });
    track('orcamento_enviado', { categoria: qCat.value, quantidade: q, cidade: qCity.value });

    var url = waUrl(msg);
    // Sem "noopener" aqui: com ele o window.open sempre retorna null e o fallback dispararia.
    var win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  });

  // ---------- Aparecer ao rolar ----------
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealObserver = 'IntersectionObserver' in window && !reduceMotion
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px' })
    : null;

  function observeReveals(root) {
    var items = (root || document).querySelectorAll('.reveal:not(.is-in)');
    items.forEach(function (el, i) {
      if (!revealObserver) { el.classList.add('is-in'); return; }
      // Itens lado a lado entram em sequência.
      el.style.setProperty('--d', (i % 4) * 0.08 + 's');
      revealObserver.observe(el);
    });
  }

  // ---------- Header ao rolar ----------
  var header = document.querySelector('.header');
  var toTop = document.getElementById('toTop');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 700);
  }
  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      track('voltar_topo', {});
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Carrossel do hero ----------
  (function () {
    var SLIDE_MS = 5000;
    var slides = document.querySelectorAll('#heroSlides img');
    var dotsBox = document.getElementById('heroDots');
    var caption = document.getElementById('heroCaption');
    if (slides.length < 2) return;
    dotsBox.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    var current = 0;
    var timer;

    dotsBox.innerHTML = Array.prototype.map.call(slides, function (s, i) {
      return '<button role="tab" aria-label="Foto ' + (i + 1) + '" aria-selected="' + (i === 0) + '" data-slide="' + i + '"></button>';
    }).join('');
    var dots = dotsBox.querySelectorAll('button');

    function show(i) {
      slides[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');
      current = (i + slides.length) % slides.length;
      var img = slides[current];
      if (img.loading === 'lazy') img.loading = 'eager';
      img.classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
      caption.classList.add('is-fading');
      setTimeout(function () {
        caption.textContent = img.getAttribute('data-caption');
        caption.classList.remove('is-fading');
      }, 300);
    }
    function start() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, SLIDE_MS);
    }
    dotsBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-slide]');
      if (!b) return;
      show(+b.getAttribute('data-slide'));
      start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearInterval(timer); else start();
    });
    // Carrega as próximas fotos depois que a página abre, para a troca ser suave.
    window.addEventListener('load', function () {
      slides.forEach(function (s) { s.loading = 'eager'; });
    });
    start();
  })();

  // ---------- Fotos dos projetos (ampliar) ----------
  (function () {
    var lb = document.getElementById('lightbox');
    var items = document.querySelectorAll('#gallery [data-photo]');
    var lbImg = document.getElementById('lbImg');
    var lbCap = document.getElementById('lbCap');
    var index = 0;

    function showPhoto(i) {
      index = (i + items.length) % items.length;
      var img = items[index].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = items[index].querySelector('span').textContent;
    }
    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        showPhoto(i);
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
        track('ver_foto_projeto', { foto: i + 1 });
      });
    });
    document.getElementById('lbPrev').addEventListener('click', function () { showPhoto(index - 1); });
    document.getElementById('lbNext').addEventListener('click', function () { showPhoto(index + 1); });
    document.getElementById('lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') showPhoto(index - 1);
      if (e.key === 'ArrowRight') showPhoto(index + 1);
    });
  })();

  // Links que abrem o catálogo já filtrado (ex.: "Ver estantes").
  document.querySelectorAll('[data-filter]').forEach(function (a) {
    a.addEventListener('click', function () {
      state.cat = a.getAttribute('data-filter');
      state.limit = PAGE;
      renderFilters();
      renderGrid();
    });
  });

  // ---------- Números que contam ----------
  (function () {
    var nums = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    function run(el) {
      var to = +el.getAttribute('data-count');
      var from = +(el.getAttribute('data-from') || 0);
      var start = null;
      function step(t) {
        if (!start) start = t;
        var k = Math.min((t - start) / 1400, 1);
        var eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(from + (to - from) * eased);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: .6 });
    nums.forEach(function (n) {
      n.textContent = n.getAttribute('data-from') || '0';
      io.observe(n);
    });
  })();

  // ---------- Barra de progresso da rolagem ----------
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ---------- Luz que segue o mouse nos cards (usada no tema escuro) ----------
  grid.addEventListener('pointermove', function (e) {
    var card = e.target.closest('.card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // ---------- Início ----------
  renderFilters();
  renderGrid();
  observeReveals();
  document.getElementById('year').textContent = new Date().getFullYear();
})();
