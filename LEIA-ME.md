# Site AJ Móveis

Site estático (HTML, CSS e JavaScript puros). Não precisa de build nem de banco de dados.

## Antes de publicar

1. **Domínio:** troque `SEU-DOMINIO.com.br` pelo domínio real em `index.html`, `robots.txt` e `sitemap.xml` (em todas as ocorrências).
2. **Google Tag Manager:** quando tiver o ID, coloque em `assets/js/config.js` (`gtmId: 'GTM-XXXXXXX'`).
3. **HTTPS:** depois que o SSL estiver ativo, descomente as 3 linhas de "Força HTTPS" no `.htaccess`.

## Visual

O site usa o tema escuro (preto e dourado): `index.html` carrega o `assets/css/style.css` e, por cima, o `assets/css/tema-escuro.css`.

## Como publicar

Envie para a pasta `public_html` do domínio: `index.html`, `privacidade.html`, `robots.txt`, `sitemap.xml`, `.htaccess` (arquivo oculto) e a pasta `assets`. Não precisa enviar `LEIA-ME.md`, `criar-formulario-aj.gs` nem a pasta `.claude`.

Depois de publicar, cadastre o domínio no Google Search Console e envie o `sitemap.xml` para o Google começar a indexar.

A imagem que aparece ao compartilhar o link (WhatsApp, Facebook etc.) é a `assets/img/aj/og-image.jpg`, com o logo.

## Onde editar

| O quê | Arquivo |
|---|---|
| Números de WhatsApp e rodízio | `assets/js/config.js` |
| Produtos (nome, código, descrição, foto, selo) | `assets/js/products.js` |
| Textos, prazos, FAQ, endereço | `index.html` |
| Cores e visual | `assets/css/style.css` (variáveis no topo) |

Para destacar um produto com selo, adicione `"tag": "Mais vendida"` no item em `products.js`.

## Eventos enviados ao Google Tag Manager

| Evento | Quando | Dados |
|---|---|---|
| `whatsapp_click` | Qualquer clique para o WhatsApp | `origem` (hero, card-produto, simulador...), `produto`, `atendente` |
| `orcamento_enviado` | Envio do simulador | `categoria`, `quantidade`, `cidade` |
| `ver_produto` | Abrir detalhes de um produto | `produto` |
| `filtro_catalogo` | Trocar a categoria do catálogo | `categoria` |
