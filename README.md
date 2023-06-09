# LINKIT - Chainlink Job Spec Editor

1) <b>Drag and connect tasks to visually program your Chainlink job spec.</b>
2) <b>Use AI to generate parts of your pipeline using natural language.</b>
3) <b>Test and debug the job spec by simulating execution using much of the same code as a real Chainlink node.</b>
4) <b>The generated TOML can be copied to your Chainlink node and you're good to go!</b>

Live demo: https://jobspec-viz.vercel.app/

## User Guide

<b>Disclaimer: This app is in early development and some features are yet to be implemented. Expect bugs!</b>

Drag from the task handles to add new tasks to your pipeline.

![drag](https://github.com/PickleyD/jobspec-viz/assets/6655367/6718fdc9-4568-4154-a4ac-652300be7d3a)

or pick from a pre-configured template

![quickstart](https://github.com/PickleyD/jobspec-viz/assets/6655367/ca8d483d-b232-455d-986a-786489c2a50c)

or import an existing job spec

![quickstart](https://github.com/PickleyD/jobspec-viz/assets/6655367/de5901ec-8aad-4c42-bafc-e4332fb1b0ca)

Use natural language to let AI generate portions of your pipeline for you!

![ai](https://github.com/PickleyD/jobspec-viz/assets/6655367/78fe54a6-694c-4aca-a3a4-13e2af1f6ded)

Open the 'Test' panel and enable test mode to parse your job spec and enable you to simulate execution of the pipeline. 

![test](https://github.com/PickleyD/jobspec-viz/assets/6655367/1dc36d3f-84d8-49ab-ad09-54ce2cd17710)

<i>Most tasks are executed exactly as they would be on a real Chainlink node but tasks which normally produce side-effects are simulated. For example, the EthTx task will not submit a transaction to the blockchain.</i>

Once you're happy with your job spec, copy the generated TOML to your clipboard — ready to paste into your Chainlink node's job spec config panel!

![export](https://github.com/PickleyD/jobspec-viz/assets/6655367/586feb69-d9b1-472b-ad97-dc21395d9bd1)

## Run Locally

```bash
npm run dev
# or
yarn dev
```

[See the Vercel docs](https://vercel.com/docs/cli/dev) for details on how to use the API routes locally. The API routes are written in Go so you wil need Go installed on your machine.
