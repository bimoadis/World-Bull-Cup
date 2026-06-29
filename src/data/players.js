import bullLionel from "@/assets/bull-lionel.jpg";
import bullKylian from "@/assets/bull-kylian.jpg";
import bullCristiano from "@/assets/bull-cristiano.jpg";

export const INITIAL_PLAYERS = [
  {
    id: "lionel",
    name: "Lionel Bull",
    nation: "Argentina",
    flag: "🇦🇷",
    ticker: "LIOBULL",
    accent: "#5BA3D0",
    contract: "Soon",
    pairAddress: "", // DexScreener Solana pair address
    img: bullLionel,
    // DUMMY values:
    marketCap: 4_120_000,
    price: 0.00412,
    volume24h: 980_000,
    change24h: 12.4,
  },
  {
    id: "kylian",
    name: "Kylian Bull",
    nation: "France",
    flag: "🇫🇷",
    ticker: "KYLBULL",
    accent: "#4F6BED",
    contract: "Soon",
    pairAddress: "",
    img: bullKylian,
    marketCap: 3_640_000,
    price: 0.00364,
    volume24h: 1_240_000,
    change24h: -4.1,
  },
  {
    id: "cristiano",
    name: "Cristiano Bull",
    nation: "Portugal",
    flag: "🇵🇹",
    ticker: "CR7BULL",
    accent: "#C0392B",
    contract: "Soon",
    pairAddress: "",
    img: bullCristiano,
    marketCap: 2_980_000,
    price: 0.00298,
    volume24h: 760_000,
    change24h: 6.7,
  },
];
