import React from "react";

export default function SectionHead({ kicker, title, right }) {
  return (
    <div className="sectionHead">
      <div>
        <div className="kicker">{kicker}</div>
        <h2 className="wbc-display sectionTitle">{title}</h2>
      </div>
      {right}
    </div>
  );
}
