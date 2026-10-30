# MT Onboarding Builder (plugin local do Figma)

Recria o protótipo `mt/onboarding.html` no arquivo Figma **Teste MDL · MT Pagamentos**, na página **Onboarding**, usando os componentes e variáveis MT que já estão no arquivo.

O que ele cria:

- 9 telas de 412 × 860 (boas-vindas, 7 etapas e sucesso), mais a tela "1b · Dados pessoais com erros" e o overlay "Termos de uso".
- Protótipo navegável: "Continuar" avança com transição Push, a seta volta (Back), "Editar" leva à etapa e "Concluir" reinicia. O checkbox de termos abre o overlay. O fluxo começa em "Abertura de conta".
- As correções pendentes nos componentes: a transparência da caixa do card "Done", a borda do campo desabilitado e o texto dos botões centralizado.

## Como rodar

1. Abra o arquivo no **Figma desktop**. Plugins de desenvolvimento não rodam no navegador.
2. Menu **Plugins → Development → Import plugin from manifest…** e escolha `mt/figma/onboarding-plugin/manifest.json`.
3. Rode em **Plugins → Development → MT Onboarding Builder**.

A mensagem no fim diz se deu certo ou mostra o erro. Rodar de novo substitui as telas criadas antes, cujos nomes começam com "Onboarding / ". Os componentes não são apagados.

Requisitos: os componentes `MT *` e as variáveis MT precisam existir no arquivo, e as fontes Outfit, Inter e Material Icons precisam estar disponíveis. Todas são Google Fonts e já vêm no Figma.
