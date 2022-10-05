import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    {
        task: "ethabidecode",
        name: "uint256, bool, int256, string",
        inputs: [],
        options: {
            abi: "uint256 u, bool b, int256 i, string s",
            data: `$(foo)`
        },
        vars: {
            "foo": {
                value: "0x000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffebf0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b666f6f206261722062617a000000000000000000000000000000000000000000",
                type: "byte"
            }
        },
        want: { "b": true, "i": -321, "s": "foo bar baz", "u": 123 }
    }
]

describe("ethabidecode", () => {
    tests.map(test => {
        generateTest(test)
    })
})