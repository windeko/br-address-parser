
const dataDriven = require('data-driven');
const { assert } = require('chai');
const parser = require('../parser');
const addresses = require('./addresses.json');

suite('Parser', () => {

    test('Should sanitize address', () => {
        const addressWithSpaces = 'RUA  DA  GROELANDIA    54-APTO 104 -BAIRRO';
        const expected = 'RUA DA GROELANDIA 54 - APTO 104 - BAIRRO';
        const actual = parser.sanitizeAddress(addressWithSpaces);
        assert.strictEqual(actual, expected);
    })

    addresses
    .filter(x => x.expected !== null)
    .forEach(({ address, expected }) => {
        test(`Should parse ${address}`, () => {
            const actual = parser.parse(address);
            assert.deepEqual(actual, expected);
        })
    });
    addresses
    .filter(x => x.expected === null)
    .forEach(({ address }) => {
        test(`Should NOT parse ${address}`, () => {
            const actual = parser.parse(address);
            if (actual !== null){
                console.log(actual);
            }
            assert.isNull(actual);
        });
    });
})
