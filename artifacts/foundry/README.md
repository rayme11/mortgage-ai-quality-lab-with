# Foundry outputs land here

Drop raw Chat Playground output here as `prompt-a-output.json` / `prompt-b-output.json`
(JSON array only — strip any prose the model adds around the JSON).

Then run:
  node scripts/evaluate-ai-tests.mjs artifacts/foundry/prompt-a-output.json
  node scripts/evaluate-ai-tests.mjs artifacts/foundry/prompt-b-output.json

Synthetic data only. Never paste real borrower, credit, or property data into any prompt or output file.
