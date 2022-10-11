import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "jsonparse", name: "array index path", inputs: [{ value: `{"data":[{"availability":"0.99991"}]}`, type: "string" }], options: { path: "data,0,availability" }, want: { value: "0.99991", type: "string" } },
    { task: "jsonparse", name: "large int result", inputs: [{ value: `{"some_id":1564679049192120321}`, type: "string" }], options: { path: "some_id" }, want: { value: "1564679049192120321", type: "int" } },
    { task: "jsonparse", name: "float result", inputs: [{ value: `{"availability":3.14}`, type: "string" }], options: { path: "availability" }, want: { value: "3.14", type: "float" } },
    { task: "jsonparse", name: "index array", inputs: [{ value: `{"data": [0, 1]}`, type: "string" }], options: { path: "data,0" }, want: { value: "0", type: "int" } },
    { task: "jsonparse", name: "index array of array", inputs: [{ value: `{"data": [[0, 1]]}`, type: "string" }], options: { path: "data,0,0" }, want: { value: "0", type: "int" } },
]

describe("jsonparse", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})