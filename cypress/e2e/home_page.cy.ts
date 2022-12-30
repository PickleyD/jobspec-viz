describe('The Home Page', () => {
    it('successfully loads', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="open-template-empty"]').click();
        cy.get('[data-cy="task_0-handle-bottom"]')
            .trigger("mousemove")
            .trigger("mousedown", { button: 0 })
        cy.get('.react-flow__pane')
            .trigger("mouseup", { button: 0, force: true, clientX: 700, clientY: 200, screenX: 700, screenY: 200, pageX: 700, pageY: 200 });
    })
})

export { }