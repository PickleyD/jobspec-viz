import { Test, generateTest } from "./task"

const TEST_STRING = "water sucks, gatorade is better"
const TEST_STRING_LENGTH = TEST_STRING.length.toString()

const tests: Array<Test> = [
    { task: "length", name: "string - input", inputs: [{ value: TEST_STRING, type: "string" }], want: { value: TEST_STRING_LENGTH, type: "decimal" } },
    { task: "length", name: "string - input, empty", inputs: [{ value: "", type: "string" }], want: { value: "0", type: "decimal" } },
    { task: "length", name: "string - param", inputs: [], options: { input: TEST_STRING }, want: { value: TEST_STRING_LENGTH, type: "decimal" } },
    { task: "length", name: "string - param, empty", inputs: [], options: { input: "" }, want: { value: "null", type: "null" } },
    { task: "length", name: "string - vars", inputs: [], options: { input: "$(foo)" }, vars: { foo: { value: TEST_STRING, type: "string" } }, want: { value: TEST_STRING_LENGTH, type: "decimal" } },
]

describe("length", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})