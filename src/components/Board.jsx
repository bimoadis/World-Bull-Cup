import React from "react";
import { fmtUSD, fmtPrice, shareToOdds } from "../utils";
import SectionHead from "./SectionHead";

export default function Board({ players, totalMcap, ranked, onRefresh, lastUpdate, refreshing }) {
  return (
    <section id="board" className="section">
      <SectionHead
        kicker="The Card"
        title="ODDS BOARD"
        right={
          <button className="refreshBtn wbc-refresh" onClick={onRefresh}>
            {refreshing ? "↻ syncing" : "↻ refresh"}
          </button>
        }
      />
      <div className="boardMeta">
        Sorted by market cap. Odds = inverse of each coin's market-cap share.
        Updated {lastUpdate.toLocaleTimeString()}.
      </div>

      <div className="table">
        <div className="theadRow wbc-thead">
          <div>#</div>
          <div>Player</div>
          <div className="tNum">Market cap</div>
          <div className="tNum">Price</div>
          <div className="tNum">24h</div>
          <div className="tNum">Odds</div>
          <div className="tNum">Share</div>
          <div></div>
        </div>

        {ranked.map((p, i) => {
          const share = p.marketCap / totalMcap;
          const up = p.change24h >= 0;
          return (
            <div key={p.id} className="trow wbc-trow">
              <div className="rank">{i === 0 ? "★" : i + 1}</div>

              <div className="playerCell">
                <div className="avatar" style={{ borderColor: p.accent }}>
                  {p.img ? (
                    <img src={p.img} alt={p.name} className="avatarImg" />
                  ) : (
                    <span className="avatarPlaceholder">▟</span>
                  )}
                </div>
                <div>
                  <div className="wbc-display playerName">{p.name}</div>
                  <div className="playerMeta">
                    {p.flag} {p.nation} · ${p.ticker}
                  </div>
                </div>
              </div>

              <div className="wbc-mono tNum strong">
                {fmtUSD(p.marketCap)}
              </div>
              <div className="wbc-mono tNum">{fmtPrice(p.price)}</div>
              <div
                className="wbc-mono tNum"
                style={{ color: up ? "var(--color-up)" : "var(--color-down)" }}
              >
                {up ? "▲" : "▼"} {Math.abs(p.change24h).toFixed(1)}%
              </div>
              <div
                className={`wbc-mono tNum odds ${i === 0 ? "oddsFav" : ""}`}
              >
                {shareToOdds(share)}
              </div>
              <div className="wbc-mono tNum">
                {(share * 100).toFixed(1)}%
              </div>

              <div className="tNum">
                <a href="#" className="tradeMini wbc-trademini">
                  Trade
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
