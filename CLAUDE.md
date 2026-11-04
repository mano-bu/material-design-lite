# Design System MT Pagamentos (fork do MDL)

Este repositório é um fork do Material Design Lite 1.3 adaptado ao design system **MT Pagamentos** (Figma `ds_mt-pagamentos`). Toda tela, protótipo ou componente feito aqui deve usar o tema MT. A documentação completa do tema está em `mt/README.md`. Leia esse arquivo antes de criar UI.

## Comandos

- `npm run tokens:mt`: regenera `src/_mt-tokens.scss` e `src/_mt-typography.scss` a partir de `mt/figma/variables.json`.
- `npm run build:mt`: compila `dist/mt/material.css`, `dist/mt/material.js` e `dist/mt/fonts/` com Dart Sass via npx. O `gulp` original não roda em Node atual, então não use `npm test` nem `gulp`.
- Demos: `python3 -m http.server 8765` na raiz e abrir `/mt/`, `/mt/teste.html` e `/mt/onboarding.html`.

## Regras ao criar UI

1. **Use só componentes MDL** (`mdl-button`, `mdl-textfield`, `mdl-card`, `mdl-chip`, `mdl-switch`, `mdl-layout` etc.). Não crie componentes do zero quando já existe um equivalente.
2. **Nunca use cores, fontes, raios ou sombras hardcoded.** Use os tokens:
   - Cores: `var(--mt-primary)`, `--mt-on-primary`, `--mt-surface`, `--mt-surface-container-*`, `--mt-outline`, `--mt-error`, `--mt-success`, `--mt-warning`, `--mt-info` e os pares `on-*` e `*-container`. Para transparência, use `rgba(var(--mt-primary-rgb), .12)`.
   - Fontes: `--mt-font-display` (Outfit: títulos, labels, botões) e `--mt-font-body` (Inter: texto corrido, campos, tabelas).
   - Tipografia: classes `.mt-typography--<estilo>` (por exemplo `--headline-large`, `--body-medium`) ou as classes `mdl-typography--*`.
   - Shape: `--mt-shape-*`. Elevação: `--mt-elevation-*` ou `mdl-shadow--Ndp`. Blur: `--mt-blur-1` a `--mt-blur-4`.
3. **Tema:** defina `data-mt-theme` no `<html>`: `varejo-light` (padrão), `varejo-dark`, `ativos-light` ou `ativos-dark`. Os componentes não devem depender de um tema específico.
4. **Botões (Figma → classe):** Filled = `mdl-button--raised mdl-button--colored`, Tonal = `mdl-button--tonal`, Elevated = `mdl-button--raised`, Outlined = `mdl-button--outlined`, Text = `mdl-button` sem modificador.
5. **Campos de texto:** o padrão é outlined. A variante filled usa `mdl-textfield--filled`. Fora de card ou diálogo, sobre um fundo diferente de `--mt-surface`, defina `--mdl-textfield-label-background` no container.
6. **Grid:** use `.mdl-grid` e `.mdl-cell`. Os breakpoints e gutters já seguem o Figma: 4 colunas abaixo de 600px e 12 colunas a partir daí.
7. Inclua `material.css`, `material.js` e Material Icons. As fontes Outfit e Inter já vêm carregadas pelo CSS.
8. Textos de interface em português do Brasil.

## Arquivos que não devem ser editados à mão

- `src/_mt-tokens.scss` e `src/_mt-typography.scss`, que são gerados por `npm run tokens:mt`. Para mudar um token, altere `mt/figma/variables.json` (exportado do Figma) e regenere.
- `dist/`, que é saída do build.

## Onde ficam as coisas

- `src/<componente>/_<componente>.scss`: estilos de cada componente, já com os tokens MT.
- `src/_mt-tokens.scss`: cores por tema, shapes, elevações e blur.
- `utils/mt-tokens-from-figma.js` e `utils/build-mt.js`: geração de tokens e build.
- `mt/figma/onboarding-plugin/`: plugin local do Figma que monta o fluxo de onboarding.
- Ao adicionar um JS de componente, mantenha a lista `SOURCES` de `utils/build-mt.js` em sincronia com `gulpfile.babel.js`.

## Git

- `origin` é `mano-bu/material-design-lite` e `upstream` é `google/material-design-lite`. Abra PRs contra `origin`, nunca contra o upstream do Google.
- Trabalhe em branches `feat/...` e não commite direto na `mdl-1.x` (branch padrão).
