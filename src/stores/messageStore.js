import { defineStore } from 'pinia';

export const useMessageStore = defineStore('messages', {
    state: () => ({
        messages: [],
        filterStatus: 'all', // 'all', 'monitor-motivo', 'monitor-criticidade'
        filterText: '',
        connected: false
    }),
    getters: {
        filteredMessages: (state) => {
            return state.messages.filter(msg => {
                const matchesTopic = state.filterStatus === 'all' || msg.topic === state.filterStatus;

                // Ensure content is treated as string for text search
                const contentStr = typeof msg.content === 'object'
                    ? JSON.stringify(msg.content)
                    : String(msg.content || '');

                const matchesText = contentStr.toLowerCase().includes(state.filterText.toLowerCase()) ||
                    String(msg.id).includes(state.filterText);
                return matchesTopic && matchesText;
            }).sort((a, b) => {
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB - dateA;
            });
        }
    },
    actions: {
        addMessage(msg) {
            console.log('New message received in store:', msg.topic, msg.id);
            this.messages.unshift(msg);
            if (this.messages.length > 100) this.messages.pop();
        },
        setHistory(history) {
            console.log('History received:', history.length, 'messages');
            this.messages = history;
        },
        setFilterStatus(status) {
            this.filterStatus = status;
        },
        setFilterText(text) {
            this.filterText = text;
        },
        setConnected(status) {
            this.connected = status;
        }
    }
});
