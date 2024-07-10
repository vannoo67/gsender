export const ALTMILL_DEFAULT = {
    '$0': '5.0',
    '$1': '255',
    '$2': '0',
    '$3': '6',
    '$4': '0',
    '$5': '15',
    '$6': '1',
    '$8': '0',
    '$9': '1',
    '$10': '511',
    '$11': '0.010',
    '$12': '0.002',
    '$13': '0',
    '$14': '14',
    '$15': '0',
    '$16': '0',
    '$17': '0',
    '$18': '0',
    '$19': '0',
    '$24': '150.0',
    '$25': '4300.0',
    '$26': '25',
    '$27': '1.500',
    '$28': '0.100',
    '$29': '0.0',
    '$30': '24000.000',
    '$31': '7500.000',
    '$32': '0',
    '$33': '1000.0',
    '$34': '0.0',
    '$35': '0.0',
    '$36': '100.0',
    '$37': '0',
    '$39': '1',
    '$41': '0',
    '$42': '2',
    '$43': '1',
    '$44': '4',
    '$45': '3',
    '$46': '0',
    '$47': '0',
    '$56': '5.0',
    '$57': '100.0',
    '$58': '-5.0',
    '$59': '500.0',
    '$60': '1',
    '$61': '3',
    '$62': '0',
    '$63': '3',
    '$64': '0',
    '$65': '0',
    '$70': '11',
    '$100': '320.000',
    '$101': '320.000',
    '$102': '800.000',
    '$103': '19.753',
    '$110': '15000.000',
    '$111': '15000.000',
    '$112': '6000.000',
    '$113': '8000.000',
    '$120': '1500.000',
    '$121': '1500.000',
    '$122': '1500.000',
    '$123': '1000.000',
    '$130': '1260.000',
    '$131': '1248.000',
    '$132': '170.000',
    '$133': '0.000',
    '$160': '0.000',
    '$161': '0.000',
    '$162': '0.000',
    '$163': '0.000',
    '$171': '0.000',
    '$172': '0.000',
    '$173': '0.000',
    '$300': 'grblHAL',
    '$301': '0',
    '$302': '192.168.5.1',
    '$303': '192.168.5.1',
    '$304': '255.255.255.0',
    '$305': '23',
    '$307': '80',
    '$308': '21',
    '$340': '5.0',
    '$341': '0',
    '$342': '30.0',
    '$343': '25.0',
    '$344': '200.0',
    '$345': '200.0',
    '$346': '1',
    '$347': '5.0',
    '$348': '2.500',
    '$349': '25.000',
    '$370': '0',
    '$372': '0',
    '$374': '3',
    '$375': '50',
    '$376': '1',
    '$384': '0',
    '$392': '11.0',
    '$393': '1.0',
    '$395': '0',
    '$398': '128',
    '$450': '1',
    '$451': '2',
    '$452': '4',
    '$453': 'G4P0',
    '$454': 'G4P0',
    '$455': 'G4P0',
    '$456': '0',
    '$457': '2',
    '$458': '0',
    '$459': '2',
    '$463': '8193',
    '$464': '8451',
    '$465': '18',
    '$466': '34',
    '$467': '1',
    '$468': '50.0',
    '$469': '60.0',
    '$470': '60.0',
    '$471': '100.0',
    '$478': '3',
    '$481': '0',
    '$484': '0',
    '$486': '0',
    '$511': '7',
    '$512': '5',
    '$513': '8',
    '$520': '0',
    '$521': '0',
    '$522': '0',
    '$534': '0',
    '$664': '0',
    '$665': '1',
    '$666': '0',
    '$668': '1',
    '$730': '255.000',
    '$731': '0.000',
    '$733': '1000.0',
    '$734': '0.0',
    '$735': '0.0',
    '$736': '100.0',
    '$741': '0.000',
    '$742': '0.000',
    '$743': '0',
    '$744': '15',
    '$745': '0'
};

export const DEFAULT = {
    ...ALTMILL_DEFAULT,
};

export const SPINDLE_KIT = {
    ...ALTMILL_DEFAULT,
};


export const ALTMILL_ORDERED = new Map();
ALTMILL_ORDERED.set('$23', 1);
ALTMILL_ORDERED.set('$22', 79);
ALTMILL_ORDERED.set('$21', 1);
ALTMILL_ORDERED.set('$20', 1);
ALTMILL_ORDERED.set('$40', 1);
ALTMILL_ORDERED.set('$170', 0);
ALTMILL_ORDERED.set('$462', 8192);

export const SPINDLE_ORDERED = new Map();
SPINDLE_ORDERED.set('$395', 6);
SPINDLE_ORDERED.set('$23', 1);
SPINDLE_ORDERED.set('$22', 79);
SPINDLE_ORDERED.set('$21', 1);
SPINDLE_ORDERED.set('$20', 1);
SPINDLE_ORDERED.set('$476', 2);
ALTMILL_ORDERED.set('$170', 0);
ALTMILL_ORDERED.set('$462', 8192);
ALTMILL_ORDERED.set('$40', 1);
