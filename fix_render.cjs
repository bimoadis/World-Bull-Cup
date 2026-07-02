const fs = require('fs');
let code = fs.readFileSync('src/routes/index.tsx', 'utf-8');
code = code.replace(/return \(\r?\n\s*<div>/m, 'return (\n    <div className={`py-16 ${index % 2 === 1 ? \\'bg-[#0D0E10]\\' : \\'bg-[#0A0A0B]\\'} `}>\n      <div className="mx-auto max-w-7xl px-6">\n        <section id={champ.id} className="mb-24">\n          <div className="mb-6 flex items-end justify-between">\n            <div>');
fs.writeFileSync('src/routes/index.tsx', code);
