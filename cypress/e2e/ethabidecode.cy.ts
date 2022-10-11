// import { Test, generateTest } from "./task"

// const tests: Array<Test> = [
//     {
//         task: "ethabidecode",
//         name: "uint256, bool, int256, string",
//         inputs: [],
//         options: {
//             abi: "uint256 u, bool b, int256 i, string s",
//             data: `$(foo)`
//         },
//         vars: {
//             "foo": {
//                 value: "0x000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffebf0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b666f6f206261722062617a000000000000000000000000000000000000000000",
//                 type: "string"
//             }
//         },
//         want: { value: `{"b":true,"i":-321,"s":"foo bar baz","u":123}`, type: "string"}
//     }
// ]

// describe("ethabidecode", () => {
//     tests.map(test => {
//         it(`${test.task} - ${test.name}`, () => {
//             generateTest(test)
//         })
//     })
// })