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
            <countdown-timer class="mb-3" :next-session="nextSession" :is-live="!!currentLiveSession"
                :session-name="currentLiveSession ? currentLiveSession.name : nextSession ? nextSession.name : ''"
                @session-started="updateTime" @notification="sendSessionNotification" />

            <session-list :sessions="sortedSessions" :has-live-session="!!currentLiveSession" />
        </div>

        <!-- Full Season Calendar View -->
        <div v-else>
            <season-calendar :current-race="raceData" :sessions="sortedSessions" @show-results="handleShowResults"
                @show-circuit="handleShowCircuit" />
        </div>

        <!-- Race Results Dialog -->
        <results-dialog :show="resultsDialog" :race-info="selectedRace" :year="selectedYear"
            @update:show="resultsDialog = $event" />

        <!-- Circuit Map Modal -->
        <circuit-map-dialog :show="mapDialog" :circuit-info="selectedCircuit" @update:show="mapDialog = $event" />
    </div>
</template>

<script>
    import CountdownTimer from './CountdownTimer.vue';
    import SessionList from './SessionList.vue';
    import SeasonCalendar from './SeasonCalendar.vue';
    import ResultsDialog from './ResultsDialog.vue';
    import CircuitMapDialog from './CircuitMapDialog.vue';

    export default {
        name: 'SessionSchedule',
        props: {
            raceData: {
                type: Object,
                required: true
            }
        },
        components: {
            CountdownTimer,
            SessionList,
            SeasonCalendar,
            ResultsDialog,
            CircuitMapDialog
        },
        data() {
            return {
                refreshInterval: null,
                currentDateTime: new Date(),
                viewMode: 'next',
                resultsDialog: false,
                selectedRace: null,
                mapDialog: false,
                selectedCircuit: null,
                selectedYear: new Date().getFullYear()
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

            updateTime() {
                this.currentDateTime = new Date();
            },

            sendSessionNotification(session) {
                if (window.electron && session) {
                    const title = 'F1 Session Reminder';
                    const body = `${session.name} starts soon!`;
                    window.electron.showNotification(title, body);
                }
            },

            startRefreshTimer() {
                // Clear any existing interval first
                this.clearIntervals();

                // Set up timer that updates every 5 seconds to refresh session statuses
                this.refreshInterval = setInterval(() => {
                    this.updateTime();
                }, 5000);
            },

            clearIntervals() {
                if (this.refreshInterval) {
                    clearInterval(this.refreshInterval);
                    this.refreshInterval = null;
                }
            },

            handleShowResults(data) {
                this.selectedRace = data.race;
                this.selectedYear = data.year;
                this.resultsDialog = true;
            },

            handleShowCircuit(circuit) {
                this.selectedCircuit = circuit;
                this.mapDialog = true;
            }
        },
        watch: {
            viewMode(newValue) {
                // Emit the view mode change to parent component
                this.$emit('view-mode-changed', newValue);
            }
        },
        mounted() {
            this.startRefreshTimer();
            // Run immediately to avoid waiting for first interval
            this.updateTime();
        },
        beforeUnmount() {
            this.clearIntervals();
        }
    }
</script>