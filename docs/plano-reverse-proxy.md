# Plano — Reverse Proxy único para os serviços do servidor `nd-db-02` (192.168.255.6)

Objetivo: acessar cada app por um **nome** (`tintas.empresa`, `load.empresa`…) sem digitar porta,
com **uma única porta de entrada** (80/443) roteando por hostname. Ferramenta escolhida:
**Nginx Proxy Manager (NPM)** — tem interface web, gerencia rotas e certificados SSL sem editar
arquivos de config na mão.

> Princípio de segurança da migração: **subir o proxy em portas de teste primeiro**, configurar e
> validar todas as rotas, e só então fazer o "cutover" da porta 80/443. Assim nada fica fora do ar
> durante a configuração, e o rollback é simples.

---

## 1. Inventário atual (confirmado no servidor)

| Serviço                    | Container(s)                | Porta hoje        | Rede docker                     | Vira nome |
|----------------------------|-----------------------------|-------------------|---------------------------------|-----------|
| check-my-load (frontend)   | `check-my-load-frontend-1`  | **80, 443**       | `check-my-load_default`         | `load.empresa` |
| check-my-load (backend)    | `check-my-load-backend-1`   | 3000              | `check-my-load_default`         | (interno) |
| check-my-load (db)         | `check-my-load-db-1`        | 5432              | `check-my-load_default`         | (não expor) |
| API Sankhya (Flask)        | `api_sankhya`               | 5000              | `internal-api-sankhya_default`  | `api.empresa` (opcional) |
| Pigmento Pulse (frontend)  | `pigmento-frontend`         | 8081→80           | `internal-api-sankhya_default`  | `tintas.empresa` |
| enriquecimento-cnpjws (?)  | — (rede existe, ver amanhã) | ?                 | `enriquecimento-cnpjws_default` | a decidir |

> **Verificar amanhã (1º passo):** `docker ps -a` e localizar o `docker-compose.yml` de cada projeto
> (provavelmente em `~/check-my-load`, `~/internal-api-sankhya`, `~/enriquecimento-cnpjws`).
> Conferir também o serviço `enriquecimento-cnpjws`, que aparece só como rede.

---

## 2. Decisões a tomar ANTES de começar

1. **Esquema de nomes.** Duas opções:
   - Usar um **domínio real que você já possua** (ex.: `apps.suaempresa.com.br`) com subdomínios
     `tintas.`, `load.` etc. → permite HTTPS válido (recomendado).
   - Usar um sufixo interno inventado (ex.: `tintas.lan`). Funciona, mas o HTTPS fica só
     autoassinado. **Evite `.local`** (conflita com mDNS).
2. **DNS interno.** Os nomes precisam resolver para `192.168.255.6` na rede. Onde criar os registros:
   - Roteador / pfSense / OPNsense (DNS estático), **ou** Pi-hole, **ou** DNS do AD Windows.
   - Sem DNS interno dá pra testar editando o `hosts` de cada PC, mas **não escala** — planeje o DNS.
3. **SSL/HTTPS.**
   - **HTTP só (interno):** mais simples, zero certificado. Ok para rede fechada.
   - **HTTPS com domínio real:** NPM emite Let's Encrypt via *DNS Challenge* (funciona mesmo para IP
     interno). Precisa de um provedor de DNS suportado (Cloudflare etc.).
   - **HTTPS autoassinado / CA interna:** navegador reclama até instalar a CA nas máquinas.

> Recomendação para começar: **domínio real + HTTP interno agora**, e ligar o HTTPS depois que
> as rotas estiverem estáveis.

---

## 3. Arquitetura alvo

```
              Navegador (LAN)
                    │  http(s)://tintas.empresa
                    ▼
        ┌───────────────────────────┐   porta 80/443 (única entrada)
        │   Nginx Proxy Manager     │
        │   (container "npm")        │
        └─────┬─────────┬───────┬────┘
              │         │       │        rede docker "proxy" (compartilhada)
   tintas.*   │  load.* │ api.* │
              ▼         ▼       ▼
      pigmento-    check-my-   api_sankhya
      frontend:80  load-fe:80  :5000
              │
              └──(mesma rede)──► api_sankhya:5000   (chamada /api do Pigmento)
```

Regra de ouro: **todo container que o proxy precisa alcançar entra numa rede docker compartilhada
chamada `proxy`.** O NPM fala com cada app pelo **nome do container** dentro dessa rede — nenhum app
precisa mais publicar 80/443/porta no host (exceto casos que você queira manter acessíveis direto).

---

## 4. Passo a passo (executar amanhã)

### Fase 0 — Backup e descoberta (não muda nada)
```bash
docker ps -a
docker network ls
# localizar os compose de cada projeto e fazer backup deles
for d in ~/check-my-load ~/internal-api-sankhya ~/enriquecimento-cnpjws ~/pigmento-pulse; do
  echo "== $d =="; ls -la "$d" 2>/dev/null | grep -i compose
done
# guardar cópia dos compose antes de editar
mkdir -p ~/backup-compose-$(date +%F)
```

### Fase 1 — Criar a rede compartilhada
```bash
docker network create proxy
```

### Fase 2 — Subir o Nginx Proxy Manager EM PORTAS DE TESTE
Crie `~/proxy/docker-compose.yml`:
```yaml
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    container_name: npm
    restart: unless-stopped
    ports:
      - "8080:80"     # TEMPORÁRIO (troca p/ 80 no cutover)
      - "8443:443"    # TEMPORÁRIO (troca p/ 443 no cutover)
      - "81:81"       # painel de administração
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - proxy

networks:
  proxy:
    external: true
```
```bash
cd ~/proxy && docker compose up -d
```
Acesse o painel em `http://192.168.255.6:81`
(login inicial: `admin@example.com` / senha `changeme` — troque no primeiro acesso).

### Fase 3 — Colocar cada app na rede `proxy` (ainda SEM tirar as portas atuais)
Para cada projeto, edite o `docker-compose.yml` adicionando a rede `proxy` como externa.
Exemplo — **Pigmento** (`~/pigmento-pulse/docker-compose.yml`, ver arquivo pronto no repo):
```yaml
services:
  frontend:
    build: .
    container_name: pigmento-frontend
    restart: unless-stopped
    networks:
      - proxy
    # ports:              # deixe COMENTADO; só reative se precisar do acesso direto :8081
    #   - "8081:80"

networks:
  proxy:
    external: true
```
> O Pigmento precisa alcançar o `api_sankhya`. Por isso **o `api_sankhya` também entra na rede
> `proxy`** — aí o `proxy_pass http://api_sankhya:5000;` do nginx continua resolvendo (mesmo nome,
> mesma rede). Confirme o nome/alias com `docker inspect api_sankhya`.

Para **check-my-load** e **api_sankhya**: adicione a rede `proxy` do mesmo jeito e recrie
(`docker compose up -d`). **Neste momento não remova ainda** o `ports: 80/443` do check-my-load —
faça isso só na Fase 5 (cutover), para não perder acesso enquanto testa.

### Fase 4 — Criar as rotas no NPM (Proxy Hosts) e testar pelas portas de teste
No painel do NPM → **Proxy Hosts → Add Proxy Host**, um para cada app:

| Domain              | Forward Hostname (nome do container) | Forward Port |
|---------------------|--------------------------------------|--------------|
| tintas.empresa      | pigmento-frontend                    | 80           |
| load.empresa        | check-my-load-frontend-1             | 80           |
| api.empresa (opc.)  | api_sankhya                          | 5000         |

Teste **sem mexer na porta 80 real**, usando a porta de teste 8080 e forçando o Host:
```bash
curl -H "Host: tintas.empresa" http://192.168.255.6:8080/ -I
curl -H "Host: load.empresa"   http://192.168.255.6:8080/ -I
```
Ambos devem responder `200`. Se der `502`, o container-alvo não está na rede `proxy` ou o
nome/porta estão errados.

### Fase 5 — Cutover da porta 80/443 (a única janela sensível)
1. Tirar o check-my-load da posse da 80/443: no compose dele, **remova** `ports: - "80:80"` e
   `- "443:443"` e recrie:
   ```bash
   cd ~/check-my-load && docker compose up -d
   ```
2. Passar o NPM para as portas reais: no `~/proxy/docker-compose.yml`, troque `8080:80`→`80:80` e
   `8443:443`→`443:443`, e recrie:
   ```bash
   cd ~/proxy && docker compose up -d
   ```
3. Remover a publicação `:8081` do Pigmento (já opcional) recriando o compose dele.

### Fase 6 — DNS e (opcional) SSL
1. Criar no DNS interno os registros `tintas.empresa`, `load.empresa`, `api.empresa` → `192.168.255.6`.
2. HTTPS: no NPM, aba **SSL** de cada Proxy Host → *Request a new certificate* (com domínio real +
   DNS Challenge). Ative "Force SSL" depois de validar.

### Fase 7 — Validação final
```bash
curl -I http://tintas.empresa      # 200
curl -I http://load.empresa        # 200
docker ps                          # npm dono da 80/443; apps sem portas publicadas
```
Testar no navegador cada nome, incluindo uma consulta real no Pigmento (bate no /api).

---

## 5. Rollback (se algo der errado no cutover)
- **Reverter o NPM** para as portas de teste (`80→8080`) e **devolver 80/443 ao check-my-load**
  (readicionar `ports` no compose dele e `docker compose up -d`). Volta ao estado atual em ~1 min.
- Como cada mudança é num `docker-compose.yml` versionado/backupeado, é sempre reversível.

## 6. Checklist rápido
- [ ] Backup dos compose atuais
- [ ] `docker network create proxy`
- [ ] NPM no ar em portas de teste (8080/8443/81)
- [ ] Todos os apps na rede `proxy` (sem remover portas ainda)
- [ ] `api_sankhya` na rede `proxy` (Pigmento continua achando o backend)
- [ ] Proxy Hosts criados e testados via `curl -H "Host: ..."`
- [ ] Cutover: check-my-load solta 80/443 → NPM assume 80/443
- [ ] DNS interno apontando os nomes para 192.168.255.6
- [ ] (Opcional) HTTPS ativado
- [ ] Validação no navegador + consulta real no Pigmento
```
