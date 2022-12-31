describe('Pipeline flow', () => {
    it('Task node creation, deletion and drag prompt', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="open-template-empty"]').click();

        cy.get('[data-cy="task_0-drag-prompt"]').should('exist')

        cy.get('[data-cy="task_0-handle-bottom"]')
            .trigger("mousemove")
            .trigger("mousedown", { button: 0 })
        cy.get('.react-flow__pane')
            .trigger("mouseup", { button: 0, force: true, clientX: 700, clientY: 200 });

        cy.get('[data-cy="task_1"]').should('exist')
        cy.get('[data-cy="task_0-drag-prompt"]').should('not.exist')
        cy.get('[data-cy="task_1-drag-prompt"]').should('not.exist')

        cy.get('[data-cy="task_0-delete"]').click();

        cy.get('[data-cy="task_0"]').should('not.exist')
        cy.get('[data-cy="task_1-drag-prompt"]').should('exist')
    })
})

export { }