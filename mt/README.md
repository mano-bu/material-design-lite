# Tema MT Pagamentos para o MDL

Adaptação dos componentes do Material Design Lite ao design system MT Pagamentos (Figma `ds_mt-pagamentos`).

## Usar em uma página ou app

```bash
npm run build:mt
```

Copie a pasta `dist/mt/` inteira para o projeto e inclua:

```html
<link rel="stylesheet" href="mt/material.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<script src="mt/material.js"></script>
```

As fontes **Outfit** e **Inter** vêm junto, em `dist/mt/fonts/`, e o próprio `material.css` as carrega. Nenhum `<link>` de fonte é necessário. Mantenha a pasta `fonts/` ao lado do `material.css`. Os arquivos são subconjuntos latin e latin-ext, cobrindo português, e são distribuídos sob a SIL Open Font License (ver `src/fonts/LICENSE-*.txt`).

Para ver as demos, sirva a raiz do repositório e abra `/mt/` e `/mt/teste.html`:

```bash
python3 -m http.server 8765
```

## Atualizar a partir do Figma

1. Exporte as variáveis do Figma em JSON e substitua `mt/figma/variables.json`.
2. Rode `npm run tokens:mt` para regenerar `src/_mt-tokens.scss` e `src/_mt-typography.scss`. Não edite esses dois arquivos à mão.
3. Rode `npm run build:mt`.

## Temas

```html
<html data-mt-theme="varejo-light">   <!-- padrão; também varejo-dark, ativos-light, ativos-dark -->
```

Cada cor existe como `--mt-primary` (valor pronto) e `--mt-primary-rgb` (tripla RGB, usada pelo MDL em `rgb()`/`rgba()`).

## Tipografia

| Coleção Figma | Uso |
| --- | --- |
| Typeface `display` = Outfit | `--mt-font-display`: títulos, headlines, labels e botões (`$preferred_font`) |
| Typeface `body` = Inter | `--mt-font-body`: texto corrido, campos, tabelas (`$performance_font`) |
| Typography (15 estilos Material) | `--mt-type-<estilo>` e classes `.mt-typography--<estilo>`, por exemplo `.mt-typography--headline-large` |

As classes do MDL usam os mesmos tokens:

| MDL | Figma |
| --- | --- |
| `display-4`, `display-3`, `display-2` | display large, medium, small |
| `display-1`, `headline`, `title` | headline large, headline small, title large |
| `subhead`, `body-2` | title medium, title small |
| `subhead-2`, `body-1`, `caption` | body large, medium, small |
| `menu`, `button` | label large (o botão usa peso 500, como `m2/button`) |

## Outros tokens

| Figma | MDL |
| --- | --- |
| Shape (4 / 8 / 12 / 16 / 28 / full) | `--mt-shape-*`; botões pill, FAB 16, cards e diálogos 28, chips e campos 8, menus e snackbar 4 |
| Effects: Elevation Light/Dark 1–5 | `--mt-elevation-*` (os temas escuros usam o conjunto Dark); `mdl-shadow--Ndp` aponta para eles |
| Effects: Blur 1–4 | `--mt-blur-1` a `--mt-blur-4` (12, 25, 50, 100px), para `backdrop-filter: blur(var(--mt-blur-2))` |
| Grids | `.mdl-grid`: 4 colunas até 599px (gutter 8, margem 16), 12 de 600 a 839px (gutter 12, margem 12), 12 a partir de 840px (gutter 24, margem 32) |
| Common Buttons: Filled, Tonal, Elevated, Outlined, Text | `--raised --colored`, `--tonal`, `--raised`, `--outlined`, padrão |
| Text Field / Filled | `.mdl-textfield` com fundo, cantos superiores de 8px e linha inferior |
| Switch 52×32 | `.mdl-switch` com thumb de 16px (desligado) e 24px (ligado) |
| Filter / Input Chip | `.mdl-chip` com contorno e `.is-selected` |
