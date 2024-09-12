export default interface SettingsState {
  maxSessionDuration: number;
  maxAutoPlayRounds: number;
  stakeList: number[];
  minBet: number;
  maxBet: number;
  defaultBet: number;
  gambleLimit: number;
  jackpotRtp: number;
  stakePerLine: number;
  selectedLines: number;
  total_stake: number;
}
