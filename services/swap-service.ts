import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6";
import {
  config,
  HoldSo,
  inmemoryTokenStorage,
  SwapHelper,
  SwapParams,
  TokenProvider,
  ZeroX,
} from "@holdstation/worldchain-sdk";
import { ethers } from "ethers";

// Setup
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";
const provider = new ethers.JsonRpcProvider(
  RPC_URL,
  {
    chainId: 480,
    name: "worldchain",
  },
  {
    staticNetwork: true,
  },
);

const client = new Client(provider);
config.client = client;
config.multicall3 = new Multicall3(provider);

const swapHelper = new SwapHelper(client, {
  tokenStorage: inmemoryTokenStorage,
});

const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 });

const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage);
const worldswap = new HoldSo(tokenProvider, inmemoryTokenStorage);

swapHelper.load(zeroX);
swapHelper.load(worldswap);

// Token functions
export async function getTokenDetail() {
  console.log("Fetching multiple token details...");
  const tokens = await tokenProvider.details(
    "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
  );

  console.log("Token Details:", tokens);
  return tokens;
}

export async function getTokenInfo() {
  console.log("Fetching single token info...");
  const tokenInfo = await tokenProvider.details("0x79A02482A880bCE3F13e09Da970dC34db4CD24d1");

  console.log("Token Info:", tokenInfo);
  return tokenInfo;
}

// Quote functions

// Swap functions
export async function estimateSwap() {
  console.log("Estimating swap...");
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    amountIn: "2",
    slippage: "0.3",
    fee: "0.2",
  };

  const result = await swapHelper.estimate.quote(params);
  console.log("Swap estimate result:", result);
  return result;
}

export async function swap() {
  console.log("Executing swap...");
  const params: SwapParams["quoteInput"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    amountIn: "2",
    slippage: "0.3",
    fee: "0.2",
  };

  const quoteResponse = await swapHelper.estimate.quote(params);
  const swapParams: SwapParams["input"] = {
    tokenIn: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    tokenOut: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    amountIn: "2",
    tx: {
      data: quoteResponse.data,
      to: quoteResponse.to,
      value: quoteResponse.value,
    },
    partnerCode: "24568", // Replace with your partner code, contact to holdstation team to get one
    feeAmountOut: quoteResponse.addons?.feeAmountOut,
    fee: "0.2",
    feeReceiver: ethers.ZeroAddress, // ZERO_ADDRESS or your fee receiver address
  };
  const result = await swapHelper.swap(swapParams);
  console.log("Swap result:", result);
  return result;
}
