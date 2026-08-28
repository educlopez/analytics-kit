/** One OHLC candle. `volume` is optional so existing price-only data remains valid. */
export interface CandleDatum {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  /** Traded volume for the period. Used by CandlestickChart's volume pane. */
  volume?: number;
}
