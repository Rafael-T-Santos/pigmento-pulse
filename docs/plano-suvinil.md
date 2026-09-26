# Plano — Suportar a coleção SUVINIL no `formulas_iquine.csv`

Objetivo: trocar `public/formulas_iquine.csv` pelo arquivo novo (que tem `COLECAO = IQUINE` **e**
`COLECAO = SUVINIL`), fazer as cores Suvinil aparecerem na tela com o sufixo **SUV** e cadastrar o
produto no Sankhya com esse sufixo no nome — sem alterar nada do comportamento atual do Iquine.

Arquivo novo: `C:\Users\devra\Downloads\formulas_iquine_suvinil\formulas_iquine.csv`

---

## 1. Como o sistema funciona hoje (levantado no código)

### 1.1 Leitura do CSV — `src/data/formulaService.ts`

```
carregarDadosFormulas()            fetch("/formulas_iquine.csv")  ->  PapaParse (header: true)
  linha 46   loadedFormulas = data.filter(row => row.COLECAO === "IQUINE" && row.COD_COR)
  linha 49   coresMap: Map<COD_COR, Cor>          <- de-duplica por COD_COR
  linha 54   rgb = mapaDeCores[COD_COR] || "#CCCCCC"
  linha 58   codigo = codigoDisplay = COD_COR
```

O arquivo fica em `public/`, é servido estático pelo nginx e **baixado inteiro pelo navegador a cada
carregamento** da tela (nenhum cache, nenhuma paginação). Todas as 255 mil linhas ficam em memória
como objetos em `loadedFormulas`.

Consultas derivadas, todas filtrando por `row.COD_COR === cor.codigo`:

| Função | O que faz |
|---|---|
| `buscarFormula(cor, base, tamanho)` | casa `PRODUTO == base.nome`, `EMBALAGEM == tamanho.nome`, `BASE == base.codigo` e devolve os corantes |
| `getBasesDisponiveis(cor, tamanho)` | monta `PRODUTO\|BASE\|volume` do CSV e cruza com `mockBases` |
| `getTamanhosDisponiveis(cor, base)` | pega os `EMBALAGEM` distintos e cruza com `mockTamanhos` |

`mockBases`/`mockTamanhos` (`src/data/mockData.ts`) são a lista fixa de 39 bases e 2 tamanhos
(`GALÃO`→`GL`, `LATA`→`BD`) com os `CODPROD` do Sankhya. O CSV é só a fórmula; o ERP é a fonte dos
códigos.

### 1.2 Como a cor é renderizada

```
Cor { id, nome, codigo, codigoDisplay, rgb, ativa }
  |- SeletorCorUnificado.tsx   lista e busca (filtra por nome OU código; corta em 100 itens)
  |                            exibe  <ColorPreview rgb> + "{nome} ({codigoDisplay})"
  |- ColorHeader.tsx           pinta o cabeçalho do resultado com rgb; texto claro/escuro por contraste
  |- ColorPreview.tsx          quadradinho; se rgb ausente/inválido, mostra ícone de paleta
  |- HistoricoItem.tsx         "{consulta.cor} - {base} - {tamanho}"
```

`#CCCCCC` é um hex **válido**, então hoje uma cor sem hex no `colorMap.ts` não cai no fallback
neutro: ela aparece como quadradinho cinza e pinta o cabeçalho do resultado de cinza.

### 1.3 Como o produto é cadastrado

`Index.tsx:210 cadastrarTinta()` → `POST /api/cadastrar-produto` com:

```json
{ "cor": { "nome": "Mesa de Bar" },
  "base": { "nome": "Seda Super Lavavel", "codigo": 11566 },
  "tamanho": { "nome": "3.2L", "codVol": "GL", "litros": 3.2 },
  "pigmentos": [ { "codigo": 11599, "quantidade": 2.4 } ] }
```

No backend (`internal-api-sankhya/app.py:178`):

```python
descr_prod = f"TINTA {base_nome} {tamanho_nome} {cor_nome} IQUINE".upper()[:100]
```

**O nome do produto vem do campo `cor.nome` que o frontend manda.** É por aí que o sufixo entra,
sem tocar no backend. `MARCA` e o resto vêm clonados do produto-modelo `CODPROD 11783`, então a
marca no ERP continua Iquine (correto: a tinta é Iquine, a referência de cor é Suvinil).

`POST /api/verificar-produto` **não usa o nome**: casa por composição (CODPROD da base + código e
quantidade de cada pigmento, tolerância 0,001). Ou seja, o "já cadastrada" não depende do sufixo.

---

## 2. O que o arquivo novo contém (conferido linha por linha)

| Verificação | Resultado |
|---|---|
| Cabeçalho | idêntico: `COLECAO,COD_COR,NOME_COR,PRODUTO,BASE,EMBALAGEM,CAPACIDADE,CORANTE,MLS` |
| Encoding / fim de linha | UTF-8 sem BOM, CRLF — igual ao atual |
| Linhas de dados | 335.515 (era 255.094) → 254.733 IQUINE + 80.782 SUVINIL |
| Tamanho | 23,6 MB (era 17,7 MB) |
| **Colisão de `COD_COR` entre as coleções** | **zero** — Iquine é numérico (`002`, `1690`), Suvinil é `A 350` / `5 139` |
| **Colisão de `NOME_COR`** | **zero** |
| **Fórmulas idênticas entre coleções** | **zero** (comparado `PRODUTO+BASE+EMBALAGEM+corantes+mls` nas 102.624 combinações) |
| `BASE` e `CORANTE` | mesmos conjuntos nas duas coleções (`C`/`M`/`P`/`P/M`, 11 corantes `P-04xx`/`P-05xx`) |
| `PRODUTO` do Suvinil | 14 nomes, todos **subconjunto** dos 31 do Iquine |
| `EMBALAGEM` do Suvinil | `GALÃO`, `LATA`, `0,8 LTS` (+ 10 linhas de `LATA DE 25/27 KG`) |

**A parte IQUINE do arquivo novo é subconjunto estrito da atual.** As 361 linhas que saíram são as
11 entradas-lixo de sempre, todas com `NOME_COR` vazio: `1595C`, `2603C`, `299C`, `7700C`,
`COOL GRAY 3C`, `COOL GRAY 7C`, `RAL 7032`, `TESTE`, `TESTE 2`, `TESTE 3`, `TESTE SÃO JOAO DEL R`.
Nenhuma cor Iquine real foi removida, renomeada ou teve fórmula alterada. **Risco de regressão no
Iquine: nulo** — e de brinde saem 11 entradas sem nome do seletor.

### Impacto na tela

- Cores carregadas do CSV: 1.385 Iquine + 1.296 Suvinil = 2.681.
- **No seletor ficam 2.574** (1.364 Iquine + 1.210 Suvinil), por causa do filtro da seção 4.2.6:
  107 cores existem no CSV apenas em produtos/bases que não estão no `mockBases`, então hoje elas
  são selecionáveis e não oferecem base nenhuma. Ver seção 2.1.
- Bases que o Suvinil oferece: 6 famílias (Diatex Pinta Mais, Fachada Emborrachada, Limpa Fácil,
  Seda Super Lavavel, Semibrilho Super Lavavel, Super Premium) = 25 das 39 entradas de `mockBases`.
- Nenhum dos 1.296 códigos Suvinil tem hex em `colorMap.ts` (os Iquine têm 1.316 de 1.385).

### 2.1 As 107 cores sem base selecionável

Não é defeito do arquivo novo: o `mockBases` não cobre esses produtos/bases, então o app não tem
`CODPROD` do Sankhya para cotar e a consulta morre no seletor. O filtro é **derivado** do
`mockBases` em tempo de carga, não uma lista fixa — cadastrar as entradas que faltam em
`mockData.ts` faz as cores voltarem sozinhas.

**21 Iquine**, todas presentes só em produtos ausentes do `mockBases` (Diepóxi Base Água A B,
Delanil Rende Muito, Diapiso Super Resistente, Dialine Topa Tudo A B):

```
126 Azul Segurança 2,5PB 4/1    230 Amarelo Segurança 5Y 8/1    300 Estuco Envelhecido
133 Amarelo Ouro 10YR 8/14      231 Branco N-9,5                313 Maribor Máximo
134 Laranja Segurança 2,5YR     232 Vermelho Segurança 5R 4/    388 Natureza Real
136 Verde Petrobrás 2,5G 5/1    233 Cinza Claro N-6,5           389 Jarro de Cerâmica
138 Creme Canalização 10YR 7    234 Cinza Médio N-5,0           397 Cinza Rio Ave
142 Verde Segurança 10GY 6/6    235 Preto N-1,0                 2935 C AZUL CASAS BAHIA
187 Verde Emblema 2,5G 3/4      236 Saibro                      7504C  Mocaccino
```

**86 Suvinil**, por motivo um pouco diferente: existem só nas bases `C`/`M` de produtos que o
`mockBases` registra apenas na base `P` (Proteção Antibactéria, Semibrilho Super Lavavel, Acaba com
o Mofo, Delanil Rende Muito, Fosco Durável, Dialine Topa Tudo A B).

### Sujeira no dado

`COD_COR` do Suvinil tem espaço no meio (`A 350`). É o dado real, e a busca do seletor funciona por
`includes`, então digitar `A 350` ou `350` acha. Nada a fazer.

O nome corrompido `461oco de Notas` (`A 350`) **já foi corrigido na origem** para `Bloco de Notas`
(26/09/2026). Reconferido no arquivo: nenhum `NOME_COR` começa com dígito, e o resto do arquivo
segue igual (mesmas contagens, sem BOM, sem colisão).

---

## 3. Decisões tomadas

1. **Sufixo no nome do produto:** o frontend envia `cor.nome` já com ` SUV`, então o backend monta
   `TINTA SEDA SUPER LAVAVEL 3.2L MESA DE BAR SUV IQUINE`. **Nenhuma alteração no
   `internal-api-sankhya`, nenhum deploy da API.** Maior descrição possível com o sufixo: 74
   caracteres — folga confortável para o corte em 100.
2. **Cor sem hex:** deixa de forçar `#CCCCCC`; sem hex, `rgb` fica vazio e o fallback neutro entra
   (ícone de paleta na lista, gradiente da marca no cabeçalho). Vale para as 1.296 Suvinil e também
   para as 69 Iquine sem hex, que hoje mentem um cinza.
3. **Compressão:** ligar gzip para `text/csv` no `nginx.conf` nesta mesma entrega (~23,6 MB → ~4 MB
   por carregamento).
4. **Cor sem base selecionável não entra no seletor** — nem Suvinil nem Iquine. Hoje escolher uma
   dessas leva a um beco sem saída (o campo Base fica vazio, sem explicação). São 107 cores, listadas
   na seção 2.1; 21 delas são Iquine, ou seja, **é uma mudança de comportamento no que já existe**,
   intencional.

---

## 4. Implementação

Ordem proposta: 4.1 → 4.2 → 4.3 → 4.4 → 4.5. Cada passo é verificável sozinho.

### 4.1 `src/types/tinta.ts` — coleção no modelo

```ts
export type Colecao = "IQUINE" | "SUVINIL";

export interface Cor {
  id: number;
  nome: string;            // nome limpo, como está no CSV
  nomeExibicao: string;    // nome + " SUV" quando SUVINIL  <- usado na tela e no cadastro
  colecao: Colecao;
  codigo: string;
  codigoDisplay?: string;
  rgb?: string;            // agora pode ser undefined de propósito
  ativa?: boolean;
}
```

Guardar `nome` e `nomeExibicao` separados (em vez de sujar `nome`) mantém o dado do CSV intacto e
deixa um único ponto decidindo o sufixo. `colecao` habilita o badge e qualquer filtro futuro.

### 4.2 `src/data/formulaService.ts` — carregar as duas coleções

1. Constantes no topo, para o sufixo não ficar espalhado em string literal:
   ```ts
   const SUFIXOS_COLECAO: Record<Colecao, string> = { IQUINE: "", SUVINIL: " SUV" };
   export const nomeExibicao = (nome: string, colecao: Colecao) =>
     `${nome}${SUFIXOS_COLECAO[colecao]}`;
   ```
2. **Filtro (linha 46):** trocar `row.COLECAO === "IQUINE"` por aceitar `IQUINE` e `SUVINIL`
   (`row.COLECAO in SUFIXOS_COLECAO`), mantendo `&& row.COD_COR`. Também descartar linha com
   `NOME_COR` vazio — é o que limpa as entradas-lixo caso elas voltem no próximo arquivo.
3. **Chave do `coresMap` (linha 53):** passar de `COD_COR` para `` `${COLECAO}|${COD_COR}` ``. Hoje
   não há colisão, mas a chave composta é o que impede um `A 350` futuro de sobrescrever
   silenciosamente uma cor Iquine.
4. **`rgb` (linha 54):** `const corHex = mapaDeCores[row.COD_COR];` — sem o `|| "#CCCCCC"`.
5. Preencher `colecao` e `nomeExibicao` ao montar a `Cor`.
6. **Descartar cor sem base selecionável** (decisão 3.4). No mesmo laço que monta o `coresMap`,
   marcar quais chaves têm ao menos uma linha cotável, e no fim manter só essas:
   ```ts
   // assinaturas que o app sabe cotar, derivadas do mockBases/mockTamanhos
   const basesValidas = new Set(mockBases.map(b => `${b.nome}|${b.codigo}|${b.volume}`));
   const volumePorEmbalagem = new Map(mockTamanhos.map(t => [t.nome.toUpperCase(), t.codigo]));
   // dentro do laço, por linha:
   const volume = volumePorEmbalagem.get(row.EMBALAGEM.toUpperCase());
   if (volume && basesValidas.has(`${row.PRODUTO}|${row.BASE}|${volume}`)) {
     coresComBase.add(chave);            // Set<string>, mesma chave composta do coresMap
   }
   // depois do laço:
   cores = Array.from(coresMap.entries())
     .filter(([chave]) => coresComBase.has(chave))
     .map(([, cor]) => cor);
   ```
   É a **mesma regra** que o `getBasesDisponiveis` já aplica (`:162-179`) — só que avaliada uma vez
   na carga, em vez de depois que o usuário escolheu a cor. Vale reaproveitá-la num helper
   compartilhado para as duas não divergirem.

   `loadedFormulas` continua com todas as linhas: as cores descartadas simplesmente nunca são
   consultadas, e filtrar as linhas também custaria uma segunda passada sem ganho.
7. **`buscarFormula`, `getBasesDisponiveis`, `getTamanhosDisponiveis`:** somar `row.COLECAO ===
   cor.colecao` aos filtros por `COD_COR`. Sem isso o sistema depende de "não existe código
   repetido", que é verdade hoje e ninguém garante amanhã.
8. Ajustar o `console.log` final para contar por coleção e registrar quantas cores foram descartadas
   por falta de base — é o número que denuncia `mockBases` incompleto num arquivo futuro.

### 4.3 Exibição — trocar `nome` por `nomeExibicao` nos 4 pontos

| Arquivo | Linha | Mudança |
|---|---|---|
| `SeletorCorUnificado.tsx` | 44 | busca passa a olhar `nomeExibicao` (faz digitar `SUV` listar as Suvinil) |
| `SeletorCorUnificado.tsx` | 85, 135 | rótulo do botão e do item da lista |
| `ResultadoCard.tsx` | 44 | `corNome={resultado.cor.nomeExibicao}` |
| `Index.tsx` | 182 | `cor: cor.nomeExibicao` no histórico |

Mais o badge de coleção em `ResultadoCard.tsx` (junto dos badges de base/tamanho já existentes),
exibido só quando `resultado.cor.colecao === "SUVINIL"`. O sufixo cumpre o pedido; o badge é o que
deixa óbvio na tela, e não custa nada.

### 4.4 Cadastro — `src/pages/Index.tsx:221`

```diff
-        cor: { nome: resultado.cor.nome }
+        cor: { nome: resultado.cor.nomeExibicao }
```

Uma linha. É o que faz o Sankhya gravar `... MESA DE BAR SUV IQUINE`.

### 4.5 Arquivo e nginx

1. Copiar o CSV novo sobre `public/formulas_iquine.csv` (o `.gitignore` já tem a exceção
   `!public/formulas_iquine.csv`, então ele entra no commit normalmente).
2. `nginx.conf`, dentro do `server`:
   ```nginx
   gzip on;
   gzip_types text/csv text/plain text/css application/javascript application/json;
   gzip_min_length 1024;

   # sem isto o gzip_types acima não casa com nada (ver armadilha abaixo)
   location = /formulas_iquine.csv {
       default_type text/csv;
   }
   ```
   A imagem oficial do nginx só comprime `text/html` por padrão — sem isso o CSV vai cru.

   **Armadilha:** o `mime.types` do nginx não tem entrada para `.csv` (conferido no fonte
   oficial — há `text/plain txt`, `text/css css`, `text/html html htm shtml`, e nada de csv).
   Sem o `location`, o arquivo sai com o `default_type` da imagem,
   `application/octet-stream`, e `gzip_types text/csv` não casa com nada: o gzip fica ligado e
   sem efeito nenhum sobre o arquivo que motivou a mudança. `default_type` dentro do location
   resolve porque ele só se aplica quando a extensão não determina o tipo.

   Passo seguinte possível (não feito aqui): `gzip_static on` com o `.csv.gz` gerado no
   Dockerfile. Troca a compressão a cada requisição por uma compressão única no build.

### Fora de escopo (não mexer)

- `internal-api-sankhya` — nada a alterar, decisão 3.1.
- `src/components/BuscaCorPorCodigo.tsx` e `src/hooks/useBuscaCor.tsx` — código morto (ninguém
  importa; o hook até importa um `cores` que não existe em `mockData`). Não entra nesta entrega.
- `colorMap.ts` — preencher os hex do Suvinil é trabalho de dado, separado. O plano só garante que a
  ausência fique visualmente honesta.

---

## 5. Validação antes do deploy

Local (`npm run dev`):

1. Console mostra **2.574 cores** no seletor (1.364 Iquine + 1.210 Suvinil) e 107 descartadas por
   falta de base. Nenhum erro de parse.
2. **Iquine não mudou:** escolher uma cor conhecida (ex. `002 Branco Neve` + Seda Super Lavavel +
   GALÃO), conferir que a fórmula, o preço e o preview são os mesmos de antes da mudança. Repetir com
   uma cor que tenha hex e outra sem.
3. **Cores sem base saíram:** buscar `Casas Bahia`, `Mocaccino` e `Preto N-1,0` → nenhum resultado.
   Buscar `Cactus` e `Curry` (Suvinil da lista 2.1) → nenhum resultado. Nenhuma cor que apareça no
   seletor deve deixar o campo Base vazio.
4. **Suvinil aparece:** digitar `SUV` no seletor → lista só Suvinil. Digitar `A 350` → acha
   `Bloco de Notas SUV`. O item mostra ícone de paleta (não quadradinho cinza).
5. **Suvinil consulta:** `A 350` + Seda Super Lavavel + GALÃO → fórmula vem, badge SUVINIL aparece,
   cabeçalho usa o gradiente, título mostra `... SUV`.
6. **Cadastro:** com a API acessível, cadastrar uma cor Suvinil e conferir no modal que o
   `nomeProduto` devolvido termina em `SUV IQUINE`. Antes disso, checar no Network que o payload
   leva `"cor": { "nome": "... SUV" }`.
7. `npm run build` sem erro de TypeScript (o campo novo `nomeExibicao` é obrigatório na interface,
   então o compilador aponta qualquer construção de `Cor` que ficou para trás).
8. Histórico: reabrir uma consulta Suvinil pelo painel de histórico e confirmar que refaz a consulta.

### Resultado da execução (26/09/2026, `npm run dev` + navegador)

| # | Item | Resultado |
|---|---|---|
| 1 | Contagens no console | `335515 linhas` · `Cores no seletor: 2574 (IQUINE: 1364, SUVINIL: 1210)` · `descartadas: 107` — exatamente o previsto |
| 2 | Iquine intacto | `002 Branco Neve` + Seda Super Lavavel + GALÃO → Azul Intenso 0,320 ml, igual à linha do CSV e igual ao CSV anterior (conferido com `git show HEAD:`). Título sem sufixo, sem badge, RGB `#F2F9FF` pintado |
| 3 | Cores sem base sumiram | `Casas Bahia`, `Mocaccino`, `Preto N-1,0`, `Saibro`, `Cactus`, `Curry`, `Carmim` → 0 resultados. Controles `Branco Neve` e `A 350` continuam lá |
| 4 | Sufixo e fallback | Digitar `SUV` lista só Suvinil (`Absinto SUV (B 043)`, `Acácia-mimosa SUV (D 026)`…), todas com ícone de paleta. `Concreto (012)` e `Salmon (013)`, Iquine sem hex, idem |
| 5 | Consulta Suvinil | `A 350` → título `Bloco de Notas SUV`, badge `SUVINIL`, fórmula Azul Intenso 3,400 / Rosa 2,160 / Vermelho Óxido 1,240 — idêntica às 3 linhas do CSV |
| 6 | Payload do cadastro | `"cor": { "nome": "Bloco de Notas SUV" }`. Aplicando a fórmula de `app.py:178`: `TINTA SEDA SUPER LAVAVEL 3.2L BLOCO DE NOTAS SUV IQUINE` (55 caracteres) |
| 7 | `npm run build` | passa. `tsc --noEmit` mantém só os 2 erros pré-existentes do código morto (`BuscaCorPorCodigo.tsx`, `useBuscaCor.tsx`) |
| 8 | Histórico | `Bloco de Notas SUV - Seda Super Lavavel - GALÃO` e `Branco Neve - Seda Super Lavavel - GALÃO` |

O cadastro do item 6 foi exercitado com `window.fetch` stubado no navegador: **nenhuma chamada saiu da
máquina e nada foi gravado no Sankhya**. O stub reproduziu a fórmula do `app.py` para conferir o nome
que o ERP produziria.

**Confirmado em produção (26/09/2026):** uma tinta Suvinil foi cadastrada de verdade pela tela, contra
a API e o Sankhya, e o cadastro funcionou. Isso fecha o único item que não dava para validar fora do
ambiente real.

Custo do filtro do seletor sobre as 2.574 cores: **~1 ms por busca**. O resto do tempo de digitação
(47–580 ms em build de dev) é o render dos itens da lista, que já era limitado a 100 antes da
mudança — ou seja, não é regressão desta entrega.

Após o deploy (`docker compose up -d --build`):

9. `curl -sI -H "Accept-Encoding: gzip" http://192.168.255.6:8081/formulas_iquine.csv` →
   `Content-Encoding: gzip`. **Verificado no servidor em 26/09/2026:** devolveu
   `Content-Type: text/csv` e `Content-Encoding: gzip`, ou seja, o `location` com `default_type`
   resolveu a armadilha do mime.types e o arquivo desce comprimido.
10. Abrir a tela pelo IP e repetir os itens 2 a 6 no ambiente real.
    **Verificado em 26/09/2026:** console do servidor mostrou
    `Cores no seletor: 2574 (IQUINE: 1364, SUVINIL: 1210)`.
    Atenção ao cache do navegador: na primeira tentativa a tela mostrou `SUVINIL: 0` porque a
    página não tinha sido recarregada; `Ctrl+Shift+R` resolveu.

---

## 6. Riscos e o que fica em aberto

| Risco | Gravidade | Tratamento |
|---|---|---|
| CSV de 23,6 MB baixado a cada load | média | gzip resolve a transferência (~4 MB). O parse de 335 mil linhas no navegador continua; se a tela ficar lenta em máquina fraca, o próximo passo é pré-processar o CSV em JSON enxuto no build, ou um endpoint na API. Fora desta entrega. |
| Cadastrar Suvinil cujo produto já existe | baixa | `verificar-produto` casa por composição e **não há fórmula repetida entre as coleções**, então não há como uma cor Suvinil ser confundida com uma Iquine já cadastrada. |
| 21 cores Iquine somem do seletor | baixa | Mudança intencional (decisão 3.4) — hoje elas levam a beco sem saída. Listadas na seção 2.1, com as 86 Suvinil. Se alguém reclamar da falta de uma, a correção certa é cadastrar a base que falta em `mockData.ts`, não reverter o filtro. |
| Arquivo futuro com produto novo que o `mockBases` não cobre | média | O filtro esconde a cor **em silêncio**. É o que o contador de descartadas no console (4.2.8) serve para denunciar: se pular de 107 para muito mais, falta base no `mockData.ts`. |
| `#CCCCCC` deixa de aparecer nas 48 Iquine sem hex que continuam no seletor | baixa | Mudança visual intencional (decisão 3.2). Se incomodar, é reverter um `\|\|`. |

**Rollback:** um `git revert` do commit devolve CSV, código e nginx ao estado atual; rebuildar o
container. Nada é gravado em disco nem em banco pelo frontend, então não há migração para desfazer.
Produtos Suvinil já cadastrados no Sankhya continuam válidos — só ficariam sem a cor correspondente
na tela até o CSV voltar.
