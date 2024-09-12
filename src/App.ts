import Api from './utils/Api';
import Renderer from './utils/Renderer';
import AppStateManager from './managers/AppStateManager';
import SettingsStateManager from './managers/SettingsStateManager';
import SpinManager from './managers/SpinManager';
import Response from './models/Response';
import { getCurrency, getLanguage } from './utils/helpers';
import { SELECTED_LINES, STAKE_PER_LINE, TOTAL_STAKE } from './constants/constants';

class App {
  isDevelopment: boolean = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  appStateManager: AppStateManager;
  settingsStateManager: SettingsStateManager;
  spinManager: SpinManager;
  renderer: Renderer;

  constructor() {
    this.appStateManager = AppStateManager.getInstance();
    this.settingsStateManager = SettingsStateManager.getInstance();
    this.spinManager = SpinManager.getInstance();
    this.renderer = Renderer.getInstance();
  }

  init = (): void => {
    this.initializeGame();
  };

  initializeGame = async (): Promise<any> => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const authToken = urlParams.get('authToken') ?? this.isDevelopment ? 'some-dummy-token' : null;
    const player_id = urlParams.get('player_id');
    const account_id = urlParams.get('account_id');
    const currency = urlParams.get('currency') ?? this.isDevelopment ? 'USD' : null;
    const oid = urlParams.get('oid') ?? this.isDevelopment ? '1532' : null;
    const language = urlParams.get('language') ?? this.isDevelopment ? 'en' : null;
    const client = urlParams.get('client');

    await getLanguage(language as string).then((response) => {
      if (response[0].status == 404 || response[0].status == 500) {
        global.language = response[1];
      } else {
        global.language = response[0];
      }
    });

    await getCurrency().then((response) => {
      if (response) {
        global.currency = response[currency as string];
      } else {
        global.currency = { currencySymbol: currency, beforeAmount: true };
      }
    });

    document.getElementById('swipeup')!.innerText = global.language.fullscreenTextIOS;

    this.getInitGameData(authToken as string, oid as string);
  };

  getInitGameData = (authToken: string, oid: string): void => {
    Api.getConnectionData(authToken, oid).then((data: Response) => {
      Api.getInitGameData().then((data: Response) => {
        const initResponseData = data as Response;

        this.appStateManager.updateState(initResponseData);
        this.appStateManager.updateFreeSpinsState();

        this.settingsStateManager.updateState({
          ...initResponseData.data.game_settings,
          stakePerLine: initResponseData.data.engine.slot.bet?.stakePerLine ?? STAKE_PER_LINE,
          selectedLines: initResponseData.data.engine.slot.bet?.selectedLines ?? SELECTED_LINES,
          total_stake: initResponseData.data.engine.slot.bet?.total_stake ?? TOTAL_STAKE,
        });

        this.spinManager.updateState(initResponseData);

        this.renderer.init(initResponseData);
      });
    });
  };
}

export default App;
