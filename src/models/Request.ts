interface Data {
  action?: string;
  stakePerLine?: number;
  selectedLines?: number;
  total_stake?: number;
  game_mode?: number; // 0-main, 1-boosted, 2-freespins
  game_id?: string;
  pickIndex?: number;
  fsb_id?: number;
}

export default interface Request {
  type: string;
  data: Data;
}
