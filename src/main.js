import './style.css';
import { Player } from './components/player.js';
import { bootstrap } from './core/bootstrap.js';

// Initialize app ONCE
const { appStore, healthStore, audioPlayer } = bootstrap();

// Mount app
const app = new Player({ appStore, healthStore, audioPlayer });

app.mount('#app');

// Dev helpers
if (import.meta.env.DEV) {
  window.app = app;
  console.log('🎵 Ravvitfy app initialized');
}
