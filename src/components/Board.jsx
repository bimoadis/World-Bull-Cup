import React from "react";
import { fmtUSD } from "../utils";
import SectionHead from "./SectionHead";

export default function Board({ players, totalMcap, ranked, onRefresh, lastUpdate, refreshing }) {
  return (
    <section id="board" className="section squadSection">
      <SectionHead
        kicker="The Card"
        title="SQUAD BOARD"
        right={
          <button className="squadRefreshBtn wbc-refresh" onClick={onRefresh}>
            {refreshing ? "↻ syncing" : "↻ Refresh prices"}
          </button>
        }
      />
      <div className="squadMeta">
        Sorted by market cap (highest first). Figures refresh about every 30 seconds. 24h volume is a rolling window from DexScreener, summed across all Solana pools for each coin (not a daily reset at midnight).
      </div>

      <div className="squadGrid">
        {ranked.map((p) => {
          return (
            <div key={p.id} className="squadCard">
              <div className="squadHeader">
                <div className="squadHeaderLeft">
                  <span className="squadFlag">{p.flag}</span>
                  <span className="wbc-display squadNation">{p.nation.toUpperCase()}</span>
                </div>
                <a href="#" className="squadTradeBtn">Trade</a>
              </div>
              
              <div className="squadStatsRow">
                <div className="squadStatBox squadStatBox--green">
                  <div className="squadStatLabel">Market cap</div>
                  <div className="wbc-mono squadStatValue">{fmtUSD(p.marketCap)}</div>
                </div>
                <div className="squadStatBox squadStatBox--green">
                  <div className="squadStatLabel">24h volume</div>
                  <div className="wbc-mono squadStatValue">{fmtUSD(p.volume24h)}</div>
                </div>
              </div>

              <div className="squadStatBox squadStatBox--yellow">
                <div className="squadStatLabel">Price</div>
                <div className="wbc-mono squadStatValue squadStatValue--small">
                  ${p.price.toFixed(8).replace(/\.?0+$/, '')}
                </div>
              </div>

              <div className="squadContract wbc-mono">
                {p.pairAddress || p.contract || "Contract: Soon"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
