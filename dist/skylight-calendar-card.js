/**
 * Skylight Calendar Card
 * A Home Assistant Lovelace card that provides a Skylight-inspired family calendar.
 *
 * Dependency: week-planner-card (HACS)
 *
 * Replaces: config-template-card, bubble-card, card-mod, better-moment-card, weather-card
 * Also eliminates the need for HA input_text helpers, input_select, and scripts.
 */

const WEATHER_ICONS = {
  'clear-night': 'mdi:weather-night',
  'cloudy': 'mdi:weather-cloudy',
  'fog': 'mdi:weather-fog',
  'hail': 'mdi:weather-hail',
  'lightning': 'mdi:weather-lightning',
  'lightning-rainy': 'mdi:weather-lightning-rainy',
  'partlycloudy': 'mdi:weather-partly-cloudy',
  'pouring': 'mdi:weather-pouring',
  'rainy': 'mdi:weather-rainy',
  'snowy': 'mdi:weather-snowy',
  'snowy-rainy': 'mdi:weather-snowy-rainy',
  'sunny': 'mdi:weather-sunny',
  'windy': 'mdi:weather-windy',
  'windy-variant': 'mdi:weather-windy-variant',
  'exceptional': 'mdi:alert-circle-outline',
};

// Default CSS injected into the inner week-planner-card shadow DOM
const INNER_CARD_STYLES = `
  /* === Skylight default inner styles === */
  :host {
    overflow: hidden;
  }
  ha-card {
    background: transparent !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    border: none !important;
  }
  .container {
    display: grid !important;
    grid-template-columns: repeat(7, minmax(0, 1fr)) !important;
    grid-auto-flow: row dense !important;
    gap: 0 !important;
  }
  .container .navigation,
  .container .header {
    grid-column: 1 / -1 !important;
  }
  .day.header {
    display: block !important;
    grid-column: auto !important;
    margin: 0 !important;
    padding: 0.2em !important;
    text-align: center !important;
    box-sizing: border-box !important;
  }
  .day.header .date .text {
    font-weight: 600 !important;
  }
  .day {
    border: solid 1px whitesmoke !important;
    padding: 0.2% !important;
    width: auto !important;
    min-width: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    align-self: stretch !important;
    justify-self: stretch !important;
  }
  .event.past {
    opacity: .2 !important;
    background-color: gray !important;
  }
  .time {
    color: #333333 !important;
    font-size: 0.8em !important;
  }
  .event {
    color: #333333 !important;
    line-height: 16px !important;
    background-color: var(--border-color) !important;
    border-radius: 10px !important;
    max-height: 80px !important;
    overflow: hidden !important;
    font-size: 1.1em !important;
  }
  .none {
    background-color: transparent !important;
  }
  .today .number {
    border-radius: 5px !important;
    background-color: orange !important;
    padding-left: 4px !important;
    padding-right: 4px !important;
  }
  .day .date .text {
    font-size: 1em !important;
    font-weight: bold !important;
  }
  .day .date .number {
    font-weight: bold !important;
    font-size: 3em !important;
  }
  /* Weekday colors */
  .day[data-weekday="1"] .date .text,
  .day[data-weekday="2"] .date .text,
  .day[data-weekday="3"] .date .text,
  .day[data-weekday="4"] .date .text,
  .day[data-weekday="5"] .date .text {
    color: #2e7d32 !important;
  }
  .day[data-weekday="6"] .date .text,
  .day[data-weekday="7"] .date .text {
    color: #d32f2f !important;
  }
  .container > .day.header .text {
    color: #2e7d32 !important;
  }
  .container > .day.header:nth-of-type(7) .text {
    color: #d32f2f !important;
  }
  .container > .day.header:nth-of-type(8) .text {
    color: #d32f2f !important;
  }
  /* Responsive */
  @media (max-width: 1024px) {
    .day .date .number { font-size: 2em !important; }
    .day .date .text   { font-size: 0.95em !important; }
  }
  @media (max-width: 768px) {
    .day .date .number { font-size: 1.6em !important; }
    .day .date .text   { font-size: 0.85em !important; }
    .event { font-size: 0.85em !important; line-height: 1.1em !important; }
    .time  { font-size: 0.75em !important; }
  }
  @media (max-width: 480px) {
    :host { font-size: clamp(10px, 2.6vw, 13px) !important; }
    .container .header, .container .navigation { padding: 0.25em 0.4em !important; }
    .day { padding: 0.15em !important; min-width: 0 !important; }
    .day .date .number { font-size: clamp(1.1em, 4.5vw, 1.4em) !important; line-height: 1.1 !important; }
    .day .date .text { font-size: clamp(0.72em, 3.2vw, 0.85em) !important; line-height: 1.1 !important; }
    .event { font-size: clamp(0.72em, 2.9vw, 0.85em) !important; line-height: 1.05em !important; padding: 0.25em 0.35em !important; max-height: 62px !important; }
    .time { font-size: clamp(0.65em, 2.5vw, 0.78em) !important; }
    .event .title, .event .name, .event .summary, .event .location, .event .desc, .event .description {
      display: -webkit-box !important; -webkit-box-orient: vertical !important; -webkit-line-clamp: 2 !important;
      overflow: hidden !important; text-overflow: ellipsis !important; white-space: normal !important;
      line-height: 1.1em !important; max-height: calc(1.1em * 2) !important;
    }
  }
  @media (min-width: 481px) and (max-width: 768px) {
    :host { font-size: clamp(11px, 2.2vw, 14px) !important; }
    .event { max-height: 72px !important; }
    .event .title, .event .name, .event .summary { display: -webkit-box !important; -webkit-line-clamp: 2 !important; overflow: hidden !important; }
  }
`;

class SkylightCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = null;
    this._hass = null;
    this._calendarVisibility = {};
    this._currentView = 'Week';
    this._innerCard = null;
    this._innerCardReady = false;
    this._clockInterval = null;
    this._innerStylesInjected = false;
  }

  static getStubConfig() {
    return {
      calendars: [],
      defaultView: 'Week',
      locale: 'en',
    };
  }

  setConfig(config) {
    if (!config.calendars || !config.calendars.length) {
      throw new Error('Please define at least one calendar');
    }

    this._config = {
      locale: 'en',
      defaultView: 'Week',
      startingDay: 'monday',
      views: ['Today', 'Tomorrow', 'Week', 'Biweek', 'Month'],
      title: 'Family Calendar',
      ...config,
    };

    this._currentView = this._config.defaultView;

    // Initialize visibility (preserve existing state on reconfig)
    const newVisibility = {};
    this._config.calendars.forEach(cal => {
      newVisibility[cal.entity] =
        this._calendarVisibility.hasOwnProperty(cal.entity)
          ? this._calendarVisibility[cal.entity]
          : true;
    });
    this._calendarVisibility = newVisibility;

    this._buildCard();
  }

  set hass(hass) {
    this._hass = hass;
    this._updateWeather();
    if (this._innerCard) {
      this._innerCard.hass = hass;
    }
  }

  getCardSize() {
    return 12;
  }

  connectedCallback() {
    this._startClock();
  }

  disconnectedCallback() {
    this._stopClock();
  }

  // ═══════════════════════════════════════════════════════════════
  // BUILD
  // ═══════════════════════════════════════════════════════════════

  _buildCard() {
    const root = this.shadowRoot;
    root.innerHTML = '';

    // Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Ovo&display=swap';
    root.appendChild(fontLink);

    // Styles
    const style = document.createElement('style');
    style.textContent = this._getStyles();
    root.appendChild(style);

    // Card
    const card = document.createElement('ha-card');
    card.innerHTML = `
      <div class="skylight">
        <div class="header">
          <div class="date-section">
            <div class="day-name"></div>
            <div class="full-date"></div>
            <div class="clock"></div>
          </div>
          <div class="weather-section"></div>
        </div>
        <div class="controls">
          <div class="title-row">
            <span class="calendar-title">${this._escapeHtml(this._config.title)}</span>
          </div>
          <div class="buttons-row">
            <div class="calendar-filters"></div>
            <div class="view-selector"></div>
          </div>
        </div>
        <div class="calendar-container"></div>
      </div>
    `;
    root.appendChild(card);

    this._renderFilters();
    this._renderViewSelector();
    this._createInnerCard();
    this._updateDate();
    this._startClock();
  }

  _renderFilters() {
    const container = this.shadowRoot.querySelector('.calendar-filters');
    if (!container) return;
    container.innerHTML = '';

    this._config.calendars.forEach(cal => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.entity = cal.entity;

      const isVisible = this._calendarVisibility[cal.entity];
      btn.classList.toggle('active', isVisible);

      if (cal.icon) {
        const icon = document.createElement('ha-icon');
        icon.setAttribute('icon', cal.icon);
        btn.appendChild(icon);
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = cal.name || cal.entity.replace('calendar.', '');
      btn.appendChild(nameSpan);

      btn.style.setProperty('--cal-color', cal.color || '#888');

      btn.addEventListener('click', () => this._toggleCalendar(cal.entity));
      container.appendChild(btn);
    });
  }

  _renderViewSelector() {
    const container = this.shadowRoot.querySelector('.view-selector');
    if (!container) return;
    container.innerHTML = '';

    (this._config.views || []).forEach(view => {
      const btn = document.createElement('button');
      btn.className = 'view-btn';
      btn.textContent = view;
      btn.classList.toggle('active', view === this._currentView);
      btn.addEventListener('click', () => this._setView(view));
      container.appendChild(btn);
    });
  }

  async _createInnerCard() {
    const container = this.shadowRoot.querySelector('.calendar-container');
    if (!container) return;

    try {
      const config = this._getInnerCardConfig();

      // Use HA card helpers for robust card creation
      if (window.loadCardHelpers) {
        const helpers = await window.loadCardHelpers();
        this._innerCard = await helpers.createCardElement(config);
      } else {
        // Fallback: direct element creation
        this._innerCard = document.createElement('week-planner-card');
        this._innerCard.setConfig(config);
      }

      if (this._hass) {
        this._innerCard.hass = this._hass;
      }

      container.innerHTML = '';
      container.appendChild(this._innerCard);
      this._innerCardReady = true;
      this._innerStylesInjected = false;

      // Inject Skylight styles into inner card's shadow DOM
      this._waitAndInjectInnerStyles();
    } catch (e) {
      container.innerHTML = `<div class="error">Error loading week-planner-card: ${e.message}<br>Make sure week-planner-card is installed via HACS.</div>`;
    }
  }

  _waitAndInjectInnerStyles() {
    if (this._innerStylesInjected) return;

    const tryInject = () => {
      if (!this._innerCard) return;

      // The inner card might be wrapped in a hui-card or similar
      const target = this._innerCard.shadowRoot
        ? this._innerCard
        : this._innerCard.querySelector('week-planner-card');

      const sr = target?.shadowRoot;
      if (sr) {
        const customCSS = this._config.calendarStyle || '';
        const styleEl = document.createElement('style');
        styleEl.id = 'skylight-inner-styles';
        styleEl.textContent = INNER_CARD_STYLES + '\n' + customCSS;
        sr.appendChild(styleEl);
        this._innerStylesInjected = true;
        return true;
      }
      return false;
    };

    // Try immediately, then poll briefly for shadow root
    if (tryInject()) return;

    let attempts = 0;
    const interval = setInterval(() => {
      if (tryInject() || ++attempts > 50) {
        clearInterval(interval);
      }
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // UPDATES
  // ═══════════════════════════════════════════════════════════════

  _updateDate() {
    const locale = this._config.locale || 'en';
    const now = new Date();

    const dayName = this.shadowRoot.querySelector('.day-name');
    const fullDate = this.shadowRoot.querySelector('.full-date');
    const clock = this.shadowRoot.querySelector('.clock');

    if (dayName) {
      dayName.textContent = now.toLocaleDateString(locale, { weekday: 'long' });
    }
    if (fullDate) {
      fullDate.textContent = now.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    if (clock) {
      clock.textContent = now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  _updateWeather() {
    const section = this.shadowRoot?.querySelector('.weather-section');
    if (!section) return;

    if (!this._hass || !this._config.weather_entity) {
      section.style.display = 'none';
      return;
    }

    const entity = this._hass.states[this._config.weather_entity];
    if (!entity) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    const condition = entity.state;
    const temp = entity.attributes.temperature;
    const unit = entity.attributes.temperature_unit || '°C';
    const iconName = WEATHER_ICONS[condition] || 'mdi:weather-cloudy';

    section.innerHTML = `
      <ha-icon icon="${this._escapeHtml(iconName)}" class="weather-icon"></ha-icon>
      <div class="weather-temp">${Math.round(temp)}${this._escapeHtml(unit)}</div>
    `;
  }

  _updateInnerCardConfig() {
    if (!this._innerCard || !this._innerCardReady) return;

    try {
      const config = this._getInnerCardConfig();

      // Find the actual week-planner-card element
      const target = this._innerCard.updateComplete !== undefined
        ? this._innerCard
        : this._innerCard.querySelector?.('week-planner-card') || this._innerCard;

      target.setConfig(config);
      if (this._hass) {
        target.hass = this._hass;
      }
    } catch (e) {
      console.error('Skylight Calendar: Error updating inner card', e);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════

  _toggleCalendar(entity) {
    this._calendarVisibility[entity] = !this._calendarVisibility[entity];

    const btn = this.shadowRoot.querySelector(
      `.filter-btn[data-entity="${CSS.escape(entity)}"]`
    );
    if (btn) {
      btn.classList.toggle('active', this._calendarVisibility[entity]);
    }

    this._updateInnerCardConfig();
  }

  _setView(viewName) {
    this._currentView = viewName;

    this.shadowRoot.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === viewName);
    });

    this._updateInnerCardConfig();
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  _getInnerCardConfig() {
    const viewCfg = this._getViewConfig(this._currentView);
    const passthrough = this._config.weekPlannerConfig || {};

    // Build weather config if entity is set
    let weatherConfig = passthrough.weather || undefined;
    if (!weatherConfig && this._config.weather_entity) {
      weatherConfig = {
        entity: this._config.weather_entity,
        showCondition: true,
        showTemperature: true,
        showLowTemperature: true,
        useTwiceDaily: false,
      };
    }

    return {
      type: 'custom:week-planner-card',
      locale: this._config.locale || 'en',
      defaultCalendar: this._config.defaultCalendar,
      startingDay: viewCfg.startingDay,
      days: viewCfg.days,
      showNavigation: true,
      showWeekDayText: false,
      combineSimilarEvents: true,
      noCardBackground: true,
      hidePastEvents: false,
      showLocation: true,
      ...passthrough,
      weather: weatherConfig,
      calendars: this._config.calendars.map(cal => ({
        entity: cal.entity,
        name: cal.name || cal.entity.replace('calendar.', ''),
        color: cal.color,
        filter: this._calendarVisibility[cal.entity] ? '.*' : '^$',
      })),
    };
  }

  _getViewConfig(viewName) {
    const startingDay = this._config.startingDay || 'monday';
    switch (viewName) {
      case 'Today':
        return { startingDay: 'today', days: 1 };
      case 'Tomorrow':
        return { startingDay: 'tomorrow', days: 1 };
      case 'Week':
        return { startingDay, days: 7 };
      case 'Biweek':
        return { startingDay, days: 14 };
      case 'Month':
        return { startingDay, days: 'month' };
      default:
        return { startingDay, days: 7 };
    }
  }

  _startClock() {
    this._stopClock();
    this._clockInterval = setInterval(() => this._updateDate(), 30000);
  }

  _stopClock() {
    if (this._clockInterval) {
      clearInterval(this._clockInterval);
      this._clockInterval = null;
    }
  }

  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════════

  _getStyles() {
    return `
      :host {
        --skylight-font: 'Ovo', serif;
        --skylight-bg: rgba(255, 255, 255, 0.6);
        --skylight-radius: 24px;
        --skylight-btn-radius: 20px;
        --skylight-accent: #03a9f4;
      }

      ha-card {
        background: var(--skylight-bg) !important;
        border-radius: var(--skylight-radius) !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden;
        font-family: var(--skylight-font);
      }

      .skylight {
        display: flex;
        flex-direction: column;
      }

      /* ── Header ───────────────────────── */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px 8px;
      }

      .date-section {
        display: flex;
        flex-direction: column;
      }

      .day-name {
        font-size: 1.1em;
        text-transform: capitalize;
        color: var(--primary-text-color, #333);
      }

      .full-date {
        font-size: 1.4em;
        text-transform: capitalize;
        color: var(--primary-text-color, #333);
      }

      .clock {
        font-size: 3.5em;
        font-weight: 400;
        color: var(--primary-text-color, #333);
        line-height: 1.1;
        margin-top: 4px;
      }

      .weather-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .weather-icon {
        --mdc-icon-size: 48px;
        color: var(--primary-text-color, #333);
      }

      .weather-temp {
        font-size: 1.5em;
        color: var(--primary-text-color, #333);
      }

      /* ── Controls ─────────────────────── */
      .controls {
        padding: 8px 24px 12px;
      }

      .title-row {
        margin-bottom: 8px;
      }

      .calendar-title {
        font-size: 1.6em;
        color: var(--primary-text-color, #333);
      }

      .buttons-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .calendar-filters {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .view-selector {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }

      /* ── Filter Buttons ───────────────── */
      .filter-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        border: 2px solid var(--cal-color, #888);
        border-radius: var(--skylight-btn-radius);
        background: transparent;
        color: var(--primary-text-color, #333);
        cursor: pointer;
        font-family: var(--skylight-font);
        font-size: 0.9em;
        transition: background 0.2s, color 0.2s;
        white-space: nowrap;
      }

      .filter-btn:hover {
        background: color-mix(in srgb, var(--cal-color, #888) 20%, transparent);
      }

      .filter-btn.active {
        background: var(--cal-color, #888);
        color: white;
      }

      .filter-btn ha-icon {
        --mdc-icon-size: 18px;
      }

      /* ── View Buttons ─────────────────── */
      .view-btn {
        padding: 5px 12px;
        border: 1px solid rgba(0, 0, 0, 0.15);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.5);
        color: var(--primary-text-color, #333);
        cursor: pointer;
        font-family: var(--skylight-font);
        font-size: 0.85em;
        transition: background 0.2s, color 0.2s, border-color 0.2s;
        white-space: nowrap;
      }

      .view-btn:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      .view-btn.active {
        background: var(--skylight-accent);
        color: white;
        border-color: var(--skylight-accent);
      }

      /* ── Calendar Container ───────────── */
      .calendar-container {
        padding: 0 8px 8px;
        min-height: 300px;
      }

      .calendar-container > * {
        width: 100%;
      }

      .error {
        padding: 24px;
        color: var(--error-color, #b00020);
        text-align: center;
        font-size: 1.1em;
      }

      /* ── Responsive ───────────────────── */
      @media (max-width: 768px) {
        .header {
          padding: 12px 16px 4px;
        }
        .clock {
          font-size: 2.5em;
        }
        .full-date {
          font-size: 1.1em;
        }
        .controls {
          padding: 6px 16px 8px;
        }
        .calendar-title {
          font-size: 1.3em;
        }
        .filter-btn {
          padding: 4px 10px;
          font-size: 0.8em;
        }
        .view-btn {
          padding: 4px 8px;
          font-size: 0.75em;
        }
        .weather-icon {
          --mdc-icon-size: 36px;
        }
        .weather-temp {
          font-size: 1.2em;
        }
      }

      @media (max-width: 480px) {
        .header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        .weather-section {
          flex-direction: row;
          gap: 8px;
        }
        .buttons-row {
          flex-direction: column;
          align-items: flex-start;
        }
        .clock {
          font-size: 2em;
        }
      }
    `;
  }
}

customElements.define('skylight-calendar-card', SkylightCalendarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'skylight-calendar-card',
  name: 'Skylight Calendar Card',
  description: 'A Skylight-inspired family calendar wrapper for week-planner-card',
  preview: false,
});

console.info(
  '%c SKYLIGHT-CALENDAR-CARD %c v1.0.0 ',
  'color: white; background: #4A90E2; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #4A90E2; background: white; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0; border: 1px solid #4A90E2;'
);
