import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "lessthan", name: "no inputs, both params", inputs: [], options: { input: "1.23", limit: "100" }, want: { value: "true", type: "bool" } },
    { task: "lessthan", name: "left input, right params", inputs: [{ value: "1.23", type: "string" }], options: { limit: "100" }, want: { value: "true", type: "bool" } },
    {
        task: "lessthan",
        name: "with vars - no inputs, both params",
        inputs: [],
        options: { input: "$(foo)", limit: "$(bar)" },
        vars: {
            "foo": {
                value: "1.23",
                type: "string"
            },
            "bar": {
                value: "100",
                type: "string"
            }
        },
        want: { value: "true", type: "bool" }
    },
    { task: "lessthan", name: "FALSE - no inputs, both params", inputs: [], options: { input: "666", limit: "100" }, want: { value: "false", type: "bool" } },
]

describe("lessthan", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})