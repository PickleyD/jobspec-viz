import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "length", name: "string - input", inputs: [{ value: "water sucks, gatorade is better", type: "string" }], want: { value: "31", type: "decimal" } },
    { task: "length", name: "string - input, empty", inputs: [{ value: "", type: "string" }], want: { value: "0", type: "decimal" } },
    { task: "length", name: "string - param", inputs: [], options: { input: "water sucks, gatorade is better" }, want: { value: "31", type: "decimal" } },
    { task: "length", name: "string - param, empty", inputs: [], options: { input: "" }, want: { value: "null", type: "null" } },
    { task: "length", name: "string - vars", inputs: [], options: { input: "$(foo)" }, vars: { foo: { value: "water sucks, gatorade is better", type: "string" } }, want: { value: "31", type: "decimal" } },
]

describe("length", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})