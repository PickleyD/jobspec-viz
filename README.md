# LINKIT (formerly Chainlink Job Spec Viz)

1) <b>Drag and connect tasks to visually program your Chainlink job spec.</b>
1) <b>Test and debug the job spec by simulating execution using much of the same code as a real Chainlink node.</b>
1) <b>The generated TOML can be copied to your Chainlink node and you're good to go!</b>

Live demo: https://jobspec-viz.vercel.app/

## User Guide

<b>Disclaimer: This app is in early development and many features are yet to be implemented. Expect some bugs!</b>

Select and configure your job type.

![step 1 gif](https://user-images.githubusercontent.com/6655367/170507369-0aca53e3-f7da-47a9-974e-99cee584175d.gif)

Drag from the task handles to add new tasks to your pipeline.

![step 2 gif](https://user-images.githubusercontent.com/6655367/170509291-5cc76744-2569-4f49-8ac1-aebdbcb1fcc8.gif)

As you enter configuration details the 'Codegen' panel will change in realtime.

![step 3 gif](https://user-images.githubusercontent.com/6655367/170509365-ddb83a7c-430b-43d4-b217-9f5f94e2b2c9.gif)


![step 4 gif](https://user-images.githubusercontent.com/6655367/170509423-32e86f35-9ad4-4b82-85ab-6205a3819130.gif)

Open the 'Test' panel and enable test mode to parse your job spec and enable you to simulate execution of the pipeline. 

<i>Most tasks are executed exactly as they would be on a real Chainlink node but tasks which normally produce side-effects are simulated. For example, the EthTx task will not submit a transaction to the blockchain.</i>

Once you're happy with your job spec, copy the generated TOML to your clipboard — ready to paste into your Chainlink node's job spec config panel!

![step 5 gif](https://user-images.githubusercontent.com/6655367/170509474-b7e929db-9c63-4d3b-a9f6-928319781ed7.gif)

## Run Locally

```bash
npm run dev
# or
yarn dev
```

[See the Vercel docs](https://vercel.com/docs/cli/dev) for details on how to use the API routes locally. The API routes are written in Go so you wil need Go installed on your machine.
