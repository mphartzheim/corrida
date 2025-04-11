<template>
    <div>
        <div class="d-flex align-center justify-space-between mb-2">
            <h3 class="text-h6">{{ viewMode === 'next' ? 'Race Weekend Schedule' : 'F1 Season Calendar' }}</h3>
            <v-btn-toggle v-model="viewMode" mandatory>
                <v-btn value="next" density="comfortable" size="small">Next Race</v-btn>
                <v-btn value="season" density="comfortable" size="small">Full Season</v-btn>
            </v-btn-toggle>
        </div>

        <!-- Next Race View -->
        <div v-if="viewMode === 'next'">
            <!-- Countdown Timer or Live Session Display -->
            <div v-if="currentLiveSession" class="countdown-container live-now mb-3">
                <div class="countdown-title">{{ currentLiveSession.name }} is LIVE NOW!</div>
                <div class="session-status">
                    Session in progress
                    <v-progress-linear color="red" indeterminate class="mt-2"></v-progress-linear>
                </div>
            </div>
            <div v-else-if="nextSession" class="countdown-container mb-3">
                <div class="countdown-title">{{ nextSession.name }} starts in:</div>
                <div class="countdown-timer">
                    <div class="countdown-item">
                        <span class="countdown-value">{{ countdownDisplay.days }}</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">{{ countdownDisplay.hours }}</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">{{ countdownDisplay.minutes }}</span>
                        <span class="countdown-label">Minutes</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-value">{{ countdownDisplay.seconds }}</span>
                        <span class="countdown-label">Seconds</span>
                    </div>
                </div>
            </div>
            <div v-else class="countdown-container mb-3">
                <div class="countdown-title">No upcoming sessions</div>
            </div>

            <v-list>
                <v-list-item v-for="session in sortedSessions" :key="session.type" :class="{
                    'next-session': session.isNext && !currentLiveSession,
                    'live-session': session.isLive || session.isPreLive
                }">
                    <v-list-item-title>
                        {{ session.name }}
                        <v-chip v-if="session.isNext && !session.isLive && !session.isPreLive && !currentLiveSession"
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
        </div>

        <!-- Full Season Calendar View -->
        <div v-else>
            <v-progress-circular v-if="loadingCalendar" indeterminate color="primary"
                class="mx-auto d-block my-4"></v-progress-circular>

            <v-alert v-if="calendarError" type="error" density="compact" class="mb-3">
                Error loading season calendar. Please try again later.
            </v-alert>

            <v-list v-else>
                <v-list-item v-for="race in seasonCalendar" :key="race.round" :class="{
                    'next-race': race.isNext,
                    'past-race': race.isPast,
                    'current-race': race.isCurrent
                }" @click="race.isPast && showRaceResults(race)"
                    :style="{ cursor: race.isPast ? 'pointer' : 'default' }">
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

        <!-- Race Results Dialog -->
        <v-dialog v-model="resultsDialog" max-width="800">
            <v-card v-if="selectedRace">
                <v-card-title class="d-flex justify-space-between align-center">
                    <div>{{ selectedRace.raceName }} Results</div>
                    <v-btn icon="$close" variant="text" @click="resultsDialog = false"></v-btn>
                </v-card-title>

                <v-card-text>
                    <v-tabs v-model="activeResultsTab">
                        <v-tab value="race">Race</v-tab>
                        <v-tab value="qualifying">Qualifying</v-tab>
                        <v-tab v-if="hasSprintResults" value="sprint">Sprint</v-tab>
                    </v-tabs>

                    <v-window v-model="activeResultsTab">
                        <!-- Race Results Tab -->
                        <v-window-item value="race">
                            <race-results v-if="raceResults" :results="raceResults"
                                :loading="loadingRaceResults"></race-results>
                            <v-progress-circular v-else-if="loadingRaceResults" indeterminate color="primary"
                                class="mx-auto d-block my-4"></v-progress-circular>
                            <v-alert v-else type="error" density="compact" class="my-3">
                                Error loading race results. Please try again later.
                            </v-alert>
                        </v-window-item>

                        <!-- Qualifying Results Tab -->
                        <v-window-item value="qualifying">
                            <race-results v-if="qualifyingResults" :results="qualifyingResults" :type="'qualifying'"
                                :loading="loadingQualifyingResults"></race-results>
                            <v-progress-circular v-else-if="loadingQualifyingResults" indeterminate color="primary"
                                class="mx-auto d-block my-4"></v-progress-circular>
                            <v-alert v-else type="error" density="compact" class="my-3">
                                Error loading qualifying results. Please try again later.
                            </v-alert>
                        </v-window-item>

                        <!-- Sprint Results Tab -->
                        <v-window-item value="sprint">
                            <race-results v-if="sprintResults" :results="sprintResults" :type="'sprint'"
                                :loading="loadingSprintResults"></race-results>
                            <v-progress-circular v-else-if="loadingSprintResults" indeterminate color="primary"
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

        <!-- Circuit Map Modal -->
        <v-dialog v-model="mapDialog" max-width="800">
            <v-card v-if="selectedCircuit">
                <v-card-title class="d-flex justify-space-between align-center">
                    <div>{{ selectedCircuit.circuitName }}</div>
                    <v-btn icon="$close" variant="text" @click="closeMapDialog"></v-btn>
                </v-card-title>

                <v-card-subtitle>
                    {{ selectedCircuit.Location.locality }}, {{ selectedCircuit.Location.country }}
                </v-card-subtitle>

                <v-card-text>
                    <div id="calendar-circuit-map" style="height: 400px;"></div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import f1Service from '@/services/f1Service';
    import RaceResults from '@/components/results/RaceResults.vue';

    export default {
        name: 'SessionSchedule',
        props: {
            raceData: {
                type: Object,
                required: true
            }
        },
        components: {
            RaceResults
        },
        data() {
            return {
                refreshInterval: null,
                countdownInterval: null,
                currentDateTime: new Date(),
                countdownDisplay: {
                    days: '00',
                    hours: '00',
                    minutes: '00',
                    seconds: '00'
                },
                viewMode: 'next',
                loadingCalendar: false,
                calendarError: false,
                seasonCalendar: [],
                resultsDialog: false,
                selectedRace: null,
                activeResultsTab: 'race',
                raceResults: null,
                qualifyingResults: null,
                sprintResults: null,
                loadingRaceResults: false,
                loadingQualifyingResults: false,
                loadingSprintResults: false,
                hasSprintResults: false,
                mapDialog: false,
                selectedCircuit: null,
                map: null
            }
        },
        computed: {
            sortedSessions() {
                if (!this.raceData) return [];

                const now = this.currentDateTime;
                const sessions = [
                    {
                        type: 'fp1',
                        name: 'First Practice',
                        date: this.raceData.FirstPractice?.date,
                        time: this.raceData.FirstPractice?.time,
                        preLiveMinutes: 15 // 15 minutes before practice
                    },
                    {
                        type: 'fp2',
                        name: 'Second Practice',
                        date: this.raceData.SecondPractice?.date,
                        time: this.raceData.SecondPractice?.time,
                        preLiveMinutes: 15 // 15 minutes before practice
                    },
                    {
                        type: 'fp3',
                        name: 'Third Practice',
                        date: this.raceData.ThirdPractice?.date,
                        time: this.raceData.ThirdPractice?.time,
                        preLiveMinutes: 15 // 15 minutes before practice
                    },
                    {
                        type: 'qualifying',
                        name: 'Qualifying',
                        date: this.raceData.Qualifying?.date,
                        time: this.raceData.Qualifying?.time,
                        preLiveMinutes: 20 // 20 minutes before qualifying
                    },
                    {
                        type: 'race',
                        name: 'Race',
                        date: this.raceData.date,
                        time: this.raceData.time,
                        preLiveMinutes: 60 // 1 hour before race
                    }
                ].filter(session => session.date && session.time);

                // Convert to Date objects and add formatted time
                const processedSessions = sessions.map(session => {
                    const dateTime = new Date(`${session.date}T${session.time}`);
                    return {
                        ...session,
                        dateTime,
                        localDateTime: this.formatDateTime(session.date, session.time),
                        // Session duration (estimate): FP - 1h, Quali - 1h, Race - 2h
                        duration: session.type === 'race' ? 2 * 60 * 60 * 1000 : 60 * 60 * 1000
                    };
                });

                // Sort by date/time
                processedSessions.sort((a, b) => a.dateTime - b.dateTime);

                // Find next session
                const nextSession = processedSessions.find(session => session.dateTime > now);

                // Check for live and pre-live sessions and mark sessions
                processedSessions.forEach(session => {
                    // Calculate pre-live time (when "Watch Live" button should appear before the session)
                    const preLiveTime = new Date(session.dateTime.getTime() - (session.preLiveMinutes * 60 * 1000));

                    // A session is in pre-live state if current time is between pre-live time and start time
                    session.isPreLive = now >= preLiveTime && now < session.dateTime;

                    // A session is live if current time is between start time and end time
                    session.isLive = now >= session.dateTime && now <= new Date(session.dateTime.getTime() + session.duration);

                    // Only mark as next if it's not pre-live or live
                    session.isNext = session === nextSession && !session.isLive && !session.isPreLive;
                });

                return processedSessions;
            },

            nextSession() {
                if (!this.sortedSessions || this.sortedSessions.length === 0) return null;

                // Only return next session if there's no live session, or find the session after the live one
                if (this.currentLiveSession) {
                    const sessionsAfterCurrent = this.sortedSessions.filter(
                        session => session.dateTime > new Date(this.currentLiveSession.dateTime.getTime() + this.currentLiveSession.duration)
                    );
                    return sessionsAfterCurrent.length > 0 ? sessionsAfterCurrent[0] : null;
                }

                const now = this.currentDateTime;
                return this.sortedSessions.find(session => session.dateTime > now);
            },

            currentLiveSession() {
                if (!this.sortedSessions || this.sortedSessions.length === 0) return null;
                return this.sortedSessions.find(session => session.isLive);
            }
        },
        methods: {
            formatDateTime(dateStr, timeStr) {
                const utcDateTime = new Date(`${dateStr}T${timeStr}`);
                return new Intl.DateTimeFormat(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    timeZoneName: 'short'
                }).format(utcDateTime);
            },

            formatDateOnly(dateStr) {
                const utcDate = new Date(dateStr);
                return new Intl.DateTimeFormat(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }).format(utcDate);
            },

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
            },

            updateTime() {
                this.currentDateTime = new Date();
            },

            sendSessionNotification(session) {
                if (window.electron && session) {
                    const title = 'F1 Session Reminder';
                    const body = `${session.name} starts in ${this.countdownDisplay.minutes} minutes!`;
                    window.electron.showNotification(title, body);
                }
            },

            updateCountdown() {
                // If there's a live session, don't update the countdown
                if (this.currentLiveSession) {
                    return;
                }

                if (!this.nextSession) {
                    this.countdownDisplay = {
                        days: '00',
                        hours: '00',
                        minutes: '00',
                        seconds: '00'
                    };
                    return;
                }

                const now = new Date();
                const sessionTime = this.nextSession.dateTime;
                const diff = sessionTime - now;

                if (diff <= 0) {
                    // Session has started, update the current time to refresh computed properties
                    this.updateTime();
                    return;
                }

                // Calculate time components
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                // Format with leading zeros
                this.countdownDisplay = {
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                };

                // Send notification when session is about to start
                // For races: 60, 30, 15, and 5 minutes before
                // For other sessions: 30, 15, and 5 minutes before
                const notifyTimes = this.nextSession.type === 'race'
                    ? [60, 30, 15, 5]
                    : [30, 15, 5];

                if (hours === 0 && notifyTimes.includes(minutes) && seconds === 0) {
                    this.sendSessionNotification(this.nextSession);
                }
            },

            startCountdownTimer() {
                // Clear any existing intervals first
                this.clearIntervals();

                // Set up timer that updates every second for countdown
                this.countdownInterval = setInterval(() => {
                    this.updateCountdown();
                }, 1000);

                // Set up timer that updates every 5 seconds to refresh session statuses
                this.refreshInterval = setInterval(() => {
                    this.updateTime();
                }, 5000);

                // Run immediately to avoid waiting for first interval
                this.updateCountdown();
            },

            clearIntervals() {
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }

                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                    this.refreshInterval = null;
                }
            },

            async loadSeasonCalendar() {
                this.loadingCalendar = true;
                this.calendarError = false;

                try {
                    // Fetch the real calendar data from the API
                    const races = await f1Service.getFullCalendar();
                    const now = new Date();

                    // Process the races to add status flags
                    this.seasonCalendar = races.map(race => {
                        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
                        const isPast = raceDate < now;
                        const isNext = race.round === this.raceData.round;
                        const isCurrent = !isPast && !isNext &&
                            this.raceData &&
                            this.sortedSessions &&
                            this.sortedSessions.length > 0 &&
                            this.sortedSessions.some(session => session.isLive);

                        return {
                            ...race,
                            isPast,
                            isNext,
                            isCurrent
                        };
                    });

                    this.loadingCalendar = false;
                } catch (error) {
                    console.error('Error loading season calendar:', error);
                    this.calendarError = true;
                    this.loadingCalendar = false;
                }
            },

            async showRaceResults(race) {
                this.selectedRace = race;
                this.resultsDialog = true;
                this.activeResultsTab = 'race';

                // Extract year from the season URL in MRData
                const year = new Date().getFullYear();
                const round = race.round;

                // Load race results
                this.loadingRaceResults = true;
                try {
                    const raceResults = await f1Service.getRaceResults(year, round);
                    this.raceResults = raceResults;
                } catch (error) {
                    console.error('Error loading race results:', error);
                    this.raceResults = null;
                } finally {
                    this.loadingRaceResults = false;
                }

                // Load qualifying results
                this.loadingQualifyingResults = true;
                try {
                    const qualifyingResults = await f1Service.getQualifyingResults(year, round);
                    this.qualifyingResults = qualifyingResults;
                } catch (error) {
                    console.error('Error loading qualifying results:', error);
                    this.qualifyingResults = null;
                } finally {
                    this.loadingQualifyingResults = false;
                }

                // Load sprint results (if available)
                this.loadingSprintResults = true;
                try {
                    const sprintResults = await f1Service.getSprintResults(year, round);
                    this.sprintResults = sprintResults;
                    this.hasSprintResults = !!sprintResults;
                } catch (error) {
                    console.error('Error loading sprint results:', error);
                    this.sprintResults = null;
                    this.hasSprintResults = false;
                } finally {
                    this.loadingSprintResults = false;
                }
            },

            showCircuitMap(circuit) {
                this.selectedCircuit = circuit;
                this.mapDialog = true;
                this.initMap();
            },

            closeMapDialog() {
                this.mapDialog = false;
                this.selectedCircuit = null;

                // Clean up map resources if they exist
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }
            },

            initMap() {
                // Import leaflet dynamically to avoid SSR issues
                import('leaflet').then(L => {
                    // Make sure Leaflet CSS is loaded
                    if (!document.getElementById('leaflet-css')) {
                        const linkElem = document.createElement('link');
                        linkElem.id = 'leaflet-css';
                        linkElem.rel = 'stylesheet';
                        linkElem.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                        document.head.appendChild(linkElem);
                    }

                    // Fix Leaflet's icon path issues
                    delete L.Icon.Default.prototype._getIconUrl;
                    L.Icon.Default.mergeOptions({
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
                    });

                    // Clean up any existing map instance
                    if (this.map) {
                        this.map.remove();
                    }

                    // Initialize the map after the DOM is ready
                    this.$nextTick(() => {
                        const lat = parseFloat(this.selectedCircuit.Location.lat);
                        const lng = parseFloat(this.selectedCircuit.Location.long);

                        // Create the map
                        this.map = L.map('calendar-circuit-map').setView([lat, lng], 14);

                        // Add the base tile layer (OpenStreetMap)
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(this.map);

                        // Add a marker for the circuit
                        L.marker([lat, lng])
                            .addTo(this.map)
                            .bindPopup(this.selectedCircuit.circuitName)
                            .openPopup();
                    });
                });
            }
        },
        watch: {
            viewMode(newValue) {
                if (newValue === 'season' && this.seasonCalendar.length === 0) {
                    this.loadSeasonCalendar();
                }
                // Emit the view mode change to parent component
                this.$emit('view-mode-changed', newValue);
            }
        },
        mounted() {
            this.startCountdownTimer();
            // Only load the calendar if the view is set to 'season'
            if (this.viewMode === 'season') {
                this.loadSeasonCalendar();
            }
        },
        beforeUnmount() {
            this.clearIntervals();
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

    .countdown-container {
        background-color: #f0f0f0;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
    }

    .countdown-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 1rem;
    }

    .countdown-timer {
        display: flex;
        justify-content: center;
        gap: 16px;
    }

    .countdown-item {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .countdown-value {
        font-weight: bold;
        font-size: 1.5rem;
        min-width: 40px;
    }

    .countdown-label {
        font-size: 0.8rem;
        color: #666;
    }

    .live-now {
        background-color: rgba(255, 0, 0, 0.2);
        animation: pulse 2s infinite;
    }

    .session-status {
        margin-top: 10px;
        font-size: 0.9rem;
        color: #333;
    }

    @keyframes pulse {
        0% {
            background-color: rgba(255, 0, 0, 0.2);
        }

        50% {
            background-color: rgba(255, 0, 0, 0.3);
        }

        100% {
            background-color: rgba(255, 0, 0, 0.2);
        }
    }

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
</style>