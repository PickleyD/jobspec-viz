export type Var = {
    value?: string;
    values?: Array<string>;
    type: string;
}

export type Test = {
    task: string;
    name: string;
    inputs: Array<Var>;
    options?: { [key: string]: any };
    vars?: { [key: string]: Var };
    want: Var;
}

export const generateTest = (test: Test, inputs64Override?: Array<string>) => {
    return handleVarsConversion(test.vars, test.inputs)
        .then((response) => {
            return performTask(test, response.body.Vars64, inputs64Override || response.body.Inputs64)
        })
}

const handleVarsConversion = (vars: Test["vars"], inputs: Test["inputs"]) => {
    return cy.request(
        "POST",
        "api/var-helper",
        {
            ...vars && { vars: vars },
            ...inputs && { inputs: inputs }
        },
    )
}

const performTask = (test: Test, vars64?: string, inputs64?: Array<string>) => {
    return cy.request(
        'POST',
        'api/task',
        {
            id: "task-0",
            name: test.task,
            options: test.options,
            ...inputs64 && { inputs64: inputs64 },
            ...vars64 && { vars64: vars64 }
        }
    ).then(
        (taskResponse) => {
            return cy.request(
                "POST",
                "api/var-helper",
                {
                    vars: {
                        ...test.vars, "task-0": {
                            keep: test.want
                        }
                    },
                    want: test.want
                },
            ).then((varHelperResponse) => {
                // expect(taskResponse.body.Value).to.deep.eq(test.want)
                // expect(taskResponse.body.Val64).to.eq("wtf")
                expect(taskResponse.body.Val64).to.eq(varHelperResponse.body.Want64)
                // expect(taskResponse.body.Vars64).to.eq(varHelperResponse.body.Vars64)

                return taskResponse.body
            })
        }
    )
}
