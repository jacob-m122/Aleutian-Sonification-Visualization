const MAPBOX_TOKEN = 'pk.eyJ1IjoiamFjb2ItbTA0MTIiLCJhIjoiY21wcTl1ZThxMGs1eTJxcHZ4OGxoMHFtciJ9.gOAzkTlYpUNAe__7BT0utQ'; 
const SAMPLES_PER_ROW = 1637;
const SAMPLE_RATE = 44100;
const SECONDS_PER_ROW = SAMPLES_PER_ROW / SAMPLE_RATE;

const deckgl = new deck.DeckGL({
    container: 'map',
    mapStyle: 'mapbox://styles/mapbox/dark-v11',
    mapboxApiAccessToken: MAPBOX_TOKEN,
    initialViewState: {
        longitude: -165.98,
        latitude: 54.14,
        zoom: 10,
        pitch: 45,
        bearing: 0
    },
    controller: true
});

let mapData = [];
const audio = document.getElementById('audio-player');

fetch('akutan_map_data.json')
    .then(response => response.json())
    .then(data => {
        mapData = data;
        console.log("Data loaded. Total events:", mapData.length);
    });

function getEventColor(d) {
    if (d.FI < 0.60) return [255, 30, 30, 255];      // Red: VT Fluid/Magma
    if (d.depth > 0.25) return [30, 150, 255, 255];  // Blue: Deep Rock Fracture
    return [255, 220, 0, 255];                       // Yellow: LP Fluid resonance
}

function renderLoop() {
    if (!audio.paused && mapData.length > 0) {
        const currentAudioTime = audio.currentTime;
        const activeRowIndex = Math.floor(currentAudioTime / SECONDS_PER_ROW);

        const windowSizeRows = Math.ceil(1.5 / SECONDS_PER_ROW);
        const startIndex = Math.max(0, activeRowIndex - windowSizeRows);
        const activeData = mapData.slice(startIndex, activeRowIndex + 1);

        const scatterLayer = new deck.ScatterplotLayer({
            id: 'volcano-activity-layer',
            data: activeData,
            getPosition: d => [d.real_lon, d.real_lat],
            getRadius: d => (d.mag * 800) + 50,
            getFillColor: d => getEventColor(d),
            radiusMinPixels: 1,
            radiusMaxPixels: 15,
            stroked: true,
            getLineColor: [255, 255, 255, 200],
            getLineWidth: 1,
            lineWidthMinPixels: 1,
            
            transitions: {
                getRadius: 100,
                getFillColor: 100
            }
        });
        
        deckgl.setProps({ layers: [scatterLayer] });
    }
    requestAnimationFrame(renderLoop);
}

audio.addEventListener('play', () => {
    requestAnimationFrame(renderLoop);
});
