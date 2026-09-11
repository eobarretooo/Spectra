# 🔮 Spectra — Transmissão de Tela, Voz e Câmera em Alta Definição

> Transmita sua tela, converse com áudio ultrabaixo de latência e compartilhe momentos sem depender de limitações de plataformas fechadas. 100% ponto a ponto (WebRTC), sem paywalls artificiais e com controle total dos sons transmitidos.

Repositório Oficial: [https://github.com/eobarretooo/Spectra](https://github.com/eobarretooo/Spectra)

---

## ✨ Principais Diferenciais do Spectra

- ⚡ **Ponto a Ponto Real (WebRTC Mesh)**: Áudio, vídeo e tela trafegam diretamente entre os participantes. O servidor apenas auxilia no aperto de mãos inicial (sinalização WebSocket).
- 🔊 **Isolamento de Áudio por Aplicativo (PC)**: Transmita o som do jogo sem vazar o Spotify, Discord ou WhatsApp. O Spectra exclui sua própria voz e apps marcados via WASAPI no Windows.
- 💎 **Qualidade Total Desbloqueada**: Opções de 1080p60, 1440p e 4K sem barreiras ou assinaturas forçadas.
- 🎨 **Identidade Visual Imersiva**: Tema espacial escuro em Violeta e Ciano Elétrico, com personalização avançada de temas de sala.
- 📱 **Multiplataforma**:
  - **Web**: Funciona direto no navegador sem instalar nada.
  - **PC (Desktop)**: Executável leve via Electron (Windows, macOS e Linux).
  - **Android**: Suporte mobile integrado via Capacitor com CI para geração de APK.
  - **PWA**: Instalável em qualquer dispositivo móvel com um clique.

---

## 🏗️ Arquitetura do Projeto

```
Spectra/
├── app/                  # Frontend Next.js 16 (App Router, TailwindCSS, React 19)
├── components/           # Componentes UI (salas, vídeo WebRTC, seletores de qualidade)
├── backend/              # Servidor de Sinalização Fastify WebSocket independente (Porta 4000)
├── electron/             # Aplicativo Desktop (captura nativa WASAPI de áudio)
├── android/              # Projeto Android nativo integrado via Capacitor (live.spectra.app)
└── .github/workflows/    # CI/CD para compilação do Desktop e APK Android
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js**: v20 ou v22+
- **NPM**: v10+

### 1. Clonar o Repositório
```bash
git clone https://github.com/eobarretooo/Spectra.git
cd Spectra
```

### 2. Instalar Dependências
```bash
npm install
npm --prefix backend install
```

### 3. Iniciar o Servidor de Sinalização (Backend)
Em um terminal:
```bash
npm run backend:dev
```
O servidor Fastify iniciará em `http://localhost:4000` (WebSocket em `ws://localhost:4000/ws`).

### 4. Iniciar o Frontend (Next.js)
Em outro terminal:
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador!

---

## 🖥️ App Desktop (PC)

Para testar ou compilar o aplicativo para computador:

```bash
# Rodar em modo desenvolvimento
npm run electron:dev

# Empacotar instalador para Windows (.exe)
npm run electron:dist
```

O instalador será gerado em `electron/release/`.

---

## 📱 App Android

O Spectra conta com suporte para Android usando **Capacitor**:
- Configuração: `capacitor.config.ts` (ID: `live.spectra.app`, Nome: `Spectra`).
- Sincronização de arquivos:
  ```bash
  npm run android:sync
  ```
- Abrir no Android Studio:
  ```bash
  npm run android:open
  ```
- **Build Automática de APK**: A action `.github/workflows/build-android.yml` compila o APK automaticamente a cada commit na branch `main` ou criação de tags `v*`.

---

## 📜 Licença e Créditos
- Fork independente mantido por [@eobarretooo](https://github.com/eobarretooo/Spectra).
- Baseado na arquitetura inicial do `group-sharescreen`.
