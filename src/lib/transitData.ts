// South African Transit Data - Comprehensive route information
// Includes Gautrain, MyCiti (Cape Town), and PUTCO Bus Routes

export type TransitSystem = 'gautrain' | 'myciti' | 'putco';
export type RouteType = 'trunk' | 'direct' | 'area' | 'rail' | 'bus';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  system: TransitSystem;
  lines: string[];
  isInterchange?: boolean;
  parkAndRide?: boolean;
  busConnection?: boolean;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  system: TransitSystem;
  type: RouteType;
  color: string;
  stations: string[];
  path?: { lat: number; lng: number }[];
}

export interface TransitFare {
  ticketNumber: string;
  origin: string;
  destination: string;
  singleTrip: number;
  trips2?: number;
  trips4?: number;
  trips10?: number;
  trips44?: number;
}

// ============================================
// GAUTRAIN STATIONS
// ============================================
export const gautrainStations: Station[] = [
  // Main Rail Stations
  { id: 'gt-hatfield', name: 'Hatfield', lat: -25.7500, lng: 28.2380, system: 'gautrain', lines: ['north-south'], parkAndRide: true, busConnection: true },
  { id: 'gt-pretoria', name: 'Pretoria', lat: -25.7536, lng: 28.1893, system: 'gautrain', lines: ['north-south'], isInterchange: true, parkAndRide: true, busConnection: true },
  { id: 'gt-centurion', name: 'Centurion', lat: -25.8510, lng: 28.1893, system: 'gautrain', lines: ['north-south'], parkAndRide: true, busConnection: true },
  { id: 'gt-midrand', name: 'Midrand', lat: -25.9930, lng: 28.1264, system: 'gautrain', lines: ['north-south'], parkAndRide: true, busConnection: true },
  { id: 'gt-marlboro', name: 'Marlboro', lat: -26.0862, lng: 28.1097, system: 'gautrain', lines: ['north-south', 'east-west'], isInterchange: true },
  { id: 'gt-sandton', name: 'Sandton', lat: -26.1076, lng: 28.0567, system: 'gautrain', lines: ['north-south'], isInterchange: true, parkAndRide: true, busConnection: true },
  { id: 'gt-rosebank', name: 'Rosebank', lat: -26.1455, lng: 28.0436, system: 'gautrain', lines: ['north-south'], parkAndRide: true, busConnection: true },
  { id: 'gt-park', name: 'Park Station', lat: -26.1960, lng: 28.0410, system: 'gautrain', lines: ['north-south'], isInterchange: true, busConnection: true },
  { id: 'gt-rhodesfield', name: 'Rhodesfield', lat: -26.1380, lng: 28.2167, system: 'gautrain', lines: ['east-west'], parkAndRide: true, busConnection: true },
  { id: 'gt-ortambo', name: 'OR Tambo International', lat: -26.1367, lng: 28.2350, system: 'gautrain', lines: ['east-west'], isInterchange: true, busConnection: true },
];

// ============================================
// GAUTRAIN ROUTES
// ============================================
export const gautrainRoutes: Route[] = [
  {
    id: 'gt-north-south',
    name: 'North-South Line',
    description: 'Hatfield to Park Station via Pretoria, Centurion, Midrand, Sandton, Rosebank',
    system: 'gautrain',
    type: 'rail',
    color: '#DBA514',
    stations: ['gt-hatfield', 'gt-pretoria', 'gt-centurion', 'gt-midrand', 'gt-marlboro', 'gt-sandton', 'gt-rosebank', 'gt-park'],
  },
  {
    id: 'gt-east-west',
    name: 'Airport Line',
    description: 'Sandton to OR Tambo International Airport via Marlboro and Rhodesfield',
    system: 'gautrain',
    type: 'rail',
    color: '#DBA514',
    stations: ['gt-sandton', 'gt-marlboro', 'gt-rhodesfield', 'gt-ortambo'],
  },
];

// ============================================
// MYCITI STATIONS (CAPE TOWN)
// ============================================
export const mycitiStations: Station[] = [
  // Civic Centre & Waterfront Area
  { id: 'mc-civic', name: 'Civic Centre', lat: -33.9198, lng: 18.4240, system: 'myciti', lines: ['T01', 'T02', 'T03', 'T04', 'D01', 'D02', 'D03', 'D04', 'D05'], isInterchange: true },
  { id: 'mc-waterfront', name: 'Waterfront', lat: -33.9035, lng: 18.4200, system: 'myciti', lines: ['T01', 'D05'], isInterchange: true },
  { id: 'mc-gardens', name: 'Gardens', lat: -33.9330, lng: 18.4130, system: 'myciti', lines: ['101', '103', '111'] },
  { id: 'mc-seapoint', name: 'Sea Point', lat: -33.9170, lng: 18.3850, system: 'myciti', lines: ['104', '105', '108', '109', '118'] },
  { id: 'mc-campsbay', name: 'Camps Bay', lat: -33.9510, lng: 18.3770, system: 'myciti', lines: ['106', '107'] },
  { id: 'mc-houtbay', name: 'Hout Bay', lat: -34.0440, lng: 18.3530, system: 'myciti', lines: ['108', '109', '118'] },
  
  // Table View & Milnerton Area
  { id: 'mc-tableview', name: 'Table View', lat: -33.8280, lng: 18.4880, system: 'myciti', lines: ['T01', 'T02', 'T03', 'D05', '213', '214', '215', '216', '223'], isInterchange: true },
  { id: 'mc-centurycity', name: 'Century City', lat: -33.8890, lng: 18.5120, system: 'myciti', lines: ['T03', 'T04', 'D08'], isInterchange: true },
  { id: 'mc-parklands', name: 'Parklands', lat: -33.8180, lng: 18.4920, system: 'myciti', lines: ['D05', '213', '214', '216'] },
  { id: 'mc-sunningdale', name: 'Sunningdale', lat: -33.8080, lng: 18.4760, system: 'myciti', lines: ['213', '215', '223'] },
  { id: 'mc-milnerton', name: 'Milnerton', lat: -33.8680, lng: 18.4980, system: 'myciti', lines: ['T01', 'T02'] },
  { id: 'mc-bigbay', name: 'Big Bay', lat: -33.7960, lng: 18.4540, system: 'myciti', lines: ['214B', '216'] },
  { id: 'mc-melkbosstrand', name: 'Melkbosstrand', lat: -33.7250, lng: 18.4400, system: 'myciti', lines: ['T03', '214'] },
  
  // Dunoon Area
  { id: 'mc-dunoon', name: 'Dunoon', lat: -33.8140, lng: 18.5470, system: 'myciti', lines: ['T01', 'T04', 'D05', 'D08'], isInterchange: true },
  { id: 'mc-omuramba', name: 'Omuramba', lat: -33.8350, lng: 18.5380, system: 'myciti', lines: ['T04'] },
  { id: 'mc-montagugardens', name: 'Montague Gardens', lat: -33.8550, lng: 18.5280, system: 'myciti', lines: ['D08'] },
  
  // Atlantis Area
  { id: 'mc-atlantis', name: 'Atlantis', lat: -33.5640, lng: 18.4890, system: 'myciti', lines: ['T02', 'T03', '231', '233', '234', '235', '236', '237', '244'], isInterchange: true },
  { id: 'mc-mamre', name: 'Mamre', lat: -33.5190, lng: 18.4630, system: 'myciti', lines: ['234'] },
  { id: 'mc-pella', name: 'Pella', lat: -33.5070, lng: 18.5260, system: 'myciti', lines: ['235'] },
  { id: 'mc-saxonsea', name: 'Saxonsea', lat: -33.5780, lng: 18.4740, system: 'myciti', lines: ['233'] },
  { id: 'mc-sherwood', name: 'Sherwood', lat: -33.5720, lng: 18.4880, system: 'myciti', lines: ['236'] },
  { id: 'mc-robinvale', name: 'Robinvale', lat: -33.5680, lng: 18.5030, system: 'myciti', lines: ['237'] },
  { id: 'mc-avondale', name: 'Avondale', lat: -33.5610, lng: 18.4680, system: 'myciti', lines: ['244'] },
  { id: 'mc-duynefontein', name: 'Duynefontein', lat: -33.6630, lng: 18.4450, system: 'myciti', lines: ['214', '244'] },
  
  // Khayelitsha & Mitchells Plain Area
  { id: 'mc-khayelitsha-east', name: 'Khayelitsha East', lat: -34.0350, lng: 18.6780, system: 'myciti', lines: ['D01'] },
  { id: 'mc-khayelitsha-west', name: 'Khayelitsha West', lat: -34.0280, lng: 18.6450, system: 'myciti', lines: ['D02'] },
  { id: 'mc-mitchellsplain-east', name: 'Mitchells Plain East', lat: -34.0420, lng: 18.6180, system: 'myciti', lines: ['D03'] },
  { id: 'mc-mitchellsplain-tc', name: 'Mitchells Plain Town Centre', lat: -34.0490, lng: 18.6080, system: 'myciti', lines: ['D04'] },
  { id: 'mc-kapteinsklip', name: 'Kapteinsklip', lat: -34.0540, lng: 18.5980, system: 'myciti', lines: ['D04'] },
  
  // Salt River & Walmer Estate
  { id: 'mc-saltriverrail', name: 'Salt River Rail', lat: -33.9290, lng: 18.4650, system: 'myciti', lines: ['102'] },
  { id: 'mc-walmerestate', name: 'Walmer Estate', lat: -33.9350, lng: 18.4520, system: 'myciti', lines: ['102'] },
  { id: 'mc-vredehoek', name: 'Vredehoek', lat: -33.9380, lng: 18.4280, system: 'myciti', lines: ['101', '111'] },
  { id: 'mc-oranjezicht', name: 'Oranjezicht', lat: -33.9350, lng: 18.4180, system: 'myciti', lines: ['103'] },
  { id: 'mc-kloofstreet', name: 'Kloof Street', lat: -33.9290, lng: 18.4120, system: 'myciti', lines: ['113'] },
  { id: 'mc-fresnaye', name: 'Fresnaye', lat: -33.9200, lng: 18.3930, system: 'myciti', lines: ['105'] },
  { id: 'mc-hangberg', name: 'Hangberg', lat: -34.0480, lng: 18.3460, system: 'myciti', lines: ['108', '118'] },
  { id: 'mc-imizamoyethu', name: 'Imizamo Yethu', lat: -34.0370, lng: 18.3580, system: 'myciti', lines: ['109', '118'] },
  { id: 'mc-adderley', name: 'Adderley', lat: -33.9210, lng: 18.4230, system: 'myciti', lines: ['108', '109', '113', '118'] },
];

// ============================================
// MYCITI ROUTES
// ============================================
export const mycitiRoutes: Route[] = [
  // Trunk Routes with path coordinates
  { id: 'mc-T01', name: 'T01', description: 'Dunoon – Table View – Civic Centre – Waterfront', system: 'myciti', type: 'trunk', color: '#E53935', stations: ['mc-dunoon', 'mc-tableview', 'mc-milnerton', 'mc-civic', 'mc-waterfront'], path: [{ lat: -33.8140, lng: 18.5470 }, { lat: -33.8280, lng: 18.4880 }, { lat: -33.8680, lng: 18.4980 }, { lat: -33.9198, lng: 18.4240 }, { lat: -33.9035, lng: 18.4200 }] },
  { id: 'mc-T02', name: 'T02', description: 'Atlantis – Table View – Civic Centre', system: 'myciti', type: 'trunk', color: '#E53935', stations: ['mc-atlantis', 'mc-duynefontein', 'mc-melkbosstrand', 'mc-tableview', 'mc-civic'], path: [{ lat: -33.5640, lng: 18.4890 }, { lat: -33.6630, lng: 18.4450 }, { lat: -33.7250, lng: 18.4400 }, { lat: -33.8280, lng: 18.4880 }, { lat: -33.9198, lng: 18.4240 }] },
  { id: 'mc-T03', name: 'T03', description: 'Atlantis – Melkbosstrand – Table View – Century City', system: 'myciti', type: 'trunk', color: '#E53935', stations: ['mc-atlantis', 'mc-melkbosstrand', 'mc-tableview', 'mc-centurycity'], path: [{ lat: -33.5640, lng: 18.4890 }, { lat: -33.7250, lng: 18.4400 }, { lat: -33.8280, lng: 18.4880 }, { lat: -33.8890, lng: 18.5120 }] },
  { id: 'mc-T04', name: 'T04', description: 'Dunoon – Omuramba – Century City', system: 'myciti', type: 'trunk', color: '#E53935', stations: ['mc-dunoon', 'mc-omuramba', 'mc-centurycity'], path: [{ lat: -33.8140, lng: 18.5470 }, { lat: -33.8350, lng: 18.5380 }, { lat: -33.8890, lng: 18.5120 }] },
  
  // Direct Routes
  { id: 'mc-D01', name: 'D01', description: 'Khayelitsha East – Civic Centre', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-khayelitsha-east', 'mc-civic'] },
  { id: 'mc-D02', name: 'D02', description: 'Khayelitsha West – Civic Centre', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-khayelitsha-west', 'mc-civic'] },
  { id: 'mc-D03', name: 'D03', description: 'Mitchells Plain East – Civic Centre', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-mitchellsplain-east', 'mc-civic'] },
  { id: 'mc-D04', name: 'D04', description: 'Kapteinsklip – Mitchells Plain Town Centre – Civic Centre', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-kapteinsklip', 'mc-mitchellsplain-tc', 'mc-civic'] },
  { id: 'mc-D05', name: 'D05', description: 'Dunoon – Parklands – Table View – Civic Centre – Waterfront', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-dunoon', 'mc-parklands', 'mc-tableview', 'mc-civic', 'mc-waterfront'] },
  { id: 'mc-D08', name: 'D08', description: 'Dunoon – Montague Gardens – Century City', system: 'myciti', type: 'direct', color: '#1E88E5', stations: ['mc-dunoon', 'mc-montagugardens', 'mc-centurycity'] },
  
  // Area Routes - Vredehoek & Gardens
  { id: 'mc-101', name: '101', description: 'Vredehoek – Gardens – Civic Centre (clockwise)', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-vredehoek', 'mc-gardens', 'mc-civic'] },
  { id: 'mc-102', name: '102', description: 'Salt River Rail – Walmer Estate – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-saltriverrail', 'mc-walmerestate', 'mc-civic'] },
  { id: 'mc-103', name: '103', description: 'Oranjezicht – Gardens – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-oranjezicht', 'mc-gardens', 'mc-civic'] },
  { id: 'mc-111', name: '111', description: 'Vredehoek – Gardens – Civic Centre (anti-clockwise)', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-vredehoek', 'mc-gardens', 'mc-civic'] },
  { id: 'mc-113', name: '113', description: 'Upper Kloof Street – Adderley – Waterfront', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-kloofstreet', 'mc-adderley', 'mc-waterfront'] },
  
  // Area Routes - Sea Point & Atlantic Seaboard
  { id: 'mc-104', name: '104', description: 'Sea Point – Waterfront – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-seapoint', 'mc-waterfront', 'mc-civic'] },
  { id: 'mc-105', name: '105', description: 'Sea Point – Fresnaye – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-seapoint', 'mc-fresnaye', 'mc-civic'] },
  { id: 'mc-106', name: '106', description: 'Camps Bay (clockwise) – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-campsbay', 'mc-civic'] },
  { id: 'mc-107', name: '107', description: 'Camps Bay (anti-clockwise) – Civic Centre', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-campsbay', 'mc-civic'] },
  { id: 'mc-108', name: '108', description: 'Hangberg – Hout Bay Harbour – Sea Point – Adderley', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-hangberg', 'mc-houtbay', 'mc-seapoint', 'mc-adderley'] },
  { id: 'mc-109', name: '109', description: 'Hout Bay Beach – Imizamo Yethu – Sea Point – Adderley', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-houtbay', 'mc-imizamoyethu', 'mc-seapoint', 'mc-adderley'] },
  { id: 'mc-118', name: '118', description: 'Hangberg – Imizamo Yethu – Sea Point – Adderley', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-hangberg', 'mc-imizamoyethu', 'mc-seapoint', 'mc-adderley'] },
  
  // Area Routes - Table View & Sunningdale
  { id: 'mc-213', name: '213', description: 'Sunningdale – Parklands – Table View – Sunningdale (clockwise)', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-sunningdale', 'mc-parklands', 'mc-tableview'] },
  { id: 'mc-214', name: '214', description: 'Parklands – Table View – Melkbosstrand – Duynefontein', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-parklands', 'mc-tableview', 'mc-melkbosstrand', 'mc-duynefontein'] },
  { id: 'mc-215', name: '215', description: 'Sunningdale – Gie Road – Wood', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-sunningdale'] },
  { id: 'mc-216', name: '216', description: 'Sunningdale – Wood Drive – Big Bay', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-sunningdale', 'mc-bigbay', 'mc-parklands'] },
  { id: 'mc-223', name: '223', description: 'Sunningdale – West Beach – Table View – Sunningdale (anti-clockwise)', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-sunningdale', 'mc-tableview'] },
  
  // Area Routes - Atlantis
  { id: 'mc-231', name: '231', description: 'Atlantis Industria East – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-atlantis'] },
  { id: 'mc-233', name: '233', description: 'Saxonsea – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-saxonsea', 'mc-atlantis'] },
  { id: 'mc-234', name: '234', description: 'Mamre (Crown) – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-mamre', 'mc-atlantis'] },
  { id: 'mc-235', name: '235', description: 'Pella – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-pella', 'mc-atlantis'] },
  { id: 'mc-236', name: '236', description: 'Sherwood – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-sherwood', 'mc-atlantis'] },
  { id: 'mc-237', name: '237', description: 'Robinvale – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-robinvale', 'mc-atlantis'] },
  { id: 'mc-244', name: '244', description: 'Avondale – Protea Park – Atlantis Industria West – Atlantis', system: 'myciti', type: 'area', color: '#43A047', stations: ['mc-avondale', 'mc-duynefontein', 'mc-atlantis'] },
];

// ============================================
// PUTCO BUS STATIONS (Gauteng)
// ============================================
export const putcoStations: Station[] = [
  // Soshanguve Area
  { id: 'pt-f4', name: 'Soshanguve F4', lat: -25.4780, lng: 28.0920, system: 'putco', lines: ['S101-S106'] },
  { id: 'pt-transfer', name: 'Transfer Station', lat: -25.5120, lng: 28.1050, system: 'putco', lines: ['S107-S111'] },
  { id: 'pt-xxentrance', name: 'XX Entrance', lat: -25.5280, lng: 28.1180, system: 'putco', lines: ['S101', 'S112-S116'] },
  { id: 'pt-orchards', name: 'Orchards', lat: -25.7380, lng: 28.2050, system: 'putco', lines: ['S102', 'S107', 'S112'], isInterchange: true },
  { id: 'pt-marabastad', name: 'Marabastad', lat: -25.7440, lng: 28.1780, system: 'putco', lines: ['S103', 'S108', 'S113'] },
  { id: 'pt-balebogeng', name: 'Balebogeng', lat: -25.7650, lng: 28.2180, system: 'putco', lines: ['S104', 'S109', 'S114'] },
  { id: 'pt-centurion-gw', name: 'Centurion Gateway', lat: -25.8550, lng: 28.1890, system: 'putco', lines: ['S105', 'S110', 'S115', 'S117'], isInterchange: true },
  { id: 'pt-midrand', name: 'Midrand', lat: -25.9930, lng: 28.1264, system: 'putco', lines: ['S106', 'S111', 'S116', 'S118-S120'], isInterchange: true },
  { id: 'pt-sinoville', name: 'Sinoville Drive-In', lat: -25.7050, lng: 28.2420, system: 'putco', lines: ['S117', 'S119'] },
  { id: 'pt-wonderpark', name: 'Wonderpark', lat: -25.7180, lng: 28.2150, system: 'putco', lines: ['S118'] },
  { id: 'pt-eastlynne', name: 'Eastlynne', lat: -25.7350, lng: 28.2280, system: 'putco', lines: ['S120'] },
  
  // Ekangala Area
  { id: 'pt-ekangala-f', name: 'Ekangala Block F', lat: -25.6920, lng: 28.7580, system: 'putco', lines: ['E210-E217'] },
  { id: 'pt-zithobeni', name: 'Zithobeni', lat: -25.6780, lng: 28.7420, system: 'putco', lines: ['E202', 'E204', 'E205', 'E210'] },
  { id: 'pt-langkloof', name: 'Langkloof', lat: -25.5680, lng: 28.8250, system: 'putco', lines: ['E201', 'E206', 'E208', 'E209'] },
  { id: 'pt-rayton', name: 'Rayton Cross', lat: -25.7420, lng: 28.6580, system: 'putco', lines: ['E208', 'E212', 'E224'] },
  { id: 'pt-springs', name: 'Springs Taxi Rank', lat: -26.2450, lng: 28.4420, system: 'putco', lines: ['E203', 'E209', 'E213'] },
  { id: 'pt-refilwe', name: 'Refilwe', lat: -25.7080, lng: 28.6850, system: 'putco', lines: ['E218-E223'] },
  { id: 'pt-onverwacht', name: 'Onverwacht', lat: -25.7220, lng: 28.6720, system: 'putco', lines: ['E218'] },
  { id: 'pt-csir', name: 'CSIR', lat: -25.7520, lng: 28.2780, system: 'putco', lines: ['E215', 'E221'] },
  
  // Tshwane & Mpumalanga Area (TAM)
  { id: 'pt-groblersdal', name: 'Groblersdal', lat: -25.1750, lng: 29.3980, system: 'putco', lines: ['T301-T309'] },
  { id: 'pt-rathoke', name: 'Rathoke', lat: -25.2350, lng: 29.3180, system: 'putco', lines: ['T301', 'T310', 'T353'] },
  { id: 'pt-weltevrede', name: 'Weltevrede', lat: -25.2850, lng: 29.2580, system: 'putco', lines: ['T302', 'T323'] },
  { id: 'pt-vaalbank', name: 'Vaalbank', lat: -25.3450, lng: 29.1980, system: 'putco', lines: ['T303', 'T331-T337'] },
  { id: 'pt-kwamhlanga', name: 'Kwa-Mhlanga', lat: -25.4280, lng: 28.9850, system: 'putco', lines: ['T304', 'T325', 'T332', 'T338'] },
  { id: 'pt-pebblerock', name: 'Pebblerock', lat: -25.5180, lng: 28.5280, system: 'putco', lines: ['T305', 'T312', 'T318', 'T326', 'T333', 'T339', 'T344'] },
  { id: 'pt-uitvlugt', name: 'Uitvlugt', lat: -25.2080, lng: 29.3550, system: 'putco', lines: ['T310-T316'] },
  { id: 'pt-gaseabe', name: 'Ga-Seabe', lat: -25.2450, lng: 29.2850, system: 'putco', lines: ['T311', 'T317', 'T354'] },
  { id: 'pt-katjibane', name: 'Katjibane', lat: -25.2650, lng: 29.3050, system: 'putco', lines: ['T317-T322'] },
  { id: 'pt-dennilton', name: 'Waterkloof Dennilton', lat: -25.3150, lng: 29.2250, system: 'putco', lines: ['T323-T330', 'E201-E203'] },
  { id: 'pt-tweefontein', name: 'Tweefontein A', lat: -25.4050, lng: 29.0850, system: 'putco', lines: ['T338-T343', 'E205'] },
  { id: 'pt-roodeplaat', name: 'Roodeplaat', lat: -25.6280, lng: 28.3580, system: 'putco', lines: ['T344-T348'] },
  { id: 'pt-denneboom', name: 'Denneboom Station', lat: -25.7580, lng: 28.2450, system: 'putco', lines: ['T349', 'T350'] },
  { id: 'pt-menlyn', name: 'Menlyn', lat: -25.7850, lng: 28.2780, system: 'putco', lines: ['T351'] },
  { id: 'pt-centurion-mall', name: 'Centurion Mall', lat: -25.8520, lng: 28.1920, system: 'putco', lines: ['T352'] },
  { id: 'pt-nylstroom', name: 'Nylstroom (Modimolle)', lat: -24.7080, lng: 28.4050, system: 'putco', lines: ['T353', 'T354'] },
  { id: 'pt-faerieglen', name: 'Faerie Glen', lat: -25.7850, lng: 28.3280, system: 'putco', lines: ['T307', 'T314', 'T320'] },
  { id: 'pt-onderstepoort', name: 'Onderstepoort', lat: -25.6480, lng: 28.1780, system: 'putco', lines: ['T307', 'T314', 'T320', 'T328', 'T335', 'T341', 'T346'] },
];

// ============================================
// PUTCO BUS ROUTES
// ============================================
export const putcoRoutes: Route[] = [
  // Soshanguve Routes (S101-S120)
  { id: 'pt-S101', name: 'S101', description: 'F4 to XX Entrance', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-xxentrance'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.5280, lng: 28.1180 }] },
  { id: 'pt-S102', name: 'S102', description: 'F4 to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-orchards'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.7380, lng: 28.2050 }] },
  { id: 'pt-S103', name: 'S103', description: 'F4 to Marabastad', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-marabastad'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.7440, lng: 28.1780 }] },
  { id: 'pt-S104', name: 'S104', description: 'F4 to Balebogeng', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-balebogeng'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.7650, lng: 28.2180 }] },
  { id: 'pt-S105', name: 'S105', description: 'F4 to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-centurion-gw'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.6000, lng: 28.1500 }, { lat: -25.8550, lng: 28.1890 }] },
  { id: 'pt-S106', name: 'S106', description: 'F4 to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-f4', 'pt-midrand'], path: [{ lat: -25.4780, lng: 28.0920 }, { lat: -25.7200, lng: 28.1500 }, { lat: -25.9930, lng: 28.1264 }] },
  { id: 'pt-S107', name: 'S107', description: 'Transfer to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-transfer', 'pt-orchards'] },
  { id: 'pt-S108', name: 'S108', description: 'Transfer to Marabastad', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-transfer', 'pt-marabastad'] },
  { id: 'pt-S109', name: 'S109', description: 'Transfer to Balebogeng', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-transfer', 'pt-balebogeng'] },
  { id: 'pt-S110', name: 'S110', description: 'Transfer to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-transfer', 'pt-centurion-gw'] },
  { id: 'pt-S111', name: 'S111', description: 'Transfer to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-transfer', 'pt-midrand'] },
  { id: 'pt-S112', name: 'S112', description: 'Zone XX to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-xxentrance', 'pt-orchards'] },
  { id: 'pt-S113', name: 'S113', description: 'Zone XX to Marabastad', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-xxentrance', 'pt-marabastad'] },
  { id: 'pt-S114', name: 'S114', description: 'Zone XX to Balebogeng', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-xxentrance', 'pt-balebogeng'] },
  { id: 'pt-S115', name: 'S115', description: 'Zone XX to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-xxentrance', 'pt-centurion-gw'] },
  { id: 'pt-S116', name: 'S116', description: 'Zone XX to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-xxentrance', 'pt-midrand'] },
  { id: 'pt-S117', name: 'S117', description: 'Sinoville Drive-In to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-sinoville', 'pt-centurion-gw'] },
  { id: 'pt-S118', name: 'S118', description: 'Wonderpark to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-wonderpark', 'pt-midrand'] },
  { id: 'pt-S119', name: 'S119', description: 'Sinoville Drive-In to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-sinoville', 'pt-midrand'] },
  { id: 'pt-S120', name: 'S120', description: 'Eastlynne to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-eastlynne', 'pt-midrand'] },
  
  // Ekangala Routes (E201-E224)
  { id: 'pt-E201', name: 'E201', description: 'Waterkloof Dennilton to Langkloof', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-langkloof'] },
  { id: 'pt-E202', name: 'E202', description: 'Waterkloof Dennilton to Zithobeni', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-zithobeni'] },
  { id: 'pt-E203', name: 'E203', description: 'Waterkloof Dennilton to Springs Taxi Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-springs'] },
  { id: 'pt-E204', name: 'E204', description: 'Vaalbank to Zithobeni', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-zithobeni'] },
  { id: 'pt-E205', name: 'E205', description: 'Tweefontein A to Zithobeni', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-zithobeni'] },
  { id: 'pt-E206', name: 'E206', description: 'Langkloof Loop', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-langkloof'] },
  { id: 'pt-E208', name: 'E208', description: 'Langkloof to Rayton Cross', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-langkloof', 'pt-rayton'] },
  { id: 'pt-E209', name: 'E209', description: 'Langkloof to Springs Taxi Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-langkloof', 'pt-springs'] },
  { id: 'pt-E210', name: 'E210', description: 'Ekangala Block F to Zithobeni', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-zithobeni'] },
  { id: 'pt-E212', name: 'E212', description: 'Ekangala Block F to Rayton Cross', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-rayton'] },
  { id: 'pt-E213', name: 'E213', description: 'Ekangala Block F to Springs Taxi Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-springs'] },
  { id: 'pt-E214', name: 'E214', description: 'Ekangala Block F to Balebogeng', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-balebogeng'] },
  { id: 'pt-E215', name: 'E215', description: 'Ekangala Block F to CSIR', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-csir'] },
  { id: 'pt-E216', name: 'E216', description: 'Ekangala Block F to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-centurion-gw'] },
  { id: 'pt-E217', name: 'E217', description: 'Ekangala Block F to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-ekangala-f', 'pt-midrand'] },
  { id: 'pt-E218', name: 'E218', description: 'Refilwe to Onverwacht', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-refilwe', 'pt-onverwacht'] },
  { id: 'pt-E220', name: 'E220', description: 'Refilwe to Balebogeng', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-refilwe', 'pt-balebogeng'] },
  { id: 'pt-E221', name: 'E221', description: 'Refilwe to CSIR', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-refilwe', 'pt-csir'] },
  { id: 'pt-E222', name: 'E222', description: 'Refilwe to Centurion Gateway', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-refilwe', 'pt-centurion-gw'] },
  { id: 'pt-E223', name: 'E223', description: 'Refilwe to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-refilwe', 'pt-midrand'] },
  { id: 'pt-E224', name: 'E224', description: 'Rayton Cross Loop', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-rayton'] },
  
  // Tshwane & Mpumalanga (TAM) Routes (T301-T354)
  { id: 'pt-T301', name: 'T301', description: 'Groblersdal to Rathoke', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-rathoke'] },
  { id: 'pt-T302', name: 'T302', description: 'Groblersdal to Weltevrede', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-weltevrede'] },
  { id: 'pt-T303', name: 'T303', description: 'Groblersdal to Vaalbank Extension', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-vaalbank'] },
  { id: 'pt-T304', name: 'T304', description: 'Groblersdal to Kwa-Mhlanga', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-kwamhlanga'] },
  { id: 'pt-T305', name: 'T305', description: 'Groblersdal to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-pebblerock'] },
  { id: 'pt-T306', name: 'T306', description: 'Groblersdal to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-eastlynne'] },
  { id: 'pt-T307', name: 'T307', description: 'Groblersdal to Faerie Glen', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-faerieglen'] },
  { id: 'pt-T308', name: 'T308', description: 'Groblersdal to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-orchards'] },
  { id: 'pt-T309', name: 'T309', description: 'Groblersdal to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-groblersdal', 'pt-midrand'] },
  { id: 'pt-T310', name: 'T310', description: 'Uitvlugt to Rathoke', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-rathoke'] },
  { id: 'pt-T311', name: 'T311', description: 'Uitvlugt to Ga-Seabe', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-gaseabe'] },
  { id: 'pt-T312', name: 'T312', description: 'Uitvlugt to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-pebblerock'] },
  { id: 'pt-T313', name: 'T313', description: 'Uitvlugt to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-eastlynne'] },
  { id: 'pt-T314', name: 'T314', description: 'Uitvlugt to Faerie Glen', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-faerieglen'] },
  { id: 'pt-T315', name: 'T315', description: 'Uitvlugt to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-orchards'] },
  { id: 'pt-T316', name: 'T316', description: 'Uitvlugt to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-uitvlugt', 'pt-midrand'] },
  { id: 'pt-T317', name: 'T317', description: 'Katjibane to Ga-Seabe', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-gaseabe'] },
  { id: 'pt-T318', name: 'T318', description: 'Katjibane to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-pebblerock'] },
  { id: 'pt-T319', name: 'T319', description: 'Katjibane to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-eastlynne'] },
  { id: 'pt-T320', name: 'T320', description: 'Katjibane to Faerie Glen', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-faerieglen'] },
  { id: 'pt-T321', name: 'T321', description: 'Katjibane to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-orchards'] },
  { id: 'pt-T322', name: 'T322', description: 'Katjibane to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-katjibane', 'pt-midrand'] },
  { id: 'pt-T323', name: 'T323', description: 'Waterkloof Dennilton to Weltevrede', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-weltevrede'] },
  { id: 'pt-T324', name: 'T324', description: 'Waterkloof Dennilton to Vaalbank Extension', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-vaalbank'] },
  { id: 'pt-T325', name: 'T325', description: 'Waterkloof Dennilton to Kwa-Mhlanga', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-kwamhlanga'] },
  { id: 'pt-T326', name: 'T326', description: 'Waterkloof Dennilton to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-pebblerock'] },
  { id: 'pt-T327', name: 'T327', description: 'Waterkloof Dennilton to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-eastlynne'] },
  { id: 'pt-T328', name: 'T328', description: 'Waterkloof Dennilton to Onderstepoort', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-onderstepoort'] },
  { id: 'pt-T329', name: 'T329', description: 'Waterkloof Dennilton to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-orchards'] },
  { id: 'pt-T330', name: 'T330', description: 'Waterkloof Dennilton to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-dennilton', 'pt-midrand'] },
  { id: 'pt-T331', name: 'T331', description: 'Vaalbank Loop', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank'] },
  { id: 'pt-T332', name: 'T332', description: 'Vaalbank to Kwa-Mhlanga', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-kwamhlanga'] },
  { id: 'pt-T333', name: 'T333', description: 'Vaalbank to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-pebblerock'] },
  { id: 'pt-T334', name: 'T334', description: 'Vaalbank to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-eastlynne'] },
  { id: 'pt-T335', name: 'T335', description: 'Vaalbank to Onderstepoort', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-onderstepoort'] },
  { id: 'pt-T336', name: 'T336', description: 'Vaalbank to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-orchards'] },
  { id: 'pt-T337', name: 'T337', description: 'Vaalbank to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-vaalbank', 'pt-midrand'] },
  { id: 'pt-T338', name: 'T338', description: 'Tweefontein A to Kwa-Mhlanga', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-kwamhlanga'] },
  { id: 'pt-T339', name: 'T339', description: 'Tweefontein A to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-pebblerock'] },
  { id: 'pt-T340', name: 'T340', description: 'Tweefontein A to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-eastlynne'] },
  { id: 'pt-T341', name: 'T341', description: 'Tweefontein A to Onderstepoort', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-onderstepoort'] },
  { id: 'pt-T342', name: 'T342', description: 'Tweefontein A to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-orchards'] },
  { id: 'pt-T343', name: 'T343', description: 'Tweefontein A to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-tweefontein', 'pt-midrand'] },
  { id: 'pt-T344', name: 'T344', description: 'Roodeplaat to Pebblerock', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-roodeplaat', 'pt-pebblerock'] },
  { id: 'pt-T345', name: 'T345', description: 'Roodeplaat to Eastlynne B. Rank', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-roodeplaat', 'pt-eastlynne'] },
  { id: 'pt-T346', name: 'T346', description: 'Roodeplaat to Onderstepoort', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-roodeplaat', 'pt-onderstepoort'] },
  { id: 'pt-T347', name: 'T347', description: 'Roodeplaat to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-roodeplaat', 'pt-orchards'] },
  { id: 'pt-T348', name: 'T348', description: 'Roodeplaat to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-roodeplaat', 'pt-midrand'] },
  { id: 'pt-T349', name: 'T349', description: 'Denneboom Station to Orchards', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-denneboom', 'pt-orchards'] },
  { id: 'pt-T350', name: 'T350', description: 'Denneboom Station to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-denneboom', 'pt-midrand'] },
  { id: 'pt-T351', name: 'T351', description: 'Menlyn to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-menlyn', 'pt-midrand'] },
  { id: 'pt-T352', name: 'T352', description: 'Centurion Mall to Midrand', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-centurion-mall', 'pt-midrand'] },
  { id: 'pt-T353', name: 'T353', description: 'Nylstroom to Rathoke', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-nylstroom', 'pt-rathoke'] },
  { id: 'pt-T354', name: 'T354', description: 'Nylstroom to Ga-Seabe', system: 'putco', type: 'bus', color: '#FB8C00', stations: ['pt-nylstroom', 'pt-gaseabe'] },
];

// ============================================
// COMBINED DATA ACCESS
// ============================================
export const allStations: Station[] = [
  ...gautrainStations,
  ...mycitiStations,
  ...putcoStations,
];

export const allRoutes: Route[] = [
  ...gautrainRoutes,
  ...mycitiRoutes,
  ...putcoRoutes,
];

export const getStationById = (id: string): Station | undefined => 
  allStations.find(station => station.id === id);

export const getRoutesBySystem = (system: TransitSystem): Route[] =>
  allRoutes.filter(route => route.system === system);

export const getStationsBySystem = (system: TransitSystem): Station[] =>
  allStations.filter(station => station.system === system);

export const getRoutesByType = (type: RouteType): Route[] =>
  allRoutes.filter(route => route.type === type);

// System metadata
export const transitSystems = {
  gautrain: {
    name: 'Gautrain',
    description: 'Johannesburg-Pretoria rapid rail system',
    color: '#DBA514',
    icon: 'train',
    region: 'Gauteng',
  },
  myciti: {
    name: 'MyCiTi',
    description: 'Cape Town integrated rapid transit',
    color: '#E53935',
    icon: 'bus',
    region: 'Cape Town',
  },
  putco: {
    name: 'PUTCO',
    description: 'Public Utility Transport Corporation buses',
    color: '#FB8C00',
    icon: 'bus',
    region: 'Gauteng & Mpumalanga',
  },
};

export const routeTypes = {
  trunk: { name: 'Trunk Routes', description: 'Major arterial routes', color: '#E53935' },
  direct: { name: 'Direct Routes', description: 'Express services', color: '#1E88E5' },
  area: { name: 'Area Routes', description: 'Local neighborhood services', color: '#43A047' },
  rail: { name: 'Rail', description: 'Train services', color: '#DBA514' },
  bus: { name: 'Bus', description: 'Bus services', color: '#FB8C00' },
};
