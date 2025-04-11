<template>
    <div class="race-results">
        <v-progress-circular v-if="loading" indeterminate color="primary"
            class="mx-auto d-block my-4"></v-progress-circular>

        <div v-else>
            <div class="text-subtitle-1 mb-2">
                {{ results.raceName }} - {{ formatRaceDate(results.date) }}
                <span v-if="results.Circuit" class="text-body-2 d-block text-medium-emphasis">
                    {{ results.Circuit.circuitName }}, {{ results.Circuit.Location.locality }}, {{
                        results.Circuit.Location.country }}
                </span>
            </div>

            <!-- Race Results Table -->
            <v-table v-if="type === 'race' && results.Results" density="compact">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Constructor</th>
                        <th>Time/Status</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(result, index) in results.Results" :key="index">
                        <td>{{ result.position }}</td>
                        <td>
                            <span class="driver-name"
                                :style="{ borderLeft: `4px solid ${getDriverColor(result.Driver.driverId)}` }">
                                {{ result.Driver.givenName }} {{ result.Driver.familyName }}
                                <span v-if="hasFastestLap(result) && isInPoints(result, 'race')"
                                    class="fastest-lap-indicator" title="Fastest Lap">
                                </span>
                            </span>
                        </td>
                        <td>{{ result.Constructor.name }}</td>
                        <td>
                            <span v-if="result.Time">{{ result.Time.time }}</span>
                            <span v-else-if="result.status">{{ result.status }}</span>
                        </td>
                        <td>{{ result.points }}</td>
                    </tr>
                </tbody>
            </v-table>

            <!-- Qualifying Results Table -->
            <v-table v-else-if="type === 'qualifying' && results.QualifyingResults" density="compact">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Constructor</th>
                        <th>Q1</th>
                        <th>Q2</th>
                        <th>Q3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(result, index) in results.QualifyingResults" :key="index">
                        <td>{{ result.position }}</td>
                        <td>
                            <span
                                :style="{ borderLeft: `4px solid ${getDriverColor(result.Driver.driverId)}`, paddingLeft: '8px' }">
                                {{ result.Driver.givenName }} {{ result.Driver.familyName }}
                            </span>
                        </td>
                        <td>{{ result.Constructor.name }}</td>
                        <td>{{ result.Q1 || '—' }}</td>
                        <td>{{ result.Q2 || '—' }}</td>
                        <td>{{ result.Q3 || '—' }}</td>
                    </tr>
                </tbody>
            </v-table>

            <!-- Sprint Results Table -->
            <v-table v-else-if="type === 'sprint' && results.SprintResults" density="compact">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Constructor</th>
                        <th>Time/Status</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(result, index) in results.SprintResults" :key="index">
                        <td>{{ result.position }}</td>
                        <td>
                            <span class="driver-name"
                                :style="{ borderLeft: `4px solid ${getDriverColor(result.Driver.driverId)}` }">
                                {{ result.Driver.givenName }} {{ result.Driver.familyName }}
                                <span v-if="hasFastestLap(result) && isInPoints(result, 'sprint')"
                                    class="fastest-lap-indicator" title="Fastest Lap">
                                </span>
                            </span>
                        </td>
                        <td>{{ result.Constructor.name }}</td>
                        <td>
                            <span v-if="result.Time">{{ result.Time.time }}</span>
                            <span v-else-if="result.status">{{ result.status }}</span>
                        </td>
                        <td>{{ result.points }}</td>
                    </tr>
                </tbody>
            </v-table>

            <v-alert v-else type="info" density="compact" class="my-3">
                No data available for this session.
            </v-alert>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'RaceResults',
        props: {
            results: {
                type: Object,
                required: true
            },
            type: {
                type: String,
                default: 'race', // can be 'race', 'qualifying', or 'sprint'
                validator: (value) => ['race', 'qualifying', 'sprint'].includes(value)
            },
            loading: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            formatRaceDate(dateStr) {
                if (!dateStr) return '';
                const date = new Date(dateStr);
                return new Intl.DateTimeFormat(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(date);
            },

            getDriverColor(driverId) {
                // Static color mapping for 2025 drivers
                const driverColors = {
                    // Red Bull
                    'max_verstappen': '#0600EF',
                    'tsunoda': '#0600EF',

                    // Ferrari
                    'leclerc': '#DC0000',
                    'hamilton': '#DC0000',

                    // Mercedes
                    'russell': '#00D2BE',
                    'antonelli': '#00D2BE',

                    // McLaren
                    'norris': '#FF8700',
                    'piastri': '#FF8700',

                    // Aston Martin
                    'alonso': '#006F62',
                    'stroll': '#006F62',

                    // Alpine
                    'gasly': '#0090FF',
                    'doohan': '#0090FF',

                    // Haas
                    'ocon': '#FFF500',
                    'bearman': '#FFF500',

                    // Racing Bulls
                    'hadjar': '#2B4562',
                    'lawson': '#2B4562',

                    // Sauber (transitioning to Audi)
                    'hulkenberg': '#900000',
                    'bortoleto': '#900000',

                    // Williams
                    'albon': '#0082FA',
                    'sainz': '#0082FA'
                };

                return driverColors[driverId] || '#999999'; // Default color if driver not found
            },

            hasFastestLap(result) {
                return result.FastestLap && result.FastestLap.rank === '1';
            },

            isInPoints(result, sessionType) {
                const pointsThreshold = sessionType === 'race' ? 10 : 8;
                return parseInt(result.position) <= pointsThreshold;
            }
        }
    };
</script>

<style scoped>
    .race-results {
        margin-top: 20px;
    }

    .driver-name {
        padding-left: 8px;
    }

    .fastest-lap-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        background-color: purple;
        border-radius: 50%;
        margin-left: 4px;
    }
</style>