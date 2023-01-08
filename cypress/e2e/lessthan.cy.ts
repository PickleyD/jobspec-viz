import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "lessthan", name: "string, lt 100", inputs: [], options: { input: "1.23", limit: "100" }, want: { value: "true", type: "bool" } },
]

describe("lessthan", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})