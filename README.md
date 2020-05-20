# br-address-parser

This module is a simple parser for Brazilian addresses. This receives a complete address string and split it in 'street', 'number', 'complement', 'neighborhood', 'city' and 'state'.

## How to install

```
npm install br-address-parser --save
```

## How to use

```javascript
const brAddressParser = require('br-address-parser');
const completeAddress = 'Av. Brasil, 1245 - Bloco 2 Ap 203 - Centro - Belo Horizonte - MG';
const parsedAddress = brAddressParser.parse(completeAddress);
```
The above example transforms the string `"Av. Brasil, 1245 - Bloco 2 Ap 203 - Centro - Belo Horizonte - MG"` into the following object: 
```json
{
    "street": "Av. Brasil",
    "number": "1245",
    "complement": "Bloco 2 Ap 203",
    "neighborhood": "Centro",
    "city": "Belo Horizonte",
    "state": "MG"
}
```

## License

This project is licensed under the terms of the [MIT license](LICENSE).
