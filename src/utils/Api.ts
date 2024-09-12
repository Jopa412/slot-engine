import EventManager from '../managers/EventManager';
import Request from '../models/Request';
import Response from '../models/Response';

class Api {
  isDevelopment: boolean = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  eventManager: EventManager;

  ws: WebSocket | null = null;
  resolver: ((value: Response) => void) | null = null;
  rejecter: ((value: Response) => void) | null = null;
  expectedResponses: number = 1;
  receivedResponses: number = 0;
  requestType: string = 'INIT';

  constructor() {
    this.eventManager = EventManager.getInstance();
  }

  handleError = (error: any) => {
    const errorbar = document.getElementById('errorbar')!;
    if (error && error.data && error.data.message) {
      errorbar.innerText = error.data.message;
    } else {
      errorbar.innerText = 'The error in communication with the server';
    }

    errorbar.className = 'show';
    setTimeout(() => {
      errorbar.className = errorbar.className.replace('show', '');
    }, 3000);
    console.error(error);
  };

  handleMessage = (event: MessageEvent) => {
    if (this.resolver && this.rejecter) {
      const message: Response = JSON.parse(event.data);

      if (message.status === 'ERROR') {
        this.handleError(message);
        this.rejecter(message);
        this.resetResponseState();
        return;
      }

      this.receivedResponses++;

      if (this.requestType === 'GAME_START' && this.receivedResponses === 1) {
        this.eventManager.emit('credit#change', message.data.player.balance);
      }

      if (this.receivedResponses === this.expectedResponses) {
        this.resolver(message);
        this.resetResponseState();
      }

      console.log(message);
    } else {
      console.error('No resolver/rejecter function set for incoming message:', event.data);
    }
  };

  resetResponseState() {
    this.resolver = null;
    this.rejecter = null;
    this.receivedResponses = 0;
  }

  setupWebSocket = (authToken: string, oid: string): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
      if (this.ws) {
        this.ws.close();
      }

      this.resolver = resolve;
      this.rejecter = reject;

      this.ws = new WebSocket(
        this.isDevelopment
          ? `${process.env.DEV_API_URL}?oid=${oid}&token=${authToken}&platform=desktop`
          : `${process.env.PROD_API_URL}?oid=${oid}&token=${authToken}&platform=desktop`,
      );

      this.ws.onopen = () => {
        console.log(`WebSocket connection opened.`);
      };

      this.ws.onmessage = this.handleMessage;

      this.ws.onclose = (event) => {
        console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
        reject();
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        reject();
      };
    }).catch((error) => {
      this.handleError(error);
      return Promise.reject(error);
    });
  };

  send = (data: Request): Promise<Response> => {
    return new Promise<Response>((resolve, reject) => {
      this.resolver = resolve;
      this.rejecter = reject;
      const message = JSON.stringify(data);
      this.ws?.send(message);
    }).catch((error) => {
      this.handleError(error);
      return Promise.reject(error);
    });
  };

  getConnectionData = async (authToken: string, oid: string) => {
    this.requestType === 'CONNECTION';
    this.expectedResponses = 1;

    return await this.setupWebSocket(authToken, oid);
  };

  getInitGameData = async () => {
    this.requestType === 'INIT';
    this.expectedResponses = 1;

    return await this.send({ type: 'INIT', data: { action: 'init' } });
  };

  gameStart = async (stakePerLine: number, selectedLines: number, total_stake: number, game_mode: number) => {
    this.requestType === 'GAME_START';
    this.expectedResponses = 2;

    return await this.send({
      type: 'GAME_START',
      data: {
        action: 'spin',
        stakePerLine: stakePerLine,
        selectedLines: selectedLines,
        total_stake: total_stake,
        game_mode: game_mode,
      },
    });
  };

  feature = async () => {
    this.requestType === 'FEATURE';
    this.expectedResponses = 1;

    return await this.send({ type: 'FEATURE', data: { action: 'freespin' } });
  };

  gamble = async (pickIndex: number) => {
    this.requestType === 'FEATURE';
    this.expectedResponses = 1;

    return await this.send({ type: 'FEATURE', data: { action: 'gamble', pickIndex: pickIndex } });
  };

  fsbStart = async (fsbId: number) => {
    this.requestType === 'FSB_INIT';
    this.expectedResponses = 1;

    return await this.send({ type: 'FSB_INIT', data: { action: 'ACCEPT', fsb_id: fsbId } });
  };

  fsbEnd = async () => {
    this.requestType === 'FSB_COMPLETE';
    this.expectedResponses = 1;

    return await this.send({ type: 'FSB_COMPLETE', data: { action: 'COMPLETE' } });
  };

  gameEnd = async (game_id: string) => {
    this.requestType === 'GAME_END';
    this.expectedResponses = 1;

    return await this.send({
      type: 'GAME_END',
      data: {
        game_id: game_id,
      },
    });
  };

  balance = () => {
    const error = { data: { message: global.language.noMoney } };
    this.handleError(error);
  };
}

export default new Api();
