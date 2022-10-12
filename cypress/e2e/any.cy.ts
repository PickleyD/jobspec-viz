import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "any", name: "zero inputs", inputs: [], want: { value: "null", type: "null" }, expectError: true },
    { task: "any", name: "one non-errored decimal input", inputs: [{ value: "42", type: "decimal" }], want: { value: "42", type: "decimal" } },
    { task: "any", name: "two non-errored inputs", inputs: [{ value: "42", type: "decimal" }, { value: "42", type: "decimal" }], want: { value: "42", type: "decimal" } },
]

describe("any", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})