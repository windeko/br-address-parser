const blacklist = {
    address: /(apto|bloco|apartamento|casa|bl\s\d+)/gi
};

const sanitizeAddress = (completeAddress) => {
    return completeAddress
        .replace(/(.)-(.)/gi, '$1 - $2')
        .replace(/\s\s+/gi, ' ');
};

const parse = (completeAddress) => {
    const sanitizedAddress = sanitizeAddress(completeAddress);
    console.log(sanitizedAddress);
    const patterns = [
        // ADDRESS - COMPLEMENT - NEIGHBORHOOD - CITY - DF
        /(?<address>.*)\s[-,]\s(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>DF)/i,
        // BR-999 - 10 - NEIGHBORHOOD - CITY - ST
        /(?<address>^(\w{2})[\s-]\d+)\s[-,]\s(?<number>(\d+|S\/?N))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - N99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))(\s[-,]\s|\s?,\s?)(((N|CASA\s)(?<number>\d+|S\/?N)))(\s-\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))(\s[-,]\s|\s?,\s?)(?<number>(\d+|S\/?N))(\s-\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS 99 COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(?<number>(\d+|S\/?N))\s(-\s)?(?<complement>(CASA\s).*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS 99 - COMPLEMENT - NEIGHBORHOOD - CITY - ST
        /(?<address>.*(?<!\s))\s(?<number>(\d+|S\/?N))(\s-\s|\s)(?<complement>.*)\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i,
        // ADDRESS - 99 - NEIGHBORHOOD - CITY - ST
        /(?<address>.*)\s[-,]\s(?<number>(\d+|S\/?N))\s[-,]\s(?<neighborhood>.*)\s[-,]\s(?<city>.*)\s[-,]\s(?<state>\w{2})/i
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
        const blacklisted = Object.keys(blacklist).some((key) => {
            return blacklist[key].test(result.groups[key]);
        });
        if (blacklisted) {
            return null;
        }
        return {
            address: result.groups.address,
            number: (result.groups.number === undefined) ? '' : result.groups.number,
            complement: (result.groups.complement === undefined) ? '' : result.groups.complement,
            neighborhood: result.groups.neighborhood,
            city: result.groups.city,
            state: result.groups.state
        };
    }
    return null;
}

module.exports = {
    sanitizeAddress,
    parse
};