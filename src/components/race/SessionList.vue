<template>
    <v-list>
        <v-list-item v-for="session in sessions" :key="session.type" :class="{
            'next-session': session.isNext && !hasLiveSession,
            'live-session': session.isLive || session.isPreLive
        }">
            <v-list-item-title>
                {{ session.name }}
                <v-chip v-if="session.isNext && !session.isLive && !session.isPreLive && !hasLiveSession"
                    color="primary" size="small" class="ml-2">
                    NEXT
                </v-chip>
                <v-btn v-if="session.isLive || session.isPreLive" color="red" size="small" class="ml-2"
                    prepend-icon="mdi-play-circle-outline" @click="watchLive">
                    WATCH LIVE
                </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>
                {{ session.localDateTime }}
            </v-list-item-subtitle>
        </v-list-item>
    </v-list>
</template>

<script>
    export default {
        name: 'SessionList',
        props: {
            sessions: {
                type: Array,
                required: true
            },
            hasLiveSession: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            watchLive() {
                // Open F1TV in the default browser
                const url = 'https://f1tv.formula1.com';
                if (window.electron) {
                    // For Electron apps
                    window.electron.openExternal(url);
                } else {
                    // For web apps
                    window.open(url, '_blank');
                }
            }
        }
    }
</script>

<style scoped>
    .next-session {
        background-color: rgba(var(--v-theme-primary), 0.1);
    }

    .live-session {
        background-color: rgba(255, 0, 0, 0.1);
    }
</style>