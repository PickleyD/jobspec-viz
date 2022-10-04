import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    // {
    //     task: "ethabiencode",
    //     name: "unusual characters in method name / uint256, bool, int256, string",
    //     inputs: [],
    //     options: {
    //         abi: "foo_Bar__3928 ( uint256 u, bool b, int256 i, string s )",
    //         data: `{ "u": $(foo), "b": $(bar), "i": $(baz), "s": $(quux) }`
    //     },
    //     vars: {
    //         "bar": {
    //             value: "true",
    //             type: "boolean"
    //         },
    //         "baz": {
    //             value: "-321",
    //             type: "int"
    //         },
    //         "foo": {
    //             value: "123",
    //             type: "int"
    //         },
    //         "quux": {
    //             value: "foo bar baz",
    //             type: "string"
    //         }
    //     },
    //     want: "0xae506917000000000000000000000000000000000000000000000000000000000000007b0000000000000000000000000000000000000000000000000000000000000001fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffebf0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000b666f6f206261722062617a000000000000000000000000000000000000000000"
    // },
    {
        task: "ethabiencode",
        name: "bytes32, bytes, address",
        inputs: [],
        options: {
            abi: "asdf(bytes32 b, bytes bs, address a)",
            data: `{ "b": $(foo), "bs": $(bar), "a": $(baz) }`
        },
        vars: {
            "foo": {
                value: "chainlink chainlink chainlink",
                type: "bytes32"
            },
            "bar": { 
                value: "stevetoshi sergeymoto",
                type: "bytes"
             },
            "baz": {
                value: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
                type: "address"
            },
        },
        want: "0x4f5e7a89636861696e6c696e6b20636861696e6c696e6b20636861696e6c696e6b0000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000deadbeefdeadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000000000000000000000000000000000157374657665746f736869207365726765796d6f746f0000000000000000000000"
    },
    // {
    //     task: "ethabiencode",
    //     name: "address[] calldata, uint80, uint32[2]",
    //     inputs: [],
    //     options: {
    //         abi: "chainLink(address[] calldata a, uint80 x, uint32[2] s)",
    //         data: `{ "a": $(foo), "x": $(bar), "s": $(baz) }`
    //     },
    //     vars: {
    //         "bar": {
    //             value: "8293",
    //             type: "int"
    //         },
    //         "baz": {
    //             values: ["192", "4182"],
    //             type: "int"
    //         },
    //         "foo": {
    //             values: [
    //                 "0x6c91b062a774cbe8b9bf52f224c37badf98fc40b",
    //                 "0xc4f27ead9083c756cc2c02aaa39b223fe8d0a0e5",
    //                 "0x749e4598819b2b0e915a02120696c7b8fe16c09c"
    //             ],
    //             type: "address"
    //         }
    //     },
    //     want: "0xa3a122020000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000206500000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000105600000000000000000000000000000000000000000000000000000000000000030000000000000000000000006c91b062a774cbe8b9bf52f224c37badf98fc40b000000000000000000000000c4f27ead9083c756cc2c02aaa39b223fe8d0a0e5000000000000000000000000749e4598819b2b0e915a02120696c7b8fe16c09c"
    // },
]

describe("ethabiencode", () => {
    tests.map(test => {
        generateTest(test)
    })
})