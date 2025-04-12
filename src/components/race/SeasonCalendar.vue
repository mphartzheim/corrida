<template>
    <div>
        <!-- Season Year Selector -->
        <div class="d-flex align-center mb-3">
            <v-select v-model="year" :items="availableYears" label="Season" density="compact" variant="outlined"
                hide-details class="season-selector" @update:model-value="handleYearChange"></v-select>
        </div>

        <v-progress-circular v-if="loading" indeterminate color="primary"
            class="mx-auto d-block my-4"></v-progress-circular>

        <v-alert v-if="error" type="error" density="compact" class="mb-3">
            Error loading season calendar. Please try again later.
        </v-alert>

        <v-list v-else>
            <v-list-item v-for="race in calendar" :key="race.round" :class="{
                'next-race': race.isNext,
                'past-race': race.isPast,
                'current-race': race.isCurrent
            }" @click="race.isPast && showRaceResults(race)" :style="{ cursor: race.isPast ? 'pointer' : 'default' }">
                <v-list-item-title>
                    {{ race.raceName }}
                    <v-chip v-if="race.isNext" color="primary" size="small" class="ml-2">
                        NEXT
                    </v-chip>
                    <v-chip v-if="race.isCurrent" color="red" size="small" class="ml-2">
                        CURRENT
                    </v-chip>
                    <v-chip v-if="race.isPast" color="grey" size="small" class="ml-2">
                        VIEW RESULTS
                    </v-chip>
                </v-list-item-title>
                <v-list-item-subtitle>
                    <span class="circuit-link" @click.stop="showCircuitMap(race.Circuit)">
                        {{ race.Circuit.circuitName }}
                        <v-icon size="x-small" color="primary">mdi-map-marker</v-icon>
                    </span> - {{ formatDateOnly(race.date) }}
                </v-list-item-subtitle>
            </v-list-item>
        </v-list>
    </div>
</template>

<script>
    import f1Service from '@/services/f1Service';

    export default {
        name: 'SeasonCalendar',
        props: {
            currentRace: {
                type: Object,
                required: true
            },
            sessions: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                year: new Date().getFullYear(),
                availableYears: f1Service.getValidSeasons(),
                calendar: [],
                loading: false,
                error: false
            }
        },
        methods: {
            formatDateOnly(dateStr) {
                const utcDate = new Date(dateStr);
                return new Intl.DateTimeFormat(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(utcDate);
            },

            handleYearChange() {
                this.loadCalendar();
            },

            async loadCalendar() {
                this.loading = true;
                this.error = false;

                try {
                    // Fetch the calendar data for the selected year from the API
                    const races = await f1Service.getFullCalendar(this.year);
                    const now = new Date();
                    const currentYear = new Date().getFullYear();
                    const isPastSeason = this.year < currentYear;

                    // Process the races to add status flags
                    this.calendar = races.map(race => {
                        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);

                        // For past seasons, all races are considered past races
                        const isPast = isPastSeason || raceDate < now;

                        // Only the current season can have next or current races
                        const isNext = !isPastSeason && race.round === this.currentRace.round;
                        const isCurrent = !isPastSeason && !isPast && !isNext &&
                            this.currentRace &&
                            this.sessions &&
                            this.sessions.length > 0 &&
                            this.sessions.some(session => session.isLive);

                        return {
                            ...race,
                            isPast,
                            isNext,
                            isCurrent
                        };
                    });
                } catch (error) {
                    console.error(`Error loading ${this.year} season calendar:`, error);
                    this.error = true;
                } finally {
                    this.loading = false;
                }
            },

            showRaceResults(race) {
                this.$emit('show-results', { race, year: this.year });
            },

            showCircuitMap(circuit) {
                this.$emit('show-circuit', circuit);
            }
        },
        mounted() {
            this.loadCalendar();
        }
    }
</script>

<style scoped>
    .next-race {
        background-color: rgba(var(--v-theme-primary), 0.1);
    }

    .past-race {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .current-race {
        background-color: rgba(255, 0, 0, 0.1);
    }

    .circuit-link {
        cursor: pointer;
        color: var(--v-theme-primary);
        display: inline-flex;
        align-items: center;
    }

    .circuit-link:hover {
        text-decoration: underline;
    }

    .season-selector {
        width: 120px;
    }

    /* Apply custom scrollbar styling to v-select dropdown menu */
    :deep(.v-select__menu .v-list::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }

    :deep(.v-select__menu .v-list::-webkit-scrollbar-track) {
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
    }

    :deep(.v-select__menu .v-list::-webkit-scrollbar-thumb) {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    :deep(.v-select__menu .v-list::-webkit-scrollbar-thumb:hover) {
        background: rgba(0, 0, 0, 0.3);
    }

    /* Firefox scrollbar styling */
    :deep(.v-select__menu .v-list) {
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
    }
</style>