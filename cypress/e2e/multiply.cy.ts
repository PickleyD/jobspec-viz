import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "multiply", name: "string, by 100", inputs: [{ value: "1.23", type: "string"}], options: { times: "100" }, want: "123" },
    { task: "multiply", name: "string, negative", inputs: [{ value: "1.23", type: "string"}], options: { times: "-5" }, want: "-6.15" },
    { task: "multiply", name: "string, no times parameter", inputs: [{ value: "1.23", type: "string"}], options: { times: "1" }, want: "1.23" },
    { task: "multiply", name: "string, zero", inputs: [{ value: "1.23", type: "string"}], options: { times: "0" }, want: "0" },
    { task: "multiply", name: "string, large value", inputs: [{ value: "1.23", type: "string"}], options: { times: "1000000000000000000" }, want: "1230000000000000000" },
]

describe("multiply", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})