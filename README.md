# 🍞 Pão da Vida - 120 Cultos nos Lares (Frontend SPA)

[![React Version](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%20v6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-teal.svg)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Nginx%20Alpine-blue.svg)](https://hub.docker.com/_/nginx)

Aplicação Web responsiva (Mobile-First + Telão de Projeção) para a celebração de **11 Anos da Igreja Pão da Vida** em Mossoró - RN.

> *"Crescer & Edificar"* — **Efésios 4:16**  
> **Data do Evento:** 19 de Novembro de 2026  
> **Meta Estratégica:** 120 cultos simultâneos em residências distribuídas pelos 14 setores pastorais da cidade.

---

## 🎨 Identidade Visual Oficial (Crescer & Edificar)

O projeto adota a paleta oficial aprovada:
* **Verde Principal (Crescimento):** `#1D4225`
* **Dourado Nobre (Edificação):** `#D4A84B`
* **Dourado Claro / Accent:** `#F3E5AB`
* **Verde Secundário:** `#7A8165`
* **Terracota / Tijolo:** `#B5651D`
* **Logos Oficiais:** `/logo-principal-transparente.png` e `/logo-principal-verde-dourado-transparente.png`

---

## 📱 Módulos e Funcionalidades

1. **Dashboard Pastoral:** Visão macro da cidade em tempo real, progresso da meta dos 120 cultos, distribuição pelos 14 setores e feed ao vivo.
2. **Telão de Celebração:** Projeção fullscreen para o templo sede, sincronizado via Server-Sent Events (SSE) com efeitos sonoros sintéticos Web Audio API, animações de confete e carrossel de fotos dos lares.
3. **App do Líder de Culto:** PWA mobile-first para check-in de participantes (presenças), registro de decisões por Cristo com coleta de contatos para discipulado, e upload de fotos direto para o MinIO S3.
4. **Portal do Anfitrião:** Área dedicada aos lares participantes para validação de dados de acolhimento e confirmação da residência.
5. **Onboarding & Convites via WhatsApp:** Ativação de novos líderes e anfitriões com links diretos contendo tokens seguros.

---

## 🚀 Como Executar com Docker (VPS ou Local)

O frontend é empacotado em um contêiner ultra leve baseado em **Nginx Alpine** (~95MB) com suporte nativo a:
* Roteamento SPA do React Router (`try_files $uri $uri/ /index.html`)
* Compressão Gzip e cache imutável de assets estáticos
* Proxy reverso transparente para o Backend (`/api/v1/`)
* Proxy reverso de baixa latência sem buffer para SSE (`/api/v1/sse/`)
* Proxy reverso para o MinIO S3 (`/cultos-fotos/`)

### 1. Na VPS (Standalone)

```bash
# Na pasta do repositório frontend na VPS:
cp .env.docker.example .env

# Subir o container no Docker
docker compose up -d --build
```

O container se conectará automaticamente à rede Docker `pao-da-vida-network` compartilhada com o backend e responderá na porta configurada (padrão: `80` ou `8080`).

---

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor Vite com Hot Reload
npm run dev

# Executar Typecheck e Build de Produção
npm run build
```
