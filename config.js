var devices = [
    {
        name = 'lamp',
        id = '5744c52e-d6d2-4887-bb10-24e20ad4e6f3',
        type = 'LED',
        vendor = 'BML',
        model = 'SPYDR-1200',
        dimmable = 'true',
        dimPort = 'P9_14'
        powerPort = 'P8_14'
    },
    {
        name = 'fan',
        id = '273a2448-eaed-4b49-b026-79ea335ccdaf',
        type = 'in-line',
        vendor = 'Prima Klima',
        model = 'PK125-EC',
        dimmable = 'true',
        dimPort = 'P8_13'
        powerPort = 'P8_12'
    },
    {
        name = 'dht',
        id = '13ef5c15-1c5f-4a97-b2ed-7534eb6d4e24',
        pin = 'P9_23'
    },
    {
        name = 'lamp',
        id = 'a3370a84-2aac-4f4c-9399-c6c4ac681175',
        type = 'LED',
        vendor = 'BML',
        model = 'SPYDR-600',
        dimmable = 'true',
        dimPort = 'P9_14'
        powerPort = 'P8_16'
    },
]

var relays = [
    {
        pin: 'P8_8',
        color: 'red',
        id: 1,
        volts: 237,
        ainPin: 'P9_35'
    },
    {
        pin: 'P8_9',
        color: 'blue',
        id: 2,
        volts:237,
        ainPin: ''
    }
]
