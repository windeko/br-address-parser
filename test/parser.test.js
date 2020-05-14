
const dataDriven = require('data-driven');
const { assert } = require('chai');
const parser = require('../parser');
const addresses = require('./addresses.json');

suite('Parser', () => {

    test('Should sanitize address', () => {
        const addressWithSpaces = 'RUA  DA  GROELANDIA,    1.554B,-APTO. 104B03 -,BAIRRO';
        const expected = 'RUA DA GROELANDIA , 1554 B - APTO 104 B 03 - BAIRRO';
        const actual = parser.sanitizeAddress(addressWithSpaces);
        assert.strictEqual(actual, expected);
    });

    test('Should sanitize address', () => {
        const addressWithSpaces = 'R SILVIO ROMERO-8-AP 504 - SANTA TERESA - RIO DE JANEIRO - RJ';
        const expected = 'R SILVIO ROMERO - 8 - AP 504 - SANTA TERESA - RIO DE JANEIRO - RJ';
        const actual = parser.sanitizeAddress(addressWithSpaces);
        assert.strictEqual(actual, expected);
    });

    test('Should sanitize with empty complement', () => {
        const addressWithSpaces = 'RUA  DA  GROELANDIA,    1.554 -  - BAIRRO';
        const expected = 'RUA DA GROELANDIA , 1554 - BAIRRO';
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
