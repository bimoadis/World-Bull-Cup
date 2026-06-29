import React from "react";
import { FIXTURES } from "../data/fixtures";
import SectionHead from "./SectionHead";

export default function Schedule() {
  return (
    <section id="schedule" className="section">
      <SectionHead kicker="The Run" title="MATCHES" />
      <div className="fixtures">
        {FIXTURES.map((f, i) => (
          <div key={i} className="fixture wbc-fixture">
            <div className="fixtureRound">{f.round}</div>
            <div className="fixtureMatch">
              <span className="wbc-display fixtureTeam">{f.a}</span>
              <span className="fixtureVs">vs</span>
              <span className="wbc-display fixtureTeam">{f.b}</span>
            </div>
            <div className="wbc-mono fixtureDate">{f.date}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
