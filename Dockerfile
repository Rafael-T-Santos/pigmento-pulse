# ---- Etapa 1: build do frontend ----
FROM node:20-alpine AS build
WORKDIR /app

# Instala dependências a partir do lockfile (build reproduzível)
COPY package.json package-lock.json ./
RUN npm ci

# Copia o restante do código e gera os arquivos estáticos em /app/dist
COPY . .
RUN npm run build

# ---- Etapa 2: servir os estáticos com nginx ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Pré-comprime o CSV de fórmulas (23,6 MB -> 1,7 MB) para o `gzip_static on` do
# nginx.conf entregar o .gz pronto. Sem isto o nginx comprimiria os 23,6 MB a
# cada requisição, ou seja, a cada pessoa que abre a tela.
#
# O arquivo original fica: o .gz só é usado para quem manda Accept-Encoding gzip.
# `-c` em vez de `-k` porque o gzip do busybox nem sempre traz o `-k`.
# Se o CSV sumir do build, este RUN falha e o erro aparece aqui, em vez de o
# container subir servindo uma tela sem cores.
RUN gzip -9 -c /usr/share/nginx/html/formulas_iquine.csv \
      > /usr/share/nginx/html/formulas_iquine.csv.gz

EXPOSE 80
