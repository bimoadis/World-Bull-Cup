import React from "react";

export default function Nav() {
  return (
    <nav className="nav">
      <div className="navInner">
        <a href="#top" className="brand">
          <span className="brandMark">▟</span>
          <span className="wbc-display brandText">
            WORLD&nbsp;BULL&nbsp;CUP
          </span>
        </a>
        <div className="navLinks wbc-navlinks">
          <a href="#board" className="navLink wbc-navlink">Board</a>
          <a href="#versus" className="navLink wbc-navlink">Versus</a>
          <a href="#schedule" className="navLink wbc-navlink">Matches</a>
          <a href="#" className="navCta wbc-navcta">Trade ↗</a>
        </div>
      </div>
    </nav>
  );
}
