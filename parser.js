const blacklist = ({
    address,
    number,
    complement,
    neighborhood,
    city,
    state
}) => {
    if (/df/i.test(state)) {
        return false;
    }
    if (/^(RUA|R)$/i.test(address)) {
        return true;
    }
    return /(apto|bloco|apartamento|casa|ap|bl\s\d+)\b/gi.test(address);
};

const sanitizeAddress = (completeAddress) => {
    return completeAddress
        .replace(/(,\-|\-,)/g, '-')
        .replace(/(\d)\.(\d{2,})/g, '$1$2')
        .replace(/\.\s/g, ' ')
        .replace(/(.)([-,])/gi, '$1 $2')
        .replace(/([-,])(.)/gi, '$1 $2')
        .replace(/(\d+)([a-z]+)(\d+)/i, '$1 $2 $3')
        .replace(/([a-z]+)(\d+)([a-z]+)/i, '$1 $2 $3')
        .replace(/(\d+)([a-z]+)/i, '$1 $2')
        .replace(/([a-z]+)(\d+)/i, '$1 $2')
        .replace(/\s\s+/gi, ' ')
        .replace(/\-\s\-/, '-');
};

const formatAddress = (parsedAddress) => {
    return {
        ...parsedAddress,
        address: parsedAddress.address
            .replace(/\s,\s/gi, ', ')
    }
}

const parse = (completeAddress) => {
    const sanitizedAddress = sanitizeAddress(completeAddress);
    console.log(sanitizedAddress);
    const patterns = [
        // ADDRESS - COMPLEMENT - NEIGHBORHOOD - CITY - DF
        /(?<address>.*)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>DF)/i,
        // ADDRESS - COMPLEMENT - NEIGHBORHOOD - CITY - GO
        /(?<address>.*(?<!\s))\s-\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>GO)/i,
        // BR-999 - 10 - NEIGHBORHOOD - CITY - ST
        /(?<address>^(\w{2})[\s-]\d+)\s[-,]\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - N99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))(\s[-,]\s|\s?,\s?)((((NR?|CASA|NUMERO)\s?)(?<number>\d+|S\/?N)))(\s-\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))(\s[-,]\s|\s?,\s?)(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))(\s-\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99/COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))(\s[-,]\s|\s?,\s?)(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s?\/\s?(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS 99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(-\s)?(?<complement>((CASA|APTO|AP)\b\s).*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99 X - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(?<complement>\w\s-.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99 - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s[-,]\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s-\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS 00 COMPLEMENT- COMPLEMENT2 99 - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(?<complement>.*-.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - ADDRESS2 99 - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // RURAL WITH COMPLEMENT
        /(?<address>^(SITIO|FAZENDA|ESTRADA).*)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // RURAL WITHOUT COMPLEMENT
        /(?<address>^(SITIO|FAZENDA|ESTRADA).*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i
    ];
    const pattern = patterns.find((p, index) => {
        const pat = p.test(sanitizedAddress);
        if (pat){
            console.log(`Pattern ${index}: ${p}`);
            return pat;
        };
        return false;
    })
    if (!pattern) {
        return null;
    }
    const result = pattern.exec(sanitizedAddress);
    if (result && result.groups) {
        const blacklisted = blacklist(result.groups);
        if (blacklisted) {
            return null;
        }
        return formatAddress({
            address: result.groups.address,
            number: (result.groups.number === undefined) ? '' : result.groups.number,
            complement: (result.groups.complement === undefined) ? '' : result.groups.complement,
            neighborhood: result.groups.neighborhood,
            city: result.groups.city,
            state: result.groups.state
        });
    }
    return null;
}

module.exports = {
    sanitizeAddress,
    parse
};