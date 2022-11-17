# LINKIT (formerly Chainlink Job Spec Viz)

1) <b>Drag and connect tasks to visually program your Chainlink job spec.</b>
1) <b>Test and debug the job spec by simulating execution using much of the same code as a real Chainlink node.</b>
1) <b>The generated TOML can be copied to your Chainlink node and you're good to go!</b>

Live demo: https://jobspec-viz.vercel.app/

## User Guide

<b>Disclaimer: This app is in early development and some features are yet to be implemented. Expect bugs!</b>

Select and configure your job type.

![step1](https://user-images.githubusercontent.com/6655367/202562012-b2f58897-6fbb-4fa9-b2fc-802c838a646f.gif)


Drag from the task handles to add new tasks to your pipeline.

![step2](https://user-images.githubusercontent.com/6655367/202562020-6cd110b2-bdce-498a-b717-45baff5eacc3.gif)


As you enter configuration details the 'Codegen' panel will change in realtime.

![step3](https://user-images.githubusercontent.com/6655367/202562023-ccdce936-fa90-49ca-94f2-5123a7059bec.gif)

Open the 'Test' panel and enable test mode to parse your job spec and enable you to simulate execution of the pipeline. 

![step4](https://user-images.githubusercontent.com/6655367/202562027-0d0671ff-abd8-4da6-9937-92d9edf9ed0c.gif)

<i>Most tasks are executed exactly as they would be on a real Chainlink node but tasks which normally produce side-effects are simulated. For example, the EthTx task will not submit a transaction to the blockchain.</i>

Once you're happy with your job spec, copy the generated TOML to your clipboard — ready to paste into your Chainlink node's job spec config panel!

![step5](https://user-images.githubusercontent.com/6655367/202562408-72c30fff-3fd4-4ef9-9edc-ed64ad2f05b1.gif)

## Run Locally

```bash
npm run dev
# or
yarn dev
```

[See the Vercel docs](https://vercel.com/docs/cli/dev) for details on how to use the API routes locally. The API routes are written in Go so you wil need Go installed on your machine.
