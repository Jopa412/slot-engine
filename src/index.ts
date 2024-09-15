import * as PIXI from 'pixi.js';
import App from './App';

declare global {
  var language: any;
  var currency: any;

  interface Window {
    MSStream: any;
  }
}

(() => {
  const app = new App();
  app.init();
})();
