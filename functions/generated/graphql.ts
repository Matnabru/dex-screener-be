export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AddPairInput = {
  pairAddress: Scalars["String"]["input"];
  protocol: Protocol;
};

export type AuthMutation = {
  __typename?: "AuthMutation";
  test: Scalars["String"]["output"];
};

export type AuthQuery = {
  __typename?: "AuthQuery";
  test: Scalars["String"]["output"];
};

export type Candle = {
  __typename?: "Candle";
  close: Scalars["Float"]["output"];
  high: Scalars["Float"]["output"];
  low: Scalars["Float"]["output"];
  open: Scalars["Float"]["output"];
  time: Scalars["String"]["output"];
  timeFrame: Timeframe;
};

export type GetOhlcInput = {
  dateFrom: Scalars["String"]["input"];
  dateTo: Scalars["String"]["input"];
  pairAddress: Scalars["String"]["input"];
  protocol: Protocol;
  timeframe: Timeframe;
};

export type GetPairInput = {
  pairAddress: Scalars["String"]["input"];
  protocol: Protocol;
};

export type GetPairsInput = {
  name?: InputMaybe<Scalars["String"]["input"]>;
  protocol?: InputMaybe<Protocol>;
};

export type GetSwapsInput = {
  dateFrom: Scalars["String"]["input"];
  dateTo: Scalars["String"]["input"];
  number?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  pairAddress: Scalars["String"]["input"];
  protocol: Protocol;
};

export type Mutation = {
  __typename?: "Mutation";
  authMutation: AuthMutation;
  publicMutation: PublicMutation;
};

export type Pair = {
  __typename?: "Pair";
  longName?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  price: Scalars["String"]["output"];
  protocol: Protocol;
  reserve0: Scalars["String"]["output"];
  reserve1: Scalars["String"]["output"];
  symbol0: Scalars["String"]["output"];
  symbol1: Scalars["String"]["output"];
  token0Decimals: Scalars["String"]["output"];
  token1Decimals: Scalars["String"]["output"];
};

export enum Protocol {
  Uniswapv2 = "UNISWAPV2",
  Uniswapv3 = "UNISWAPV3",
}

export type PublicMutation = {
  __typename?: "PublicMutation";
  addPair?: Maybe<Scalars["Boolean"]["output"]>;
  test: Scalars["String"]["output"];
};

export type PublicMutationAddPairArgs = {
  payload: AddPairInput;
};

export type PublicQuery = {
  __typename?: "PublicQuery";
  getOhlc: Array<Candle>;
  getOhlcDirectly: Array<Candle>;
  getPair: Pair;
  getPairs: Array<Pair>;
  getSwaps: Array<Transaction>;
  loadOhlc: Array<Candle>;
  test: Scalars["String"]["output"];
};

export type PublicQueryGetOhlcArgs = {
  payload: GetOhlcInput;
};

export type PublicQueryGetOhlcDirectlyArgs = {
  payload: GetOhlcInput;
};

export type PublicQueryGetPairArgs = {
  payload: GetPairInput;
};

export type PublicQueryGetPairsArgs = {
  payload: GetPairsInput;
};

export type PublicQueryGetSwapsArgs = {
  payload: GetSwapsInput;
};

export type PublicQueryLoadOhlcArgs = {
  payload: GetOhlcInput;
};

export type Query = {
  __typename?: "Query";
  authQuery?: Maybe<AuthQuery>;
  publicQuery?: Maybe<PublicQuery>;
};

export enum Timeframe {
  D1 = "D1",
  H1 = "H1",
  H4 = "H4",
  M1 = "M1",
  M5 = "M5",
  M15 = "M15",
}

export type Transaction = {
  __typename?: "Transaction";
  price: Scalars["String"]["output"];
  sender: Scalars["String"]["output"];
  timestamp: Scalars["String"]["output"];
  to: Scalars["String"]["output"];
  type: TransactionType;
  unit: Scalars["String"]["output"];
  weth: Scalars["String"]["output"];
};

export enum TransactionType {
  Buy = "BUY",
  Sell = "SELL",
}

export type Token = {
  __typename?: "token";
  latestPrice?: Maybe<Scalars["Float"]["output"]>;
  numberOfDecimals: Scalars["Int"]["output"];
  pairAddress: Scalars["String"]["output"];
  price1d?: Maybe<Scalars["Float"]["output"]>;
  price15?: Maybe<Scalars["Float"]["output"]>;
  price60?: Maybe<Scalars["Float"]["output"]>;
  protocol: Protocol;
};
