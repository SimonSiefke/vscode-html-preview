/// <reference types="Cypress" />

Cypress.Commands.add('asNewIframe', { prevSubject: 'element' }, $iframe => {
  return new Cypress.Promise(resolve => {
    $iframe.on('load', () => {
      resolve($iframe.contents().find('body'))
    })
  })
})

Cypress.Commands.add('asIframe', { prevSubject: 'element' }, $iframe =>
  $iframe.contents().find('body')
)

beforeEach(() => {
  cy.visit('http://localhost:3000')
})

it('shows the preview', () => {
  cy.get('iframe')
    .asNewIframe()
    .find('h1')
    .contains('hello world')
})

it('updates the preview', () => {
  cy.get('textarea').type('{leftarrow}'.repeat(5) + '!')
  cy.get('iframe')
    .asIframe()
    .find('h1')
    .contains('hello world!')
})
