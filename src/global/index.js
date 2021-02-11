const PDF_URL = process.env.REACT_APP_AWS_CLOUD+'/public/pdfs';
const baseURL = 'http://localhost:3333'; //process.env.REACT_APP_API_URL

const EnumAircraftType = [
    {
        key: 'aircraft',
        value: 'Aeronave convencional',
    },
    {
        key: 'helicopter',
        value: 'Helicoptéro',
    },
    {
        key: 'seaplane',
        value: 'Hidroavião',
    },
    {
        key: 'jet',
        value: 'Jato',
    },
];

const EnumAircraftCarrier = [
    {
        key: 'small',
        value: 'Pequeno',
    },
    {
        key: 'medium',
        value: 'Médio',
    },
    {
        key: 'large',
        value: 'Grande',
    }
];

const EnumAircraftNumberEngines = [
    {
        key: 'monomotor',
        value: 'Monomotor',
    },
    {
        key: 'bimotor',
        value: 'Bimotor',
    },
];

const EnumAircraftEngineType = [
    {
        key: 'turboprop',
        value: 'Turbo Hélice',
    },
    {
        key: 'piston',
        value: 'Pistão',
    },
    {
        key: 'helicopter',
        value: 'Helicoptero',
    }
];

const EnumAircraftStatus = [
    {
        key: 'available',
        value: 'Disponível',
    },
    {
        key: 'unavailable',
        value: 'Indisponível',
    },
    {
        key: 'unavailable_per_flight',
        value: 'Indisponível por voo',
    },
    {
        key: 'unavailable_per_maintenance',
        value: 'Indisponível por manutenção',
    }
];

const EnumAircraftImageView = [
    {
        key: 'exterior',
        value: 'Exterior',
    },
    {
        key: 'interior',
        value: 'Interior',
    },
];

const EnumFlightSegmentType = [
    {
        key: 'trip',
        value: 'Viagem',
    },
    {
        key: 'transfer',
        value: 'Translado',
    },
];

const EnumTypeOfTransport = [
    {
        key: 'passengers',
        value: 'Passageiros',
    },
    {
        key: 'aeromedical',
        value: 'Aeromédico',
    },
];

export {
    PDF_URL,
    baseURL,
    EnumAircraftType,
    EnumAircraftCarrier,
    EnumAircraftNumberEngines,
    EnumAircraftEngineType,
    EnumAircraftStatus,
    EnumAircraftImageView,
    EnumFlightSegmentType,
    EnumTypeOfTransport,
};