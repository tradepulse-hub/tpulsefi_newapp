import { ethers } from "ethers"
import { config, TokenProvider, HoldSo, ZeroX, inmemoryTokenStorage, SwapHelper } from "@holdstation/worldchain-sdk"
import { Client, Multicall3 } from "@holdstation/worldchain-ethers-v6"

// Definindo TOKENS para corresponder ao serviço de swap e mini-carteira
export const TOKENS = [
  {
    address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
    symbol: "WLD",
    name: "Worldcoin",
    decimals: 18,
    logo: "/images/worldcoin.jpeg",
    color: "#000000",
  },
  {
    address: "0x834a73c0a83F3BCe349A116FFB2A4c2d1C651E45",
    symbol: "TPF",
    name: "TPulseFi",
    decimals: 18,
    logo: "/images/logo-tpf.png",
    color: "#00D4FF",
  },
  {
    address: "0xEdE54d9c024ee80C85ec0a75eD2d8774c7Fbac9B", // Updated WDD address
    symbol: "WDD",
    name: "Drachma", // Updated name
    decimals: 18,
    logo: "/images/drachma-token.png", // Updated logo path
    color: "#FFD700",
  },
  {
    address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1", // USDC address on Worldchain
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6, // USDC typically has 6 decimals
    logo: "/images/usdc.png", // New USDC logo
    color: "#2775CA", // USDC blue
  },
]

// Configuração do SDK Holdstation (Centralizada aqui para uso consistente)
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public"
const provider = new ethers.JsonRpcProvider(RPC_URL, { chainId: 480, name: "worldchain" }, { staticNetwork: true })
const client = new Client(provider)
config.client = client
config.multicall3 = new Multicall3(provider)
const tokenProvider = new TokenProvider({ client, multicall3: config.multicall3 })
const zeroX = new ZeroX(tokenProvider, inmemoryTokenStorage)
const worldSwap = new HoldSo(tokenProvider, inmemoryTokenStorage)
export const swapHelper = new SwapHelper(client, { tokenStorage: inmemoryTokenStorage }) // Export swapHelper
swapHelper.load(zeroX)
swapHelper.load(worldSwap)

// Todas as funções e tipos relacionados a preços e históricos foram removidos.
// Apenas o que é necessário para o swapHelper e TOKENS permanece.
