<script setup>
import { ref, watch, computed } from 'vue';
import { BellRing, X } from 'lucide-vue-next';

const props = defineProps({
  lastMessage: {
    type: Object,
    default: null
  }
});

const visible = ref(false);

const parsedContent = computed(() => {
  if (!props.lastMessage) return null;
  try {
    return JSON.parse(props.lastMessage.content);
  } catch (e) {
    return null;
  }
});

watch(() => props.lastMessage, (newMsg) => {
  if (newMsg) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 4000);
  }
});

const close = () => {
  visible.value = false;
};
</script>

<template>
  <Transition name="toast">
    <div v-if="visible && lastMessage" class="toast-notification glass-panel" :class="lastMessage.topic === 'monitor-motivo' ? 'border-blue' : 'border-purple'">
      <div class="toast-icon">
        <BellRing :size="20" />
      </div>
      <div class="toast-content">
        <h4 v-if="parsedContent">{{ parsedContent.nome }}</h4>
        <h4 v-else>Novo Alerta: {{ lastMessage.topic }}</h4>
        
        <p v-if="parsedContent">
          {{ parsedContent.motivo || `Criticidade Nível ${parsedContent.criticidade}` }}
        </p>
        <p v-else>{{ lastMessage.content.substring(0, 60) }}...</p>
      </div>
      <button @click="close" class="close-btn">
        <X :size="16" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  width: 320px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-left: 4px solid var(--accent-blue);
}

.border-blue { border-left-color: var(--accent-blue); }
.border-purple { border-left-color: var(--accent-purple); }

.toast-icon {
  background: rgba(255,255,255,0.05);
  padding: 0.5rem;
  border-radius: 12px;
  color: var(--accent-blue);
}

.toast-content h4 {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
}

.toast-content p {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

/* Animations */
.toast-enter-active, .toast-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}
</style>
