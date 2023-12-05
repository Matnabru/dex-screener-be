export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AuthMutation = {
  __typename?: 'AuthMutation';
  test: Scalars['String']['output'];
};

export type AuthQuery = {
  __typename?: 'AuthQuery';
  test: Scalars['String']['output'];
};

export type Candle = {
  __typename?: 'Candle';
  close: Scalars['Float']['output'];
  high: Scalars['Float']['output'];
  low: Scalars['Float']['output'];
  open: Scalars['Float']['output'];
  openTime: Scalars['String']['output'];
  timeframe: Timeframe;
};

export type GetOhlcInput = {
  dateFrom: Scalars['String']['input'];
  dateTo: Scalars['String']['input'];
  pairAddress: Scalars['String']['input'];
  protocol: Protocol;
  timeframe: Timeframe;
};

export type GetPairInput = {
  pairAddress: Scalars['String']['input'];
  protocol: Protocol;
};

export type GetSwapsInput = {
  dateFrom: Scalars['String']['input'];
  dateTo: Scalars['String']['input'];
  pairAddress: Scalars['String']['input'];
  protocol: Protocol;
  timeframe: Timeframe;
};

export type Mutation = {
  __typename?: 'Mutation';
  authMutation: AuthMutation;
  publicMutation: AuthMutation;
};

export type Pair = {
  __typename?: 'Pair';
  liquidity?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  price?: Maybe<Scalars['String']['output']>;
  protocol: Protocol;
  volume?: Maybe<Scalars['Float']['output']>;
};

export enum Protocol {
  Uniswapv2 = 'UNISWAPV2',
  Uniswapv3 = 'UNISWAPV3'
}

export type PublicMutation = {
  __typename?: 'PublicMutation';
  test: Scalars['String']['output'];
};

export type PublicQuery = {
  __typename?: 'PublicQuery';
  getOhlc: Array<Candle>;
  getPair: Pair;
  getSwaps: Array<Transaction>;
  test: Scalars['String']['output'];
};


export type PublicQueryGetOhlcArgs = {
  payload: GetOhlcInput;
};


export type PublicQueryGetPairArgs = {
  payload: GetPairInput;
};


export type PublicQueryGetSwapsArgs = {
  payload: GetSwapsInput;
};

export type Query = {
  __typename?: 'Query';
  authQuery?: Maybe<AuthQuery>;
  publicQuery?: Maybe<PublicQuery>;
};

export enum Timeframe {
  D1 = 'D1',
  H1 = 'H1',
  H4 = 'H4',
  M1 = 'M1',
  M5 = 'M5',
  M15 = 'M15'
}

export type Transaction = {
  __typename?: 'Transaction';
  price: Scalars['String']['output'];
  timestamp: Scalars['String']['output'];
  type: TransactionType;
  unit: Scalars['String']['output'];
  weth: Scalars['String']['output'];
};

export enum TransactionType {
  Buy = 'BUY',
  Sell = 'SELL'
}
