<template>
    <div class="race-info">
        <v-card-title class="text-h4 pa-4 pb-2">
            {{ raceData.raceName }}
        </v-card-title>
        <v-card-subtitle class="px-4 pb-0">
            Round {{ raceData.round }} - {{ raceData.Circuit.circuitName }}
        </v-card-subtitle>
    </div>
</template>

<script>
    export default {
        name: 'RaceInfo',
        props: {
            raceData: {
                type: Object,
                required: true
            }
        }
    }
</script>

<style scoped>
    .race-info {
        padding-bottom: 0;
    }
</style>