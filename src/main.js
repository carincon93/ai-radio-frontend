import './style.css';
import { Player } from './components/player.js';

// Initialize app
const app = new Player();
app.mount('#app');

// Expose to window for debugging in development
if (import.meta.env.DEV) {
  window.app = app;
  console.log('🎵 Ravvitfy app initialized. Access via window.app');
}
