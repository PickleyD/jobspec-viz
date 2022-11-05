import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "bridge", name: "bridge task with mock response", inputs: [{ value: "12345.67", type: "string" }], mockResponse: { data: { thing: 123 } }, want: { keep: {data: { thing: 123 } } } },
]

describe("mockResponse", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})