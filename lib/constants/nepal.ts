// Nepal-specific constants and data for localization

// Nepal provinces (as per 2015 constitution)
export const NEPAL_PROVINCES = [
  { code: 'P1', name: 'Province No. 1', nepali: 'प्रदेश नं. १' },
  { code: 'P2', name: 'Madhesh Province', nepali: 'मधेश प्रदेश' },
  { code: 'P3', name: 'Bagmati Province', nepali: 'बागमती प्रदेश' },
  { code: 'P4', name: 'Gandaki Province', nepali: 'गण्डकी प्रदेश' },
  { code: 'P5', name: 'Lumbini Province', nepali: 'लुम्बिनी प्रदेश' },
  { code: 'P6', name: 'Karnali Province', nepali: 'कर्णाली प्रदेश' },
  { code: 'P7', name: 'Sudurpashchim Province', nepali: 'सुदूरपश्चिम प्रदेश' }
] as const;

// Major districts in Nepal (selected major ones for forms)
export const NEPAL_DISTRICTS = [
  // Province 1
  { province: 'P1', name: 'Jhapa', nepali: 'झापा' },
  { province: 'P1', name: 'Morang', nepali: 'मोरङ' },
  { province: 'P1', name: 'Sunsari', nepali: 'सुनसरी' },
  { province: 'P1', name: 'Dhankuta', nepali: 'धनकुटा' },
  { province: 'P1', name: 'Sankhuwasabha', nepali: 'संखुवासभा' },
  
  // Madhesh Province
  { province: 'P2', name: 'Saptari', nepali: 'सप्तरी' },
  { province: 'P2', name: 'Siraha', nepali: 'सिराहा' },
  { province: 'P2', name: 'Dhanusha', nepali: 'धनुषा' },
  { province: 'P2', name: 'Mahottari', nepali: 'महोत्तरी' },
  { province: 'P2', name: 'Sarlahi', nepali: 'सर्लाही' },
  { province: 'P2', name: 'Bara', nepali: 'बारा' },
  { province: 'P2', name: 'Parsa', nepali: 'पर्सा' },
  { province: 'P2', name: 'Rautahat', nepali: 'रौतहट' },
  
  // Bagmati Province
  { province: 'P3', name: 'Kathmandu', nepali: 'काठमाडौं' },
  { province: 'P3', name: 'Lalitpur', nepali: 'ललितपुर' },
  { province: 'P3', name: 'Bhaktapur', nepali: 'भक्तपुर' },
  { province: 'P3', name: 'Kavrepalanchok', nepali: 'काभ्रेपलाञ्चोक' },
  { province: 'P3', name: 'Sindhupalchok', nepali: 'सिन्धुपाल्चोक' },
  { province: 'P3', name: 'Nuwakot', nepali: 'नुवाकोट' },
  { province: 'P3', name: 'Rasuwa', nepali: 'रसुवा' },
  { province: 'P3', name: 'Dhading', nepali: 'धादिङ' },
  { province: 'P3', name: 'Chitwan', nepali: 'चितवन' },
  { province: 'P3', name: 'Makwanpur', nepali: 'मकवानपुर' },
  
  // Gandaki Province
  { province: 'P4', name: 'Gorkha', nepali: 'गोरखा' },
  { province: 'P4', name: 'Lamjung', nepali: 'लमजुङ' },
  { province: 'P4', name: 'Tanahu', nepali: 'तनहुँ' },
  { province: 'P4', name: 'Syangja', nepali: 'स्याङजा' },
  { province: 'P4', name: 'Kaski', nepali: 'कास्की' },
  { province: 'P4', name: 'Manang', nepali: 'मनाङ' },
  { province: 'P4', name: 'Mustang', nepali: 'मुस्ताङ' },
  { province: 'P4', name: 'Myagdi', nepali: 'म्याग्दी' },
  { province: 'P4', name: 'Parbat', nepali: 'पर्वत' },
  { province: 'P4', name: 'Baglung', nepali: 'बागलुङ' },
  { province: 'P4', name: 'Nawalpur', nepali: 'नवलपुर' },
  
  // Lumbini Province
  { province: 'P5', name: 'Kapilvastu', nepali: 'कपिलवस्तु' },
  { province: 'P5', name: 'Rupandehi', nepali: 'रुपन्देही' },
  { province: 'P5', name: 'Palpa', nepali: 'पाल्पा' },
  { province: 'P5', name: 'Nawalparasi', nepali: 'नवलपरासी' },
  { province: 'P5', name: 'Gulmi', nepali: 'गुल्मी' },
  { province: 'P5', name: 'Arghakhanchi', nepali: 'अर्घाखाँची' },
  { province: 'P5', name: 'Pyuthan', nepali: 'प्युठान' },
  { province: 'P5', name: 'Rolpa', nepali: 'रोल्पा' },
  { province: 'P5', name: 'Rukum East', nepali: 'रुकुम पूर्व' },
  { province: 'P5', name: 'Banke', nepali: 'बाँके' },
  { province: 'P5', name: 'Bardiya', nepali: 'बर्दिया' },
  { province: 'P5', name: 'Dang', nepali: 'दाङ' },
  
  // Karnali Province
  { province: 'P6', name: 'Dolpa', nepali: 'डोल्पा' },
  { province: 'P6', name: 'Humla', nepali: 'हुम्ला' },
  { province: 'P6', name: 'Kalikot', nepali: 'कालिकोट' },
  { province: 'P6', name: 'Mugu', nepali: 'मुगु' },
  { province: 'P6', name: 'Surkhet', nepali: 'सुर्खेत' },
  { province: 'P6', name: 'Dailekh', nepali: 'दैलेख' },
  { province: 'P6', name: 'Jajarkot', nepali: 'जाजरकोट' },
  { province: 'P6', name: 'Rukum West', nepali: 'रुकुम पश्चिम' },
  { province: 'P6', name: 'Salyan', nepali: 'सल्यान' },
  
  // Sudurpashchim Province
  { province: 'P7', name: 'Bajura', nepali: 'बाजुरा' },
  { province: 'P7', name: 'Bajhang', nepali: 'बझाङ' },
  { province: 'P7', name: 'Achham', nepali: 'अछाम' },
  { province: 'P7', name: 'Doti', nepali: 'डोटी' },
  { province: 'P7', name: 'Kailali', nepali: 'कैलाली' },
  { province: 'P7', name: 'Kanchanpur', nepali: 'कञ्चनपुर' },
  { province: 'P7', name: 'Dadeldhura', nepali: 'डडेल्धुरा' },
  { province: 'P7', name: 'Baitadi', nepali: 'बैतडी' },
  { province: 'P7', name: 'Darchula', nepali: 'दार्चुला' }
] as const;

// Currency configuration for Nepal
export const NEPAL_CURRENCY = {
  code: 'NPR',
  symbol: '₹',
  name: 'Nepalese Rupee',
  namePlural: 'Nepalese Rupees',
  decimalPlaces: 2,
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolPosition: 'before', // ₹ 1,000.00
  spaceAfterSymbol: true
} as const;

// Phone number configuration for Nepal
export const NEPAL_PHONE = {
  countryCode: '+977',
  mobilePrefix: ['98', '97'],
  landlinePrefix: ['01', '02', '03', '04', '05', '06', '07', '08', '09'],
  minLength: 10,
  maxLength: 10,
  format: '+977-XX-XXXXXXXX' // Example format
} as const;

// Address configuration for Nepal
export const NEPAL_ADDRESS_FORMAT = {
  fields: [
    'street_address_1',
    'street_address_2',
    'municipality_vdc',
    'ward_number',
    'district',
    'province',
    'postal_code'
  ],
  required: [
    'street_address_1',
    'municipality_vdc',
    'district',
    'province'
  ],
  labels: {
    street_address_1: 'Street Address',
    street_address_2: 'Area/Locality (Optional)',
    municipality_vdc: 'Municipality/VDC',
    ward_number: 'Ward Number',
    district: 'District',
    province: 'Province',
    postal_code: 'Postal Code'
  }
} as const;

// Default country information
export const NEPAL_COUNTRY = {
  name: 'Nepal',
  code: 'NP',
  currency: NEPAL_CURRENCY.code,
  phoneCode: NEPAL_PHONE.countryCode,
  timezone: 'Asia/Kathmandu',
  locale: 'ne-NP'
} as const;

// Tax configuration for Nepal (VAT)
export const NEPAL_TAX = {
  vat: 0.13, // 13% VAT in Nepal
  serviceTax: 0.10, // 10% service tax for certain services
  defaultRate: 0.13
} as const;

// Postal code patterns for major cities
export const NEPAL_POSTAL_CODES = {
  'Kathmandu': ['44600', '44601', '44602', '44603', '44604', '44605'],
  'Lalitpur': ['44700', '44701', '44702'],
  'Bhaktapur': ['44800', '44801', '44802'],
  'Pokhara': ['33700', '33701', '33702'],
  'Biratnagar': ['56613', '56614', '56615'],
  'Birgunj': ['44300', '44301', '44302'],
  'Dharan': ['56705', '56706'],
  'Butwal': ['32907', '32908'],
  'Hetauda': ['44107', '44108'],
  'Janakpur': ['45600', '45601']
} as const;

// Helper function to get districts by province
export function getDistrictsByProvince(provinceCode: string) {
  return NEPAL_DISTRICTS.filter(district => district.province === provinceCode);
}

// Helper function to get province by district
export function getProvinceByDistrict(districtName: string) {
  const district = NEPAL_DISTRICTS.find(d => d.name === districtName);
  return district ? NEPAL_PROVINCES.find(p => p.code === district.province) : null;
}
