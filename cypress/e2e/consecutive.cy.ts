import { Test, generateTest } from "./task"

const tasks: Array<Test> = [
    {
        task: "http", name: "http request", inputs: [], options: {
            method: "GET",
            url: "https://reqres.in/api/users?page=2",
            allowUnrestrictedNetworkAccess: "true"
        },
        want: `{"page":2,"per_page":6,"total":12,"total_pages":2,"data":[{"id":7,"email":"michael.lawson@reqres.in","first_name":"Michael","last_name":"Lawson","avatar":"https://reqres.in/img/faces/7-image.jpg"},{"id":8,"email":"lindsay.ferguson@reqres.in","first_name":"Lindsay","last_name":"Ferguson","avatar":"https://reqres.in/img/faces/8-image.jpg"},{"id":9,"email":"tobias.funke@reqres.in","first_name":"Tobias","last_name":"Funke","avatar":"https://reqres.in/img/faces/9-image.jpg"},{"id":10,"email":"byron.fields@reqres.in","first_name":"Byron","last_name":"Fields","avatar":"https://reqres.in/img/faces/10-image.jpg"},{"id":11,"email":"george.edwards@reqres.in","first_name":"George","last_name":"Edwards","avatar":"https://reqres.in/img/faces/11-image.jpg"},{"id":12,"email":"rachel.howell@reqres.in","first_name":"Rachel","last_name":"Howell","avatar":"https://reqres.in/img/faces/12-image.jpg"}],"support":{"url":"https://reqres.in/#support-heading","text":"To keep ReqRes free, contributions towards server costs are appreciated!"}}`
    },
    {
        task: "jsonparse", name: "jsonparse the http response", inputs: [], options: {
            path: "page",
        }, 
        want: 2
    }
]

const recursiveExecute = (tasks: Array<Test>, currInput: Array<any> = []): any => {
    return generateTest(tasks[0], currInput).then(response => {
        tasks.length > 1 && recursiveExecute(tasks.slice(1), [response.Value])
    })
}

describe("consecutive", () => {
    it("http request then jsonparse", () => {
        recursiveExecute(tasks)
    })
})
