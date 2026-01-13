import './style.css';
import { Player } from './components/player.js';
import { bootstrap } from './core/bootstrap.js';

// Initialize app ONCE
const {
  audioPlayer,
  djService,
  healthService,
  healthStore,
  appStore
} = bootstrap();

// Mount app
const app = new Player({
  audioPlayer,
  djService,
  healthService,
  healthStore,
  appStore
});

app.mount('#app');

// Dev helpers
if (import.meta.env.DEV) {
  window.app = app;
  window.appStore = appStore;
  window.audioPlayer = audioPlayer;
  console.log('🎵 Ravvitfy app initialized');
}
