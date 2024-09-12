import EventEmmiter from 'eventemitter3';

class EventManager {
  static instance: EventManager;
  emmiter: EventEmmiter;

  constructor() {
    this.emmiter = new EventEmmiter();
  }

  static getInstance = (): EventManager => {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }

    return EventManager.instance;
  };

  on = (event: string, callback: (...args: any[]) => void): void => {
    this.emmiter.on(event, callback);
  };

  once = (event: string, callback: (...args: any[]) => void): void => {
    this.emmiter.once(event, callback);
  };

  emit = (event: string, ...args: any[]): void => {
    this.emmiter.emit(event, ...args);
  };
}

export default EventManager;
