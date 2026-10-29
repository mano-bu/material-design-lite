# Tema MT Pagamentos para o MDL

Adaptação dos componentes do Material Design Lite à biblioteca Figma `ds_mt-pagamentos`.

## Build e demo

```bash
npm run build:mt
python3 -m http.server 8765
```

Abra `http://localhost:8765/mt/` para ver a demo. O build gera `dist/mt/material.css` e `dist/mt/material.js`. Ele usa Dart Sass via `npx`, porque o gulp 3 do projeto original não instala no Node atual.

Carregue a fonte nas páginas:

```html
<link href="https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

## Temas

Os quatro modos da coleção **Theme** do Figma viram CSS custom properties em `src/_mt-tokens.scss`:

```html
<html data-mt-theme="varejo-light">   <!-- padrão; também varejo-dark, ativos-light, ativos-dark -->
```

Cada cor existe como `--mt-primary` (valor pronto) e `--mt-primary-rgb` (tripla RGB, usada pelo MDL em `rgb()`/`rgba()`).

## O que veio do Figma

| Figma | MDL |
| --- | --- |
| Theme (49 cores × 4 modos) | `src/_mt-tokens.scss`, ligado às variáveis em `src/_variables.scss` |
| Shape (4 / 8 / 12 / 16 / 28 / full) | `--mt-shape-*`; botões pill, FAB 16, cards e diálogos 28, chips e campos 8, menus e snackbar 4 |
| Elevation 1–5 | `--mt-elevation-*`; os mixins `shadow-Ndp` e as classes `mdl-shadow--Ndp` apontam para eles |
| Material typography (Readex Pro) | Mixins `typo-*` em `src/_mixins.scss` |
| Common Buttons: Filled, Tonal, Elevated, Outlined, Text | `--raised --colored`, `--tonal` (novo), `--raised`, `--outlined` (novo), padrão |
| Text Field / Filled | `.mdl-textfield` com fundo, cantos superiores de 8px e linha inferior |
| Switch 52×32 | `.mdl-switch` com thumb de 16px (desligado) e 24px (ligado) |
| Filter / Input Chip | `.mdl-chip` com contorno e `.is-selected` (novo) |
