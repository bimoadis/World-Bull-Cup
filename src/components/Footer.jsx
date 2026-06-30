import React from "react";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="wbc-display footerBrand flex items-center gap-2">
          <img src={logo} alt="World Bull Cup Logo" className="h-8 w-auto" />
          <span>WORLD BULL CUP</span>
        </div>
        <p className="footerDisc">
          World Bull Cup is an independent fan project. Not affiliated with FIFA,
          the FIFA World Cup™, any player, federation, or Pump.fun. Nothing here
          is betting, financial, or legal advice. "Odds" are a visual reading of
          market-cap share, not a wager and not a payout. Digital tokens are
          highly risky — you may lose everything you put in.
        </p>
        <div className="footerLinks">
          <a href="#" className="footerLink">X / Twitter</a>
          <a href="#" className="footerLink">DexScreener</a>
          <a href="#" className="footerLink">Pump.fun</a>
        </div>
      </div>
    </footer>
  );
}
