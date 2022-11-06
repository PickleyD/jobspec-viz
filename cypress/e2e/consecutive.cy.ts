import { Test, generateTest } from "./task"

const tasks: Array<Test> = [
    {
        task: "http", name: "http request", inputs: [], options: {
            method: "GET",
            url: "http://dummy.url",
            allowUnrestrictedNetworkAccess: "true"
        },
        mockResponse: "{\"page\":2,\"per_page\":6}"
    },
    {
        task: "jsonparse", name: "jsonparse the http response", inputs: [], options: {
            path: "page",
        },
        want: { value: "2", type: "int" }
    }
]

const recursiveExecute = (tasks: Array<Test>, currInput: Array<any> = []): any => {
    return generateTest(tasks[0], currInput).then(response => {
        tasks.length > 1 && recursiveExecute(tasks.slice(1), [response.val64])
    })
}

describe("consecutive", () => {
    it("http request then jsonparse", () => {
        recursiveExecute(tasks)
    })
})
