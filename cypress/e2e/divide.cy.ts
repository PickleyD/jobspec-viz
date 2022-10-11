import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "divide", name: "string", inputs: [{ value: "12345.67", type: "string" }], options: { divisor: "100" }, want: { value: "123.4567", type: "decimal" } },
    { task: "divide", name: "string, negative", inputs: [{ value: "12345.67", type: "string" }], options: { divisor: "-5" }, want: { value: "-2469.134", type: "decimal" } },
    { task: "divide", name: "string, large value", inputs: [{ value: "12345.67", type: "string" }], options: { divisor: "1000000000000000000" }, want: { value: "0.0000000000000123", type: "decimal" } },

    { task: "divide", name: "precision", inputs: [{ value: "12345.67", type: "float" }], options: { divisor: "1000", precision: "2" }, want: { value: "12.35", type: "decimal" } },
    { task: "divide", name: "precision (> 16)", inputs: [{ value: "200", type: "float" }], options: { divisor: "6", precision: "18" }, want: { value: "33.333333333333333333", type: "decimal" } },
    { task: "divide", name: "precision (negative)", inputs: [{ value: "12345.67", type: "float" }], options: { divisor: "1000", precision: "-1" }, want: { value: "10", type: "decimal" } },
]

describe("divide", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})