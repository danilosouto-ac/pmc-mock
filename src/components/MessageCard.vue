<script setup>
import { computed } from 'vue';
import { 
  Terminal, 
  Clock, 
  ShieldAlert, 
  Activity, 
  User, 
  MapPin, 
  Camera, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-vue-next';

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const isMotivo = computed(() => props.message.topic === 'monitor-motivo');

const parsedData = computed(() => {
  if (!props.message?.content) return null;
  if (typeof props.message.content === 'object') return props.message.content;
  try {
    return JSON.parse(props.message.content);
  } catch (e) {
    console.warn('Failed to parse message content as JSON:', props.message.id);
    return null;
  }
});

const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const getCriticidadeLabel = (val) => {
  const levels = {
    1: 'Baixa',
    2: 'Média',
    3: 'Alta',
    4: 'Crítica'
  };
  return levels[val] || val;
};

const getCriticidadeClass = (val) => {
  if (val >= 3) return 'text-red';
  if (val === 2) return 'text-orange';
  return 'text-green';
};
</script>

<template>
  <div class="message-card glass-panel animate-in" :class="isMotivo ? 'glow-blue' : 'glow-purple'">
    <div class="card-header">
      <div class="topic-info">
        <component :is="isMotivo ? Terminal : ShieldAlert" 
                   :size="16" 
                   :class="isMotivo ? 'text-blue' : 'text-purple'" />
        <span class="badge" :class="isMotivo ? 'badge-blue' : 'badge-purple'">
          {{ isMotivo ? 'Interesse Motivo' : 'Interesse Criticidade' }}
        </span>
      </div>
      <div class="timestamp">
        <Clock :size="12" />
        <span>{{ formatTime(message.timestamp) }}</span>
      </div>
    </div>
    
    <div class="card-body">
      <!-- Structured JSON View -->
      <div v-if="parsedData" class="structured-content">
        <div class="main-info">
          <div class="person">
            <User :size="18" class="icon" />
            <span class="name">{{ parsedData.nome }}</span>
          </div>
          <div v-if="isMotivo" class="reason-tag">
            <span class="label">MOTIVO:</span>
            <span class="value">{{ parsedData.motivo }}</span>
          </div>
          <div v-else class="criticidade-tag" :class="getCriticidadeClass(parsedData.criticidade)">
            <AlertCircle :size="18" />
            <span class="value">CRITICIDADE {{ parsedData.criticidade }}: {{ getCriticidadeLabel(parsedData.criticidade) }}</span>
          </div>
        </div>

        <div class="metadata-grid">
          <div class="meta-item">
            <MapPin :size="14" />
            <span>{{ parsedData.local }}</span>
          </div>
          <div class="meta-item">
            <Camera :size="14" />
            <span>{{ parsedData.camera }}</span>
          </div>
          <div class="meta-item subtle">
            <ImageIcon :size="14" />
            <span>{{ parsedData.imagem }}</span>
          </div>
        </div>
      </div>

      <!-- Fallback for non-JSON -->
      <p v-else class="content">{{ message.content }}</p>
    </div>
    
    <div class="card-footer">
      <div class="msg-id">ID: {{ message.id }}</div>
      <div class="coords" v-if="parsedData">
        {{ parsedData.latitude }}, {{ parsedData.longitude }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-card {
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.message-card:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.03);
}

.message-card.glow-blue { border-left-color: var(--accent-blue); }
.message-card.glow-purple { border-left-color: var(--accent-purple); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.topic-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.text-blue { color: var(--accent-blue); }
.text-purple { color: var(--accent-purple); }

.timestamp {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

.structured-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.person {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.person .icon { color: var(--accent-blue); }
.person .name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.reason-tag {
  background: rgba(59, 130, 246, 0.1);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  display: flex;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.reason-tag .label { color: var(--accent-blue); font-weight: 700; }
.reason-tag .value { color: var(--text-primary); }

.criticidade-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  font-weight: 700;
  font-size: 0.85rem;
}

.text-red { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }
.text-orange { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
.text-green { color: #10b981; border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.meta-item.subtle { opacity: 0.6; }

.card-body .content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-primary);
  word-break: break-word;
}

.card-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.msg-id {
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}

.coords {
  font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  opacity: 0.6;
}
</style>
