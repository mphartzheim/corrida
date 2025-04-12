<template>
    <v-dialog v-model="dialog" max-width="800">
        <v-card v-if="race">
            <v-card-title class="d-flex justify-space-between align-center">
                <div>{{ race.raceName }} Results</div>
                <v-btn icon="$close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>

            <v-card-text>
                <v-tabs v-model="activeTab">
                    <v-tab value="race">Race</v-tab>
                    <v-tab value="qualifying">Qualifying</v-tab>
                    <v-tab v-if="hasSprintResults" value="sprint">Sprint</v-tab>
                </v-tabs>

                <v-window v-model="activeTab">
                    <!-- Race Results Tab -->
                    <v-window-item value="race">
                        <race-results v-if="raceResults" :results="raceResults" :loading="loadingRace"></race-results>
                        <v-progress-circular v-else-if="loadingRace" indeterminate color="primary"
                            class="mx-auto d-block my-4"></v-progress-circular>
                        <v-alert v-else type="error" density="compact" class="my-3">
                            Error loading race results. Please try again later.
                        </v-alert>
                    </v-window-item>

                    <!-- Qualifying Results Tab -->
                    <v-window-item value="qualifying">
                        <race-results v-if="qualifyingResults" :results="qualifyingResults" :type="'qualifying'"
                            :loading="loadingQualifying"></race-results>
                        <v-progress-circular v-else-if="loadingQualifying" indeterminate color="primary"
                            class="mx-auto d-block my-4"></v-progress-circular>
                        <v-alert v-else type="error" density="compact" class="my-3">
                            Error loading qualifying results. Please try again later.
                        </v-alert>
                    </v-window-item>

                    <!-- Sprint Results Tab -->
                    <v-window-item value="sprint">
                        <race-results v-if="sprintResults" :results="sprintResults" :type="'sprint'"
                            :loading="loadingSprint"></race-results>
                        <v-progress-circular v-else-if="loadingSprint" indeterminate color="primary"
                            class="mx-auto d-block my-4"></v-progress-circular>
                        <v-alert v-else-if="!hasSprintResults" type="info" density="compact" class="my-3">
                            No sprint race for this Grand Prix.
                        </v-alert>
                        <v-alert v-else type="error" density="compact" class="my-3">
                            Error loading sprint results. Please try again later.
                        </v-alert>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    import f1Service from '@/services/f1Service';
    import RaceResults from '@/components/results/RaceResults.vue';

    export default {
        name: 'ResultsDialog',
        components: {
            RaceResults
        },
        props: {
            show: {
                type: Boolean,
                default: false
            },
            raceInfo: {
                type: Object,
                default: null
            },
            year: {
                type: Number,
                default: null
            }
        },
        data() {
            return {
                dialog: false,
                race: null,
                activeTab: 'race',
                raceResults: null,
                qualifyingResults: null,
                sprintResults: null,
                loadingRace: false,
                loadingQualifying: false,
                loadingSprint: false,
                hasSprintResults: false
            }
        },
        watch: {
            show(val) {
                this.dialog = val;
                if (val && this.raceInfo) {
                    this.race = this.raceInfo;
                    this.loadResults();
                }
            },
            dialog(val) {
                if (!val) {
                    this.$emit('update:show', false);
                }
            }
        },
        methods: {
            closeDialog() {
                this.dialog = false;
            },

            async loadResults() {
                if (!this.race || !this.year) return;

                const year = this.year;
                const round = this.race.round;

                // Load race results
                this.loadingRace = true;
                try {
                    const raceResults = await f1Service.getRaceResults(year, round);
                    this.raceResults = raceResults;
                } catch (error) {
                    console.error('Error loading race results:', error);
                    this.raceResults = null;
                } finally {
                    this.loadingRace = false;
                }

                // Load qualifying results
                this.loadingQualifying = true;
                try {
                    const qualifyingResults = await f1Service.getQualifyingResults(year, round);
                    this.qualifyingResults = qualifyingResults;
                } catch (error) {
                    console.error('Error loading qualifying results:', error);
                    this.qualifyingResults = null;
                } finally {
                    this.loadingQualifying = false;
                }

                // Load sprint results (if available)
                this.loadingSprint = true;
                try {
                    const sprintResults = await f1Service.getSprintResults(year, round);
                    this.sprintResults = sprintResults;
                    this.hasSprintResults = !!sprintResults;
                } catch (error) {
                    console.error('Error loading sprint results:', error);
                    this.sprintResults = null;
                    this.hasSprintResults = false;
                } finally {
                    this.loadingSprint = false;
                }
            }
        }
    }
</script>

<style scoped>
    /* No specific styling needed */
</style>