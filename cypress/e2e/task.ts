export type Var = {
    value?: string;
    values?: Array<string>; // Ugly way of handling flat arrays
    type?: string;
    keep?: any; // Convert to base64 but don't try any type conversions beforehand
}

export type Test = {
    task: string;
    name: string;
    inputs: Array<Var>;
    options?: { [key: string]: any };
    vars?: { [key: string]: Var };
    jobRun?: { [key: string]: Var };
    jobSpec?: { [key: string]: Var };
    want?: Var;
    want64?: string;
    expectError?: boolean;
    mockResponse?: any;
    wantSideEffectData?: Var;
}

export const generateTest = (test: Test, inputs64Override?: Array<string>) => {
    return handleVarsConversion(test.vars, test.jobRun, test.jobSpec, test.inputs)
        .then((response) => {
            return performTask(test, response.body.vars64, inputs64Override || response.body.inputs64)
        })
}

const handleVarsConversion = (vars: Test["vars"], jobRun: Test["jobRun"], jobSpec: Test["jobSpec"], inputs: Test["inputs"]) => {
    return cy.request(
        "POST",
        "api/var-helper",
        {
            ...vars && { vars },
            ...jobRun && { jobRun },
            ...jobSpec && { jobSpec },
            ...inputs && { inputs },
        },
    )
}

const performTask = (test: Test, vars64?: string, inputs64?: Array<string>) => {
    return cy.request(
        'POST',
        'api/task',
        {
            id: "task_0",
            name: test.task,
            options: test.options,
            ...inputs64 && { inputs64: inputs64 },
            ...vars64 && { vars64: vars64 },
            ...test.mockResponse && { mockResponse: test.mockResponse }
        }
    ).then(
        (taskResponse) => {
            return cy.request(
                "POST",
                "api/var-helper",
                {
                    // vars: {
                    //     ...test.vars, "task_0": {
                    //         keep: test.want?.value
                    //     }
                    // },
                    ...test.want && { want: test.want },
                    ...test.wantSideEffectData && { wantSideEffectData: test.wantSideEffectData }
                },
            ).then((varHelperResponse) => {
                if (test.want64) {
                    expect(taskResponse.body.val64).to.eq(test.want64)
                }
                else if (test.want) {
                    expect(taskResponse.body.val64).to.eq(varHelperResponse.body.want64)
                }

                if (test.expectError) {
                    expect(taskResponse.body.error).to.not.empty
                }

                if (test.wantSideEffectData) {
                    expect(taskResponse.body.sideEffectData64).to.eq(varHelperResponse.body.wantSideEffectData64)
                }

                return taskResponse.body
            })
        }
    )
}
