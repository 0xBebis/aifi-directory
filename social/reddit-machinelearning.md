# Reddit — r/MachineLearning (use [P] flair for Project)

**Title:** [P] How 8 AI/ML techniques are distributed across 433 financial services companies — a taxonomy breakdown

**Body:**

I've been cataloguing AI companies in financial services and tagged each with a primary AI type using an 8-category taxonomy. Thought the distribution would be interesting for this community.

**The taxonomy and counts (433 companies total):**

| AI Type | Companies | % |
|---|---|---|
| Predictive ML | 200 | 46% |
| LLM | 56 | 13% |
| Data Platform | 48 | 11% |
| Infrastructure | 46 | 11% |
| Agentic | 35 | 8% |
| Computer Vision | 32 | 7% |
| Reinforcement Learning | 20 | 5% |
| Graph Analytics | 7 | 2% |

A few observations:

**Predictive ML dominates because it dominates in production.** Credit scoring, fraud detection, AML/transaction monitoring, churn prediction, pricing models — these have been running at major financial institutions for years. The 46% reflects deployment reality, not hype.

**LLMs in finance are mostly document and compliance use cases.** Of the 56 LLM-classified companies, the dominant applications are contract analysis, regulatory document parsing, earnings call summarization, customer support. Document-in, document-out tasks where hallucination risk is bounded by human review.

**Reinforcement learning is the most underrepresented relative to theoretical fit.** RL is arguably the technique most natively suited to sequential financial decision-making — market making, execution optimization, portfolio rebalancing. Only 20 companies. The research literature on RL in trading is extensive; industry adoption has been much slower.

**Graph analytics at 2% is the steepest gap.** Fraud ring detection, KYC relationship mapping, systemic risk propagation — areas where graph-based approaches have significant advantages over tabular ML. Seven companies.

The full directory, filterable by AI type, is at aifimap.com. Built on static JSON, open source. PRs welcome for corrections.
