import { Test, generateTest } from "./task"
import web3utils from "web3-utils"

const tests: Array<Test> = [
    { task: "bridge", name: "requestData (empty) + includeInputAtKey", inputs: [{ value: "123.45", type: "decimal" }], options: {name: "bridge1", requestData: ``, includeInputAtKey: "input"}, want: { value: web3utils.utf8ToHex('{"input":"123.45"}'), type: "string" } },
    { task: "bridge", name: "requestData (empty) + includeInputAtKey + meta", inputs: [{ value: "123.45", type: "decimal" }], jobRun: { meta: { keep: { "theMeta": "yes" } }}, options: {name: "bridge1", requestData: ``, includeInputAtKey: "input"}, want: { value: web3utils.utf8ToHex('{"input":"123.45","meta":{"theMeta":"yes"}}'), type: "string" } },
]

describe("bridge", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})