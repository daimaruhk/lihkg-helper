import { html, isDarkMode } from '../utils';
import '../../styles/button.css';
import '../../styles/play-button.css';

class PlayButton {
  private targetQuery = '[data-tip="熱門回覆"]';
  private containerQuery = '#rightPanel';
  private componentRef: HTMLElement = null;
  private speedLabelRef: HTMLElement = null;
  private timer: number;
  private _isPlaying = false;
  private speedIndex = 2;
  private speeds = [0.25, 0.5, 1, 1.5, 2];

  public get isPlaying() {
    return this._isPlaying;
  };

  public create() {
    const target = document.querySelector(this.targetQuery);
    if (!target) return;

    this.speedLabelRef = html`<span class="speed-label"></span>`;
    this.speedLabelRef.addEventListener('click', (e) => {
      e.stopPropagation();
      this.incrementSpeed();
    });

    const playImagePath = `images/play-${isDarkMode() ? 'light' : 'dark'}.png`;
    const pauseImagePath = `images/pause-${isDarkMode() ? 'light' : 'dark'}.png`;
    this.componentRef = html`
      <span data-tip="開啟自動瀏覽" title="開啟自動瀏覽" class="btn-container play-btn-container">
        <span class="btn-wrapper">
          <image src=${chrome.runtime.getURL(playImagePath)} class="btn-icon play-icon"></image>
          <image src=${chrome.runtime.getURL(pauseImagePath)} class="btn-icon pause-icon hidden"></image>
        </span>
      </span>
    `;
    this.componentRef.addEventListener('click', () => this.isPlaying ? this.pause() : this.play());
    target.parentElement!.insertBefore(this.componentRef, target);
  };

  public play() {
    this._isPlaying = true;
    this.componentRef.dataset['tip'] = this.componentRef.title = '關閉自動瀏覽';
    this.componentRef.querySelector('.play-icon')?.classList.add('hidden');
    this.componentRef.querySelector('.pause-icon')?.classList.remove('hidden');
    this.componentRef.appendChild(this.speedLabelRef);
    this.speedLabelRef.textContent = `${this.getSpeed()}x`;
    this.startScroll();
  };

  public pause() {
    this._isPlaying = false;
    this.componentRef.dataset['tip'] = this.componentRef.title = '開啟自動瀏覽';
    this.componentRef.querySelector('.play-icon')?.classList.remove('hidden');
    this.componentRef.querySelector('.pause-icon')?.classList.add('hidden');
    this.speedLabelRef.remove();
    this.stopScroll();
  };

  private incrementSpeed() {
    if (!this.isPlaying) return;
    this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
    this.speedLabelRef.textContent = `${this.getSpeed()}x`;
    this.stopScroll();
    this.startScroll();
  };

  private getSpeed() {
    return this.speeds[this.speedIndex];
  };

  private startScroll() {
    const container = document.querySelector(this.containerQuery);
    if (!container) return;
    this.timer = window.setInterval(() => {
      container.scrollTo({ top: container.scrollTop + 500, behavior: 'smooth' });
    }, 3000 / this.getSpeed());
  };

  private stopScroll() {
    window.clearInterval(this.timer);
  };
}

export default new PlayButton();