<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { io } from 'socket.io-client';
import { useMessageStore } from './stores/messageStore';
import MessageCard from './components/MessageCard.vue';
import Toast from './components/Toast.vue';
import { 
  Search, 
  Filter, 
  Wifi, 
  WifiOff, 
  LayoutDashboard, 
  Database,
  RefreshCw
} from 'lucide-vue-next';

const store = useMessageStore();
const socket = ref(null);
const lastMessage = ref(null);
const isRefreshing = ref(false);

const backendUrl = `http://${window.location.hostname}:3001`;

onMounted(() => {
  console.log('Connecting to backend at:', backendUrl);
  socket.value = io(backendUrl);

  socket.value.on('connect', () => {
    console.log('Socket.io connected breakthrough!');
    store.setConnected(true);
  });

  socket.value.on('disconnect', () => {
    store.setConnected(false);
  });

  socket.value.on('history', (history) => {
    store.setHistory(history);
  });

  socket.value.on('new-message', (data) => {
    store.addMessage(data);
    lastMessage.value = data;
  });
});

onUnmounted(() => {
  if (socket.value) socket.value.disconnect();
});

const refresh = () => {
  isRefreshing.value = true;
  setTimeout(() => isRefreshing.value = false, 1000);
};
</script>

<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar glass-panel">
      <div class="logo">
        <Database :size="24" class="logo-icon" />
        <span>PMC Monitor</span>
      </div>
      
      <nav class="nav-links">
        <a href="#" class="nav-item active">
          <LayoutDashboard :size="20" />
          <span>Dashboard</span>
        </a>
        <div class="nav-section">Tópicos</div>
        <button 
          class="filter-btn" 
          :class="{ active: store.filterStatus === 'all' }"
          @click="store.setFilterStatus('all')"
        >
          Todos
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: store.filterStatus === 'monitor-motivo' }"
          @click="store.setFilterStatus('monitor-motivo')"
        >
          Interesse Motivo
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: store.filterStatus === 'monitor-criticidade' }"
          @click="store.setFilterStatus('monitor-criticidade')"
        >
          Interesse Criticidade
        </button>
      </nav>

      <div class="status-indicator">
        <Wifi v-if="store.connected" :size="16" class="connected" />
        <WifiOff v-else :size="16" class="disconnected" />
        <span>{{ store.connected ? 'Online' : 'Offline' }}</span>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-area">
      <header class="top-nav">
        <div class="search-bar glass-panel">
          <Search :size="18" class="search-icon" />
          <input 
            type="text" 
            placeholder="Filtrar por ID ou conteúdo..." 
            :value="store.filterText"
            @input="store.setFilterText($event.target.value)"
          />
        </div>
        
        <div class="actions">
          <button class="refresh-btn glass-panel" @click="refresh" :class="{ rotating: isRefreshing }">
            <RefreshCw :size="18" />
          </button>
          <div class="user-profile glass-panel">
            <div class="avatar">DS</div>
          </div>
        </div>
      </header>

      <div class="feed-container">
        <div class="feed-header">
          <h2>Mensagens em Tempo Real</h2>
          <div class="stats">
            Total: {{ store.messages.length }} | Filtradas: {{ store.filteredMessages.length }}
          </div>
        </div>

        <TransitionGroup name="list" tag="div" class="message-list">
          <MessageCard 
            v-for="msg in store.filteredMessages" 
            :key="msg.id" 
            :message="msg" 
          />
          
          <div v-if="store.filteredMessages.length === 0" class="empty-state glass-panel">
            <LayoutDashboard :size="48" />
            <p>Nenhuma mensagem encontrada para os filtros atuais.</p>
          </div>
        </TransitionGroup>
      </div>
    </main>

    <!-- Alert System -->
    <Toast :lastMessage="lastMessage" />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  background-color: var(--bg-dark);
}

/* Sidebar */
.sidebar {
  width: 260px;
  margin: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 2.5rem;
  color: var(--text-primary);
}

.logo-icon { color: var(--accent-blue); }

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.nav-item.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-blue);
}

.nav-section {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  margin: 1.5rem 0 0.5rem 1rem;
}

.filter-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  text-align: left;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.filter-btn.active {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.status-indicator {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.5rem;
}

.connected { color: var(--accent-green); }
.disconnected { color: var(--accent-red); }

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem 1rem 1rem 0;
  overflow: hidden;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  width: 400px;
  gap: 0.75rem;
}

.search-icon { color: var(--text-secondary); }

.search-bar input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
  width: 100%;
}

.actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.6rem;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s;
}

.refresh-btn:hover { color: var(--text-primary); }

.rotating { animation: spin 1s linear infinite; }

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.user-profile {
  padding: 0.4rem;
  border-radius: 12px;
}

.avatar {
  width: 32px;
  height: 32px;
  background: var(--accent-blue);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
}

/* Feed */
.feed-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

.message-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: var(--text-secondary);
}

/* List Animations */
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
