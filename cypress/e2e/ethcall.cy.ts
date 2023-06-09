import { Test, generateTest } from "./task"

const tests: Array<Test> = [
    { task: "ethcall", name: "happy with empty from", inputs: [], vars:{foo: {value: "foo bar", type: "bytes"}}, options: {data: `$(foo)`, contract: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF", from: "", evmChainId: "", gas: ""}, wantSideEffectData: { value: '{\"From\":\"0x0000000000000000000000000000000000000000\",\"To\":\"0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef\",\"Gas\":500000,\"GasPrice\":null,\"GasFeeCap\":null,\"GasTipCap\":null,\"Value\":null,\"Data\":\"Zm9vIGJhcg==\",\"AccessList\":null}', type: "string" } },
    { task: "ethcall", name: "with explicit gas limit", inputs: [], vars:{foo: {value: "foo bar", type: "bytes"}}, options: {data: `$(foo)`, contract: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF", from: "", evmChainId: "", gas: "3000", specGasLimit: "1000"}, wantSideEffectData: { value: '{\"From\":\"0x0000000000000000000000000000000000000000\",\"To\":\"0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef\",\"Gas\":3000,\"GasPrice\":null,\"GasFeeCap\":null,\"GasTipCap\":null,\"Value\":null,\"Data\":\"Zm9vIGJhcg==\",\"AccessList\":null}', type: "string" } },
    { task: "ethcall", name: "with spec gas limit", inputs: [], vars:{foo: {value: "foo bar", type: "bytes"}}, options: {data: `$(foo)`, contract: "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF", from: "", evmChainId: "", gas: "", specGasLimit: "1000"}, wantSideEffectData: { value: '{\"From\":\"0x0000000000000000000000000000000000000000\",\"To\":\"0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef\",\"Gas\":1000,\"GasPrice\":null,\"GasFeeCap\":null,\"GasTipCap\":null,\"Value\":null,\"Data\":\"Zm9vIGJhcg==\",\"AccessList\":null}', type: "string" } },
]

describe("ethcall", () => {
    tests.map(test => {
        it(`${test.task} - ${test.name}`, () => {
            generateTest(test)
        })
    })
})