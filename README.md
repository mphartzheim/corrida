# Corrida - Formula 1 Race Information App

![Corrida App Banner](src/assets/corrida-banner.png)

Corrida is a desktop application that provides Formula 1 fans with up-to-date information about races, schedules, results, and circuit details. Built with Electron, Vue.js, and Vuetify, it offers a clean and intuitive interface for tracking the F1 season.

## Features

- **Race Weekend Schedule**: View upcoming sessions with countdown timers
- **Full Season Calendar**: Browse the entire F1 season schedule
- **Interactive Circuit Maps**: Explore F1 tracks with detailed maps showing precise circuit locations
- **Race Results**: View complete race, qualifying, and sprint race results for past events
- **System Tray Integration**: Minimize to system tray for background updates
- **Session Notifications**: Get alerts when F1 sessions are about to begin

## Installation

### Windows

Download and run the latest `Corrida Setup x.x.x.exe` from the [Releases](https://github.com/joypunk/corrida/releases) page.

### Linux

Download the latest `Corrida-x.x.x.AppImage` from the [Releases](https://github.com/joypunk/corrida/releases) page.

Make it executable:
```bash
chmod +x Corrida-x.x.x.AppImage
```

Run the application:
```bash
./Corrida-x.x.x.AppImage
```

Alternatively, you can install the Debian package on Ubuntu/Debian systems:
```bash
sudo dpkg -i corrida_x.x.x_amd64.deb
```

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

Clone the repository:
```bash
git clone https://github.com/mphartzheim/corrida.git
cd corrida
```

Install dependencies:
```bash
npm install
```

### Run in Development Mode

```bash
npm start
```

This will start both the Vite dev server and Electron in development mode.

### Build from Source

Build for your current platform:
```bash
npm run electron:build
```

Build specifically for Windows:
```bash
npm run electron:build:win
```

Build specifically for Linux:
```bash
npm run electron:build:linux
```

Built packages will be available in the release directory.

## Data Sources

Corrida uses data from the [Ergast Developer API](https://ergast.com/mrd/) through a proxy API that enhances the original data with additional information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- F1 data provided by [Ergast API](https://ergast.com/mrd/)
- Maps powered by [Leaflet](https://leafletjs.com/)
- UI built with [Vue.js](https://vuejs.org/) and [Vuetify](https://vuetifyjs.com/)
- Desktop application framework by [Electron](https://www.electronjs.org/)

---

Created with ❤️ by [joypunk](https://github.com/mphartzheim)