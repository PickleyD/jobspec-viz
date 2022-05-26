# Chainlink Job Spec Viz

<b>Drag, drop and connect tasks to visually program your Chainlink job spec. Copy the generated code to your Chainlink node and you're good to go!</b>

Live demo: https://jobspec-viz.vercel.app/

## User Guide

<b>Disclaimer: This app is in early development and many features are yet to be implemented. Expect some bugs!</b>

First, select the job type and enter any required config.

![step 1 gif](https://user-images.githubusercontent.com/6655367/170507369-0aca53e3-f7da-47a9-974e-99cee584175d.gif)

Drag tasks to the workspace. Similarly, each task may have required config fields.

![step 2 gif](https://user-images.githubusercontent.com/6655367/170509291-5cc76744-2569-4f49-8ac1-aebdbcb1fcc8.gif)

Connect tasks together to form a pipeline. 'Power' fields give you quick access to input variables you can use.

![step 3 gif](https://user-images.githubusercontent.com/6655367/170509365-ddb83a7c-430b-43d4-b217-9f5f94e2b2c9.gif)

The 'Codegen' panel will change in realtime as you work. Any lines highlighted in red indicate missing or invalid config.

![step 4 gif](https://user-images.githubusercontent.com/6655367/170509423-32e86f35-9ad4-4b82-85ab-6205a3819130.gif)

Copy the generated TOML to your clipboard ready to paste into your Chainlink node's job spec config panel!

![step 5 gif](https://user-images.githubusercontent.com/6655367/170509474-b7e929db-9c63-4d3b-a9f6-928319781ed7.gif)

## Run Locally

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
