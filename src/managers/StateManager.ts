import isEqual from 'lodash/isEqual';
import { getProp } from '../utils/helpers';

export type StateListenerCallback = (value: any) => void;

interface StateListener {
  propertyMap: string;
  callback: StateListenerCallback;
}

class StateManager<T> {
  protected state!: T;
  private listeners: StateListener[];
  private listenersOnce: StateListener[];

  constructor() {
    this.listeners = [];
    this.listenersOnce = [];
  }

  updateState = (state: T): void => {
    const oldState = this.state ? { ...this.state } : null;
    const newState = { ...state };
    this.state = { ...this.state, ...state };

    [...this.listeners, ...this.listenersOnce].forEach((listener) => {
      const oldValue = getProp(oldState, listener.propertyMap);
      const value = getProp(newState, listener.propertyMap);

      if (!isEqual(oldValue, value)) {
        listener.callback(value);
      }
    });

    this.listenersOnce = [];
  };

  addListener = (propertyMap: string, callback: StateListenerCallback): void => {
    this.listeners = [
      ...this.listeners,
      {
        propertyMap,
        callback,
      },
    ];

    if (this.state) {
      const value = getProp(this.state, propertyMap);
      callback(value);
    }
  };
}

export default StateManager;
