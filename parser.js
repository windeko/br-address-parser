const blacklist = ({
    street,
    number,
    complement,
    neighborhood,
    city,
    state
}) => {
    if (/df/i.test(state)) {
        return false;
    }
    if (/^(RUA|R)$/i.test(street)) {
        return true;
    }
    return /(apto|bloco|apartamento|casa|ap|bl\s\d+)\b/gi.test(street);
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
        street: parsedAddress.street
            .replace(/\s,\s/gi, ', ')
    }
}

const applyDefault = (parsedAddress, defaultFields) => {
    const emptyKeys = Object.keys(parsedAddress).filter((key) => parsedAddress[key].trim() === '');
    emptyKeys.forEach((key) => {
        if (defaultFields[key]) {
            parsedAddress[key] = defaultFields[key];
        }
    });
    return parsedAddress;
};

const parse = (completeAddress, defaultFields) => {
    const sanitizedAddress = sanitizeAddress(completeAddress);
    console.debug(sanitizedAddress);
    const patterns = [
        // LINHA 99 - COMPLEMENT - NEIGHBORHOOD - CITY - DF
        /(?<street>LINHA\s\d+)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - COMPLEMENT - NEIGHBORHOOD - CITY - DF
        /(?<street>.*)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>DF)/i,
        // STREET - COMPLEMENT - NUMBER - NEIGHBORHOOD - CITY - GO
        /(?<street>.*(?<!\s))(\s[-,]\s|\s?,\s?)((((NR?|CASA|NUMERO)\s?)(?<number>\d+|S\/?N)))(\s[-/]\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>GO)/i,
        // STREET - COMPLEMENT - NEIGHBORHOOD - CITY - GO
        /(?<street>.*(?<!\s))\s-\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>GO)/i,
        // BR-999 - 10 - NEIGHBORHOOD - CITY - ST
        /(?<street>^(\w{2})[\s-]\d+)\s[-,]\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - N99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))(\s[-,]\s|\s?,\s?)((((NR?|CASA|NUMERO)\s?)(?<number>\d+|S\/?N)))(\s[-/]\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))(\s[-,]\s|\s?,\s?)(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))(\s[-/]\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - 99/COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))(\s[-,]\s|\s?,\s?)(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s?\/\s?(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET 99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(-\s)?(?<complement>((CASA|APTO|AP)\b\s).*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - 99 X - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(?<complement>\w\s-.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - 99 - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s[-,]\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s-\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET 00 COMPLEMENT- COMPLEMENT2 99 - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s(?<complement>.*-.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // STREET - STREET2 99 - NEIGHBORHOOD - CITY - ST
        /(?<street>.*(?<!\s))\s(((NR?|CASA|NUMERO)\s?)?(?<number>(\d+|S\/?N)))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // RURAL WITH COMPLEMENT
        /(?<street>^(SITIO|FAZENDA|ESTRADA).*)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // RURAL WITHOUT COMPLEMENT
        /(?<street>^(SITIO|FAZENDA|ESTRADA).*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i
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
        const parsedAddress = formatAddress({
            street: result.groups.street,
            number: (result.groups.number === undefined) ? '' : result.groups.number,
            complement: (result.groups.complement === undefined) ? '' : result.groups.complement,
            neighborhood: result.groups.neighborhood,
            city: result.groups.city,
            state: result.groups.state
        });
        if (defaultFields) {
            applyDefault(parsedAddress, defaultFields);
        }
        return parsedAddress;
    }
    return null;
}

module.exports = {
    sanitizeAddress,
    parse,
    applyDefault
};