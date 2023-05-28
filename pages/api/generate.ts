import {
    NextApiRequest,
    NextApiResponse,
} from "next/types";

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
    const { prompt, toml, aiNodeId } = request.body;

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user",
            content: embellishPrompt(prompt, toml, aiNodeId),
        }],
        temperature: 0.3,
        // max_tokens: 200,
        n: 1,
        // user: TODO
    };

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
            "OpenAI-Organization": `${process.env.OPENAI_ORG_ID ?? ""}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    const json = await completion.json();
    response.status(200).json(json);
}

const embellishPrompt = (prompt: string, toml: string, aiNodeId: string) => {
    return `You are a generator of Chainlink Job Specs in TOML format.
The user will state what they want the next task(s) in their job spec pipeline to do and you will reply with relevant tasks and params.
The previous task in the pipeline is provided as context when generating the next task(s).
Respond only with TOML tasks in DOT syntax.
Make up the name/key of each task you generate.
Each task in response should be in the format 'generated_key [type="task_type" other params...]'.
Respond '?' if unable to generate tasks with confidence.
For brevity a description of task available to you is given to you below in the following format:

'
t: task type
a description of the task

p:
the available parameters
('#dtnum' means 'Possible data types: number OR stringified number OR bytes-ified number OR $(variable)')
('allowedFaults' parameter means the max num of input tasks that can error without this task erroring. Default: N - 1, where N is the num of inputs.

i:
task inputs

o: 
task outputs

e:
one or more examples of the task
'

t: any
Returns a random value from set of inputs passed in.

p:
None.

i:
Anything.

o:
Randomly-selected value from the set of inputs.

e:
'
fetch1   [type="http" ...]
fetch2   [type="http" ...]
fetch3   [type="http" ...]
pick_any [type="any"]

fetch1 -> pick_any
fetch2 -> pick_any
fetch3 -> pick_any
'
pick_any will return either the result of fetch1, fetch2, or fetch3.

t: base64decode
Accepts a base64 encoded string and returns decoded bytes.

p:
input: a base64 encoded string.

o:
Decoded bytes.

e:
'
my_base64decode_task [type="base64decode" input="SGVsbG8sIHBsYXlncm91bmQ="]
'
Input SGVsbG8sIHBsYXlncm91bmQ= will return Hello, playground (as ASCII bytes).

t: base64encode
Encodes bytes/string into a Base64 string.

p:
input: Byte array or string to be encoded.

o:
String with Base64 encoding of input.

e:
'
my_base64encode_task [type="base64encode" input="Hello, playground"]
'
Given the input string "Hello, playground", the task will return "SGVsbG8sIHBsYXlncm91bmQ=".

t: bridge
Make HTTP POST request to pre-configured URLs. Bridges are configured by the node operator and are referred to by a user-specified name. This is the way most jobs interact with External Adapters.

p:
name: name given to bridge by node operator.
requestData (optional): statically-defined payload to be sent to the external adapter.
cacheTTL (optional): a duration-formatted string indicating max acceptable staleness for cached bridge responses in case of intermittent failures. Disabled by default.
headers (optional): an array of strings. Num of strings must be even. e.g.: foo [type="bridge" name="foo" headers="[\\"X-Header-1\\", \\"value1\\", \\"X-Header-2\\", \\"value2\\"]"]

o:
String containing response body.

e:
'
my_bridge_task [type="bridge"
                name="some_bridge"
                requestData="{\\"data\\":{\\"foo\\": $(foo), \\"bar\\": $(bar)}}"
                ]
'

t: cborparse
Parse a CBOR payload. If user has made on-chain request using a ChainlinkClient contract, the request parameters are encoded as CBOR.

p:
data: Byte array containing CBOR payload.
mode: Optional. Specifies how to parse incoming CBOR. Default mode is 'diet', which expects input to be a map. Set to 'standard' to pass literal values through "as-is". Empty inputs return nil.

o:
Map containing request parameters. Parameters can be individually accessed using $(dot.accessors).

e:
'
// First, we parse the request log and the CBOR payload inside of it
decode_log  [type="ethabidecodelog"
             data="$(jobRun.logData)"
             topics="$(jobRun.logTopics)"
             abi="SomeContractEvent(bytes32 requestID, bytes cborPayload)"]

decode_cbor [type="cborparse"
             data="$(decode_log.cborPayload)"]

// Then, we use the decoded request parameters to make an HTTP fetch
fetch [type="http" url="$(decode_cbor.fetchURL)" method=GET]
parse [type="jsonparse" path="$(decode_cbor.jsonPath)" data="$(fetch)"]
'

t: divide:
Divide the input by divisor.

p:
input: value to be divided. #dtnum.
divisor: value by which to divide input. #dtnum.
precision: num of decimal places to retain in result. #dtnum.

o:
Result of division.

e:
'
my_divide_task [type="divide"
                input="$(json_parse_result)"
                divisor="3"
                precision="2"]
'
Input 10 returns 3.33.

t: ethabidecodelog
Decodes a log emitted by an ETH contract.

p:
abi: a canonical ETH log event definition. Formatted exactly as in Solidity. Each argument must be named. e.g.:
'NewRound(uint256 indexed roundId, address indexed startedBy, uint256 startedAt)',
'AuthorizedSendersChanged(address[] senders)'.
data: ABI-encoded log data. Possible data types: a byte array OR a hex-encoded string beginning with 0x
but generally should just be set to $(jobRun.logData)
topics: the ABI-encoded log topics (i.e., the indexed parameters). Possible data types: an array of bytes32 values OR an array of hex-encoded bytes32 values beginning with 0x
but generally should just be set to $(jobRun.logTopics)

o:
Map containing the decoded values.

e:
'
decode [type="ethabidecodelog"
        abi="NewRound(uint256 indexed roundId, address indexed startedBy, uint256 startedAt)"
        data="$(jobRun.logData)"
        topics="$(jobRun.logTopics)"]
'
returns map with the following schema:
'
{
    "roundId": ...,   // a number
    "startedBy": ..., // an address
    "startedAt": ..., // a number
}
'

t: ethabidecode
Decode ETH ABI-encoded payload, typically the result of an ETH Call task.

p:
abi: a canonical ETH ABI argument string. Formatted exactly as in Solidity. Each argument must be named. e.g.:
uint256 foo, bytes32 bar, address[] baz
address a, uint80[3][] u, bytes b, bytes32 b32
data: ABI-encoded payload to decode. Possible data types: a byte array OR a hex-encoded string beginning with 0x

o:
Map containing the decoded values.

e:
'
decode [type="ethabidecode"
        abi="bytes32 requestID, uint256 price, address[] oracles"
        data="$(eth_call_result)"]
'
Returns the following schema:
'
{
    "requestID": ..., // [32]byte value
    "price": ...,     // a number
    "oracles": [
        "0x859AAa51961284C94d970B47E82b8771942F1980",
        "0x51DE85B0cD5B3684865ECfEedfBAF12777cd0Ff8",
        ...
    ]
}
'

t: ethabiencode
Encodes a bytes payload according to ETH ABI encoding, typically in order to perform an ETH Call or an ETH Tx.

p:
abi: a canonical ETH ABI argument string. Formatted exactly as in Solidity. Each argument must be named. If a method name is provided, the 4-byte method signature is prepended to result. e.g.:
'uint256 foo, bytes32 bar, address[] baz'
'fulfillRequest(bytes32 requestID, uint256 answer)'
data: a map of the values to be encoded. The task will make a best effort at converting values to the appropriate types.

o:
A byte array.

e:
'
encode [type="ethabiencode"
        abi="fulfillRequest(bytes32 requestID, uint256 answer)"
        data="{\\"requestID\\": $(foo), \\"answer\\": $(bar)}"
        ]
'

t: ethcall
Make non-mutating contract call.

p:
contract: the address of the contract to call.
data: Data to attach (including the fn selector).
gas: Amount of gas to attach to tx.
from: Address with which call should be made. Default: zero address.
gasPrice: Gas price. Default: 0.
gasTipCap: Gas tip cap (EIP-1559). Default: 0.
gasFeeCap: Gas fee cap (EIP-1559). Default: 0.
gasUnlimited: Boolean. Sets if unlimited gas should be provided for call. If set to true, do not set gas parameter.
evmChainID: Optional.

o:
An ABI-encoded byte array containing the return value of the contract fn.

e:
'
encode_call  [type="ethabiencode"
              abi="checkUpkeep(bytes data)"
              data="{ \\"data\\": $(upkeep_data) }"]

call          [type="ethcall"
               contract="0xa36085F69e2889c224210F603D836748e7dC0088"
               data="$(encode_call)"
               gas="1000"]

decode_result [type="ethabidecode"
               abi="bool upkeepNeeded, bytes performData"
               data="$(call)"]

encode_call -> call -> decode_result
'

t: ethtx
Makes mutating tx.

p:
from: one or more addresses of EOA from which to send the tx. Left blank, it will select a random address on every send.
to: address of the contract to make tx to.
data: data to attach to the call (including fn selector). Likely the output of an ethabiencode task.
gasLimit: amount of gas to attach to tx.
txMeta: a map of metadata for debugging.
minConfirmations: min num of confirmations required before this task will continue.
evmChainID: optional.
failOnRevert: optional. boolean. allows a node operator's UI to display and color the status of task depending on tx status. default: false.

o:
The hash of the tx attempt.

e:
'
encode_tx    [type="ethabiencode"
              abi="performUpkeep(bytes performData)"
              data="{ \\"data\\": $(upkeep_data) }"]

submit_tx    [type="ethtx"
               to="0xa36085F69e2889c224210F603D836748e7dC0088"
               data="$(encode_tx)"
               failOnRevert="true"]

encode_tx -> submit_tx
'

t: hexdecode
Decodes hex encoded string.

p:
input: must have prefix 0x.

o:
Decoded bytes.

e:
'
my_hexdecode_task [type="hexdecode" input="0x12345678"]
'
Input of 0x12345678 will return [0x12, 0x34, 0x56, 0x78].

t: hexencode
Encodes bytes/string/int into a hex string.

p:
input: Byte array, string or int.

o:
Hex string prefixed with "0x" (or empty string if input was empty).

e:
'
my_hexencode_task [type="hexencode" input="xyz"]
'
Input string "xyz" will return "0x78797a" (the ascii values of the chars).

t: http
Make HTTP requests.

p:
method: HTTP method.
url: URL to make request to.
requestData (optional): a statically-defined payload to be sent.
allowUnrestrictedNetworkAccess (optional): permits task to access a URL at localhost.
headers (optional): array of strings. Num of strings must be even. e.g.: foo [type=http headers="[\\"X-Header-1\\", \\"value1\\", \\"X-Header-2\\", \\"value2\\"]"]

o:
String containing response body.

e:
'
my_http_task [type="http"
              method=PUT
              url="http://chain.link"
              requestData="{\\"foo\\": $(foo), \\"bar\\": $(bar), \\"jobID\\": 123}"
              allowUnrestrictedNetworkAccess=true
              ]
'

t: jsonparse
Parses a JSON payload and extracts a value at a given keypath.

p:
data: the JSON string. Can be: string OR byte array
path: keypath to extract. Must be separated by specified value of separator param.
separator: (optional) custom path key separator. Default: ','.
lax (optional): if false (or omitted), and keypath doesn't exist, task will error. If true, task will return nil to next task.

o:
The value at provided keypath.

e:
'
my_json_task [type="jsonparse"
              data="$(http_fetch_result)"
              path="data,0,price"]
'

Given
'
{
  "data": [{ "price": 123.45 }, { "price": 678.9 }]
}
'
will return 123.45 (float64).

t: length
Returns length of a byte array or string.

p:
input: To get length of.

o:
The length.
For strings containing multi-byte unicode chars, output is length in bytes and not num of chars.

e:
'
my_length_task [type="length" input="xyz"]
'
Input "xyz" will return 3.

t: lessthan
Returns boolean result of left < right.

p:
left: #dtnum.
right: #dtnum.

o:
Result of comparison.

e:
'
my_lessthan_task [type="lessthan" left="3" right="10"]
'
will return true

t: lowercase
Returns lowercase version of input.

p:
input: a string.

o:
Lowercase string.

e:
'
my_lowercase_task [type="lowercase" input="Hello World!"]
'

t: mean
Accepts numerical inputs. Returns mean (average).

p:
values: array of values.
allowedFaults: (optional)
precision: the num of decimal places in result.

o:
Mean of the values.

e:
'
my_mean_task [type="mean"
              values=<[ $(fetch1), $(fetch2), $(fetch3) ]>
              precision=2
              allowedFaults=1]
'
If values array is 2, 5 and 20, the task will return 9.

t: median
Accepts numerical values and returns median of them.

p:
values: an array of values.
allowedFaults: (optional)

o:
The median of the values.

e:
'
my_median_task [type="median"
                values=<[ $(fetch1), $(fetch2), $(fetch3) ]>
                allowedFaults=1]
'
Given inputs 2, 5, and 20, the task will return 5.

t: memo
Returns its value as a result.

p:
value: value to return. Possible data types: number OR boolean OR float OR string OR array

o:
The value.

e:
'
memo [type="memo" value="10"]
'
Will return 10

t: merge
Returns merged value of two maps.

p:
left: left map.
right: right map. Overwrites left side.

o:
Returns combined map of left and right. If merged map is invalid, returns null.

e:
'
merge [type="merge" left="{\\"foo\\":\\"abc\\", \\"bar\\":\\"123\\"}" right="{\\"bar\\":\\"xyz\\", \\"biz\\":\\"buzz\\"}"]
'
would return:
'
{ "foo": "abc", "bar": "xyz", "biz": "buzz" }
'

t: mode
Accepts multiple numerical inputs and returns mode (most common) of them. If more than one value occurs the max num of times, it returns all of them.

p:
values: an array of values from which to select a mode.
allowedFaults: (optional)

o:
    Map containing two keys:
'
{
    "results": [ ... ], // Array containing all values that occurred the max num of times
    "occurrences": ..., // The num of times those values occurred
}
'

e:
'
my_mode_task [type="mode"
                values=<[ $(fetch1), $(fetch2), $(fetch3), $(fetch4), $(fetch5), $(fetch6), $(fetch7), $(fetch8) ]>
                allowedFaults=3]
'

Given a values array of [ 2, 5, 2, "foo", "foo" "bar", "foo", 2 ] will return:
'
{
  "results": [2, "foo"],
  "occurrences": 3
}
'

t: multiply

p:
input: #dtnum.
times: #dtnum.

o:
result

e:
'
my_multiply_task [type="multiply" input="$(json_parse_result)" times=3]
'

t: sum

p:
values: an array of values.
allowedFaults: (optional)

o:
Sum of the values in 'values'.

e:
'
my_sum_task [type="sum"
             values=<[ $(f1), $(f2), $(f3) ]>
             allowedFaults=1]
'
If f1=2,f2=5,f3=20, task will return 27.

t: uppercase
Returns uppercase of input string.

p:
input: str.

o:
uppercase str.

e:
'
my_uppercase_task [type="uppercase" input="Hello!"]
'
input Hello! will return HELLO!

User's current job spec: """
${toml}
"""

User's request for the ${aiNodeId} task(s): """
${prompt}
"""
`
}