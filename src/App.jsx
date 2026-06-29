import React, { useState } from "react";
import { INITIAL_PLAYERS } from "./data/players";
import { useLiveData } from "./hooks/useLiveData";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Board from "./components/Board";
import Versus from "./components/Versus";
import Schedule from "./components/Schedule";
import Footer from "./components/Footer";

export default function App() {
  const { data: liveUpdates, isFetching, refetch } = useLiveData(INITIAL_PLAYERS);
  
  // Merge static players with live updates
  const players = INITIAL_PLAYERS.map(p => {
    if (liveUpdates && liveUpdates[p.id]) {
      return { ...p, ...liveUpdates[p.id] };
    }
    return p;
  });

  const totalMcap = players.reduce((s, p) => s + p.marketCap, 0) || 1;
  const ranked = [...players].sort((a, b) => b.marketCap - a.marketCap);
  const leader = ranked[0];

  return (
    <>
      <Nav />
      <Hero leader={leader} totalMcap={totalMcap} />
      <Board
        players={players}
        totalMcap={totalMcap}
        ranked={ranked}
        onRefresh={() => refetch()}
        lastUpdate={new Date()}
        refreshing={isFetching}
      />
      <Versus ranked={ranked} totalMcap={totalMcap} />
      <Schedule />
      <Footer />
    </>
  );
}
