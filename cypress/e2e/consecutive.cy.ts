import { Test, generateTest } from "./task"

const tasks: Array<Test> = [
    {
        task: "http", name: "http request", inputs: [], options: {
            method: "GET",
            url: "https://reqres.in/api/users?page=2",
            allowUnrestrictedNetworkAccess: "true"
        },
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
        tasks.length > 1 && recursiveExecute(tasks.slice(1), [response.Val64])
    })
}

describe("consecutive", () => {
    it("http request then jsonparse", () => {
        recursiveExecute(tasks)
    })
})
