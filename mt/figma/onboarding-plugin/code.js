// MT Onboarding Builder
//
// Rebuilds the mt/onboarding.html account-opening flow on the "Onboarding"
// page of the "Teste MDL · MT Pagamentos" file: 9 screens + an error state +
// a terms overlay, wired as a clickable prototype. It uses the MT components
// and variables already in the file (found by name) and can be re-run: it
// replaces the frames it created before.

const PAGE_NAME = 'Onboarding';
const PREFIX = 'Onboarding / ';
const W = 412;
const H = 860;
const GAP = 80;

const FONTS = [
  { family: 'Outfit', style: 'Medium' },
  { family: 'Outfit', style: 'SemiBold' },
  { family: 'Inter', style: 'Regular' },
  { family: 'Inter', style: 'Medium' },
  { family: 'Material Icons', style: 'Regular' }
];

async function main() {
  await figma.loadAllPagesAsync();
  await Promise.all(FONTS.map((f) => figma.loadFontAsync(f)));

  const page = figma.root.children.find((p) => p.name === PAGE_NAME);
  if (!page) { throw new Error('Página "' + PAGE_NAME + '" não encontrada.'); }
  await figma.setCurrentPageAsync(page);

  // ---------- Design system lookups ----------
  const components = figma.root.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] });
  function component(name) {
    const found = components.find((c) => c.name === name && (c.type === 'COMPONENT_SET' || c.parent.type !== 'COMPONENT_SET'));
    if (!found) { throw new Error('Componente "' + name + '" não encontrado.'); }
    return found;
  }
  function variant(setName, variantName) {
    const set = component(setName);
    const v = set.children.find((c) => c.name === variantName);
    if (!v) { throw new Error('Variante "' + variantName + '" de "' + setName + '" não encontrada.'); }
    return v;
  }
  const C = {
    button: component('MT Button'),
    field: component('MT Text Field'),
    checkbox: component('MT Checkbox'),
    radio: component('MT Radio'),
    sw: component('MT Switch'),
    otp: component('MT OTP Box'),
    rule: component('MT Password Rule'),
    tile: component('MT Capture Tile'),
    appBar: component('MT App Bar'),
    progress: component('MT Progress'),
    reviewRow: component('MT Review Row'),
    benefit: component('MT Benefit'),
    listItem: component('MT List Item')
  };

  const colorVars = await figma.variables.getLocalVariablesAsync('COLOR');
  const floatVars = await figma.variables.getLocalVariablesAsync('FLOAT');
  function colorVar(name) {
    const v = colorVars.find((x) => x.name.split('/').pop() === name);
    if (!v) { throw new Error('Variável de cor "' + name + '" não encontrada.'); }
    return v;
  }
  // Variable-bound paints only keep their opacity when it is set on the
  // paint already applied to the node, so apply opacity in a second pass.
  function paint(name) {
    return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', colorVar(name));
  }
  function fill(node, name, opacity) {
    node.fills = [paint(name)];
    if (opacity !== undefined) { node.fills = [Object.assign({}, node.fills[0], { opacity: opacity })]; }
  }
  function stroke(node, name, weight, opacity) {
    node.strokes = [paint(name)];
    node.strokeWeight = weight || 1;
    node.strokeAlign = 'INSIDE';
    if (opacity !== undefined) { node.strokes = [Object.assign({}, node.strokes[0], { opacity: opacity })]; }
  }
  function radius(node, name) {
    const v = floatVars.find((x) => x.name === 'rounded-' + name);
    ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'].forEach((c) => node.setBoundVariable(c, v));
  }
  const textStyles = {};
  (await figma.getLocalTextStylesAsync()).forEach((s) => { textStyles[s.name.replace('MT/', '')] = s.id; });

  // ---------- Fixes on components created over MCP ----------
  const disabled = variant('MT Text Field', 'State=Disabled').findOne((n) => n.name === 'field');
  disabled.strokes = [Object.assign({}, disabled.strokes[0], { opacity: 0.12 })];
  const doneBox = variant('MT Capture Tile', 'State=Done').findOne((n) => n.name === 'icon box');
  doneBox.fills = [Object.assign({}, doneBox.fills[0], { opacity: 0.14 })];
  C.button.children.forEach((b) => { b.primaryAxisAlignItems = 'CENTER'; });

  // ---------- Builders ----------
  async function text(chars, style, color, opts) {
    const t = figma.createText();
    await t.setTextStyleIdAsync(textStyles[style]);
    t.characters = chars;
    if (color) { fill(t, color); }
    if (opts && opts.align) { t.textAlignHorizontal = opts.align; }
    return t;
  }
  async function icon(glyph, size, color) {
    const t = figma.createText();
    t.fontName = { family: 'Material Icons', style: 'Regular' };
    t.fontSize = size;
    t.lineHeight = { unit: 'PIXELS', value: size };
    t.characters = glyph;
    t.name = 'icon/' + glyph;
    if (color) { fill(t, color); }
    return t;
  }
  // Auto-layout frame that hugs its content on both axes.
  function autoLayout(dir, name, props) {
    const f = figma.createFrame();
    f.name = name;
    f.layoutMode = dir;
    f.primaryAxisSizingMode = 'AUTO';
    f.counterAxisSizingMode = 'AUTO';
    f.fills = [];
    f.clipsContent = false;
    Object.keys(props || {}).forEach((k) => { f[k] = props[k]; });
    return f;
  }
  function setProps(instance, values) {
    const map = {};
    Object.keys(instance.componentProperties).forEach((key) => {
      const base = key.split('#')[0];
      if (base in values) { map[key] = values[base]; }
    });
    instance.setProperties(map);
    return instance;
  }
  function add(parent, node, fillWidth) {
    parent.appendChild(node);
    if (fillWidth) { node.layoutSizingHorizontal = 'FILL'; }
    return node;
  }
  async function para(parent, chars, style, color, align) {
    const t = await text(chars, style, color, { align: align });
    add(parent, t, true);
    t.textAutoResize = 'HEIGHT';
    return t;
  }

  function button(style, label) {
    const b = setProps(variant('MT Button', 'Style=' + style).createInstance(), { Label: label, 'Show icon': false });
    b.name = label;
    return b;
  }
  function fullButton(parent, style, label) {
    const b = add(parent, button(style, label), true);
    b.layoutSizingVertical = 'FIXED';
    b.resize(b.width, 48);
    return b;
  }
  function field(parent, state, label, value, error) {
    const f = setProps(variant('MT Text Field', 'State=' + state).createInstance(), { Label: label, Value: value || '', Error: error || '' });
    f.name = label;
    return add(parent, f, true);
  }
  function passwordField(parent, state, label) {
    const f = field(parent, state, label, '••••••••••');
    setProps(f, { 'Trailing icon': true, Icon: 'visibility' });
    return f;
  }

  // Screen scaffold: app bar + progress + scrollable body + footer.
  async function screen(name, x, options) {
    const s = autoLayout('VERTICAL', PREFIX + name);
    s.resize(W, H);
    s.primaryAxisSizingMode = 'FIXED';
    s.counterAxisSizingMode = 'FIXED';
    fill(s, 'surface');
    s.clipsContent = true;
    s.x = x;
    s.y = 0;
    let appBar = null;
    if (options.title) {
      appBar = add(s, setProps(C.appBar.createInstance(), { Title: options.title, Step: options.step + ' de 7' }), true);
      add(s, variant('MT Progress', 'Step=' + options.step).createInstance(), true);
    }
    const body = autoLayout('VERTICAL', 'Body', { itemSpacing: options.gap || 16 });
    add(s, body, true);
    body.layoutSizingVertical = 'FILL';
    body.paddingLeft = body.paddingRight = 24;
    body.paddingTop = options.title ? 8 : 32;
    body.paddingBottom = 24;
    body.clipsContent = true;
    const footer = autoLayout('VERTICAL', 'Footer', { itemSpacing: 8 });
    add(s, footer, true);
    footer.paddingLeft = footer.paddingRight = 24;
    footer.paddingTop = 12;
    footer.paddingBottom = 24;
    fill(footer, 'surface');
    footer.strokes = [paint('outline-variant')];
    footer.strokeTopWeight = 1;
    footer.strokeBottomWeight = footer.strokeLeftWeight = footer.strokeRightWeight = 0;
    footer.strokeAlign = 'INSIDE';
    return { frame: s, body: body, footer: footer, appBar: appBar };
  }
  async function heading(body, title, lead) {
    const h = await para(body, title, 'headline/small', 'on-surface');
    h.name = 'Title';
    if (lead) { (await para(body, lead, 'body/medium', 'on-surface-variant')).name = 'Lead'; }
  }
  function row(parent, name, gap) {
    const r = autoLayout('HORIZONTAL', name, { itemSpacing: gap === undefined ? 12 : gap });
    return add(parent, r, true);
  }

  // ---------- Remove frames from a previous run ----------
  page.children.filter((n) => n.name.indexOf(PREFIX) === 0).forEach((n) => n.remove());

  const screens = {};
  let x = 0;
  const step = () => { const cur = x; x += W + GAP; return cur; };

  // Welcome
  {
    const sc = await screen('0 · Boas-vindas', step(), { gap: 24 });
    const brand = row(sc.body, 'Brand', 8);
    brand.counterAxisAlignItems = 'CENTER';
    brand.appendChild(await icon('account_balance', 28, 'primary'));
    brand.appendChild(await text('MT Pagamentos', 'title/medium', 'primary'));
    const hero = autoLayout('VERTICAL', 'Hero', { itemSpacing: 12 });
    add(sc.body, hero, true);
    fill(hero, 'secondary-container');
    radius(hero, 'extra-large');
    hero.paddingLeft = hero.paddingRight = 24;
    hero.paddingTop = hero.paddingBottom = 28;
    hero.appendChild(await icon('savings', 48, 'on-secondary-container'));
    await para(hero, 'Sua conta digital em poucos minutos', 'headline/medium', 'on-surface');
    await para(hero, 'Abra sua conta pelo celular, sem filas e sem papelada.', 'body/large', 'on-secondary-container');
    const benefits = autoLayout('VERTICAL', 'Benefits', { itemSpacing: 16 });
    add(sc.body, benefits, true);
    [
      ['pix', 'Pix e boletos', 'Pague e receba na hora, a qualquer momento.'],
      ['credit_card', 'Cartão de débito', 'Peça o seu assim que a conta for aprovada.'],
      ['verified_user', 'Seus dados protegidos', 'Usamos suas informações só para abrir a conta.']
    ].forEach((b) => add(benefits, setProps(C.benefit.createInstance(), { Icon: b[0], Title: b[1], Description: b[2] }), true));
    screens.welcome = sc;
    sc.start = fullButton(sc.footer, 'Filled', 'Abrir minha conta');
    sc.login = fullButton(sc.footer, 'Text', 'Já tenho conta');
  }

  // 1 · Personal data (valid) and error state
  async function personal(name, errors) {
    const sc = await screen(name, step(), { title: 'Dados pessoais', step: 1, gap: 20 });
    await heading(sc.body, 'Vamos começar pelos seus dados', 'Use as mesmas informações do seu documento.');
    if (errors) {
      field(sc.body, 'Error', 'Nome completo', 'Ana', 'Informe nome e sobrenome.');
      field(sc.body, 'Error', 'CPF', '123.456.789-00', 'CPF inválido. Confira os números.');
      field(sc.body, 'Error', 'Data de nascimento', '01/01/2015', 'É preciso ter 18 anos ou mais para abrir a conta.');
    } else {
      field(sc.body, 'Filled', 'Nome completo', 'Ana Souza Lima');
      field(sc.body, 'Filled', 'CPF', '529.982.247-25');
      field(sc.body, 'Focused', 'Data de nascimento', '14/03/1992');
    }
    sc.body.appendChild(button('Text', 'Preencher com dados de exemplo'));
    sc.next = fullButton(sc.footer, 'Filled', 'Continuar');
    return sc;
  }
  screens.personal = await personal('1 · Dados pessoais', false);

  // 2 · Contact
  {
    const sc = await screen('2 · Contato', step(), { title: 'Contato', step: 2, gap: 20 });
    await heading(sc.body, 'Como falamos com você?', 'Vamos enviar um código por SMS para confirmar o celular.');
    field(sc.body, 'Filled', 'E-mail', 'ana.souza@exemplo.com.br');
    field(sc.body, 'Focused', 'Celular com DDD', '(65) 99876-5432');
    sc.body.appendChild(button('Text', 'Preencher com dados de exemplo'));
    sc.next = fullButton(sc.footer, 'Filled', 'Enviar código');
    screens.contact = sc;
  }

  // 3 · SMS code
  {
    const sc = await screen('3 · Verificação', step(), { title: 'Verificação', step: 3 });
    await heading(sc.body, 'Digite o código', 'Enviamos um código de 6 dígitos para (65) 9****-5432.');
    const otp = row(sc.body, 'Code', 8);
    otp.primaryAxisAlignItems = 'SPACE_BETWEEN';
    [['Filled', '4'], ['Filled', '8'], ['Filled', '2'], ['Focused', ' '], ['Empty', null], ['Empty', null]].forEach((d) => {
      const box = variant('MT OTP Box', 'State=' + d[0]).createInstance();
      if (d[1] !== null) { setProps(box, { Digit: d[1] }); }
      otp.appendChild(box);
    });
    await para(sc.body, 'No protótipo, qualquer código de 6 dígitos funciona, exceto 000000.', 'body/small', 'on-surface-variant');
    const resend = row(sc.body, 'Resend', 8);
    resend.primaryAxisAlignItems = 'SPACE_BETWEEN';
    resend.counterAxisAlignItems = 'CENTER';
    resend.appendChild(await text('Reenviar em 24s', 'body/medium', 'on-surface-variant'));
    const rb = button('Text', 'Reenviar código');
    rb.opacity = 0.38;
    resend.appendChild(rb);
    sc.editPhone = button('Text', 'Alterar número');
    sc.body.appendChild(sc.editPhone);
    sc.next = fullButton(sc.footer, 'Filled', 'Verificar');
    screens.verify = sc;
  }

  // 4 · Address
  {
    const sc = await screen('4 · Endereço', step(), { title: 'Endereço', step: 4, gap: 16 });
    await heading(sc.body, 'Onde você mora?', 'Informe o CEP e completamos o resto.');
    field(sc.body, 'Filled', 'CEP', '78048-000');
    field(sc.body, 'Filled', 'Rua', 'Av. Historiador Rubens de Mendonça');
    const r1 = row(sc.body, 'Number row');
    const num = field(r1, 'Focused', 'Número', '1200');
    num.layoutSizingHorizontal = 'FIXED';
    num.resize(104, num.height);
    field(r1, 'Empty', 'Complemento (opcional)');
    add(sc.body, setProps(variant('MT Checkbox', 'Checked=false').createInstance(), { Label: 'Endereço sem número' }));
    field(sc.body, 'Filled', 'Bairro', 'Bosque da Saúde');
    const r2 = row(sc.body, 'City row');
    field(r2, 'Filled', 'Cidade', 'Cuiabá');
    const uf = field(r2, 'Filled', 'UF', 'MT');
    uf.layoutSizingHorizontal = 'FIXED';
    uf.resize(104, uf.height);
    sc.next = fullButton(sc.footer, 'Filled', 'Continuar');
    screens.address = sc;
  }

  // 5 · Documents
  {
    const sc = await screen('5 · Documentos', step(), { title: 'Documentos', step: 5 });
    await heading(sc.body, 'Fotos do documento e selfie', 'Precisamos confirmar que é você mesmo. Escolha o documento:');
    const radios = row(sc.body, 'Document type', 24);
    radios.appendChild(setProps(variant('MT Radio', 'Selected=true').createInstance(), { Label: 'CNH' }));
    radios.appendChild(setProps(variant('MT Radio', 'Selected=false').createInstance(), { Label: 'RG' }));
    add(sc.body, setProps(variant('MT Capture Tile', 'State=Done').createInstance(), { Title: 'CNH aberta' }), true);
    add(sc.body, setProps(variant('MT Capture Tile', 'State=Idle').createInstance(), { Title: 'Selfie', Icon: 'face' }), true);
    await para(sc.body, 'No protótipo, a câmera é simulada: nenhuma foto é tirada ou enviada.', 'body/small', 'on-surface-variant');
    sc.next = fullButton(sc.footer, 'Filled', 'Continuar');
    screens.documents = sc;
  }

  // 6 · Password
  {
    const sc = await screen('6 · Senha', step(), { title: 'Senha', step: 6, gap: 16 });
    await heading(sc.body, 'Crie sua senha de acesso', 'Você vai usá-la para entrar no app.');
    passwordField(sc.body, 'Filled', 'Senha');
    const rules = autoLayout('VERTICAL', 'Rules', { itemSpacing: 6 });
    add(sc.body, rules, true);
    rules.paddingLeft = 16;
    ['Pelo menos 8 caracteres', 'Letras e números', 'Um símbolo, como ! @ # $'].forEach((r) => {
      rules.appendChild(setProps(variant('MT Password Rule', 'Ok=true').createInstance(), { Label: r }));
    });
    passwordField(sc.body, 'Focused', 'Confirme a senha');
    sc.next = fullButton(sc.footer, 'Filled', 'Continuar');
    screens.password = sc;
  }

  // 7 · Review
  {
    const sc = await screen('7 · Revisão', step(), { title: 'Revisão', step: 7, gap: 12 });
    await heading(sc.body, 'Confira seus dados', 'Se algo estiver errado, toque em Editar.');
    sc.edit = {};
    const sections = [
      ['personal', 'Dados pessoais', [['Nome', 'Ana Souza Lima'], ['CPF', '***.982.247-**'], ['Nascimento', '14/03/1992']]],
      ['contact', 'Contato', [['E-mail', 'ana.souza@exemplo.com.br'], ['Celular', '(65) 99876-5432']]],
      ['address', 'Endereço', [['Endereço', 'Av. Historiador Rubens de Mendonça, 1200 · Bosque da Saúde · Cuiabá/MT'], ['CEP', '78048-000']]]
    ];
    for (const s of sections) {
      const card = autoLayout('VERTICAL', s[1], { itemSpacing: 6 });
      add(sc.body, card, true);
      fill(card, 'surface-container');
      radius(card, 'large');
      card.paddingLeft = 16;
      card.paddingRight = 0;
      card.paddingTop = 4;
      card.paddingBottom = 12;
      const head = row(card, 'Head', 8);
      head.primaryAxisAlignItems = 'SPACE_BETWEEN';
      head.counterAxisAlignItems = 'CENTER';
      head.appendChild(await text(s[1], 'title/small', 'on-surface'));
      sc.edit[s[0]] = button('Text', 'Editar');
      head.appendChild(sc.edit[s[0]]);
      for (const r of s[2]) {
        const rr = setProps(C.reviewRow.createInstance(), { Label: r[0], Value: r[1] });
        rr.name = r[0];
        card.appendChild(rr);
        rr.layoutSizingHorizontal = 'FIXED';
        rr.resize(W - 48 - 32, rr.height);
      }
    }
    sc.terms = add(sc.body, setProps(variant('MT Checkbox', 'Checked=true').createInstance(), { Label: 'Li e aceito os Termos de uso e a Política de Privacidade' }));
    const news = row(sc.body, 'Newsletter', 16);
    news.primaryAxisAlignItems = 'SPACE_BETWEEN';
    news.counterAxisAlignItems = 'CENTER';
    news.appendChild(await text('Quero receber novidades por e-mail', 'body/medium', 'on-surface'));
    news.appendChild(variant('MT Switch', 'On=false').createInstance());
    sc.next = fullButton(sc.footer, 'Filled', 'Abrir minha conta');
    screens.review = sc;
  }

  // Success
  {
    const sc = await screen('8 · Sucesso', step(), { gap: 16 });
    sc.body.counterAxisAlignItems = 'CENTER';
    sc.body.paddingTop = 48;
    const badge = autoLayout('HORIZONTAL', 'Badge', { primaryAxisAlignItems: 'CENTER', counterAxisAlignItems: 'CENTER' });
    sc.body.appendChild(badge);
    badge.resize(112, 112);
    badge.layoutSizingHorizontal = 'FIXED';
    badge.layoutSizingVertical = 'FIXED';
    radius(badge, 'full');
    fill(badge, 'success', 0.14);
    badge.appendChild(await icon('check', 56, 'success'));
    await para(sc.body, 'Recebemos seu cadastro, Ana!', 'headline/small', 'on-surface', 'CENTER');
    await para(sc.body, 'Sua conta está em análise. Avisaremos por e-mail em até 1 dia útil.', 'body/medium', 'on-surface-variant', 'CENTER');
    const protocol = autoLayout('HORIZONTAL', 'Protocol', { itemSpacing: 8, counterAxisAlignItems: 'CENTER' });
    sc.body.appendChild(protocol);
    fill(protocol, 'surface-container');
    radius(protocol, 'full');
    protocol.paddingLeft = protocol.paddingRight = 16;
    protocol.paddingTop = protocol.paddingBottom = 8;
    protocol.appendChild(await icon('receipt_long', 20, 'on-surface'));
    protocol.appendChild(await text('Protocolo MT-2026-509121', 'label/large', 'on-surface'));
    const list = autoLayout('VERTICAL', 'Next steps');
    add(sc.body, list, true);
    [['mail', 'Fique de olho no e-mail', 'Vamos escrever para ana.souza@exemplo.com.br'],
     ['credit_card', 'Peça seu cartão', 'Disponível após a aprovação']].forEach((i) => {
      add(list, setProps(C.listItem.createInstance(), { Icon: i[0], Title: i[1], Subtitle: i[2], Info: ' ' }), true);
    });
    sc.done = fullButton(sc.footer, 'Filled', 'Concluir');
    screens.success = sc;
  }

  // Error state (outside the main path)
  screens.personalError = await personal('1b · Dados pessoais com erros', true);
  screens.personalError.frame.y = H + GAP;
  screens.personalError.frame.x = screens.personal.frame.x;
  x -= W + GAP;

  // Terms overlay
  const overlay = autoLayout('VERTICAL', PREFIX + 'Termos de uso (overlay)', { itemSpacing: 16 });
  overlay.resize(360, 100);
  overlay.counterAxisSizingMode = 'FIXED';
  fill(overlay, 'surface-container');
  radius(overlay, 'extra-large');
  overlay.paddingLeft = overlay.paddingRight = overlay.paddingTop = overlay.paddingBottom = 24;
  overlay.x = screens.review.frame.x;
  overlay.y = H + GAP;
  await para(overlay, 'Termos de uso', 'headline/small', 'on-surface');
  await para(overlay, 'Este é um texto de exemplo para o protótipo. Na versão final, aqui entram os Termos de uso e a Política de Privacidade da MT Pagamentos.', 'body/medium', 'on-surface-variant');
  await para(overlay, 'Resumo: usamos seus dados para abrir e manter sua conta, cumprir obrigações legais e prevenir fraudes.', 'body/medium', 'on-surface-variant');
  const actions = row(overlay, 'Actions', 8);
  actions.primaryAxisAlignItems = 'MAX';
  const closeBtn = button('Text', 'Fechar');
  const acceptBtn = button('Filled', 'Li e aceito');
  actions.appendChild(closeBtn);
  actions.appendChild(acceptBtn);

  // ---------- Prototype ----------
  // Forward = push from the right (like the HTML slide-in); back arrow = Back.
  const push = { type: 'PUSH', direction: 'LEFT', matchLayers: false, easing: { type: 'EASE_OUT' }, duration: 0.3 };
  const pushBack = Object.assign({}, push, { direction: 'RIGHT' });
  async function link(node, target, transition) {
    await node.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: target.frame.id, navigation: 'NAVIGATE', transition: transition || push, preserveScrollPosition: false }] }]);
  }
  async function back(sc) {
    const b = sc.appBar.findOne((n) => n.name === 'back');
    await b.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'BACK' }] }]);
  }
  const flow = ['welcome', 'personal', 'contact', 'verify', 'address', 'documents', 'password', 'review', 'success'];
  await link(screens.welcome.start, screens.personal);
  for (let i = 1; i < flow.length - 1; i++) {
    await link(screens[flow[i]].next, screens[flow[i + 1]]);
    await back(screens[flow[i]]);
  }
  await link(screens.personalError.next, screens.personal, pushBack);
  await back(screens.personalError);
  await link(screens.verify.editPhone, screens.contact, pushBack);
  await link(screens.review.edit.personal, screens.personal, pushBack);
  await link(screens.review.edit.contact, screens.contact, pushBack);
  await link(screens.review.edit.address, screens.address, pushBack);
  await link(screens.success.done, screens.welcome, { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.3 });
  await screens.review.terms.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId: overlay.id, navigation: 'OVERLAY', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 }, preserveScrollPosition: false }] }]);
  await closeBtn.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'CLOSE' }] }]);
  await acceptBtn.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'CLOSE' }] }]);

  page.flowStartingPoints = [{ nodeId: screens.welcome.frame.id, name: 'Abertura de conta' }];
  figma.viewport.scrollAndZoomIntoView(flow.map((k) => screens[k].frame));

  return 'Fluxo criado: ' + flow.length + ' telas, 1 estado de erro e 1 overlay.';
}

main()
  .then((message) => figma.closePlugin(message))
  .catch((error) => figma.closePlugin('Erro: ' + error.message));
