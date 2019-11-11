beforeEach(() => {
  cy.visit('http://localhost:3000')
  cy.wait(5000)

  // copied from https://github.com/cypress-io/cypress/issues/136#issuecomment-479438963
  cy.get('iframe').then($iframe => {
    const $body = $iframe.contents().find('body')
    cy.wrap($body).as('iframe')
  })
})

it('shows the preview', () => {
  cy.get('iframe')
    .should('have.attr', 'sandbox', 'allow-scripts')
    .should('have.attr', 'title', 'Html Preview')

  cy.get('@iframe')
    .find('h1')
    .contains('hello world')
})

it('updates the preview', () => {
  cy.get('textarea')
    .type('{leftarrow}'.repeat(5) + '!')
    .get('@iframe')
    .find('h1')
    .contains('hello world!')
})