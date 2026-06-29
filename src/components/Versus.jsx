import React from "react";
import SectionHead from "./SectionHead";
import { fmtUSD } from "../utils";

export default function Versus({ ranked, totalMcap }) {
  const pairs = [];
  for (let i = 0; i < ranked.length; i++) {
    for (let j = i + 1; j < ranked.length; j++) {
      pairs.push([ranked[i], ranked[j]]);
    }
  }

  return (
    <section id="versus" className="sectionDark">
      <SectionHead kicker="Head to Head" title="THE VERSUS" />
      <div className="versusList">
        {pairs.map(([a, b], idx) => {
          const sum = a.marketCap + b.marketCap || 1;
          const aShare = (a.marketCap / sum) * 100;
          const bShare = 100 - aShare;
          const aLeads = a.marketCap >= b.marketCap;
          return (
            <div key={idx} className="matchup">
              <Side player={a} leads={aLeads} align="left" />

              <div className="versusCenter">
                <div className="wbc-display vsBadge">VS</div>
              </div>

              <Side player={b} leads={!aLeads} align="right" />

              <div className="momentumWrap">
                <div
                  className="wbc-momentum-a"
                  style={{
                    width: `${aShare}%`,
                    background: a.accent,
                  }}
                />
                <div
                  className="wbc-momentum-b"
                  style={{
                    width: `${bShare}%`,
                    background: b.accent,
                  }}
                />
                <div
                  className="wbc-mono momentumLabel"
                  style={{ left: 12 }}
                >
                  {aShare.toFixed(0)}%
                </div>
                <div
                  className="wbc-mono momentumLabel"
                  style={{ right: 12 }}
                >
                  {bShare.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Side({ player, leads, align }) {
  return (
    <div className="side" style={{ textAlign: align }}>
      <div
        className="sideAvatar"
        style={{
          borderColor: player.accent,
          marginLeft: align === "right" ? "auto" : 0,
        }}
      >
        {player.img ? (
          <img src={player.img} alt={player.name} className="avatarImg" />
        ) : (
          <span className="avatarPlaceholderLg">▟</span>
        )}
      </div>
      <div
        className="wbc-display sideName"
        style={{
          color: leads ? "var(--color-gold)" : "var(--color-text)",
        }}
      >
        {player.name}
      </div>
      <div className="sideMeta">
        {player.flag} ${player.ticker}
      </div>
      <div className="wbc-mono sideMcap">
        {fmtUSD(player.marketCap)}
      </div>
      {leads && <div className="leadTag">FRONT RUNNER</div>}
    </div>
  );
}
