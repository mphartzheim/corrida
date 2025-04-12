<template>
    <v-dialog v-model="dialog" max-width="800">
        <v-card v-if="circuit">
            <v-card-title class="d-flex justify-space-between align-center">
                <div>{{ circuit.circuitName }}</div>
                <v-btn icon="$close" variant="text" @click="closeDialog"></v-btn>
            </v-card-title>

            <v-card-subtitle>
                {{ circuit.Location.locality }}, {{ circuit.Location.country }}
            </v-card-subtitle>

            <v-card-text>
                <div id="circuit-map-dialog" style="height: 400px;"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        name: 'CircuitMapDialog',
        props: {
            show: {
                type: Boolean,
                default: false
            },
            circuitInfo: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                dialog: false,
                circuit: null,
                map: null
            }
        },
        watch: {
            show(val) {
                this.dialog = val;
                if (val && this.circuitInfo) {
                    this.circuit = this.circuitInfo;
                    this.$nextTick(() => {
                        this.initMap();
                    });
                }
            },
            dialog(val) {
                if (!val) {
                    this.$emit('update:show', false);
                    this.cleanupMap();
                }
            }
        },
        methods: {
            closeDialog() {
                this.dialog = false;
            },

            cleanupMap() {
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
                    this.cleanupMap();

                    // Initialize the map after the DOM is ready
                    this.$nextTick(() => {
                        const lat = parseFloat(this.circuit.Location.lat);
                        const lng = parseFloat(this.circuit.Location.long);

                        // Create the map
                        this.map = L.map('circuit-map-dialog').setView([lat, lng], 14);

                        // Add the base tile layer (OpenStreetMap)
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(this.map);

                        // Add a marker for the circuit
                        L.marker([lat, lng])
                            .addTo(this.map)
                            .bindPopup(this.circuit.circuitName)
                            .openPopup();
                    });
                });
            }
        },
        beforeUnmount() {
            this.cleanupMap();
        }
    }
</script>

<style scoped>
    /* No specific styling needed */
</style>