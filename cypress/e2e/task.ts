import { encode } from "../utils/encoding/base64"

type Var = {
    value?: string;
    values?: Array<string>;
    type: string;
}

type Vars = { [key: string]: Var };

export type Test = {
    task: string;
    name: string;
    inputs?: Array<string>;
    options?: { [key: string]: any };
    vars?: Vars;
    want: any;
}

export const generateTest = (test: Test) => {
    return it(`${test.task} - ${test.name}`, () => {
        return test.vars !== undefined ?
            cy.request(
                "POST",
                "api/var-helper",
                { vars: test.vars },
            ).then((varsResponse) => {
                return performTask(test, varsResponse.body.VarsAsBase64)
            })
            :
            performTask(test)
    })
}

const performTask = (test: Test, vars64?: string) => {
    return cy.request(
        'POST',
        'api/task',
        {
            id: "task-0",
            name: test.task,
            inputs: test.inputs,
            options: test.options,
            varBytesBase64: vars64
        }
    ).then(
        (response) => {

            cy.request(
                "POST",
                "api/var-helper",
                {
                    vars: {
                        ...test.vars, "task-0": {
                            value: test.want,
                            type: ""
                        }
                    }
                },
            ).then((varsResponse) => {
                expect(response.body).to.deep.eq({
                    "Value": test.want,
                    "VarBytesBase64": varsResponse.body.VarsAsBase64
                    // "Vars": {
                    //     ...test.vars && convertRequestVarsToResultVars(test.vars),
                    //     "task-0": test.want
                    // },
                    // "VarBytesBase64": encode(JSON.stringify({
                    //     ...test.vars && convertRequestVarsToResultVars(test.vars),
                    //     "task-0": test.want
                    // }))
                })
                // return performTask(test, varsResponse.body.VarsAsBase64)
            })
        }
    )
}

const convertRequestVarsToResultVars = (vars: Vars) => Object.fromEntries(Object.entries(vars).map(([k, v]) => {
    const theVar: Var = vars?.[k] || { type: "", value: "" }
    return 'values' in theVar ? [k, convertTypes(theVar.values || [], theVar.type)] : [k, convertTypes(theVar.value || "", theVar.type)]
}))

const convertTypes = (value: string | Array<string>, type: string) => {
    return Array.isArray(value) ? value.map(val => convertType(val, type)) : convertType(value, type)
}

const convertType = (value: string, type: string) => {
    switch (type) {
        case "int": {
            return parseInt(value)
        }
    }
    return value
}