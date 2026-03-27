/**
 * Bangladesh Locations Data
 * 
 * Static data for districts and upazilas in Bangladesh.
 * Used for address selection in Order Forms.
 */

// ============================================================================
// DIVISIONS
// ============================================================================
export interface Division {
  id: string;
  name: string;
  nameEn: string;
}

export const DIVISIONS: Division[] = [
  { id: 'dhaka', name: 'ঢাকা', nameEn: 'Dhaka' },
  { id: 'chittagong', name: 'চট্টগ্রাম', nameEn: 'Chittagong' },
  { id: 'rajshahi', name: 'রাজশাহী', nameEn: 'Rajshahi' },
  { id: 'khulna', name: 'খুলনা', nameEn: 'Khulna' },
  { id: 'barisal', name: 'বরিশাল', nameEn: 'Barisal' },
  { id: 'sylhet', name: 'সিলেট', nameEn: 'Sylhet' },
  { id: 'rangpur', name: 'রংপুর', nameEn: 'Rangpur' },
  { id: 'mymensingh', name: 'ময়মনসিংহ', nameEn: 'Mymensingh' },
];

// ============================================================================
// DISTRICTS (64 Districts of Bangladesh)
// ============================================================================
export interface District {
  id: string;
  name: string;
  nameEn: string;
  divisionId: string;
}

export const DISTRICTS: District[] = [
  // Dhaka Division (13 districts)
  { id: 'dhaka', name: 'ঢাকা', nameEn: 'Dhaka', divisionId: 'dhaka' },
  { id: 'faridpur', name: 'ফরিদপুর', nameEn: 'Faridpur', divisionId: 'dhaka' },
  { id: 'gazipur', name: 'গাজীপুর', nameEn: 'Gazipur', divisionId: 'dhaka' },
  { id: 'gopalganj', name: 'গোপালগঞ্জ', nameEn: 'Gopalganj', divisionId: 'dhaka' },
  { id: 'kishoreganj', name: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', divisionId: 'dhaka' },
  { id: 'madaripur', name: 'মাদারীপুর', nameEn: 'Madaripur', divisionId: 'dhaka' },
  { id: 'manikganj', name: 'মানিকগঞ্জ', nameEn: 'Manikganj', divisionId: 'dhaka' },
  { id: 'munshiganj', name: 'মুন্সীগঞ্জ', nameEn: 'Munshiganj', divisionId: 'dhaka' },
  { id: 'narayanganj', name: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', divisionId: 'dhaka' },
  { id: 'narsingdi', name: 'নরসিংদী', nameEn: 'Narsingdi', divisionId: 'dhaka' },
  { id: 'rajbari', name: 'রাজবাড়ী', nameEn: 'Rajbari', divisionId: 'dhaka' },
  { id: 'shariatpur', name: 'শরীয়তপুর', nameEn: 'Shariatpur', divisionId: 'dhaka' },
  { id: 'tangail', name: 'টাঙ্গাইল', nameEn: 'Tangail', divisionId: 'dhaka' },

  // Chittagong Division (11 districts)
  { id: 'chittagong', name: 'চট্টগ্রাম', nameEn: 'Chittagong', divisionId: 'chittagong' },
  { id: 'bandarban', name: 'বান্দরবান', nameEn: 'Bandarban', divisionId: 'chittagong' },
  { id: 'brahmanbaria', name: 'ব্রাহ্মণবাড়িয়া', nameEn: 'Brahmanbaria', divisionId: 'chittagong' },
  { id: 'chandpur', name: 'চাঁদপুর', nameEn: 'Chandpur', divisionId: 'chittagong' },
  { id: 'comilla', name: 'কুমিল্লা', nameEn: 'Comilla', divisionId: 'chittagong' },
  { id: 'coxsbazar', name: 'কক্সবাজার', nameEn: "Cox's Bazar", divisionId: 'chittagong' },
  { id: 'feni', name: 'ফেনী', nameEn: 'Feni', divisionId: 'chittagong' },
  { id: 'khagrachhari', name: 'খাগড়াছড়ি', nameEn: 'Khagrachhari', divisionId: 'chittagong' },
  { id: 'lakshmipur', name: 'লক্ষ্মীপুর', nameEn: 'Lakshmipur', divisionId: 'chittagong' },
  { id: 'noakhali', name: 'নোয়াখালী', nameEn: 'Noakhali', divisionId: 'chittagong' },
  { id: 'rangamati', name: 'রাঙ্গামাটি', nameEn: 'Rangamati', divisionId: 'chittagong' },

  // Rajshahi Division (8 districts)
  { id: 'rajshahi', name: 'রাজশাহী', nameEn: 'Rajshahi', divisionId: 'rajshahi' },
  { id: 'bogura', name: 'বগুড়া', nameEn: 'Bogura', divisionId: 'rajshahi' },
  { id: 'chapainawabganj', name: 'চাঁপাইনবাবগঞ্জ', nameEn: 'Chapainawabganj', divisionId: 'rajshahi' },
  { id: 'joypurhat', name: 'জয়পুরহাট', nameEn: 'Joypurhat', divisionId: 'rajshahi' },
  { id: 'naogaon', name: 'নওগাঁ', nameEn: 'Naogaon', divisionId: 'rajshahi' },
  { id: 'natore', name: 'নাটোর', nameEn: 'Natore', divisionId: 'rajshahi' },
  { id: 'nawabganj', name: 'নবাবগঞ্জ', nameEn: 'Nawabganj', divisionId: 'rajshahi' },
  { id: 'pabna', name: 'পাবনা', nameEn: 'Pabna', divisionId: 'rajshahi' },
  { id: 'sirajganj', name: 'সিরাজগঞ্জ', nameEn: 'Sirajganj', divisionId: 'rajshahi' },

  // Khulna Division (10 districts)
  { id: 'khulna', name: 'খুলনা', nameEn: 'Khulna', divisionId: 'khulna' },
  { id: 'bagerhat', name: 'বাগেরহাট', nameEn: 'Bagerhat', divisionId: 'khulna' },
  { id: 'chuadanga', name: 'চুয়াডাঙ্গা', nameEn: 'Chuadanga', divisionId: 'khulna' },
  { id: 'jessore', name: 'যশোর', nameEn: 'Jessore', divisionId: 'khulna' },
  { id: 'jhenaidah', name: 'ঝিনাইদহ', nameEn: 'Jhenaidah', divisionId: 'khulna' },
  { id: 'kushtia', name: 'কুষ্টিয়া', nameEn: 'Kushtia', divisionId: 'khulna' },
  { id: 'magura', name: 'মাগুরা', nameEn: 'Magura', divisionId: 'khulna' },
  { id: 'meherpur', name: 'মেহেরপুর', nameEn: 'Meherpur', divisionId: 'khulna' },
  { id: 'narail', name: 'নড়াইল', nameEn: 'Narail', divisionId: 'khulna' },
  { id: 'satkhira', name: 'সাতক্ষীরা', nameEn: 'Satkhira', divisionId: 'khulna' },

  // Barisal Division (6 districts)
  { id: 'barisal', name: 'বরিশাল', nameEn: 'Barisal', divisionId: 'barisal' },
  { id: 'barguna', name: 'বরগুনা', nameEn: 'Barguna', divisionId: 'barisal' },
  { id: 'bhola', name: 'ভোলা', nameEn: 'Bhola', divisionId: 'barisal' },
  { id: 'jhalokati', name: 'ঝালকাঠি', nameEn: 'Jhalokati', divisionId: 'barisal' },
  { id: 'patuakhali', name: 'পটুয়াখালী', nameEn: 'Patuakhali', divisionId: 'barisal' },
  { id: 'pirojpur', name: 'পিরোজপুর', nameEn: 'Pirojpur', divisionId: 'barisal' },

  // Sylhet Division (4 districts)
  { id: 'sylhet', name: 'সিলেট', nameEn: 'Sylhet', divisionId: 'sylhet' },
  { id: 'habiganj', name: 'হবিগঞ্জ', nameEn: 'Habiganj', divisionId: 'sylhet' },
  { id: 'moulvibazar', name: 'মৌলভীবাজার', nameEn: 'Moulvibazar', divisionId: 'sylhet' },
  { id: 'sunamganj', name: 'সুনামগঞ্জ', nameEn: 'Sunamganj', divisionId: 'sylhet' },

  // Rangpur Division (8 districts)
  { id: 'rangpur', name: 'রংপুর', nameEn: 'Rangpur', divisionId: 'rangpur' },
  { id: 'dinajpur', name: 'দিনাজপুর', nameEn: 'Dinajpur', divisionId: 'rangpur' },
  { id: 'gaibandha', name: 'গাইবান্ধা', nameEn: 'Gaibandha', divisionId: 'rangpur' },
  { id: 'kurigram', name: 'কুড়িগ্রাম', nameEn: 'Kurigram', divisionId: 'rangpur' },
  { id: 'lalmonirhat', name: 'লালমনিরহাট', nameEn: 'Lalmonirhat', divisionId: 'rangpur' },
  { id: 'nilphamari', name: 'নীলফামারী', nameEn: 'Nilphamari', divisionId: 'rangpur' },
  { id: 'panchagarh', name: 'পঞ্চগড়', nameEn: 'Panchagarh', divisionId: 'rangpur' },
  { id: 'thakurgaon', name: 'ঠাকুরগাঁও', nameEn: 'Thakurgaon', divisionId: 'rangpur' },

  // Mymensingh Division (4 districts)
  { id: 'mymensingh', name: 'ময়মনসিংহ', nameEn: 'Mymensingh', divisionId: 'mymensingh' },
  { id: 'jamalpur', name: 'জামালপুর', nameEn: 'Jamalpur', divisionId: 'mymensingh' },
  { id: 'netrokona', name: 'নেত্রকোণা', nameEn: 'Netrokona', divisionId: 'mymensingh' },
  { id: 'sherpur', name: 'শেরপুর', nameEn: 'Sherpur', divisionId: 'mymensingh' },
];

// ============================================================================
// UPAZILAS / THANAS (Major areas per district)
// ============================================================================
export interface Upazila {
  id: string;
  name: string;
  nameEn: string;
  districtId: string;
}

export const UPAZILAS: Upazila[] = [
  { id: 'dhamrai', name: 'ধামরাই', nameEn: 'Dhamrai', districtId: 'dhaka' },
  { id: 'dohar', name: 'দোহার', nameEn: 'Dohar', districtId: 'dhaka' },
  { id: 'keraniganj', name: 'কেরানীগঞ্জ', nameEn: 'Keraniganj', districtId: 'dhaka' },
  { id: 'nawabganj', name: 'নবাবগঞ্জ', nameEn: 'Nawabganj', districtId: 'dhaka' },
  { id: 'savar', name: 'সাভার', nameEn: 'Savar', districtId: 'dhaka' },
  { id: 'anwara', name: 'আনোয়ারা', nameEn: 'Anwara', districtId: 'chittagong' },
  { id: 'banshkhali', name: 'বাঁশখালী', nameEn: 'Banshkhali', districtId: 'chittagong' },
  { id: 'boalkhali', name: 'বোয়ালখালী', nameEn: 'Boalkhali', districtId: 'chittagong' },
  { id: 'chandanaish', name: 'চন্দনাইশ', nameEn: 'Chandanaish', districtId: 'chittagong' },
  { id: 'fatikchhari', name: 'ফটিকছড়ি', nameEn: 'Fatikchhari', districtId: 'chittagong' },
  { id: 'hathazari', name: 'হাটহাজারী', nameEn: 'Hathazari', districtId: 'chittagong' },
  { id: 'lohagara', name: 'লোহাগাড়া', nameEn: 'Lohagara', districtId: 'chittagong' },
  { id: 'mirsharai', name: 'মীরসরাই', nameEn: 'Mirsharai', districtId: 'chittagong' },
  { id: 'patiya', name: 'পটিয়া', nameEn: 'Patiya', districtId: 'chittagong' },
  { id: 'rangunia', name: 'রাঙ্গুনিয়া', nameEn: 'Rangunia', districtId: 'chittagong' },
  { id: 'raozan', name: 'রাউজান', nameEn: 'Raozan', districtId: 'chittagong' },
  { id: 'sandwip', name: 'সন্দ্বীপ', nameEn: 'Sandwip', districtId: 'chittagong' },
  { id: 'satkania', name: 'সাতকানিয়া', nameEn: 'Satkania', districtId: 'chittagong' },
  { id: 'sitakunda', name: 'সীতাকুণ্ড', nameEn: 'Sitakunda', districtId: 'chittagong' },
  { id: 'barura', name: 'বরুড়া', nameEn: 'Barura', districtId: 'comilla' },
  { id: 'brahmanpara', name: 'ব্রাহ্মণপাড়া', nameEn: 'Brahmanpara', districtId: 'comilla' },
  { id: 'burichang', name: 'বুড়িচং', nameEn: 'Burichang', districtId: 'comilla' },
  { id: 'chandina', name: 'চান্দিনা', nameEn: 'Chandina', districtId: 'comilla' },
  { id: 'chauddagram', name: 'চৌদ্দগ্রাম', nameEn: 'Chauddagram', districtId: 'comilla' },
  { id: 'daudkandi', name: 'দাউদকান্দি', nameEn: 'Daudkandi', districtId: 'comilla' },
  { id: 'debidwar', name: 'দেবিদ্বার', nameEn: 'Debidwar', districtId: 'comilla' },
  { id: 'homna', name: 'হোমনা', nameEn: 'Homna', districtId: 'comilla' },
  { id: 'laksam', name: 'লাকসাম', nameEn: 'Laksam', districtId: 'comilla' },
  { id: 'muradnagar', name: 'মুরাদনগর', nameEn: 'Muradnagar', districtId: 'comilla' },
  { id: 'nangalkot', name: 'নাঙ্গলকোট', nameEn: 'Nangalkot', districtId: 'comilla' },
  { id: 'cumilla-sadar', name: 'কুমিল্লা সদর', nameEn: 'Cumilla Sadar', districtId: 'comilla' },
  { id: 'meghna', name: 'মেঘনা', nameEn: 'Meghna', districtId: 'comilla' },
  { id: 'titas', name: 'তিতাস', nameEn: 'Titas', districtId: 'comilla' },
  { id: 'monohorgonj', name: 'মনোহরগঞ্জ', nameEn: 'Monohorgonj', districtId: 'comilla' },
  { id: 'cumilla-sadar-dakshin', name: 'কুমিল্লা সদর দক্ষিণ', nameEn: 'Cumilla Sadar Dakshin', districtId: 'comilla' },
  { id: 'lalmai', name: 'লালমাই', nameEn: 'Lalmai', districtId: 'comilla' },
  { id: 'chakaria', name: 'চকরিয়া', nameEn: 'Chakaria', districtId: 'coxsbazar' },
  { id: 'cox-s-bazar-sadar', name: 'কক্সবাজার সদর', nameEn: 'Cox\'s Bazar Sadar', districtId: 'coxsbazar' },
  { id: 'kutubdia', name: 'কুতুবদিয়া', nameEn: 'Kutubdia', districtId: 'coxsbazar' },
  { id: 'maheshkhali', name: 'মহেশখালী', nameEn: 'Maheshkhali', districtId: 'coxsbazar' },
  { id: 'ramu', name: 'রামু', nameEn: 'Ramu', districtId: 'coxsbazar' },
  { id: 'teknaf', name: 'টেকনাফ', nameEn: 'Teknaf', districtId: 'coxsbazar' },
  { id: 'ukhia', name: 'উখিয়া', nameEn: 'Ukhia', districtId: 'coxsbazar' },
  { id: 'pekua', name: 'পেকুয়া', nameEn: 'Pekua', districtId: 'coxsbazar' },
  { id: 'eidgaon', name: 'ঈদগাঁও', nameEn: 'Eidgaon', districtId: 'coxsbazar' },
  { id: 'bagha', name: 'বাঘা', nameEn: 'Bagha', districtId: 'rajshahi' },
  { id: 'bagmara', name: 'বাগমারা', nameEn: 'Bagmara', districtId: 'rajshahi' },
  { id: 'charghat', name: 'চারঘাট', nameEn: 'Charghat', districtId: 'rajshahi' },
  { id: 'durgapur', name: 'দুর্গাপুর', nameEn: 'Durgapur', districtId: 'rajshahi' },
  { id: 'godagari', name: 'গোদাগাড়ী', nameEn: 'Godagari', districtId: 'rajshahi' },
  { id: 'mohanpur', name: 'মোহনপুর', nameEn: 'Mohanpur', districtId: 'rajshahi' },
  { id: 'paba', name: 'পবা', nameEn: 'Paba', districtId: 'rajshahi' },
  { id: 'puthia', name: 'পুঠিয়া', nameEn: 'Puthia', districtId: 'rajshahi' },
  { id: 'tanore', name: 'তানোর', nameEn: 'Tanore', districtId: 'rajshahi' },
  { id: 'adamdighi', name: 'আদমদিঘী', nameEn: 'Adamdighi', districtId: 'bogura' },
  { id: 'bogura-sadar', name: 'বগুড়া সদর', nameEn: 'Bogura Sadar', districtId: 'bogura' },
  { id: 'dhunat', name: 'ধুনট', nameEn: 'Dhunat', districtId: 'bogura' },
  { id: 'dhupchanchia', name: 'দুপচাঁচিয়া', nameEn: 'Dhupchanchia', districtId: 'bogura' },
  { id: 'gabtali', name: 'গাবতলী', nameEn: 'Gabtali', districtId: 'bogura' },
  { id: 'kahaloo', name: 'কাহালু', nameEn: 'Kahaloo', districtId: 'bogura' },
  { id: 'nandigram', name: 'নন্দিগ্রাম', nameEn: 'Nandigram', districtId: 'bogura' },
  { id: 'sariakandi', name: 'সারিয়াকান্দি', nameEn: 'Sariakandi', districtId: 'bogura' },
  { id: 'shajahanpur', name: 'শাজাহানপুর', nameEn: 'Shajahanpur', districtId: 'bogura' },
  { id: 'sherpur', name: 'শেরপুর', nameEn: 'Sherpur', districtId: 'bogura' },
  { id: 'shibganj', name: 'শিবগঞ্জ', nameEn: 'Shibganj', districtId: 'bogura' },
  { id: 'sonatola', name: 'সোনাতলা', nameEn: 'Sonatola', districtId: 'bogura' },
  { id: 'balaganj', name: 'বালাগঞ্জ', nameEn: 'Balaganj', districtId: 'sylhet' },
  { id: 'beanibazar', name: 'বিয়ানীবাজার', nameEn: 'Beanibazar', districtId: 'sylhet' },
  { id: 'bishwanath', name: 'বিশ্বনাথ', nameEn: 'Bishwanath', districtId: 'sylhet' },
  { id: 'companiganj', name: 'কোম্পানীগঞ্জ', nameEn: 'Companiganj', districtId: 'sylhet' },
  { id: 'fenchuganj', name: 'ফেঞ্চুগঞ্জ', nameEn: 'Fenchuganj', districtId: 'sylhet' },
  { id: 'golapganj', name: 'গোলাপগঞ্জ', nameEn: 'Golapganj', districtId: 'sylhet' },
  { id: 'gowainghat', name: 'গোয়াইনঘাট', nameEn: 'Gowainghat', districtId: 'sylhet' },
  { id: 'jaintiapur', name: 'জৈন্তাপুর', nameEn: 'Jaintiapur', districtId: 'sylhet' },
  { id: 'kanaighat', name: 'কানাইঘাট', nameEn: 'Kanaighat', districtId: 'sylhet' },
  { id: 'sylhet-sadar', name: 'সিলেট সদর', nameEn: 'Sylhet Sadar', districtId: 'sylhet' },
  { id: 'zakiganj', name: 'জকিগঞ্জ', nameEn: 'Zakiganj', districtId: 'sylhet' },
  { id: 'dakshin-surma', name: 'দক্ষিণ সুরমা', nameEn: 'Dakshin Surma', districtId: 'sylhet' },
  { id: 'badarganj', name: 'বদরগঞ্জ', nameEn: 'Badarganj', districtId: 'rangpur' },
  { id: 'gangachara', name: 'গঙ্গাচড়া', nameEn: 'Gangachara', districtId: 'rangpur' },
  { id: 'kaunia', name: 'কাউনিয়া', nameEn: 'Kaunia', districtId: 'rangpur' },
  { id: 'rangpur-sadar', name: 'রংপুর সদর', nameEn: 'Rangpur Sadar', districtId: 'rangpur' },
  { id: 'mithapukur', name: 'মিঠাপুকুর', nameEn: 'Mithapukur', districtId: 'rangpur' },
  { id: 'pirgachha', name: 'পীরগাছা', nameEn: 'Pirgachha', districtId: 'rangpur' },
  { id: 'pirganj', name: 'পীরগঞ্জ', nameEn: 'Pirganj', districtId: 'rangpur' },
  { id: 'taraganj', name: 'তারাগঞ্জ', nameEn: 'Taraganj', districtId: 'rangpur' },
  { id: 'bhaluka', name: 'ভালুকা', nameEn: 'Bhaluka', districtId: 'mymensingh' },
  { id: 'dhobaura', name: 'ধোবাউড়া', nameEn: 'Dhobaura', districtId: 'mymensingh' },
  { id: 'fulbaria', name: 'ফুলবাড়িয়া', nameEn: 'Fulbaria', districtId: 'mymensingh' },
  { id: 'gaffargaon', name: 'গফরগাঁও', nameEn: 'Gaffargaon', districtId: 'mymensingh' },
  { id: 'gauripur', name: 'গৌরীপুর', nameEn: 'Gauripur', districtId: 'mymensingh' },
  { id: 'haluaghat', name: 'হালুয়াঘাট', nameEn: 'Haluaghat', districtId: 'mymensingh' },
  { id: 'ishwarganj', name: 'ঈশ্বরগঞ্জ', nameEn: 'Ishwarganj', districtId: 'mymensingh' },
  { id: 'mymensingh-sadar', name: 'ময়মনসিংহ সদর', nameEn: 'Mymensingh Sadar', districtId: 'mymensingh' },
  { id: 'muktagachha', name: 'মুক্তাগাছা', nameEn: 'Muktagachha', districtId: 'mymensingh' },
  { id: 'nandail', name: 'নান্দাইল', nameEn: 'Nandail', districtId: 'mymensingh' },
  { id: 'phulpur', name: 'ফুলপুর', nameEn: 'Phulpur', districtId: 'mymensingh' },
  { id: 'trishal', name: 'ত্রিশাল', nameEn: 'Trishal', districtId: 'mymensingh' },
  { id: 'batiaghata', name: 'বটিয়াঘাটা', nameEn: 'Batiaghata', districtId: 'khulna' },
  { id: 'dacope', name: 'ডাকোপ', nameEn: 'Dacope', districtId: 'khulna' },
  { id: 'dumuria', name: 'দুমুরিয়া', nameEn: 'Dumuria', districtId: 'khulna' },
  { id: 'dighalia', name: 'দিঘলিয়া', nameEn: 'Dighalia', districtId: 'khulna' },
  { id: 'koyra', name: 'কয়রা', nameEn: 'Koyra', districtId: 'khulna' },
  { id: 'paikgachha', name: 'পাইকগাছা', nameEn: 'Paikgachha', districtId: 'khulna' },
  { id: 'phultala', name: 'ফুলতলা', nameEn: 'Phultala', districtId: 'khulna' },
  { id: 'rupsa', name: 'রূপসা', nameEn: 'Rupsa', districtId: 'khulna' },
  { id: 'terokhada', name: 'তেরখাদা', nameEn: 'Terokhada', districtId: 'khulna' },
  { id: 'agailjhara', name: 'আগৈলঝাড়া', nameEn: 'Agailjhara', districtId: 'barisal' },
  { id: 'babuganj', name: 'বাবুগঞ্জ', nameEn: 'Babuganj', districtId: 'barisal' },
  { id: 'bakerganj', name: 'বাকেরগঞ্জ', nameEn: 'Bakerganj', districtId: 'barisal' },
  { id: 'banaripara', name: 'বানারীপাড়া', nameEn: 'Banaripara', districtId: 'barisal' },
  { id: 'barishal-sadar', name: 'বরিশাল সদর', nameEn: 'Barishal Sadar', districtId: 'barisal' },
  { id: 'gournadi', name: 'গৌরনদী', nameEn: 'Gournadi', districtId: 'barisal' },
  { id: 'hizla', name: 'হিজলা', nameEn: 'Hizla', districtId: 'barisal' },
  { id: 'mehendiganj', name: 'মেহেন্দিগঞ্জ', nameEn: 'Mehendiganj', districtId: 'barisal' },
  { id: 'muladi', name: 'মুলাদী', nameEn: 'Muladi', districtId: 'barisal' },
  { id: 'wazirpur', name: 'ওয়াজিরপুর', nameEn: 'Wazirpur', districtId: 'barisal' },
  { id: 'alfadanga', name: 'আলফাডাঙ্গা', nameEn: 'Alfadanga', districtId: 'faridpur' },
  { id: 'bhanga', name: 'ভাঙ্গা', nameEn: 'Bhanga', districtId: 'faridpur' },
  { id: 'boalmari', name: 'বোয়ালমারী', nameEn: 'Boalmari', districtId: 'faridpur' },
  { id: 'charbhadrasan', name: 'চরভদ্রাসন', nameEn: 'Charbhadrasan', districtId: 'faridpur' },
  { id: 'faridpur-sadar', name: 'ফরিদপুর সদর', nameEn: 'Faridpur Sadar', districtId: 'faridpur' },
  { id: 'madhukhali', name: 'মধুখালী', nameEn: 'Madhukhali', districtId: 'faridpur' },
  { id: 'nagarkanda', name: 'নগরকান্দা', nameEn: 'Nagarkanda', districtId: 'faridpur' },
  { id: 'sadarpur', name: 'সদরপুর', nameEn: 'Sadarpur', districtId: 'faridpur' },
  { id: 'saltha', name: 'সালথা', nameEn: 'Saltha', districtId: 'faridpur' },
  { id: 'gazipur-sadar', name: 'গাজীপুর সদর', nameEn: 'Gazipur Sadar', districtId: 'gazipur' },
  { id: 'kaliakair', name: 'কালিয়াকৈর', nameEn: 'Kaliakair', districtId: 'gazipur' },
  { id: 'kaliganj', name: 'কালীগঞ্জ', nameEn: 'Kaliganj', districtId: 'gazipur' },
  { id: 'kapasia', name: 'কাপাসিয়া', nameEn: 'Kapasia', districtId: 'gazipur' },
  { id: 'sreepur', name: 'শ্রীপুর', nameEn: 'Sreepur', districtId: 'gazipur' },
  { id: 'basail', name: 'বাসাইল', nameEn: 'Basail', districtId: 'tangail' },
  { id: 'bhuapur', name: 'ভূয়াপুর', nameEn: 'Bhuapur', districtId: 'tangail' },
  { id: 'delduar', name: 'দেলদুয়ার', nameEn: 'Delduar', districtId: 'tangail' },
  { id: 'ghatail', name: 'ঘাটাইল', nameEn: 'Ghatail', districtId: 'tangail' },
  { id: 'gopalpur', name: 'গোপালপুর', nameEn: 'Gopalpur', districtId: 'tangail' },
  { id: 'kalihati', name: 'কালিহাতী', nameEn: 'Kalihati', districtId: 'tangail' },
  { id: 'madhupur', name: 'মধুপুর', nameEn: 'Madhupur', districtId: 'tangail' },
  { id: 'mirzapur', name: 'মির্জাপুর', nameEn: 'Mirzapur', districtId: 'tangail' },
  { id: 'nagarpur', name: 'নাগরপুর', nameEn: 'Nagarpur', districtId: 'tangail' },
  { id: 'sakhipur', name: 'সখিপুর', nameEn: 'Sakhipur', districtId: 'tangail' },
  { id: 'tangail-sadar', name: 'টাঙ্গাইল সদর', nameEn: 'Tangail Sadar', districtId: 'tangail' },
  { id: 'dhanbari', name: 'ধনবাড়ী', nameEn: 'Dhanbari', districtId: 'tangail' },
  { id: 'birampur', name: 'বীরামপুর', nameEn: 'Birampur', districtId: 'dinajpur' },
  { id: 'birganj', name: 'বীরগঞ্জ', nameEn: 'Birganj', districtId: 'dinajpur' },
  { id: 'biral', name: 'বিরল', nameEn: 'Biral', districtId: 'dinajpur' },
  { id: 'bochaganj', name: 'বোচাগঞ্জ', nameEn: 'Bochaganj', districtId: 'dinajpur' },
  { id: 'chirirbandar', name: 'চিরিরবন্দর', nameEn: 'Chirirbandar', districtId: 'dinajpur' },
  { id: 'dinajpur-sadar', name: 'দিনাজপুর সদর', nameEn: 'Dinajpur Sadar', districtId: 'dinajpur' },
  { id: 'ghoraghat', name: 'ঘোড়াঘাট', nameEn: 'Ghoraghat', districtId: 'dinajpur' },
  { id: 'hakimpur', name: 'হাকিমপুর', nameEn: 'Hakimpur', districtId: 'dinajpur' },
  { id: 'kaharole', name: 'কাহারোল', nameEn: 'Kaharole', districtId: 'dinajpur' },
  { id: 'khansama', name: 'খানসামা', nameEn: 'Khansama', districtId: 'dinajpur' },
  { id: 'nawabganj', name: 'নবাবগঞ্জ', nameEn: 'Nawabganj', districtId: 'dinajpur' },
  { id: 'parbatipur', name: 'পার্বতীপুর', nameEn: 'Parbatipur', districtId: 'dinajpur' },
  { id: 'phulbari', name: 'ফুলবাড়ী', nameEn: 'Phulbari', districtId: 'dinajpur' },
  { id: 'ajmiriganj', name: 'আজমিরীগঞ্জ', nameEn: 'Ajmiriganj', districtId: 'habiganj' },
  { id: 'bahubal', name: 'বাহুবল', nameEn: 'Bahubal', districtId: 'habiganj' },
  { id: 'baniachong', name: 'বানিয়াচং', nameEn: 'Baniachong', districtId: 'habiganj' },
  { id: 'chunarughat', name: 'চুনারুঘাট', nameEn: 'Chunarughat', districtId: 'habiganj' },
  { id: 'habiganj-sadar', name: 'হবিগঞ্জ সদর', nameEn: 'Habiganj Sadar', districtId: 'habiganj' },
  { id: 'lakhai', name: 'লাখাই', nameEn: 'Lakhai', districtId: 'habiganj' },
  { id: 'madhabpur', name: 'মাধবপুর', nameEn: 'Madhabpur', districtId: 'habiganj' },
  { id: 'nabiganj', name: 'নবীগঞ্জ', nameEn: 'Nabiganj', districtId: 'habiganj' },
  { id: 'shaistagonj', name: 'শায়েস্তাগঞ্জ', nameEn: 'Shaistagonj', districtId: 'habiganj' },
  { id: 'barlekha', name: 'বড়লেখা', nameEn: 'Barlekha', districtId: 'moulvibazar' },
  { id: 'juri', name: 'জুড়ী', nameEn: 'Juri', districtId: 'moulvibazar' },
  { id: 'kamalganj', name: 'কমলগঞ্জ', nameEn: 'Kamalganj', districtId: 'moulvibazar' },
  { id: 'kulaura', name: 'কুলাউড়া', nameEn: 'Kulaura', districtId: 'moulvibazar' },
  { id: 'moulvibazar-sadar', name: 'মৌলভীবাজার সদর', nameEn: 'Moulvibazar Sadar', districtId: 'moulvibazar' },
  { id: 'rajnagar', name: 'রাজনগর', nameEn: 'Rajnagar', districtId: 'moulvibazar' },
  { id: 'sreemangal', name: 'শ্রীমঙ্গল', nameEn: 'Sreemangal', districtId: 'moulvibazar' },
  { id: 'bishwamvarpur', name: 'বিশ্বম্ভরপুর', nameEn: 'Bishwamvarpur', districtId: 'sunamganj' },
  { id: 'chhatak', name: 'ছাতক', nameEn: 'Chhatak', districtId: 'sunamganj' },
  { id: 'derai', name: 'দিরাই', nameEn: 'Derai', districtId: 'sunamganj' },
  { id: 'dharamapasha', name: 'ধর্মপাশা', nameEn: 'Dharamapasha', districtId: 'sunamganj' },
  { id: 'dowarabazar', name: 'দোয়ারাবাজার', nameEn: 'Dowarabazar', districtId: 'sunamganj' },
  { id: 'jagannathpur', name: 'জগন্নাথপুর', nameEn: 'Jagannathpur', districtId: 'sunamganj' },
  { id: 'jamalganj', name: 'জামালগঞ্জ', nameEn: 'Jamalganj', districtId: 'sunamganj' },
  { id: 'sulla', name: 'সুল্লা', nameEn: 'Sulla', districtId: 'sunamganj' },
  { id: 'sunamganj-sadar', name: 'সুনামগঞ্জ সদর', nameEn: 'Sunamganj Sadar', districtId: 'sunamganj' },
  { id: 'shantiganj', name: 'শান্তিগঞ্জ', nameEn: 'Shantiganj', districtId: 'sunamganj' },
  { id: 'tahirpur', name: 'তাহিরপুর', nameEn: 'Tahirpur', districtId: 'sunamganj' },
  { id: 'south-sunamganj', name: 'দক্ষিণ সুনামগঞ্জ', nameEn: 'South Sunamganj', districtId: 'sunamganj' },
  { id: 'phulchhari', name: 'ফুলছড়ি', nameEn: 'Phulchhari', districtId: 'gaibandha' },
  { id: 'gaibandha-sadar', name: 'গাইবান্ধা সদর', nameEn: 'Gaibandha Sadar', districtId: 'gaibandha' },
  { id: 'gobindaganj', name: 'গোবিন্দগঞ্জ', nameEn: 'Gobindaganj', districtId: 'gaibandha' },
  { id: 'palashbari', name: 'পলাশবাড়ী', nameEn: 'Palashbari', districtId: 'gaibandha' },
  { id: 'sadullapur', name: 'সাদুল্লাপুর', nameEn: 'Sadullapur', districtId: 'gaibandha' },
  { id: 'sughatta', name: 'সুঘাটা', nameEn: 'Sughatta', districtId: 'gaibandha' },
  { id: 'sundarganj', name: 'সুন্দরগঞ্জ', nameEn: 'Sundarganj', districtId: 'gaibandha' },
  { id: 'bhurungamari', name: 'ভুরুঙ্গামারী', nameEn: 'Bhurungamari', districtId: 'kurigram' },
  { id: 'char-rajibpur', name: 'চর রাজিবপুর', nameEn: 'Char Rajibpur', districtId: 'kurigram' },
  { id: 'chilmari', name: 'চিলমারী', nameEn: 'Chilmari', districtId: 'kurigram' },
  { id: 'kurigram-sadar', name: 'কুড়িগ্রাম সদর', nameEn: 'Kurigram Sadar', districtId: 'kurigram' },
  { id: 'nageshwari', name: 'নাগেশ্বরী', nameEn: 'Nageshwari', districtId: 'kurigram' },
  { id: 'phulbari', name: 'ফুলবাড়ী', nameEn: 'Phulbari', districtId: 'kurigram' },
  { id: 'rajarhat', name: 'রাজারহাট', nameEn: 'Rajarhat', districtId: 'kurigram' },
  { id: 'raomari', name: 'রৌমারী', nameEn: 'Raomari', districtId: 'kurigram' },
  { id: 'ulipur', name: 'উলিপুর', nameEn: 'Ulipur', districtId: 'kurigram' },
  { id: 'aditmari', name: 'আদিতমারী', nameEn: 'Aditmari', districtId: 'lalmonirhat' },
  { id: 'hatibandha', name: 'হাতীবান্ধা', nameEn: 'Hatibandha', districtId: 'lalmonirhat' },
  { id: 'kaliganj', name: 'কালীগঞ্জ', nameEn: 'Kaliganj', districtId: 'lalmonirhat' },
  { id: 'lalmonirhat-sadar', name: 'লালমনিরহাট সদর', nameEn: 'Lalmonirhat Sadar', districtId: 'lalmonirhat' },
  { id: 'patgram', name: 'পাটগ্রাম', nameEn: 'Patgram', districtId: 'lalmonirhat' },
  { id: 'dimla', name: 'ডিমলা', nameEn: 'Dimla', districtId: 'nilphamari' },
  { id: 'domar', name: 'ডোমার', nameEn: 'Domar', districtId: 'nilphamari' },
  { id: 'jaldhaka', name: 'জলঢাকা', nameEn: 'Jaldhaka', districtId: 'nilphamari' },
  { id: 'kishoreganj', name: 'কিশোরগঞ্জ', nameEn: 'Kishoreganj', districtId: 'nilphamari' },
  { id: 'nilphamari-sadar', name: 'নীলফামারী সদর', nameEn: 'Nilphamari Sadar', districtId: 'nilphamari' },
  { id: 'saidpur', name: 'সৈয়দপুর', nameEn: 'Saidpur', districtId: 'nilphamari' },
  { id: 'atwari', name: 'আটোয়ারী', nameEn: 'Atwari', districtId: 'panchagarh' },
  { id: 'boda', name: 'বোদা', nameEn: 'Boda', districtId: 'panchagarh' },
  { id: 'debiganj', name: 'দেবীগঞ্জ', nameEn: 'Debiganj', districtId: 'panchagarh' },
  { id: 'panchagarh-sadar', name: 'পঞ্চগড় সদর', nameEn: 'Panchagarh Sadar', districtId: 'panchagarh' },
  { id: 'tetulia', name: 'তেতুলিয়া', nameEn: 'Tetulia', districtId: 'panchagarh' },
  { id: 'baliadangi', name: 'বালিয়াডাঙ্গী', nameEn: 'Baliadangi', districtId: 'thakurgaon' },
  { id: 'haripur', name: 'হরিপুর', nameEn: 'Haripur', districtId: 'thakurgaon' },
  { id: 'pirganj', name: 'পীরগঞ্জ', nameEn: 'Pirganj', districtId: 'thakurgaon' },
  { id: 'ranisankail', name: 'রাণীশংকৈল', nameEn: 'Ranisankail', districtId: 'thakurgaon' },
  { id: 'thakurgaon-sadar', name: 'ঠাকুরগাঁও সদর', nameEn: 'Thakurgaon Sadar', districtId: 'thakurgaon' },
  { id: 'akkelpur', name: 'আক্কেলপুর', nameEn: 'Akkelpur', districtId: 'joypurhat' },
  { id: 'joypurhat-sadar', name: 'জয়পুরহাট সদর', nameEn: 'Joypurhat Sadar', districtId: 'joypurhat' },
  { id: 'kalai', name: 'কালাই', nameEn: 'Kalai', districtId: 'joypurhat' },
  { id: 'khetlal', name: 'ক্ষেতলাল', nameEn: 'Khetlal', districtId: 'joypurhat' },
  { id: 'panchbibi', name: 'পাঁচবিবি', nameEn: 'Panchbibi', districtId: 'joypurhat' },
  { id: 'atrai', name: 'আত্রাই', nameEn: 'Atrai', districtId: 'naogaon' },
  { id: 'badalgachhi', name: 'বদলগাছী', nameEn: 'Badalgachhi', districtId: 'naogaon' },
  { id: 'manda', name: 'মান্দা', nameEn: 'Manda', districtId: 'naogaon' },
  { id: 'dhamoirhat', name: 'ধামইরহাট', nameEn: 'Dhamoirhat', districtId: 'naogaon' },
  { id: 'mohadevpur', name: 'মহাদেবপুর', nameEn: 'Mohadevpur', districtId: 'naogaon' },
  { id: 'naogaon-sadar', name: 'নওগাঁ সদর', nameEn: 'Naogaon Sadar', districtId: 'naogaon' },
  { id: 'niamatpur', name: 'নিয়ামতপুর', nameEn: 'Niamatpur', districtId: 'naogaon' },
  { id: 'patnitala', name: 'পত্নিতলা', nameEn: 'Patnitala', districtId: 'naogaon' },
  { id: 'porsha', name: 'পোরশা', nameEn: 'Porsha', districtId: 'naogaon' },
  { id: 'raninagar', name: 'রাণীনগর', nameEn: 'Raninagar', districtId: 'naogaon' },
  { id: 'sapahar', name: 'সাপাহার', nameEn: 'Sapahar', districtId: 'naogaon' },
  { id: 'bagatipara', name: 'বাগাতিপাড়া', nameEn: 'Bagatipara', districtId: 'natore' },
  { id: 'baraigram', name: 'বড়াইগ্রাম', nameEn: 'Baraigram', districtId: 'natore' },
  { id: 'gurudaspur', name: 'গুরুদাসপুর', nameEn: 'Gurudaspur', districtId: 'natore' },
  { id: 'lalpur', name: 'লালপুর', nameEn: 'Lalpur', districtId: 'natore' },
  { id: 'natore-sadar', name: 'নাটোর সদর', nameEn: 'Natore Sadar', districtId: 'natore' },
  { id: 'singra', name: 'সিংড়া', nameEn: 'Singra', districtId: 'natore' },
  { id: 'naldanga', name: 'নলডাঙ্গা', nameEn: 'Naldanga', districtId: 'natore' },
  { id: 'bholahat', name: 'ভোলাহাট', nameEn: 'Bholahat', districtId: 'nawabganj' },
  { id: 'gomastapur', name: 'গোমস্তাপুর', nameEn: 'Gomastapur', districtId: 'nawabganj' },
  { id: 'nachole', name: 'নাচোল', nameEn: 'Nachole', districtId: 'nawabganj' },
  { id: 'nawabganj-sadar', name: 'নবাবগঞ্জ সদর', nameEn: 'Nawabganj Sadar', districtId: 'nawabganj' },
  { id: 'shibganj', name: 'শিবগঞ্জ', nameEn: 'Shibganj', districtId: 'nawabganj' },
  { id: 'atgharia', name: 'আটঘরিয়া', nameEn: 'Atgharia', districtId: 'pabna' },
  { id: 'bera', name: 'বেড়া', nameEn: 'Bera', districtId: 'pabna' },
  { id: 'bhangura', name: 'ভাঙ্গুড়া', nameEn: 'Bhangura', districtId: 'pabna' },
  { id: 'chatmohar', name: 'চাটমোহর', nameEn: 'Chatmohar', districtId: 'pabna' },
  { id: 'faridpur', name: 'ফরিদপুর', nameEn: 'Faridpur', districtId: 'pabna' },
  { id: 'ishwardi', name: 'ঈশ্বরদী', nameEn: 'Ishwardi', districtId: 'pabna' },
  { id: 'pabna-sadar', name: 'পাবনা সদর', nameEn: 'Pabna Sadar', districtId: 'pabna' },
  { id: 'santhia', name: 'সাঁথিয়া', nameEn: 'Santhia', districtId: 'pabna' },
  { id: 'sujanagar', name: 'সুজানগর', nameEn: 'Sujanagar', districtId: 'pabna' },
  { id: 'belkuchi', name: 'বেলকুচি', nameEn: 'Belkuchi', districtId: 'sirajganj' },
  { id: 'chauhali', name: 'চৌহালি', nameEn: 'Chauhali', districtId: 'sirajganj' },
  { id: 'kamarkhand', name: 'কামারখন্ড', nameEn: 'Kamarkhand', districtId: 'sirajganj' },
  { id: 'kazipur', name: 'কাজীপুর', nameEn: 'Kazipur', districtId: 'sirajganj' },
  { id: 'raiganj', name: 'রায়গঞ্জ', nameEn: 'Raiganj', districtId: 'sirajganj' },
  { id: 'shahjadpur', name: 'শাহজাদপুর', nameEn: 'Shahjadpur', districtId: 'sirajganj' },
  { id: 'sirajganj-sadar', name: 'সিরাজগঞ্জ সদর', nameEn: 'Sirajganj Sadar', districtId: 'sirajganj' },
  { id: 'tarash', name: 'তাড়াশ', nameEn: 'Tarash', districtId: 'sirajganj' },
  { id: 'ullahpara', name: 'উল্লাপাড়া', nameEn: 'Ullahpara', districtId: 'sirajganj' },
  { id: 'bakshiganj', name: 'বকশীগঞ্জ', nameEn: 'Bakshiganj', districtId: 'jamalpur' },
  { id: 'dewanganj', name: 'দেওয়ানগঞ্জ', nameEn: 'Dewanganj', districtId: 'jamalpur' },
  { id: 'islampur', name: 'ইসলামপুর', nameEn: 'Islampur', districtId: 'jamalpur' },
  { id: 'jamalpur-sadar', name: 'জামালপুর সদর', nameEn: 'Jamalpur Sadar', districtId: 'jamalpur' },
  { id: 'madarganj', name: 'মাদারগঞ্জ', nameEn: 'Madarganj', districtId: 'jamalpur' },
  { id: 'melandaha', name: 'মেলান্দহ', nameEn: 'Melandaha', districtId: 'jamalpur' },
  { id: 'sarishabari', name: 'সরিষাবাড়ী', nameEn: 'Sarishabari', districtId: 'jamalpur' },
  { id: 'atpara', name: 'আটপাড়া', nameEn: 'Atpara', districtId: 'netrokona' },
  { id: 'barhatta', name: 'বরহাট্টা', nameEn: 'Barhatta', districtId: 'netrokona' },
  { id: 'durgapur', name: 'দুর্গাপুর', nameEn: 'Durgapur', districtId: 'netrokona' },
  { id: 'kalmakanda', name: 'কলমাকান্দা', nameEn: 'Kalmakanda', districtId: 'netrokona' },
  { id: 'kendua', name: 'কেন্দুয়া', nameEn: 'Kendua', districtId: 'netrokona' },
  { id: 'khaliajuri', name: 'খালিয়াজুরী', nameEn: 'Khaliajuri', districtId: 'netrokona' },
  { id: 'madan', name: 'মদন', nameEn: 'Madan', districtId: 'netrokona' },
  { id: 'mohanganj', name: 'মোহনগঞ্জ', nameEn: 'Mohanganj', districtId: 'netrokona' },
  { id: 'netrakona-sadar', name: 'নেত্রকোণা সদর', nameEn: 'Netrakona Sadar', districtId: 'netrokona' },
  { id: 'purbadhala', name: 'পূর্বধলা', nameEn: 'Purbadhala', districtId: 'netrokona' },
  { id: 'jhenaigati', name: 'ঝিনাইগাতী', nameEn: 'Jhenaigati', districtId: 'sherpur' },
  { id: 'nakla', name: 'নকলা', nameEn: 'Nakla', districtId: 'sherpur' },
  { id: 'nalitabari', name: 'নালিতাবাড়ী', nameEn: 'Nalitabari', districtId: 'sherpur' },
  { id: 'sherpur-sadar', name: 'শেরপুর সদর', nameEn: 'Sherpur Sadar', districtId: 'sherpur' },
  { id: 'sreebardi', name: 'শ্রীবর্দী', nameEn: 'Sreebardi', districtId: 'sherpur' },
  { id: 'bagerhat-sadar', name: 'বাগেরহাট সদর', nameEn: 'Bagerhat Sadar', districtId: 'bagerhat' },
  { id: 'chitalmari', name: 'চিতলমারী', nameEn: 'Chitalmari', districtId: 'bagerhat' },
  { id: 'fakirhat', name: 'ফকিরহাট', nameEn: 'Fakirhat', districtId: 'bagerhat' },
  { id: 'kachua', name: 'কচুয়া', nameEn: 'Kachua', districtId: 'bagerhat' },
  { id: 'mollahat', name: 'মোল্লাহাট', nameEn: 'Mollahat', districtId: 'bagerhat' },
  { id: 'mongla', name: 'মংলা', nameEn: 'Mongla', districtId: 'bagerhat' },
  { id: 'morrelganj', name: 'মোড়েলগঞ্জ', nameEn: 'Morrelganj', districtId: 'bagerhat' },
  { id: 'rampal', name: 'রামপাল', nameEn: 'Rampal', districtId: 'bagerhat' },
  { id: 'sarankhola', name: 'শরণখোলা', nameEn: 'Sarankhola', districtId: 'bagerhat' },
  { id: 'alamdanga', name: 'আলমডাঙ্গা', nameEn: 'Alamdanga', districtId: 'chuadanga' },
  { id: 'chuadanga-sadar', name: 'চুয়াডাঙ্গা সদর', nameEn: 'Chuadanga Sadar', districtId: 'chuadanga' },
  { id: 'damurhuda', name: 'দামুড়হুদা', nameEn: 'Damurhuda', districtId: 'chuadanga' },
  { id: 'jibannagar', name: 'জীবননগর', nameEn: 'Jibannagar', districtId: 'chuadanga' },
  { id: 'abhaynagar', name: 'অভয়নগর', nameEn: 'Abhaynagar', districtId: 'jessore' },
  { id: 'bagherpara', name: 'বাঘারপাড়া', nameEn: 'Bagherpara', districtId: 'jessore' },
  { id: 'chaugachha', name: 'চৌগাছা', nameEn: 'Chaugachha', districtId: 'jessore' },
  { id: 'jhikargachha', name: 'ঝিকরগাছা', nameEn: 'Jhikargachha', districtId: 'jessore' },
  { id: 'keshabpur', name: 'কেশবপুর', nameEn: 'Keshabpur', districtId: 'jessore' },
  { id: 'jashore-sadar', name: 'যশোর সদর', nameEn: 'Jashore Sadar', districtId: 'jessore' },
  { id: 'manirampur', name: 'মণিরামপুর', nameEn: 'Manirampur', districtId: 'jessore' },
  { id: 'sharsha', name: 'শার্শা', nameEn: 'Sharsha', districtId: 'jessore' },
  { id: 'harinakunda', name: 'হরিণাকুন্ডু', nameEn: 'Harinakunda', districtId: 'jhenaidah' },
  { id: 'jhenaidah-sadar', name: 'ঝিনাইদহ সদর', nameEn: 'Jhenaidah Sadar', districtId: 'jhenaidah' },
  { id: 'kaliganj', name: 'কালীগঞ্জ', nameEn: 'Kaliganj', districtId: 'jhenaidah' },
  { id: 'kotchandpur', name: 'কোটচাঁদপুর', nameEn: 'Kotchandpur', districtId: 'jhenaidah' },
  { id: 'maheshpur', name: 'মহেশপুর', nameEn: 'Maheshpur', districtId: 'jhenaidah' },
  { id: 'shailkupa', name: 'শৈলকুপা', nameEn: 'Shailkupa', districtId: 'jhenaidah' },
  { id: 'bheramara', name: 'ভেড়ামারা', nameEn: 'Bheramara', districtId: 'kushtia' },
  { id: 'daulatpur', name: 'দৌলতপুর', nameEn: 'Daulatpur', districtId: 'kushtia' },
  { id: 'khoksa', name: 'খোকসা', nameEn: 'Khoksa', districtId: 'kushtia' },
  { id: 'kumarkhali', name: 'কুমারখালী', nameEn: 'Kumarkhali', districtId: 'kushtia' },
  { id: 'kushtia-sadar', name: 'কুষ্টিয়া সদর', nameEn: 'Kushtia Sadar', districtId: 'kushtia' },
  { id: 'mirpur', name: 'মিরপুর', nameEn: 'Mirpur', districtId: 'kushtia' },
  { id: 'magura-sadar', name: 'মাগুরা সদর', nameEn: 'Magura Sadar', districtId: 'magura' },
  { id: 'mohammadpur', name: 'মোহাম্মদপুর', nameEn: 'Mohammadpur', districtId: 'magura' },
  { id: 'shalikha', name: 'শালিখা', nameEn: 'Shalikha', districtId: 'magura' },
  { id: 'sreepur', name: 'শ্রীপুর', nameEn: 'Sreepur', districtId: 'magura' },
  { id: 'gangni', name: 'গাংনী', nameEn: 'Gangni', districtId: 'meherpur' },
  { id: 'meherpur-sadar', name: 'মেহেরপুর সদর', nameEn: 'Meherpur Sadar', districtId: 'meherpur' },
  { id: 'mujibnagar', name: 'মুজিবনগর', nameEn: 'Mujibnagar', districtId: 'meherpur' },
  { id: 'kalia', name: 'কালিয়া', nameEn: 'Kalia', districtId: 'narail' },
  { id: 'lohagara', name: 'লোহাগড়া', nameEn: 'Lohagara', districtId: 'narail' },
  { id: 'narail-sadar', name: 'নড়াইল সদর', nameEn: 'Narail Sadar', districtId: 'narail' },
  { id: 'assasuni', name: 'আশাশুনি', nameEn: 'Assasuni', districtId: 'satkhira' },
  { id: 'debhata', name: 'দেবহাটা', nameEn: 'Debhata', districtId: 'satkhira' },
  { id: 'kalaroa', name: 'কলারোয়া', nameEn: 'Kalaroa', districtId: 'satkhira' },
  { id: 'kaliganj', name: 'কালিগঞ্জ', nameEn: 'Kaliganj', districtId: 'satkhira' },
  { id: 'satkhira-sadar', name: 'সাতক্ষীরা সদর', nameEn: 'Satkhira Sadar', districtId: 'satkhira' },
  { id: 'shyamnagar', name: 'শ্যামনগর', nameEn: 'Shyamnagar', districtId: 'satkhira' },
  { id: 'tala', name: 'তালা', nameEn: 'Tala', districtId: 'satkhira' },
  { id: 'amtali', name: 'আমতলী', nameEn: 'Amtali', districtId: 'barguna' },
  { id: 'bamna', name: 'বামনা', nameEn: 'Bamna', districtId: 'barguna' },
  { id: 'betagi', name: 'বেতাগী', nameEn: 'Betagi', districtId: 'barguna' },
  { id: 'patharghata', name: 'পাথরঘাটা', nameEn: 'Patharghata', districtId: 'barguna' },
  { id: 'taltali', name: 'তালতলি', nameEn: 'Taltali', districtId: 'barguna' },
  { id: 'bhola-sadar', name: 'ভোলা সদর', nameEn: 'Bhola Sadar', districtId: 'bhola' },
  { id: 'burhanuddin', name: 'বুরহানউদ্দিন', nameEn: 'Burhanuddin', districtId: 'bhola' },
  { id: 'char-fasson', name: 'চর ফ্যাশন', nameEn: 'Char Fasson', districtId: 'bhola' },
  { id: 'daulatkhan', name: 'দৌলতখান', nameEn: 'Daulatkhan', districtId: 'bhola' },
  { id: 'lalmohan', name: 'লালমোহন', nameEn: 'Lalmohan', districtId: 'bhola' },
  { id: 'manpura', name: 'মনপুরা', nameEn: 'Manpura', districtId: 'bhola' },
  { id: 'tazumuddin', name: 'তাজুমুদ্দিন', nameEn: 'Tazumuddin', districtId: 'bhola' },
  { id: 'jhalokathi-sadar', name: 'ঝালকাঠি সদর', nameEn: 'Jhalokathi Sadar', districtId: 'jhalokati' },
  { id: 'kathalia', name: 'কাঠালিয়া', nameEn: 'Kathalia', districtId: 'jhalokati' },
  { id: 'nalchity', name: 'নলছিটি', nameEn: 'Nalchity', districtId: 'jhalokati' },
  { id: 'rajapur', name: 'রাজাপুর', nameEn: 'Rajapur', districtId: 'jhalokati' },
  { id: 'bauphal', name: 'বাউফল', nameEn: 'Bauphal', districtId: 'patuakhali' },
  { id: 'dashmina', name: 'দশমিনা', nameEn: 'Dashmina', districtId: 'patuakhali' },
  { id: 'dumki', name: 'দুমকি', nameEn: 'Dumki', districtId: 'patuakhali' },
  { id: 'galachipa', name: 'গলাচিপা', nameEn: 'Galachipa', districtId: 'patuakhali' },
  { id: 'kalapara', name: 'কলাপাড়া', nameEn: 'Kalapara', districtId: 'patuakhali' },
  { id: 'mirzaganj', name: 'মির্জাগঞ্জ', nameEn: 'Mirzaganj', districtId: 'patuakhali' },
  { id: 'patuakhali-sadar', name: 'পটুয়াখালী সদর', nameEn: 'Patuakhali Sadar', districtId: 'patuakhali' },
  { id: 'rangabali', name: 'রাঙ্গাবালী', nameEn: 'Rangabali', districtId: 'patuakhali' },
  { id: 'bhandaria', name: 'ভান্ডারিয়া', nameEn: 'Bhandaria', districtId: 'pirojpur' },
  { id: 'kawkhali', name: 'কাউখালী', nameEn: 'Kawkhali', districtId: 'pirojpur' },
  { id: 'mathbaria', name: 'মঠবাড়িয়া', nameEn: 'Mathbaria', districtId: 'pirojpur' },
  { id: 'nazirpur', name: 'নাজিরপুর', nameEn: 'Nazirpur', districtId: 'pirojpur' },
  { id: 'nesarabad', name: 'নেছারাবাদ', nameEn: 'Nesarabad', districtId: 'pirojpur' },
  { id: 'pirojpur-sadar', name: 'পিরোজপুর সদর', nameEn: 'Pirojpur Sadar', districtId: 'pirojpur' },
  { id: 'zianagar', name: 'জিয়ানগর', nameEn: 'Zianagar', districtId: 'pirojpur' },
  { id: 'ali-kadam', name: 'আলী কদম', nameEn: 'Ali Kadam', districtId: 'bandarban' },
  { id: 'bandarban-sadar', name: 'বান্দরবান সদর', nameEn: 'Bandarban Sadar', districtId: 'bandarban' },
  { id: 'lama', name: 'লামা', nameEn: 'Lama', districtId: 'bandarban' },
  { id: 'naikhongchhari', name: 'নাইক্ষ্যংছড়ি', nameEn: 'Naikhongchhari', districtId: 'bandarban' },
  { id: 'rowangchhari', name: 'রোয়াংছড়ি', nameEn: 'Rowangchhari', districtId: 'bandarban' },
  { id: 'ruma', name: 'রুমা', nameEn: 'Ruma', districtId: 'bandarban' },
  { id: 'thanchi', name: 'থানচি', nameEn: 'Thanchi', districtId: 'bandarban' },
  { id: 'akhaura', name: 'আখাউড়া', nameEn: 'Akhaura', districtId: 'brahmanbaria' },
  { id: 'bancharampur', name: 'বাঞ্ছারামপুর', nameEn: 'Bancharampur', districtId: 'brahmanbaria' },
  { id: 'brahmanbaria-sadar', name: 'ব্রাহ্মণবাড়িয়া সদর', nameEn: 'Brahmanbaria Sadar', districtId: 'brahmanbaria' },
  { id: 'kasba', name: 'কসবা', nameEn: 'Kasba', districtId: 'brahmanbaria' },
  { id: 'nabinagar', name: 'নবীনগর', nameEn: 'Nabinagar', districtId: 'brahmanbaria' },
  { id: 'nasirnagar', name: 'নাসিরনগর', nameEn: 'Nasirnagar', districtId: 'brahmanbaria' },
  { id: 'sarail', name: 'সরাইল', nameEn: 'Sarail', districtId: 'brahmanbaria' },
  { id: 'ashuganj', name: 'আশুগঞ্জ', nameEn: 'Ashuganj', districtId: 'brahmanbaria' },
  { id: 'bijoynagar', name: 'বিজয়নগর', nameEn: 'Bijoynagar', districtId: 'brahmanbaria' },
  { id: 'chandpur-sadar', name: 'চাঁদপুর সদর', nameEn: 'Chandpur Sadar', districtId: 'chandpur' },
  { id: 'faridganj', name: 'ফরিদগঞ্জ', nameEn: 'Faridganj', districtId: 'chandpur' },
  { id: 'haimchar', name: 'হাইমচর', nameEn: 'Haimchar', districtId: 'chandpur' },
  { id: 'haziganj', name: 'হাজীগঞ্জ', nameEn: 'Haziganj', districtId: 'chandpur' },
  { id: 'kachua', name: 'কচুয়া', nameEn: 'Kachua', districtId: 'chandpur' },
  { id: 'matlab-dakshin', name: 'মতলব দক্ষিণ', nameEn: 'Matlab Dakshin', districtId: 'chandpur' },
  { id: 'matlab-uttar', name: 'মতলব উত্তর', nameEn: 'Matlab Uttar', districtId: 'chandpur' },
  { id: 'shahrasti', name: 'শাহরাস্তি', nameEn: 'Shahrasti', districtId: 'chandpur' },
  { id: 'chhagalnaiya', name: 'ছাগলনাইয়া', nameEn: 'Chhagalnaiya', districtId: 'feni' },
  { id: 'daganbhuiyan', name: 'দাগনভূঞা', nameEn: 'Daganbhuiyan', districtId: 'feni' },
  { id: 'feni-sadar', name: 'ফেনী সদর', nameEn: 'Feni Sadar', districtId: 'feni' },
  { id: 'fulgazi', name: 'ফুলগাজী', nameEn: 'Fulgazi', districtId: 'feni' },
  { id: 'parshuram', name: 'পরশুরাম', nameEn: 'Parshuram', districtId: 'feni' },
  { id: 'sonagazi', name: 'সোনাগাজী', nameEn: 'Sonagazi', districtId: 'feni' },
  { id: 'dighinala', name: 'দিঘীনালা', nameEn: 'Dighinala', districtId: 'khagrachhari' },
  { id: 'khagrachhari-sadar', name: 'খাগড়াছড়ি সদর', nameEn: 'Khagrachhari Sadar', districtId: 'khagrachhari' },
  { id: 'lakshmichhari', name: 'লক্ষ্মীছড়ি', nameEn: 'Lakshmichhari', districtId: 'khagrachhari' },
  { id: 'mahalchhari', name: 'মহালছড়ি', nameEn: 'Mahalchhari', districtId: 'khagrachhari' },
  { id: 'manikchhari', name: 'মানিকছড়ি', nameEn: 'Manikchhari', districtId: 'khagrachhari' },
  { id: 'matiranga', name: 'মাটিরাঙ্গা', nameEn: 'Matiranga', districtId: 'khagrachhari' },
  { id: 'panchhari', name: 'পানছড়ি', nameEn: 'Panchhari', districtId: 'khagrachhari' },
  { id: 'ramgarh', name: 'রামগড়', nameEn: 'Ramgarh', districtId: 'khagrachhari' },
  { id: 'guimara', name: 'গুইমারা', nameEn: 'Guimara', districtId: 'khagrachhari' },
  { id: 'lakshmipur-sadar', name: 'লক্ষ্মীপুর সদর', nameEn: 'Lakshmipur Sadar', districtId: 'lakshmipur' },
  { id: 'raipur', name: 'রায়পুর', nameEn: 'Raipur', districtId: 'lakshmipur' },
  { id: 'ramganj', name: 'রামগঞ্জ', nameEn: 'Ramganj', districtId: 'lakshmipur' },
  { id: 'ramgati', name: 'রামগতি', nameEn: 'Ramgati', districtId: 'lakshmipur' },
  { id: 'kamalnagar', name: 'কমলনগর', nameEn: 'Kamalnagar', districtId: 'lakshmipur' },
  { id: 'begumganj', name: 'বেগমগঞ্জ', nameEn: 'Begumganj', districtId: 'noakhali' },
  { id: 'noakhali-sadar', name: 'নোয়াখালী সদর', nameEn: 'Noakhali Sadar', districtId: 'noakhali' },
  { id: 'chatkhil', name: 'চাটখিল', nameEn: 'Chatkhil', districtId: 'noakhali' },
  { id: 'companiganj', name: 'কোম্পানীগঞ্জ', nameEn: 'Companiganj', districtId: 'noakhali' },
  { id: 'hatiya', name: 'হাতিয়া', nameEn: 'Hatiya', districtId: 'noakhali' },
  { id: 'kabirhat', name: 'কবিরহাট', nameEn: 'Kabirhat', districtId: 'noakhali' },
  { id: 'senbagh', name: 'সেনবাগ', nameEn: 'Senbagh', districtId: 'noakhali' },
  { id: 'sonaimuri', name: 'সোনাইমুড়ী', nameEn: 'Sonaimuri', districtId: 'noakhali' },
  { id: 'subarnachar', name: 'সুবর্ণচর', nameEn: 'Subarnachar', districtId: 'noakhali' },
  { id: 'baghaichhari', name: 'বাঘাইছড়ি', nameEn: 'Baghaichhari', districtId: 'rangamati' },
  { id: 'barkal', name: 'বরকল', nameEn: 'Barkal', districtId: 'rangamati' },
  { id: 'kawkhali', name: 'কাউখালী', nameEn: 'Kawkhali', districtId: 'rangamati' },
  { id: 'belaichhari', name: 'বিলাইছড়ি', nameEn: 'Belaichhari', districtId: 'rangamati' },
  { id: 'kaptai', name: 'কাপ্তাই', nameEn: 'Kaptai', districtId: 'rangamati' },
  { id: 'juraichhari', name: 'জুরাছড়ি', nameEn: 'Juraichhari', districtId: 'rangamati' },
  { id: 'langadu', name: 'লাঙ্গাডু', nameEn: 'Langadu', districtId: 'rangamati' },
  { id: 'naniarchar', name: 'নানিয়ারচর', nameEn: 'Naniarchar', districtId: 'rangamati' },
  { id: 'rajasthali', name: 'রাজস্থলী', nameEn: 'Rajasthali', districtId: 'rangamati' },
  { id: 'rangamati-sadar', name: 'রাঙ্গামাটি সদর', nameEn: 'Rangamati Sadar', districtId: 'rangamati' },
  { id: 'gopalganj-sadar', name: 'গোপালগঞ্জ সদর', nameEn: 'Gopalganj Sadar', districtId: 'gopalganj' },
  { id: 'kashiani', name: 'কাশিয়ানী', nameEn: 'Kashiani', districtId: 'gopalganj' },
  { id: 'kotalipara', name: 'কোটালীপাড়া', nameEn: 'Kotalipara', districtId: 'gopalganj' },
  { id: 'muksudpur', name: 'মুকসুদপুর', nameEn: 'Muksudpur', districtId: 'gopalganj' },
  { id: 'tungipara', name: 'টুঙ্গীপাড়া', nameEn: 'Tungipara', districtId: 'gopalganj' },
  { id: 'austagram', name: 'অষ্টগ্রাম', nameEn: 'Austagram', districtId: 'kishoreganj' },
  { id: 'bajitpur', name: 'বাজিতপুর', nameEn: 'Bajitpur', districtId: 'kishoreganj' },
  { id: 'bhairab', name: 'ভৈরব', nameEn: 'Bhairab', districtId: 'kishoreganj' },
  { id: 'hossainpur', name: 'হোসেনপুর', nameEn: 'Hossainpur', districtId: 'kishoreganj' },
  { id: 'itna', name: 'ইটনা', nameEn: 'Itna', districtId: 'kishoreganj' },
  { id: 'karimganj', name: 'করিমগঞ্জ', nameEn: 'Karimganj', districtId: 'kishoreganj' },
  { id: 'katiadi', name: 'কটিয়াদী', nameEn: 'Katiadi', districtId: 'kishoreganj' },
  { id: 'kishoreganj-sadar', name: 'কিশোরগঞ্জ সদর', nameEn: 'Kishoreganj Sadar', districtId: 'kishoreganj' },
  { id: 'kuliarchar', name: 'কুলিয়ারচর', nameEn: 'Kuliarchar', districtId: 'kishoreganj' },
  { id: 'mithamain', name: 'মিঠামইন', nameEn: 'Mithamain', districtId: 'kishoreganj' },
  { id: 'nikli', name: 'নিকলী', nameEn: 'Nikli', districtId: 'kishoreganj' },
  { id: 'pakundia', name: 'পাকুন্দিয়া', nameEn: 'Pakundia', districtId: 'kishoreganj' },
  { id: 'tarail', name: 'তাড়াইল', nameEn: 'Tarail', districtId: 'kishoreganj' },
  { id: 'kalkini', name: 'কালকিনি', nameEn: 'Kalkini', districtId: 'madaripur' },
  { id: 'madaripur-sadar', name: 'মাদারীপুর সদর', nameEn: 'Madaripur Sadar', districtId: 'madaripur' },
  { id: 'rajoir', name: 'রাজৈর', nameEn: 'Rajoir', districtId: 'madaripur' },
  { id: 'shibchar', name: 'শিবচর', nameEn: 'Shibchar', districtId: 'madaripur' },
  { id: 'dasar', name: 'দাসার', nameEn: 'Dasar', districtId: 'madaripur' },
  { id: 'daulatpur', name: 'দৌলতপুর', nameEn: 'Daulatpur', districtId: 'manikganj' },
  { id: 'ghior', name: 'ঘিওর', nameEn: 'Ghior', districtId: 'manikganj' },
  { id: 'harirampur', name: 'হরিরামপুর', nameEn: 'Harirampur', districtId: 'manikganj' },
  { id: 'manikganj-sadar', name: 'মানিকগঞ্জ সদর', nameEn: 'Manikganj Sadar', districtId: 'manikganj' },
  { id: 'saturia', name: 'সাটুরিয়া', nameEn: 'Saturia', districtId: 'manikganj' },
  { id: 'shivalaya', name: 'শিবালয়', nameEn: 'Shivalaya', districtId: 'manikganj' },
  { id: 'singair', name: 'সিংগাইর', nameEn: 'Singair', districtId: 'manikganj' },
  { id: 'gazaria', name: 'গজারিয়া', nameEn: 'Gazaria', districtId: 'munshiganj' },
  { id: 'lohajang', name: 'লৌহজং', nameEn: 'Lohajang', districtId: 'munshiganj' },
  { id: 'munshiganj-sadar', name: 'মুন্সিগঞ্জ সদর', nameEn: 'Munshiganj Sadar', districtId: 'munshiganj' },
  { id: 'serajdikhan', name: 'সিরাজদিখান', nameEn: 'Serajdikhan', districtId: 'munshiganj' },
  { id: 'sreenagar', name: 'শ্রীনগর', nameEn: 'Sreenagar', districtId: 'munshiganj' },
  { id: 'tongibari', name: 'টংগীবাড়ি', nameEn: 'Tongibari', districtId: 'munshiganj' },
  { id: 'araihazar', name: 'আড়াইহাজার', nameEn: 'Araihazar', districtId: 'narayanganj' },
  { id: 'bandar', name: 'বন্দর', nameEn: 'Bandar', districtId: 'narayanganj' },
  { id: 'narayanganj-sadar', name: 'নারায়ণগঞ্জ সদর', nameEn: 'Narayanganj Sadar', districtId: 'narayanganj' },
  { id: 'rupganj', name: 'রূপগঞ্জ', nameEn: 'Rupganj', districtId: 'narayanganj' },
  { id: 'sonargaon', name: 'সোনারগাঁ', nameEn: 'Sonargaon', districtId: 'narayanganj' },
  { id: 'belabo', name: 'বেলাবো', nameEn: 'Belabo', districtId: 'narsingdi' },
  { id: 'monohardi', name: 'মনোহরদী', nameEn: 'Monohardi', districtId: 'narsingdi' },
  { id: 'norsingdi-sadar', name: 'নরসিংদী সদর', nameEn: 'Norsingdi Sadar', districtId: 'narsingdi' },
  { id: 'palash', name: 'পলাশ', nameEn: 'Palash', districtId: 'narsingdi' },
  { id: 'raipura', name: 'রায়পুরা', nameEn: 'Raipura', districtId: 'narsingdi' },
  { id: 'shibpur', name: 'শিবপুর', nameEn: 'Shibpur', districtId: 'narsingdi' },
  { id: 'baliakandi', name: 'বালিয়াকান্দি', nameEn: 'Baliakandi', districtId: 'rajbari' },
  { id: 'goalandaghat', name: 'গোয়ালন্দ ঘাট', nameEn: 'Goalandaghat', districtId: 'rajbari' },
  { id: 'pangsha', name: 'পাংশা', nameEn: 'Pangsha', districtId: 'rajbari' },
  { id: 'rajbari-sadar', name: 'রাজবাড়ী সদর', nameEn: 'Rajbari Sadar', districtId: 'rajbari' },
  { id: 'kalukhali', name: 'কালুখালী', nameEn: 'Kalukhali', districtId: 'rajbari' },
  { id: 'bhedarganj', name: 'ভেদরগঞ্জ', nameEn: 'Bhedarganj', districtId: 'shariatpur' },
  { id: 'damudya', name: 'ডামুড্যা', nameEn: 'Damudya', districtId: 'shariatpur' },
  { id: 'gosairhat', name: 'গোসাইরহাট', nameEn: 'Gosairhat', districtId: 'shariatpur' },
  { id: 'naria', name: 'নড়িয়া', nameEn: 'Naria', districtId: 'shariatpur' },
  { id: 'shariatpur-sadar', name: 'শরীয়তপুর সদর', nameEn: 'Shariatpur Sadar', districtId: 'shariatpur' },
  { id: 'zajira', name: 'জাজিরা', nameEn: 'Zajira', districtId: 'shariatpur' },
  { id: 'shakhipur', name: 'শাখিপুর', nameEn: 'Shakhipur', districtId: 'shariatpur' },
  { id: 'sunamganj-sadar', name: 'সুনামগঞ্জ সদর', nameEn: 'Sunamganj Sadar', districtId: 'sunamganj' },
  { id: 'madhyanagar', name: 'মধ্যনগর', nameEn: 'Madhyanagar', districtId: 'sunamganj' },
  { id: 'companiganj', name: 'কোম্পানীগঞ্জ', nameEn: 'Companiganj', districtId: 'sylhet' }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all districts sorted alphabetically by Bengali name
 */
export function getAllDistricts(): District[] {
  return [...DISTRICTS].sort((a, b) => a.name.localeCompare(b.name, 'bn'));
}

/**
 * Get districts by division
 */
export function getDistrictsByDivision(divisionId: string): District[] {
  return DISTRICTS.filter(d => d.divisionId === divisionId)
    .sort((a, b) => a.name.localeCompare(b.name, 'bn'));
}

/**
 * Get upazilas by district
 */
export function getUpazilasByDistrict(districtId: string): Upazila[] {
  const upazilas = UPAZILAS.filter(u => u.districtId === districtId)
    .sort((a, b) => a.name.localeCompare(b.name, 'bn'));
  
  // Add "Other" option at the end
  if (upazilas.length > 0) {
    upazilas.push({
      id: `other_${districtId}`,
      name: 'অন্যান্য',
      nameEn: 'Other',
      districtId,
    });
  }
  
  return upazilas;
}

/**
 * Check if a district is in Dhaka Division (for shipping calculation)
 */
export function isInDhakaDivision(districtId: string): boolean {
  const district = DISTRICTS.find(d => d.id === districtId);
  return district?.divisionId === 'dhaka';
}

/**
 * Get shipping zone from district
 * Returns 'dhaka' for Dhaka division, 'outside' for others
 */
export function getShippingZone(districtId: string): 'dhaka' | 'outside' {
  return isInDhakaDivision(districtId) ? 'dhaka' : 'outside';
}

/**
 * Find district by ID
 */
export function getDistrictById(id: string): District | undefined {
  return DISTRICTS.find(d => d.id === id);
}

/**
 * Find upazila by ID
 */
export function getUpazilaById(id: string): Upazila | undefined {
  return UPAZILAS.find(u => u.id === id);
}

/**
 * Search districts by name (Bengali or English)
 */
export function searchDistricts(query: string): District[] {
  const lowerQuery = query.toLowerCase();
  return DISTRICTS.filter(d => 
    d.name.includes(query) || 
    d.nameEn.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search upazilas by name within a district
 */
export function searchUpazilas(districtId: string, query: string): Upazila[] {
  const lowerQuery = query.toLowerCase();
  return getUpazilasByDistrict(districtId).filter(u => 
    u.name.includes(query) || 
    u.nameEn.toLowerCase().includes(lowerQuery)
  );
}
