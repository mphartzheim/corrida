<template>
    <div>
        <h3 class="text-h6">Circuit Information</h3>
        <div class="mt-2">
            <div>Location: {{ raceData.Circuit.Location.locality }}, {{ raceData.Circuit.Location.country }}</div>
            <div>
                Circuit:
                <a href="#" @click.prevent="showCircuitMap">
                    {{ raceData.Circuit.circuitName }}
                    <v-icon size="small" color="primary">mdi-map-marker</v-icon>
                </a>
            </div>
        </div>

        <!-- Circuit Map Modal -->
        <v-dialog v-model="mapDialog" max-width="800">
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <div>{{ raceData.Circuit.circuitName }}</div>
                    <v-btn icon="$close" variant="text" @click="closeMapDialog"></v-btn>
                </v-card-title>

                <v-card-subtitle>
                    {{ raceData.Circuit.Location.locality }}, {{ raceData.Circuit.Location.country }}
                </v-card-subtitle>

                <v-card-text>
                    <div id="circuit-map" style="height: 400px;"></div>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        name: 'CircuitInfo',
        props: {
            raceData: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                mapDialog: false,
                map: null
            }
        },
        methods: {
            showCircuitMap() {
                this.mapDialog = true;
                // Map will be initialized after the dialog is shown
                this.$nextTick(() => {
                    this.initMap();
                });
            },
            closeMapDialog() {
                this.mapDialog = false;
                // Clean up map resources
                if (this.map) {
                    this.map.remove();
                    this.map = null;
                }
            },
            initMap() {
                // Import leaflet dynamically to avoid SSR issues
                import('leaflet').then(L => {
                    // Make sure Leaflet CSS is loaded
                    const linkElem = document.createElement('link');
                    linkElem.rel = 'stylesheet';
                    linkElem.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                    document.head.appendChild(linkElem);

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
                        const lat = parseFloat(this.raceData.Circuit.Location.lat);
                        const lng = parseFloat(this.raceData.Circuit.Location.long);

                        // Create the map
                        this.map = L.map('circuit-map').setView([lat, lng], 14);

                        // Add the base tile layer (OpenStreetMap)
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(this.map);

                        // Add a marker for the circuit
                        L.marker([lat, lng])
                            .addTo(this.map)
                            .bindPopup(this.raceData.Circuit.circuitName)
                            .openPopup();
                    });
                });
            }
        }
    }
</script>

<style scoped>
    a {
        text-decoration: none;
        color: inherit;
        border-bottom: 1px dotted;
        cursor: pointer;
    }
</style>