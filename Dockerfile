# ==========================================
# STAGE 1: Builder do Frontend (Vite + React)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copia descritores de pacote
COPY package*.json ./

# Instala todas as dependências
RUN npm ci

# Copia código-fonte completo
COPY . .

# Argumento para URL da API (padrão '/api/v1' para proxy transparente do Nginx)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Executa build do TypeScript e Vite
RUN npm run build

# ==========================================
# STAGE 2: Servidor Web Nginx (Alta Performance)
# ==========================================
FROM nginx:alpine AS runner

# Remove a página padrão do nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build estático gerado no estágio 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuração customizada do Nginx com suporte a SPA, SSE e Proxy Reverso
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe porta 80 do container
EXPOSE 80

# Healthcheck do Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
