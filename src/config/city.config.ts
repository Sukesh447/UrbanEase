export interface CityConfig {
  name: string;
  nameTamil: string;
  state: string;
  centerCoords: [number, number]; // [lat, lng]
  zoomLevel: number;
  emergencyHelpline: string;
  corporationName: string;
  corporationNameTamil: string;
  wards: { id: number; name: string; nameTamil: string; counselor: string }[];
}

export const CITY_CONFIG: CityConfig = {
  name: 'Coimbatore',
  nameTamil: 'கோயம்புத்தூர்',
  state: 'Tamil Nadu',
  centerCoords: [11.0168, 76.9558],
  zoomLevel: 13,
  emergencyHelpline: '1800-425-4000',
  corporationName: 'Coimbatore City Municipal Corporation (CCMC)',
  corporationNameTamil: 'கோயம்புத்தூர் மாநகராட்சி',
  wards: [
    { id: 12, name: 'RS Puram (West Ward 12)', nameTamil: 'ஆர்.எஸ். புரம்', counselor: 'S. Shanmugam' },
    { id: 24, name: 'Gandhipuram (Central Ward 24)', nameTamil: 'காந்திபுரம்', counselor: 'K. Meenakshi' },
    { id: 37, name: 'Peelamedu Tech Zone (Ward 37)', nameTamil: 'பீளமேடு', counselor: 'V. Ramanathan' },
    { id: 45, name: 'Ukkadam Lakefront (Ward 45)', nameTamil: 'உக்கடம்', counselor: 'A. Fathima' },
    { id: 58, name: 'Singanallur Junction (Ward 58)', nameTamil: 'சிங்கநல்லூர்', counselor: 'P. Balaji' },
    { id: 62, name: 'Saibaba Colony (Ward 62)', nameTamil: 'சாய்பாபா காலனி', counselor: 'M. Anand' },
    { id: 71, name: 'Saravanampatti IT Park (Ward 71)', nameTamil: 'சரவணம்பட்டி', counselor: 'T. Krishnan' },
  ],
};
