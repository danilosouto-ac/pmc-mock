# PMC Monitor - Real-time GCP Pub/Sub Dashboard

Esta é uma aplicação Vue 3 SPA desenvolvida para monitorar tópicos do Google Cloud Pub/Sub em tempo real.

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real**: Conecta via Socket.io ao backend que escuta as mensagens do tópico `facial-recognition-input`.
- **Subscriptions Suportadas**: `facial-interest-motivo` e `facial-interest-criticidade`.
- **Alertas Premium**: Notificações visuais elegantes para cada nova mensagem.
- **Filtros Avançados**: Filtre por conteúdo, ID ou tópico específico.
- **Design Premium**: Interface escura com Glassmorphism e animações suaves.

## 🛠️ Tecnologias

- **Frontend**: Vue 3, Vite, Pinia, Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, @google-cloud/pubsub.

## 📦 Como Rodar

### 1. Pré-requisitos
- Node.js instalado.
- Credenciais da Google Cloud (se for usar o modo real).

### 2. Instalação
```bash
npm install
```

### 3. Configuração
Edite o arquivo `server/.env`:
- `MOCK=true`: Gera mensagens fakes para demonstração.
- `MOCK=false`: Conecta ao GCP Pub/Sub real.
- `GCP_PROJECT_ID`: ID do seu projeto no GCP.

### 4. Execução
Para rodar frontend e backend simultaneamente:
```bash
npm run dev:all
```

O frontend estará disponível em `http://localhost:5173`.

## 🔌 Integração GCP Pub/Sub
Para usar em produção:
1. Garanta que você tem permissão de leitura nos tópicos.
2. O backend tentará criar ou usar assinaturas com o nome `{topic}-sub-web-monitor`.
3. Certifique-se de estar autenticado via `gcloud auth application-default login` ou defina `GOOGLE_APPLICATION_CREDENTIALS`.
