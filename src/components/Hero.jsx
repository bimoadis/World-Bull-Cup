import React from "react";
import { fmtUSD } from "../utils";

export default function Hero({ leader, totalMcap }) {
  return (
    <header id="top" className="hero">
      <div className="heroGlow" />
      <div className="heroInner">
        <div className="eyebrow">
          <span className="live">● LIVE BOARD</span>
          <span className="eyebrowSep">/</span>
          <span>SOLANA · PUMP.FUN</span>
        </div>

        <h1 className="wbc-display heroTitle">
          THE BULLS<br />
          ENTER THE<br />
          <span className="heroTitleGold">ARENA.</span>
        </h1>

        <p className="heroSub">
          Three legends, three coins, one charge. The board reads each coin's
          share of the combined market cap as live odds. The bull in front is the
          one the market is backing — nothing is wagered, everything is watched.
        </p>

        <div className="heroStats">
          <Stat label="Combined market cap" value={fmtUSD(totalMcap)} />
          <Stat label="Current favorite" value={`${leader.flag} ${leader.name}`} />
          <Stat label="Players in play" value="3" />
        </div>

        <div className="heroDisclaimer">
          Not betting. Not financial advice. "Odds" are a visual reading of
          market-cap share. Tokens are highly risky.
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="wbc-mono statValue">{value}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}
