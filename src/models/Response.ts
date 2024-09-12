interface Player {
  balance: number;
  currency: string;
}

interface GameSettings {
  maxSessionDuration: number;
  maxAutoPlayRounds: number;
  stakeList: number[];
  minBet: number;
  maxBet: number;
  defaultBet: number;
  gambleLimit: number;
  jackpotRtp: number;
}

interface Game {
  state: string;
  name: string;
  version: string;
  nextAction: string;
  recover: boolean;
  game_id: string;
  total_win: number;
}

interface Bet {
  stakePerLine: number;
  selectedLines: number;
  total_stake: number;
}

interface Win {
  symbolID: string;
  winnings: number;
  count: number;
  offsets: string;
  offsetsList: number[][];
  winLine: number;
}

interface SlotGameData {
  gameMode: number;
  reelSetIndex: number;
  stopList: number[];
  view: string[][];
  wins: Win[];
  currentWinnings: number;
  wildMultiplierArr: number[];
}

interface FeatureTriggerData {
  reelSetIndex: number;
  stopList: number[];
  view: string[][];
  wins: Win[];
  currentWinnings: number;
  wildMultiplierArr: number[];
}

interface GambleData {
  pickedList: any[];
  currentAmount: number;
  potentialWinAmount: number;
  status: string;
  cardValues: any[];
  finished: boolean;
  maxCap: boolean;
}

interface FreeSpinData {
  spinsAwarded: number;
  spinsRemaining: number;
  spinsRetriggered: number;
  totalFreeSpinWin: number;
}

interface Slot {
  bet?: Bet;
  slotGameData: SlotGameData;
  featureTriggerData: FeatureTriggerData;
  gambleData?: GambleData;
  freeSpinData?: FreeSpinData;
}

interface Engine {
  request_id: string;
  player_id: string;
  session_id: string;
  playerInputs: { action: string };
  game: Game;
  slot: Slot;
}

interface FreeSpinBonus {
  bonus_id?: number;
  bonus_type?: string;
  assignment_time?: string;
  expiry_time?: string;
  player_state?: string;
  state?: string;
  result?: string;
  spin_number?: number;
  spin_win_limit?: number;
  spin_value?: number;
  remaining_spins?: number;
  balance?: number;
  has_wagering_requirement?: boolean;
  wagering_requirement?: number;
  wagering_requirement_completed_percent?: number;
  cancel_balance?: number;
  has_max_win_limit?: boolean;
  max_win_limit?: number;
  credited_amount?: number;
  should_be_completed?: boolean;
  offer?: {
    bonus_id: number;
    bonus_type: string;
    assignment_time: string;
    expiry_time: string;
    player_state: string;
    state: string;
    result: string;
    spin_number: number;
    spin_win_limit: number;
    spin_value: number;
    remaining_spins: number;
    balance: number;
    has_wagering_requirement: boolean;
    wagering_requirement: number;
    wagering_requirement_completed_percent: number;
    cancel_balance: number;
    has_max_win_limit: boolean;
    max_win_limit: number;
    credited_amount: number;
    should_be_completed: boolean;
  }[];
  active?: {
    bonus_id: number;
    bonus_type: string;
    assignment_time: string;
    expiry_time: string;
    player_state: string;
    state: string;
    result: string;
    spin_number: number;
    spin_win_limit: number;
    spin_value: number;
    remaining_spins: number;
    balance: number;
    has_wagering_requirement: boolean;
    wagering_requirement: number;
    wagering_requirement_completed_percent: number;
    cancel_balance: number;
    has_max_win_limit: boolean;
    max_win_limit: number;
    credited_amount: number;
    should_be_completed: boolean;
  };
}

interface Jackpot {
  available: number[];
  data: any[]; // Depending on your actual data structure, you might want to define a proper interface for this.
}

interface Data {
  player: Player;
  game_settings: GameSettings;
  engine: Engine;
  fsb: FreeSpinBonus;
  jackpot: Jackpot;
}

export default interface Response {
  type: string;
  status: string;
  data: Data;
}
