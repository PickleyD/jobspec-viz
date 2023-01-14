import { Test, generateTest } from "./task"
import web3utils from "web3-utils"

const tests: Array<Test> = [
    { task: "bridge", name: "requestData (empty) + includeInputAtKey", inputs: [{ value: "123.45", type: "decimal" }], options: {name: "bridge1", requestData: ``, includeInputAtKey: "input"}, wantSideEffectData: { value: '{"input":"123.45"}', type: "string" } },
    { task: "bridge", name: "requestData (empty) + includeInputAtKey + meta", inputs: [{ value: "123.45", type: "decimal" }], jobRun: { meta: { keep: { "theMeta": "yes" } }}, options: {name: "bridge1", requestData: ``, includeInputAtKey: "input"}, wantSideEffectData: { value: '{"input":"123.45","meta":{"theMeta":"yes"}}', type: "string" } },
    { task: "bridge", name: "requestData (pure variable) + meta", inputs: [{ value: "123.45", type: "decimal" }], vars: {foo: { keep: { "bar": "baz" } }}, jobRun: { meta: { keep: { "theMeta": "yes" } }}, options: {name: "bridge1", requestData: `$(foo)`}, wantSideEffectData: { value: '{"bar":"baz","meta":{"theMeta":"yes"}}', type: "string" } },
    { task: "bridge", name: "error (var is not a map) - requestData (pure variable) + meta", inputs: [{ value: "123.45", type: "decimal" }], vars: {foo: {value: "bar", type: "string"}}, jobRun: { meta: { keep: { "theMeta": "yes" } }}, options: {name: "bridge1", requestData: `$(foo)`}, wantSideEffectData: { value: "", type: "null" }, expectError: true },
    { task: "bridge", name: "mockresponse + requestData (empty) + includeInputAtKey", mockResponse: { "someData": "foo" }, inputs: [{ value: "123.45", type: "decimal" }], options: {name: "bridge1", requestData: ``, includeInputAtKey: "input"}, wantSideEffectData:{ value: '{"input":"123.45"}', type: "string" }, want: { keep: {"someData": "foo"} } },
]

describe("bridge", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})