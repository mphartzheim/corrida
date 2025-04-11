<template>
  <v-app>
    <v-img :src="f1Logo" height="120" contain class="bg-black pa-4 mt-0">
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-row>
      </template>
    </v-img>

    <v-main class="pt-0"> <!-- Removed top padding -->
      <v-container class="pa-0"> <!-- Removed container padding -->
        <v-card v-if="raceData" class="mx-auto mt-0" max-width="800" elevation="0">
          <!-- Added mt-0 and removed elevation -->
          <RaceInfo :raceData="raceData" />

          <v-card-text>
            <v-row>
              <v-col cols="12" class="py-2"> <!-- Reduced padding -->
                <SessionSchedule :raceData="raceData" @view-mode-changed="handleViewModeChange" />
              </v-col>
            </v-row>

            <v-row v-if="currentViewMode === 'next'">
              <v-col cols="12" class="py-2"> <!-- Reduced padding -->
                <CircuitInfo :raceData="raceData" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
  import corridaBanner from './assets/corrida-banner.png';
  import f1Service from './services/f1Service';
  import RaceInfo from './components/race/RaceInfo.vue';
  import SessionSchedule from './components/race/SessionSchedule.vue';
  import CircuitInfo from './components/race/CircuitInfo.vue';

  export default {
    name: 'App',
    components: {
      RaceInfo,
      SessionSchedule,
      CircuitInfo
    },
    data() {
      return {
        raceData: null,
        f1Logo: corridaBanner,
        currentViewMode: 'next',
        isElectron: !!window.electron // Check if running in Electron
      }
    },
    methods: {
      async fetchRaceData() {
        try {
          this.raceData = await f1Service.getNextRace();
        } catch (error) {
          console.error('Error fetching race data:', error);
        }
      },
      handleViewModeChange(viewMode) {
        this.currentViewMode = viewMode;
      },
      minimizeToTray() {
        if (window.electron) {
          window.electron.minimizeToTray();
        }
      }
    },
    mounted() {
      this.fetchRaceData();
    }
  }
</script>

<style>
  .v-application {
    background: #f5f5f5;
  }

  /* Fix spacing issues */
  .v-main {
    min-height: calc(100vh - 120px);
    /* Account for header height */
  }

  .v-card-text {
    padding-top: 0;
  }
</style>
