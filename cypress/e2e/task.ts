export type Test = {
    task: string;
    name: string;
    inputs?: Array<string>;
    options?: { [key: string]: any };
    vars?: { [key: string]: any };
    want: any;
}

export const generateTest = (test: Test, inputsOverride?: Array<string>) => {
    return test.vars !== undefined ?
        cy.request(
            "POST",
            "api/var-helper",
            { vars: test.vars },
        ).then((varsResponse) => {
            return performTask(test, varsResponse.body.VarsAsBase64, inputsOverride)
        })
        :
        performTask(test, undefined, inputsOverride)
}

const performTask = (test: Test, vars64?: string, inputsOverride?: Array<string>) => {
    return cy.request(
        'POST',
        'api/task',
        {
            id: "task-0",
            name: test.task,
            inputs: inputsOverride || test.inputs,
            options: test.options,
            vars: vars64
        }
    ).then(
        (response) => {
            return cy.request(
                "POST",
                "api/var-helper",
                {
                    vars: {
                        ...test.vars, "task-0": {
                            keep: test.want
                        }
                    }
                },
            ).then((varsResponse) => {
                expect(response.body.Value).to.deep.eq(test.want)
                expect(response.body.Vars64).to.eq(varsResponse.body.VarsAsBase64)

                return response.body
            })
        }
    )
}
