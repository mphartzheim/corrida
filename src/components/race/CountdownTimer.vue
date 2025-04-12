<template>
    <div class="countdown-container" :class="{ 'live-now': isLive }">
        <div v-if="isLive" class="countdown-title">{{ sessionName }} is LIVE NOW!</div>
        <div v-else-if="nextSession" class="countdown-title">{{ sessionName }} starts in:</div>
        <div v-else class="countdown-title">No upcoming sessions</div>

        <div v-if="isLive" class="session-status">
            Session in progress
            <v-progress-linear color="red" indeterminate class="mt-2"></v-progress-linear>
        </div>
        <div v-else-if="nextSession" class="countdown-timer">
            <div class="countdown-item">
                <span class="countdown-value">{{ countdown.days }}</span>
                <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">{{ countdown.hours }}</span>
                <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">{{ countdown.minutes }}</span>
                <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-item">
                <span class="countdown-value">{{ countdown.seconds }}</span>
                <span class="countdown-label">Seconds</span>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'CountdownTimer',
        props: {
            nextSession: {
                type: Object,
                default: null
            },
            isLive: {
                type: Boolean,
                default: false
            },
            sessionName: {
                type: String,
                default: 'Session'
            }
        },
        data() {
            return {
                countdownInterval: null,
                countdown: {
                    days: '00',
                    hours: '00',
                    minutes: '00',
                    seconds: '00'
                }
            }
        },
        methods: {
            updateCountdown() {
                // If there's a live session, don't update the countdown
                if (this.isLive) {
                    return;
                }

                if (!this.nextSession) {
                    this.countdown = {
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
                    // Session has started, emit event to refresh parent component
                    this.$emit('session-started');
                    return;
                }

                // Calculate time components
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                // Format with leading zeros
                this.countdown = {
                    days: days.toString().padStart(2, '0'),
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0')
                };

                // Emit notification event when session is about to start
                const notifyTimes = this.nextSession.type === 'race'
                    ? [60, 30, 15, 5]
                    : [30, 15, 5];

                if (hours === 0 && notifyTimes.includes(minutes) && seconds === 0) {
                    this.$emit('notification', this.nextSession);
                }
            },
            startCountdown() {
                // Clear any existing interval first
                this.clearInterval();

                // Set up timer that updates every second
                this.countdownInterval = setInterval(() => {
                    this.updateCountdown();
                }, 1000);

                // Run immediately to avoid waiting for first interval
                this.updateCountdown();
            },
            clearInterval() {
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
            }
        },
        watch: {
            nextSession() {
                // Reset and restart countdown when nextSession changes
                this.updateCountdown();
            }
        },
        mounted() {
            this.startCountdown();
        },
        beforeUnmount() {
            this.clearInterval();
        }
    }
</script>

<style scoped>
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
</style>