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
  // Dhaka District - Major Thanas
  { id: 'dhanmondi', name: 'ধানমন্ডি', nameEn: 'Dhanmondi', districtId: 'dhaka' },
  { id: 'gulshan', name: 'গুলশান', nameEn: 'Gulshan', districtId: 'dhaka' },
  { id: 'banani', name: 'বনানী', nameEn: 'Banani', districtId: 'dhaka' },
  { id: 'uttara', name: 'উত্তরা', nameEn: 'Uttara', districtId: 'dhaka' },
  { id: 'mirpur', name: 'মিরপুর', nameEn: 'Mirpur', districtId: 'dhaka' },
  { id: 'mohammadpur', name: 'মোহাম্মদপুর', nameEn: 'Mohammadpur', districtId: 'dhaka' },
  { id: 'motijheel', name: 'মতিঝিল', nameEn: 'Motijheel', districtId: 'dhaka' },
  { id: 'tejgaon', name: 'তেজগাঁও', nameEn: 'Tejgaon', districtId: 'dhaka' },
  { id: 'badda', name: 'বাড্ডা', nameEn: 'Badda', districtId: 'dhaka' },
  { id: 'rampura', name: 'রামপুরা', nameEn: 'Rampura', districtId: 'dhaka' },
  { id: 'khilgaon', name: 'খিলগাঁও', nameEn: 'Khilgaon', districtId: 'dhaka' },
  { id: 'jatrabari', name: 'যাত্রাবাড়ী', nameEn: 'Jatrabari', districtId: 'dhaka' },
  { id: 'lalbagh', name: 'লালবাগ', nameEn: 'Lalbagh', districtId: 'dhaka' },
  { id: 'hazaribagh', name: 'হাজারীবাগ', nameEn: 'Hazaribagh', districtId: 'dhaka' },
  { id: 'wari', name: 'ওয়ারী', nameEn: 'Wari', districtId: 'dhaka' },
  { id: 'sutrapur', name: 'সূত্রাপুর', nameEn: 'Sutrapur', districtId: 'dhaka' },
  { id: 'shyampur', name: 'শ্যামপুর', nameEn: 'Shyampur', districtId: 'dhaka' },
  { id: 'kadamtoli', name: 'কদমতলী', nameEn: 'Kadamtoli', districtId: 'dhaka' },
  { id: 'demra', name: 'ডেমরা', nameEn: 'Demra', districtId: 'dhaka' },
  { id: 'sabujbagh', name: 'সবুজবাগ', nameEn: 'Sabujbagh', districtId: 'dhaka' },
  { id: 'bashundhara', name: 'বসুন্ধরা', nameEn: 'Bashundhara', districtId: 'dhaka' },
  { id: 'cantonment', name: 'ক্যান্টনমেন্ট', nameEn: 'Cantonment', districtId: 'dhaka' },
  { id: 'pallabi', name: 'পল্লবী', nameEn: 'Pallabi', districtId: 'dhaka' },
  { id: 'kafrul', name: 'কাফরুল', nameEn: 'Kafrul', districtId: 'dhaka' },
  { id: 'adabor', name: 'আদাবর', nameEn: 'Adabor', districtId: 'dhaka' },
  { id: 'savar', name: 'সাভার', nameEn: 'Savar', districtId: 'dhaka' },
  { id: 'keraniganj', name: 'কেরানীগঞ্জ', nameEn: 'Keraniganj', districtId: 'dhaka' },
  { id: 'dhamrai', name: 'ধামরাই', nameEn: 'Dhamrai', districtId: 'dhaka' },
  { id: 'dohar', name: 'দোহার', nameEn: 'Dohar', districtId: 'dhaka' },
  { id: 'nawabganj_dhaka', name: 'নবাবগঞ্জ', nameEn: 'Nawabganj', districtId: 'dhaka' },

  // Gazipur District
  { id: 'gazipur_sadar', name: 'গাজীপুর সদর', nameEn: 'Gazipur Sadar', districtId: 'gazipur' },
  { id: 'kaliakair', name: 'কালিয়াকৈর', nameEn: 'Kaliakair', districtId: 'gazipur' },
  { id: 'kaliganj_gazipur', name: 'কালীগঞ্জ', nameEn: 'Kaliganj', districtId: 'gazipur' },
  { id: 'kapasia', name: 'কাপাসিয়া', nameEn: 'Kapasia', districtId: 'gazipur' },
  { id: 'sreepur', name: 'শ্রীপুর', nameEn: 'Sreepur', districtId: 'gazipur' },
  { id: 'tongi', name: 'টঙ্গী', nameEn: 'Tongi', districtId: 'gazipur' },

  // Narayanganj District
  { id: 'narayanganj_sadar', name: 'নারায়ণগঞ্জ সদর', nameEn: 'Narayanganj Sadar', districtId: 'narayanganj' },
  { id: 'araihazar', name: 'আড়াইহাজার', nameEn: 'Araihazar', districtId: 'narayanganj' },
  { id: 'bandar', name: 'বন্দর', nameEn: 'Bandar', districtId: 'narayanganj' },
  { id: 'rupganj', name: 'রূপগঞ্জ', nameEn: 'Rupganj', districtId: 'narayanganj' },
  { id: 'sonargaon', name: 'সোনারগাঁও', nameEn: 'Sonargaon', districtId: 'narayanganj' },
  { id: 'siddhirganj', name: 'সিদ্ধিরগঞ্জ', nameEn: 'Siddhirganj', districtId: 'narayanganj' },
  { id: 'fatullah', name: 'ফতুল্লা', nameEn: 'Fatullah', districtId: 'narayanganj' },

  // Chittagong District
  { id: 'chittagong_sadar', name: 'চট্টগ্রাম সদর', nameEn: 'Chittagong Sadar', districtId: 'chittagong' },
  { id: 'agrabad', name: 'আগ্রাবাদ', nameEn: 'Agrabad', districtId: 'chittagong' },
  { id: 'nasirabad', name: 'নাসিরাবাদ', nameEn: 'Nasirabad', districtId: 'chittagong' },
  { id: 'kotwali_ctg', name: 'কোতোয়ালি', nameEn: 'Kotwali', districtId: 'chittagong' },
  { id: 'panchlaish', name: 'পাঁচলাইশ', nameEn: 'Panchlaish', districtId: 'chittagong' },
  { id: 'halishahar', name: 'হালিশহর', nameEn: 'Halishahar', districtId: 'chittagong' },
  { id: 'pahartali', name: 'পাহাড়তলী', nameEn: 'Pahartali', districtId: 'chittagong' },
  { id: 'patenga', name: 'পতেঙ্গা', nameEn: 'Patenga', districtId: 'chittagong' },
  { id: 'anwara', name: 'আনোয়ারা', nameEn: 'Anwara', districtId: 'chittagong' },
  { id: 'boalkhali', name: 'বোয়ালখালী', nameEn: 'Boalkhali', districtId: 'chittagong' },
  { id: 'chandanaish', name: 'চন্দনাইশ', nameEn: 'Chandanaish', districtId: 'chittagong' },
  { id: 'fatikchhari', name: 'ফটিকছড়ি', nameEn: 'Fatikchhari', districtId: 'chittagong' },
  { id: 'hathazari', name: 'হাটহাজারী', nameEn: 'Hathazari', districtId: 'chittagong' },
  { id: 'lohagara_ctg', name: 'লোহাগাড়া', nameEn: 'Lohagara', districtId: 'chittagong' },
  { id: 'mirsharai', name: 'মীরসরাই', nameEn: 'Mirsharai', districtId: 'chittagong' },
  { id: 'patiya', name: 'পটিয়া', nameEn: 'Patiya', districtId: 'chittagong' },
  { id: 'rangunia', name: 'রাঙ্গুনিয়া', nameEn: 'Rangunia', districtId: 'chittagong' },
  { id: 'raozan', name: 'রাউজান', nameEn: 'Raozan', districtId: 'chittagong' },
  { id: 'sandwip', name: 'সন্দ্বীপ', nameEn: 'Sandwip', districtId: 'chittagong' },
  { id: 'satkania', name: 'সাতকানিয়া', nameEn: 'Satkania', districtId: 'chittagong' },
  { id: 'sitakunda', name: 'সীতাকুণ্ড', nameEn: 'Sitakunda', districtId: 'chittagong' },

  // Cox's Bazar District
  { id: 'coxsbazar_sadar', name: 'কক্সবাজার সদর', nameEn: "Cox's Bazar Sadar", districtId: 'coxsbazar' },
  { id: 'chakaria', name: 'চকরিয়া', nameEn: 'Chakaria', districtId: 'coxsbazar' },
  { id: 'kutubdia', name: 'কুতুবদিয়া', nameEn: 'Kutubdia', districtId: 'coxsbazar' },
  { id: 'maheshkhali', name: 'মহেশখালী', nameEn: 'Maheshkhali', districtId: 'coxsbazar' },
  { id: 'pekua', name: 'পেকুয়া', nameEn: 'Pekua', districtId: 'coxsbazar' },
  { id: 'ramu', name: 'রামু', nameEn: 'Ramu', districtId: 'coxsbazar' },
  { id: 'teknaf', name: 'টেকনাফ', nameEn: 'Teknaf', districtId: 'coxsbazar' },
  { id: 'ukhia', name: 'উখিয়া', nameEn: 'Ukhia', districtId: 'coxsbazar' },

  // Comilla District
  { id: 'comilla_sadar', name: 'কুমিল্লা সদর', nameEn: 'Comilla Sadar', districtId: 'comilla' },
  { id: 'barura', name: 'বরুড়া', nameEn: 'Barura', districtId: 'comilla' },
  { id: 'brahmanpara', name: 'ব্রাহ্মণপাড়া', nameEn: 'Brahmanpara', districtId: 'comilla' },
  { id: 'burichang', name: 'বুড়িচং', nameEn: 'Burichang', districtId: 'comilla' },
  { id: 'chandina', name: 'চান্দিনা', nameEn: 'Chandina', districtId: 'comilla' },
  { id: 'chauddagram', name: 'চৌদ্দগ্রাম', nameEn: 'Chauddagram', districtId: 'comilla' },
  { id: 'daudkandi', name: 'দাউদকান্দি', nameEn: 'Daudkandi', districtId: 'comilla' },
  { id: 'debidwar', name: 'দেবীদ্বার', nameEn: 'Debidwar', districtId: 'comilla' },
  { id: 'homna', name: 'হোমনা', nameEn: 'Homna', districtId: 'comilla' },
  { id: 'laksam', name: 'লাকসাম', nameEn: 'Laksam', districtId: 'comilla' },
  { id: 'muradnagar', name: 'মুরাদনগর', nameEn: 'Muradnagar', districtId: 'comilla' },
  { id: 'nangalkot', name: 'নাঙ্গলকোট', nameEn: 'Nangalkot', districtId: 'comilla' },
  { id: 'titas', name: 'তিতাস', nameEn: 'Titas', districtId: 'comilla' },

  // Sylhet District
  { id: 'sylhet_sadar', name: 'সিলেট সদর', nameEn: 'Sylhet Sadar', districtId: 'sylhet' },
  { id: 'beanibazar', name: 'বিয়ানীবাজার', nameEn: 'Beanibazar', districtId: 'sylhet' },
  { id: 'bishwanath', name: 'বিশ্বনাথ', nameEn: 'Bishwanath', districtId: 'sylhet' },
  { id: 'companiganj_sylhet', name: 'কোম্পানীগঞ্জ', nameEn: 'Companiganj', districtId: 'sylhet' },
  { id: 'fenchuganj', name: 'ফেঞ্চুগঞ্জ', nameEn: 'Fenchuganj', districtId: 'sylhet' },
  { id: 'golapganj', name: 'গোলাপগঞ্জ', nameEn: 'Golapganj', districtId: 'sylhet' },
  { id: 'gowainghat', name: 'গোয়াইনঘাট', nameEn: 'Gowainghat', districtId: 'sylhet' },
  { id: 'jaintiapur', name: 'জৈন্তাপুর', nameEn: 'Jaintiapur', districtId: 'sylhet' },
  { id: 'kanaighat', name: 'কানাইঘাট', nameEn: 'Kanaighat', districtId: 'sylhet' },
  { id: 'osmani_nagar', name: 'ওসমানী নগর', nameEn: 'Osmani Nagar', districtId: 'sylhet' },
  { id: 'south_surma', name: 'দক্ষিণ সুরমা', nameEn: 'South Surma', districtId: 'sylhet' },
  { id: 'zakiganj', name: 'জকিগঞ্জ', nameEn: 'Zakiganj', districtId: 'sylhet' },

  // Rajshahi District
  { id: 'rajshahi_sadar', name: 'রাজশাহী সদর', nameEn: 'Rajshahi Sadar', districtId: 'rajshahi' },
  { id: 'bagha', name: 'বাঘা', nameEn: 'Bagha', districtId: 'rajshahi' },
  { id: 'bagmara', name: 'বাগমারা', nameEn: 'Bagmara', districtId: 'rajshahi' },
  { id: 'charghat', name: 'চারঘাট', nameEn: 'Charghat', districtId: 'rajshahi' },
  { id: 'durgapur_rajshahi', name: 'দুর্গাপুর', nameEn: 'Durgapur', districtId: 'rajshahi' },
  { id: 'godagari', name: 'গোদাগাড়ী', nameEn: 'Godagari', districtId: 'rajshahi' },
  { id: 'mohanpur', name: 'মোহনপুর', nameEn: 'Mohanpur', districtId: 'rajshahi' },
  { id: 'paba', name: 'পবা', nameEn: 'Paba', districtId: 'rajshahi' },
  { id: 'puthia', name: 'পুঠিয়া', nameEn: 'Puthia', districtId: 'rajshahi' },
  { id: 'tanore', name: 'তানোর', nameEn: 'Tanore', districtId: 'rajshahi' },

  // Khulna District
  { id: 'khulna_sadar', name: 'খুলনা সদর', nameEn: 'Khulna Sadar', districtId: 'khulna' },
  { id: 'batiaghata', name: 'বটিয়াঘাটা', nameEn: 'Batiaghata', districtId: 'khulna' },
  { id: 'dacope', name: 'দাকোপ', nameEn: 'Dacope', districtId: 'khulna' },
  { id: 'dighalia', name: 'দিঘলিয়া', nameEn: 'Dighalia', districtId: 'khulna' },
  { id: 'dumuria', name: 'ডুমুরিয়া', nameEn: 'Dumuria', districtId: 'khulna' },
  { id: 'koyra', name: 'কয়রা', nameEn: 'Koyra', districtId: 'khulna' },
  { id: 'paikgachha', name: 'পাইকগাছা', nameEn: 'Paikgachha', districtId: 'khulna' },
  { id: 'phultala', name: 'ফুলতলা', nameEn: 'Phultala', districtId: 'khulna' },
  { id: 'rupsha', name: 'রূপসা', nameEn: 'Rupsha', districtId: 'khulna' },
  { id: 'terokhada', name: 'তেরখাদা', nameEn: 'Terokhada', districtId: 'khulna' },

  // Rangpur District
  { id: 'rangpur_sadar', name: 'রংপুর সদর', nameEn: 'Rangpur Sadar', districtId: 'rangpur' },
  { id: 'badarganj', name: 'বদরগঞ্জ', nameEn: 'Badarganj', districtId: 'rangpur' },
  { id: 'gangachara', name: 'গঙ্গাচড়া', nameEn: 'Gangachara', districtId: 'rangpur' },
  { id: 'kaunia', name: 'কাউনিয়া', nameEn: 'Kaunia', districtId: 'rangpur' },
  { id: 'mithapukur', name: 'মিঠাপুকুর', nameEn: 'Mithapukur', districtId: 'rangpur' },
  { id: 'pirgachha', name: 'পীরগাছা', nameEn: 'Pirgachha', districtId: 'rangpur' },
  { id: 'pirganj_rangpur', name: 'পীরগঞ্জ', nameEn: 'Pirganj', districtId: 'rangpur' },
  { id: 'taraganj', name: 'তারাগঞ্জ', nameEn: 'Taraganj', districtId: 'rangpur' },

  // Bogura District
  { id: 'bogura_sadar', name: 'বগুড়া সদর', nameEn: 'Bogura Sadar', districtId: 'bogura' },
  { id: 'adamdighi', name: 'আদমদিঘি', nameEn: 'Adamdighi', districtId: 'bogura' },
  { id: 'dhunat', name: 'ধুনট', nameEn: 'Dhunat', districtId: 'bogura' },
  { id: 'dhupchanchia', name: 'দুপচাঁচিয়া', nameEn: 'Dhupchanchia', districtId: 'bogura' },
  { id: 'gabtali', name: 'গাবতলী', nameEn: 'Gabtali', districtId: 'bogura' },
  { id: 'kahaloo', name: 'কাহালু', nameEn: 'Kahaloo', districtId: 'bogura' },
  { id: 'nandigram', name: 'নন্দীগ্রাম', nameEn: 'Nandigram', districtId: 'bogura' },
  { id: 'shajahanpur', name: 'শাজাহানপুর', nameEn: 'Shajahanpur', districtId: 'bogura' },
  { id: 'sherpur_bogura', name: 'শেরপুর', nameEn: 'Sherpur', districtId: 'bogura' },
  { id: 'shibganj_bogura', name: 'শিবগঞ্জ', nameEn: 'Shibganj', districtId: 'bogura' },
  { id: 'sonatola', name: 'সোনাতলা', nameEn: 'Sonatola', districtId: 'bogura' },
  { id: 'sariakandi', name: 'সারিয়াকান্দি', nameEn: 'Sariakandi', districtId: 'bogura' },

  // Barisal District  
  { id: 'barisal_sadar', name: 'বরিশাল সদর', nameEn: 'Barisal Sadar', districtId: 'barisal' },
  { id: 'agailjhara', name: 'আগৈলঝাড়া', nameEn: 'Agailjhara', districtId: 'barisal' },
  { id: 'babuganj', name: 'বাবুগঞ্জ', nameEn: 'Babuganj', districtId: 'barisal' },
  { id: 'bakerganj', name: 'বাকেরগঞ্জ', nameEn: 'Bakerganj', districtId: 'barisal' },
  { id: 'banaripara', name: 'বানারীপাড়া', nameEn: 'Banaripara', districtId: 'barisal' },
  { id: 'gournadi', name: 'গৌরনদী', nameEn: 'Gournadi', districtId: 'barisal' },
  { id: 'hizla', name: 'হিজলা', nameEn: 'Hizla', districtId: 'barisal' },
  { id: 'mehendiganj', name: 'মেহেন্দীগঞ্জ', nameEn: 'Mehendiganj', districtId: 'barisal' },
  { id: 'muladi', name: 'মুলাদী', nameEn: 'Muladi', districtId: 'barisal' },
  { id: 'wazirpur', name: 'উজিরপুর', nameEn: 'Wazirpur', districtId: 'barisal' },

  // Mymensingh District
  { id: 'mymensingh_sadar', name: 'ময়মনসিংহ সদর', nameEn: 'Mymensingh Sadar', districtId: 'mymensingh' },
  { id: 'bhaluka', name: 'ভালুকা', nameEn: 'Bhaluka', districtId: 'mymensingh' },
  { id: 'dhobaura', name: 'ধোবাউড়া', nameEn: 'Dhobaura', districtId: 'mymensingh' },
  { id: 'fulbaria', name: 'ফুলবাড়ীয়া', nameEn: 'Fulbaria', districtId: 'mymensingh' },
  { id: 'gaffargaon', name: 'গফরগাঁও', nameEn: 'Gaffargaon', districtId: 'mymensingh' },
  { id: 'gauripur', name: 'গৌরীপুর', nameEn: 'Gauripur', districtId: 'mymensingh' },
  { id: 'haluaghat', name: 'হালুয়াঘাট', nameEn: 'Haluaghat', districtId: 'mymensingh' },
  { id: 'ishwarganj', name: 'ঈশ্বরগঞ্জ', nameEn: 'Ishwarganj', districtId: 'mymensingh' },
  { id: 'muktagachha', name: 'মুক্তাগাছা', nameEn: 'Muktagachha', districtId: 'mymensingh' },
  { id: 'nandail', name: 'নান্দাইল', nameEn: 'Nandail', districtId: 'mymensingh' },
  { id: 'phulpur', name: 'ফুলপুর', nameEn: 'Phulpur', districtId: 'mymensingh' },
  { id: 'trishal', name: 'ত্রিশাল', nameEn: 'Trishal', districtId: 'mymensingh' },
  { id: 'tarakanda', name: 'তারাকান্দা', nameEn: 'Tarakanda', districtId: 'mymensingh' },

  // Default "Other" option for districts without detailed upazilas
  // This will be used as a catch-all
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
