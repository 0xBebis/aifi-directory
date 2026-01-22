const fs = require('fs');

// Load existing results
const results = require('./results.json');

// Get current timestamp
const now = new Date().toISOString();

// New companies to add (73 remaining)
const newCompanies = {
  "equifax-workforce-solutions": {
    "funding_found": null,
    "source": "Wikipedia/CBInsights",
    "confidence": "high",
    "notes": "Subsidiary of Equifax (NYSE:EFX), acquired for $1.4B in 2007. Not standalone company.",
    "searched_at": now
  },
  "refinitiv-eikon": {
    "funding_found": null,
    "source": "Wikipedia/LSEG",
    "confidence": "high",
    "notes": "Acquired by LSEG for $27B in 2021. Now part of LSEG Data & Analytics.",
    "searched_at": now
  },
  "bloomberg-treasury": {
    "funding_found": null,
    "source": "Bloomberg",
    "confidence": "high",
    "notes": "Part of Bloomberg LP - private company, no separate funding for this division.",
    "searched_at": now
  },
  "finbar": {
    "funding_found": null,
    "source": "Y Combinator",
    "confidence": "low",
    "notes": "YC-backed AI investment analyst, specific funding amount not disclosed.",
    "searched_at": now
  },
  "keye": {
    "funding_found": 8550000,
    "source": "Fintech Global/PitchBook",
    "confidence": "high",
    "notes": "PE AI platform - $5M seed Jul 2025, total $8.55M raised.",
    "searched_at": now
  },
  "trata": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found for fintech company named Trata.",
    "searched_at": now
  },
  "sp-capital-iq": {
    "funding_found": null,
    "source": "CBInsights/Wikipedia",
    "confidence": "high",
    "notes": "Acquired by S&P Global in 2004. Part of S&P Global Market Intelligence.",
    "searched_at": now
  },
  "modulus-labs": {
    "funding_found": 6300000,
    "source": "The Block/CoinDesk",
    "confidence": "high",
    "notes": "ZKML startup - $6.3M seed Nov 2023. Acquired by Tools for Humanity Dec 2024.",
    "searched_at": now
  },
  "eqty-lab": {
    "funding_found": 12000000,
    "source": "Tracxn",
    "confidence": "medium",
    "notes": "AI integrity suite - funding details limited, partnered with Intel/NVIDIA.",
    "searched_at": now
  },
  "vana": {
    "funding_found": 25000000,
    "source": "Tracxn/Company Blog",
    "confidence": "high",
    "notes": "User-owned AI - $2M seed, $18M Series A, $5M strategic. Total $25M.",
    "searched_at": now
  },
  "gensyn": {
    "funding_found": 50600000,
    "source": "CoinDesk/Tracxn",
    "confidence": "high",
    "notes": "Decentralized ML compute - $6.5M seed + $43M Series A Jun 2023. Total $50.6M.",
    "searched_at": now
  },
  "together-ai": {
    "funding_found": 534000000,
    "source": "PRNewswire/Crunchbase",
    "confidence": "high",
    "notes": "AI cloud - $305M Series B Feb 2025, $3.3B valuation. Total $534M.",
    "searched_at": now
  },
  "prime-intellect": {
    "funding_found": 70400000,
    "source": "Fortune/Company Blog",
    "confidence": "high",
    "notes": "Decentralized AI - $5.5M seed, $15M Series A Mar 2025, $49.9M Dec 2025. Total $70.4M.",
    "searched_at": now
  },
  "grass": {
    "funding_found": 13500000,
    "source": "Blockworks/VentureBurn",
    "confidence": "medium",
    "notes": "DePIN data - $3.5M seed, undisclosed Series A, $10M bridge Oct 2025. ~$13.5M+.",
    "searched_at": now
  },
  "ionet": {
    "funding_found": 30000000,
    "source": "Tracxn/Nansen",
    "confidence": "high",
    "notes": "Decentralized GPU - $30M Series A Mar 2024 led by Hack VC, Solana Labs, OKX.",
    "searched_at": now
  },
  "morpheus-mor": {
    "funding_found": null,
    "source": "The Defiant/GlobeNewswire",
    "confidence": "medium",
    "notes": "Fair launch model - no VC. $50M+ TVL at launch, $120M stETH deposited.",
    "searched_at": now
  },
  "masa": {
    "funding_found": 17750000,
    "source": "The Block/Tracxn",
    "confidence": "high",
    "notes": "AI data network - $3.5M pre-seed, $5.4M seed, $8.75M CoinList. Total $17.75M.",
    "searched_at": now
  },
  "ritual": {
    "funding_found": 25000000,
    "source": "CoinDesk/Blockworks",
    "confidence": "high",
    "notes": "AI + smart contracts - $25M Series A Nov 2023 + undisclosed Polychain Apr 2024.",
    "searched_at": now
  },
  "pond": {
    "funding_found": 7500000,
    "source": "The Block",
    "confidence": "high",
    "notes": "Crypto AI models - $7.5M seed Nov 2024 led by Archetype, Coinbase Ventures.",
    "searched_at": now
  },
  "allora": {
    "funding_found": 35000000,
    "source": "The Block/Company Blog",
    "confidence": "high",
    "notes": "Self-improving AI network - $1.26M seed, $7.5M A1, $22M A2, $3M strategic. Total $35M.",
    "searched_at": now
  },
  "0g-labs": {
    "funding_found": 75000000,
    "source": "The Block/SiliconANGLE",
    "confidence": "high",
    "notes": "Decentralized AI OS - $35M pre-seed Mar 2024 + $40M seed Nov 2024. Total $75M.",
    "searched_at": now
  },
  "sahara-ai": {
    "funding_found": 51500000,
    "source": "CoinDesk/PRNewswire",
    "confidence": "high",
    "notes": "Decentralized AI - $6M seed + $43M Series A Aug 2024 + $8.5M public sale. Total $51.5M.",
    "searched_at": now
  },
  "aligned-layer": {
    "funding_found": 22600000,
    "source": "CoinDesk/The Block",
    "confidence": "high",
    "notes": "ZK verification - $2.6M seed + $20M Series A Apr 2024 led by Hack VC. Total $22.6M.",
    "searched_at": now
  },
  "hey-anon": {
    "funding_found": null,
    "source": "CoinGecko/Medium",
    "confidence": "low",
    "notes": "DeFAI protocol - no traditional VC funding disclosed. Token-based project.",
    "searched_at": now
  },
  "bankr": {
    "funding_found": 15000000,
    "source": "AInvest/Crypto-Fundraising",
    "confidence": "medium",
    "notes": "AI crypto companion - backed by Base Ecosystem Fund. Amount estimated.",
    "searched_at": now
  },
  "hotkeyswap": {
    "funding_found": null,
    "source": "Yahoo Finance",
    "confidence": "low",
    "notes": "Bittensor subnet - no traditional VC funding. Part of Bittensor ecosystem.",
    "searched_at": now
  },
  "orbit": {
    "funding_found": null,
    "source": "CoinMarketCap",
    "confidence": "low",
    "notes": "DeFi AI agent (GRIFT) - launched via Pump Fun Dec 2024. No VC funding.",
    "searched_at": now
  },
  "neur": {
    "funding_found": null,
    "source": "RootData",
    "confidence": "low",
    "notes": "Solana AI copilot - community-driven, no traditional VC funding disclosed.",
    "searched_at": now
  },
  "heyelsa": {
    "funding_found": 3000000,
    "source": "CryptoRank/Company Blog",
    "confidence": "high",
    "notes": "AI crypto copilot - $3M pre-seed+seed Jun 2025, led by M31 Capital, Coinbase Ventures.",
    "searched_at": now
  },
  "cod3x": {
    "funding_found": null,
    "source": "Company Blog",
    "confidence": "high",
    "notes": "DeFi AI agents - fully bootstrapped, no external VC funding. Seeking investors.",
    "searched_at": now
  },
  "project-plutus": {
    "funding_found": null,
    "source": "Solana Compass",
    "confidence": "low",
    "notes": "Solana trading AI - won $15K hackathon prize. No VC funding disclosed.",
    "searched_at": now
  },
  "aipump": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found. Likely community/meme token.",
    "searched_at": now
  },
  "taocat": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "Bittensor ecosystem token - no traditional VC funding disclosed.",
    "searched_at": now
  },
  "swarmnodeai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "mode-network": {
    "funding_found": 7300000,
    "source": "Tracxn/CoinLaunch",
    "confidence": "medium",
    "notes": "L2 DeFi - $2M OP grant + $5.3M from Optimism support. ICO $110K.",
    "searched_at": now
  },
  "layer-ai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "ark-defai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "hapi-protocol": {
    "funding_found": null,
    "source": "PitchBook",
    "confidence": "medium",
    "notes": "Security oracle - 7 investors including GBV Capital, HG Ventures. Amount undisclosed.",
    "searched_at": now
  },
  "anti-rug-agent": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found. Likely community token.",
    "searched_at": now
  },
  "soul-scanner": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "moby-ai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "slate": {
    "funding_found": 15000000,
    "source": "PitchBook",
    "confidence": "medium",
    "notes": "AI financial copilot - estimated $15-20M. Celesta Capital investor.",
    "searched_at": now
  },
  "agentfunai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "chutes": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "hermes-subquery": {
    "funding_found": null,
    "source": "AInvest",
    "confidence": "low",
    "notes": "SubQuery AI subnet - part of SubQuery Network. No separate funding.",
    "searched_at": now
  },
  "phala-network": {
    "funding_found": 10000000,
    "source": "Tracxn/Crunchbase",
    "confidence": "high",
    "notes": "TEE AI coprocessor - $10M total over 2 rounds. DWF Labs led Jan 2024 round.",
    "searched_at": now
  },
  "dolion-bully": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "Likely meme/community token. No VC funding.",
    "searched_at": now
  },
  "delysium": {
    "funding_found": 14000000,
    "source": "SaasNews/PitchBook",
    "confidence": "high",
    "notes": "AI gaming - $10M strategic Oct 2022 led by Anthos. Total $14M from 32 investors.",
    "searched_at": now
  },
  "griffin-ai-gain": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "DeFAI project - no funding information found.",
    "searched_at": now
  },
  "flockio": {
    "funding_found": 11000000,
    "source": "SiliconANGLE/Decrypt",
    "confidence": "high",
    "notes": "Decentralized AI training - $6M seed Mar 2024 + $3M strategic Dec 2024. Total $11M.",
    "searched_at": now
  },
  "gigabrain": {
    "funding_found": null,
    "source": "PitchBook",
    "confidence": "medium",
    "notes": "AI trading terminal - BAM Ventures, Protagonist investors. Amount undisclosed.",
    "searched_at": now
  },
  "elfa-ai": {
    "funding_found": 69420,
    "source": "Chromia Blog",
    "confidence": "medium",
    "notes": "Web3 market intelligence - $69,420 from Chromia Data & AI Fund Oct 2024.",
    "searched_at": now
  },
  "lunarcrush": {
    "funding_found": 7020000,
    "source": "Decrypt/PitchBook",
    "confidence": "high",
    "notes": "Social analytics - $5M Series A Jul 2023 + earlier rounds. Total $7.02M.",
    "searched_at": now
  },
  "giza-arma-giza-tech-arma": {
    "funding_found": 5200000,
    "source": "Medium/Invezz",
    "confidence": "high",
    "notes": "AI DeFi agents - $3M pre-seed Jul 2023 + $2.2M seed May 2025. Total $5.2M.",
    "searched_at": now
  },
  "truenorth": {
    "funding_found": 3000000,
    "source": "Investing.com/CryptoPotato",
    "confidence": "high",
    "notes": "Financial AI - $3M pre-seed Dec 2025 led by CyberFund, Delphi Labs.",
    "searched_at": now
  },
  "zyfai": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "almanak": {
    "funding_found": 10950000,
    "source": "JU Blog/CoinLaunch",
    "confidence": "high",
    "notes": "DeFi AI agents - $10.95M+ from NEAR, Delphi, HashKey. $8.45M announced Aug 2025.",
    "searched_at": now
  },
  "wayfinder": {
    "funding_found": 85000000,
    "source": "RootData/Bitget",
    "confidence": "medium",
    "notes": "AI agents by Parallel - $50M Oct 2021 + $35M Mar 2024. Via parent company.",
    "searched_at": now
  },
  "velvet-capital": {
    "funding_found": 3700000,
    "source": "Phemex/Company Blog",
    "confidence": "high",
    "notes": "DeFi asset mgmt - $3.7M from YZi Labs, Binance Labs backing. TGE Jul 2025.",
    "searched_at": now
  },
  "billybets": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "symphony-symphonyio": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found for symphony.io crypto project.",
    "searched_at": now
  },
  "shekel-agentic": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "edwin-edwinfinance": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found for edwin.finance.",
    "searched_at": now
  },
  "kvants-ai": {
    "funding_found": null,
    "source": "Medium",
    "confidence": "medium",
    "notes": "AI quant platform - pre-seed/seed completed, TGE Jan 2025. Amount undisclosed.",
    "searched_at": now
  },
  "arkham": {
    "funding_found": 12000000,
    "source": "LinkedIn/Crunchbase",
    "confidence": "medium",
    "notes": "Crypto intelligence - $12M+ from Palantir founders, OpenAI's Sam Altman, Tim Draper.",
    "searched_at": now
  },
  "cambrian-network": {
    "funding_found": 5900000,
    "source": "TechStartups/U.Today",
    "confidence": "high",
    "notes": "AI data infrastructure - $5.9M seed Mar 2025 led by a16z CSX.",
    "searched_at": now
  },
  "iaesir-fund": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "mamo-lending-agent": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "axal": {
    "funding_found": 2500000,
    "source": "The Block/SiliconANGLE",
    "confidence": "high",
    "notes": "Autonomous agents - $2.5M pre-seed Oct 2024 led by CMT Digital.",
    "searched_at": now
  },
  "defi-saver": {
    "funding_found": null,
    "source": "Crunchbase",
    "confidence": "low",
    "notes": "DeFi management - established since 2019, no disclosed VC funding.",
    "searched_at": now
  },
  "sail-ai-agents": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  },
  "lulo": {
    "funding_found": null,
    "source": "RootData",
    "confidence": "medium",
    "notes": "Solana lending - $100M+ AUM, funding not disclosed. Circle Alliance member.",
    "searched_at": now
  },
  "askjimmy": {
    "funding_found": null,
    "source": "Web search",
    "confidence": "low",
    "notes": "No funding information found.",
    "searched_at": now
  }
};

// Add new companies to results
Object.assign(results.companies, newCompanies);

// Update metadata
results.metadata.searched = 470;
results.metadata.status = "complete";

// Count found (non-null funding)
let found = 0;
for (const slug in results.companies) {
  if (results.companies[slug].funding_found !== null) {
    found++;
  }
}
results.metadata.found = found;

// Write updated results
fs.writeFileSync('./results.json', JSON.stringify(results, null, 2));

console.log('Updated results.json');
console.log('Total companies:', Object.keys(results.companies).length);
console.log('Found with funding:', found);
