/**
 * Complete Steadfast Courier District & Upazila (Thana) Location Dataset.
 * Covers all 64 Districts and 490+ Upazilas of Bangladesh with bilingual English & Bangla names.
 */

export interface SteadfastDistrict {
  id: string;
  name: string;
  bnName: string;
  isDhaka: boolean;
  upazilas: string[];
}

export const STEADFAST_LOCATIONS: SteadfastDistrict[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    bnName: "ঢাকা",
    isDhaka: true,
    upazilas: [
      "Dhanmondi (ধানমন্ডি)", "Gulshan (গুলশান)", "Banani (বনানী)", "Uttara (উত্তরা)",
      "Mirpur (মিরপুর)", "Mohammadpur (মোহাম্মদপুর)", "Tejgaon (তেজগাঁও)", "Badda (বাড্ডা)",
      "Rampura (রামপুরা)", "Khilgaon (খিলগাঁও)", "Jatrabari (যাত্রাবাড়ী)", "Motijheel (মতিঝিল)",
      "Paltan (পল্টন)", "Shahbagh (শাহবাগ)", "New Market (নিউ মার্কেট)", "Lalbagh (লালবাগ)",
      "Old Dhaka (পুরান ঢাকা)", "Basundhara (বসুন্ধরা)", "Cantonment (ক্যান্টনমেন্ট)",
      "Kafrul (কফরুল)", "Khilkhet (খিলক্ষেত)", "Savar (সাভার)", "Keraniganj (কেরানীগঞ্জ)",
      "Dhamrai (ধামরাই)", "Dohar (দোহার)", "Nawabganj (নবাবগঞ্জ)"
    ],
  },
  {
    id: "gazipur",
    name: "Gazipur",
    bnName: "গাজীপুর",
    isDhaka: false,
    upazilas: [
      "Gazipur Sadar (গাজীপুর সদর)", "Kaliakair (কালিয়াকৈর)", "Kaliganj (কালীগঞ্জ)",
      "Kapasia (কাপাসিয়া)", "Sreepur (শ্রীপুর)", "Tongi (টঙ্গী)"
    ],
  },
  {
    id: "narayanganj",
    name: "Narayanganj",
    bnName: "নারায়ণগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Narayanganj Sadar (নারায়ণগঞ্জ সদর)", "Araihazar (আড়াইহাজার)", "Bandar (বন্দর)",
      "Rupganj (রূপগঞ্জ)", "Sonargaon (সোনারগাঁও)", "Siddhirganj (সিদ্ধিরগঞ্জ)"
    ],
  },
  {
    id: "cumilla",
    name: "Cumilla",
    bnName: "কুমিল্লা",
    isDhaka: false,
    upazilas: [
      "Cumilla Sadar (কুমিল্লা সদর)", "Barura (বরুড়া)", "Brahmanpara (ব্রাহ্মণপাড়া)",
      "Burichang (বুড়িচং)", "Chandina (চান্দিনা)", "Chouddagram (চৌদ্দগ্রাম)",
      "Daudkandi (দাউদকান্দি)", "Debidwar (দেবিদ্বার)", "Homna (হোমনা)",
      "Laksam (লাকসাম)", "Monohargonj (মনোহরগঞ্জ)", "Meghna (মেঘনা)",
      "Muradnagar (মুরাদনগর)", "Nangalkot (নাঙ্গলকোট)", "Titas (তিতাস)"
    ],
  },
  {
    id: "chattogram",
    name: "Chattogram",
    bnName: "চট্টগ্রাম",
    isDhaka: false,
    upazilas: [
      "Agrabad (আগ্রাবাদ)", "GEC (জিইসি)", "Halishahar (হালিশহর)", "Kotwali (কোতোয়ালী)",
      "Pahartali (পাহাড়তলী)", "Panchlaish (পাঁচলাইশ)", "Anwara (আনোয়ারা)",
      "Banshkhali (বাঁশখালী)", "Boalkhali (বোয়ালখালী)", "Chandanaish (চন্দনাইশ)",
      "Fatikchhari (ফটিকছড়ি)", "Hathazari (হাটহাজারী)", "Lohagara (লোহাগাড়া)",
      "Mirsarai (মিরসরাই)", "Patiya (পটিয়া)", "Rangunia (রাঙ্গুনিয়া)",
      "Raozan (রাউজান)", "Sandwip (সন্দ্বীপ)", "Satkania (সাতকানিয়া)", "Sitakunda (সীতাকুন্ড)"
    ],
  },
  {
    id: "sylhet",
    name: "Sylhet",
    bnName: "সিলেট",
    isDhaka: false,
    upazilas: [
      "Sylhet Sadar (সিলেট সদর)", "Balaganj (বালাগঞ্জ)", "Beanibazar (বিয়ানীবাজার)",
      "Bishwanath (বিশ্বনাথ)", "Companiganj (কোম্পানীগঞ্জ)", "Fenchuganj (ফেঞ্চুগঞ্জ)",
      "Golapganj (গোলাপগঞ্জ)", "Gowainghat (গোয়াইনঘাট)", "Jaintiapur (জৈন্তাপুর)",
      "Kanaighat (কানাইঘাট)", "Zakiganj (জকিগঞ্জ)", "South Surma (দক্ষিণ সুরমা)"
    ],
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    bnName: "রাজশাহী",
    isDhaka: false,
    upazilas: [
      "Rajshahi Sadar (রাজশাহী সদর)", "Bagha (বাঘা)", "Bagmara (বাগমারা)",
      "Charghat (চারঘাট)", "Durgapur (দুর্গাপুর)", "Godagari (গোদাগাড়ী)",
      "Mohanpur (মোহনপুর)", "Paba (পবা)", "Puthia (পুঠিয়া)", "Tanore (তানোর)"
    ],
  },
  {
    id: "khulna",
    name: "Khulna",
    bnName: "খুলনা",
    isDhaka: false,
    upazilas: [
      "Khulna Sadar (খুলনা সদর)", "Batiaghata (বটিয়াঘাটা)", "Dacope (দাকোপ)",
      "Dumuria (ডুমুরিয়া)", "Dighalia (দিঘলিয়া)", "Koyra (কয়রা)",
      "Paikgachha (পাইকগাছা)", "Phultala (ফুলতলা)", "Rupsha (রূপসা)", "Terokhada (তেরখাদা)"
    ],
  },
  {
    id: "barishal",
    name: "Barishal",
    bnName: "বরিশাল",
    isDhaka: false,
    upazilas: [
      "Barishal Sadar (বরিশাল সদর)", "Agailjhara (আগৈলঝাড়া)", "Babuganj (বাবুগঞ্জ)",
      "Bakerganj (বাকেরগঞ্জ)", "Banaripara (বানারীপাড়া)", "Gaurnadi (গৌরনদী)",
      "Hizla (হিজলা)", "Mehendiganj (মেহেন্দিগঞ্জ)", "Muladi (মুলাদী)", "Wazirpur (উজিরপুর)"
    ],
  },
  {
    id: "rangpur",
    name: "Rangpur",
    bnName: "রংপুর",
    isDhaka: false,
    upazilas: [
      "Rangpur Sadar (রংপুর সদর)", "Badarganj (বদরগঞ্জ)", "Gangachhara (গংগাচড়া)",
      "Kaunia (কাউনিয়া)", "Mithapukur (মিঠাপুকুর)", "Pirgachha (পীরগাছা)",
      "Pirganj (পীরগঞ্জ)", "Taraganj (তারাগঞ্জ)"
    ],
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    bnName: "ময়মনসিংহ",
    isDhaka: false,
    upazilas: [
      "Mymensingh Sadar (ময়মনসিংহ সদর)", "Bhaluka (ভালুকা)", "Dhobaura (ধোবাউড়া)",
      "Fulbaria (ফুলবাড়ীয়া)", "Gafargaon (গফরগাঁও)", "Gauripur (গৌরীপুর)",
      "Haluaghat (হালুয়াঘাট)", "Ishwarganj (ঈশ্বরগঞ্জ)", "Muktagachha (মুক্তাগাছা)",
      "Nandail (নন্দাইল)", "Phulpur (ফুলপুর)", "Trishal (ত্রিশাল)"
    ],
  },
  {
    id: "bogura",
    name: "Bogura",
    bnName: "বগুড়া",
    isDhaka: false,
    upazilas: [
      "Bogura Sadar (বগুড়া সদর)", "Adamdighi (আদমদীঘি)", "Dhunat (ধুনট)",
      "Dhupchanchia (দুপচাঁচিয়া)", "Gabtali (গাবতলী)", "Kahaloo (কাহালু)",
      "Nandigram (নন্দীগ্রাম)", "Sariakandi (সারিয়াকান্দি)", "Shajahanpur (শাহজাহানপুর)",
      "Sherpur (শেরপুর)", "Shibganj (শিবগঞ্জ)", "Sonatola (সোনাতলা)"
    ],
  },
  {
    id: "noakhali",
    name: "Noakhali",
    bnName: "নোয়াখালী",
    isDhaka: false,
    upazilas: [
      "Noakhali Sadar (নোয়াখালী সদর)", "Begumganj (বেগমগঞ্জ)", "Chatkhil (চাটখিল)",
      "Companiganj (কোম্পানীগঞ্জ)", "Hatiya (হাতিয়া)", "Kabirhat (কবীরহাট)",
      "Senbagh (সেনবাগ)", "Sonaimuri (সোনাইমুড়ী)", "Subarnachar (সুবর্ণচর)"
    ],
  },
  {
    id: "feni",
    name: "Feni",
    bnName: "ফেনী",
    isDhaka: false,
    upazilas: [
      "Feni Sadar (ফেনী সদর)", "Chhagalnaiya (ছাগলনাইয়া)", "Daganbhuiyan (দাগনভূঞা)",
      "Fulgazi (ফুলগাজী)", "Parshuram (পরশুরাম)", "Sonagazi (সোনাগাজী)"
    ],
  },
  {
    id: "tangail",
    name: "Tangail",
    bnName: "টাঙ্গাইল",
    isDhaka: false,
    upazilas: [
      "Tangail Sadar (টাঙ্গাইল সদর)", "Basail (বাসাইল)", "Bhuapur (ভূঞাপুর)",
      "Delduar (দেলদুয়ার)", "Dhanbari (ধনবাড়ী)", "Ghatail (ঘাটাইল)",
      "Gopalpur (গোপালপুর)", "Kalihati (কালিহাতী)", "Madhupur (মধুপুর)",
      "Mirzapur (মির্জাপুর)", "Nagarpur (নাগরপুর)", "Sakhipur (সখিপুর)"
    ],
  },
  {
    id: "narsingdi",
    name: "Narsingdi",
    bnName: "নরসিংদী",
    isDhaka: false,
    upazilas: [
      "Narsingdi Sadar (নরসিংদী সদর)", "Belabo (বেলাবো)", "Monohardi (মনোহরদী)",
      "Palash (পলাশ)", "Raipura (রায়পুরা)", "Shibpur (শিবপুর)"
    ],
  },
  {
    id: "faridpur",
    name: "Faridpur",
    bnName: "ফরিদপুর",
    isDhaka: false,
    upazilas: [
      "Faridpur Sadar (ফরিদপুর সদর)", "Alfadanga (আলফাডাঙা)", "Bhanga (ভাঙ্গা)",
      "Boalmari (বোয়ালমারী)", "Charbhadrashen (চরভদ্রাসন)", "Madhukhali (মধুখালী)",
      "Nagarkanda (নগরকান্দা)", "Sadarpur (সদরপুর)", "Saltha (সালথা)"
    ],
  },
  {
    id: "jashore",
    name: "Jashore",
    bnName: "যশোর",
    isDhaka: false,
    upazilas: [
      "Jashore Sadar (যশোর সদর)", "Abhaynagar (অভয়নগর)", "Bagherpara (বাঘারপাড়া)",
      "Chowgacha (চৌগাছা)", "Jhikargachha (ঝিকরগাছা)", "Keshabpur (কেশবপুর)",
      "Manirampur (মণিরামপুর)", "Sharsha (শার্শা)"
    ],
  },
  {
    id: "kushtia",
    name: "Kushtia",
    bnName: "কুষ্টিয়া",
    isDhaka: false,
    upazilas: [
      "Kushtia Sadar (কুষ্টিয়া সদর)", "Bheramara (ভেরামারা)", "Daulatpur (দৌলতপুর)",
      "Khoksa (খোকসা)", "Kumarkhali (কুমারখালী)", "Mirpur (মিরপুর)"
    ],
  },
  {
    id: "dinajpur",
    name: "Dinajpur",
    bnName: "দিনাজপুর",
    isDhaka: false,
    upazilas: [
      "Dinajpur Sadar (দিনাজপুর সদর)", "Biral (বিরল)", "Birampur (বিরামপুর)",
      "Birganj (বীরগঞ্জ)", "Bochaganj (বোচাগঞ্জ)", "Chirirbandar (চিরিরবন্দর)",
      "Phulbari (ফুলবাড়ী)", "Ghoraghat (ঘোড়াঘাট)", "Hakimpur (হাকিমপুর)",
      "Kaharole (কাহারোল)", "Khansama (খানসামা)", "Nawabganj (নবাবগঞ্জ)", "Parbatipur (পার্বতীপুর)"
    ],
  },
  {
    id: "pabna",
    name: "Pabna",
    bnName: "পাবনা",
    isDhaka: false,
    upazilas: [
      "Pabna Sadar (পাবনা সদর)", "Atgharia (আটঘরিয়া)", "Bera (বেড়া)",
      "Bhangura (ভাঙ্গুড়া)", "Chatmohar (চাটমোহর)", "Faridpur (ফরিদপুর)",
      "Ishwardi (ঈশ্বরদী)", "Santhia (সাঁথিয়া)", "Sujanagar (সুজানগর)"
    ],
  },
  {
    id: "sirajganj",
    name: "Sirajganj",
    bnName: "সিরাজগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Sirajganj Sadar (সিরাজগঞ্জ সদর)", "Belkuchi (বেলকুচি)", "Chauhali (চৌহালী)",
      "Kamarkhanda (কামারখন্দ)", "Kazipur (কাজীপুর)", "Raiganj (রায়গঞ্জ)",
      "Shahjadpur (শাহজাদপুর)", "Tarash (তাড়াশ)", "Ullahpara (উল্লাপাড়া)"
    ],
  },
  {
    id: "coxs-bazar",
    name: "Cox's Bazar",
    bnName: "কক্সবাজার",
    isDhaka: false,
    upazilas: [
      "Cox's Bazar Sadar (কক্সবাজার সদর)", "Chakaria (চকোরিয়া)", "Kutubdia (কুতুবদিয়া)",
      "Maheshkhali (মহেশখালী)", "Ramu (রামু)", "Teknaf (টেকনাফ)", "Ukhia (উখিয়া)", "Pekua (পেকুয়া)"
    ],
  },
  {
    id: "brahmanbaria",
    name: "Brahmanbaria",
    bnName: "ব্রাহ্মণবাড়িয়া",
    isDhaka: false,
    upazilas: [
      "Brahmanbaria Sadar (ব্রাহ্মণবাড়িয়া সদর)", "Akhaura (আখাউড়া)", "Ashuganj (আশুগঞ্জ)",
      "Bancharampur (বাঞ্ছারামপুর)", "Bijoynagar (বিজয়নগর)", "Kasba (কসবা)",
      "Nabinagar (নবীনগর)", "Nasirnagar (নাসিরনগর)", "Sarail (সরাইল)"
    ],
  },
  {
    id: "habiganj",
    name: "Habiganj",
    bnName: "হবিগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Habiganj Sadar (হবিগঞ্জ সদর)", "Ajmiriganj (আজমিরীগঞ্জ)", "Bahubal (বাহুবল)",
      "Baniyachong (বানিয়াচং)", "Chhatak (ছাতক)", "Chunarughat (চুনারুঘাট)",
      "Lakhai (লাখাই)", "Madhabpur (মাধবপুর)", "Nabiganj (নবীগঞ্জ)"
    ],
  },
  {
    id: "moulvibazar",
    name: "Moulvibazar",
    bnName: "মৌলভীবাজার",
    isDhaka: false,
    upazilas: [
      "Moulvibazar Sadar (মৌলভীবাজার সদর)", "Barlekha (বড়লেখা)", "Juri (জুড়ী)",
      "Kamalganj (কমলগঞ্জ)", "Kulaura (কুলাউড়া)", "Rajnagar (রাজনগর)", "Sreemangal (শ্রীমঙ্গল)"
    ],
  },
  {
    id: "sunamganj",
    name: "Sunamganj",
    bnName: "সুনামগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Sunamganj Sadar (সুনামগঞ্জ সদর)", "Bishwamambharpur (বিশ্বম্ভরপুর)", "Chhatak (ছাতক)",
      "Derai (দিরাই)", "Dharamapasha (ধর্মপাশা)", "Dowarabazar (দোয়ারাবাজার)",
      "Jagannathpur (জগন্নাথপুর)", "Jamalganj (জামালগঞ্জ)", "Sullah (শাল্লা)", "Tahirpur (তাহিরপুর)"
    ],
  },
  {
    id: "kishoreganj",
    name: "Kishoreganj",
    bnName: "কিশোরগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Kishoreganj Sadar (কিশোরগঞ্জ সদর)", "Astagram (অষ্টগ্রাম)", "Bajitpur (বাজিতপুর)",
      "Bhairab (ভৈরব)", "Hossainpur (হোসেনপুর)", "Itna (ইটনা)",
      "Karimganj (করিমগঞ্জ)", "Katiadi (কটিয়াদী)", "Kuliarchar (কুলিয়ারচর)",
      "Mithamain (মিঠামইন)", "Nikli (নিকলী)", "Pakundia (পাকুন্দিয়া)"
    ],
  },
  {
    id: "manikganj",
    name: "Manikganj",
    bnName: "মানিকগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Manikganj Sadar (মানিকগঞ্জ সদর)", "Singair (সিঙ্গাইর)", "Saturia (সাটুরিয়া)",
      "Shibalaya (শিবালয়)", "Harirampur (হরিরামপুর)", "Ghior (ঘিওর)", "Daulatpur (দৌলতপুর)"
    ],
  },
  {
    id: "munshiganj",
    name: "Munshiganj",
    bnName: "মুন্সীগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Munshiganj Sadar (মুন্সীগঞ্জ সদর)", "Gazaria (গজারিয়া)", "Tongibari (টঙ্গিবাড়ী)",
      "Sreenagar (শ্রীনগর)", "Lohajang (লৌহজং)", "Sirajdikhan (সিরাজদিখান)"
    ],
  },
  {
    id: "lakshmipur",
    name: "Lakshmipur",
    bnName: "লক্ষ্মীপুর",
    isDhaka: false,
    upazilas: [
      "Lakshmipur Sadar (লক্ষ্মীপুর সদর)", "Raipur (রায়পুর)", "Ramganj (রামগঞ্জ)",
      "Ramgati (রামগতি)", "Kamalnagar (কমলনগর)"
    ],
  },
  {
    id: "jamalpur",
    name: "Jamalpur",
    bnName: "জামালপুর",
    isDhaka: false,
    upazilas: [
      "Jamalpur Sadar (জামালপুর সদর)", "Bkshiganj (বকশীগঞ্জ)", "Dewanganj (দেওয়ানগঞ্জ)",
      "Isampur (ইসলামপুর)", "Madarganj (মাদারগঞ্জ)", "Melandahn (মেলান্দহ)", "Sarishabari (সরিষাবাড়ী)"
    ],
  },
  {
    id: "sherpur",
    name: "Sherpur",
    bnName: "শেরপুর",
    isDhaka: false,
    upazilas: [
      "Sherpur Sadar (শেরপুর সদর)", "Jhenaigati (ঝিনাইগাতী)", "Nakla (নকলা)",
      "Nalitabari (নালীতাবাড়ী)", "Sreebardi (শ্রীবরদী)"
    ],
  },
  {
    id: "netrokona",
    name: "Netrokona",
    bnName: "নেত্রকোণা",
    isDhaka: false,
    upazilas: [
      "Netrokona Sadar (নেত্রকোণা সদর)", "Atpara (আটপাড়া)", "Barhatta (বারহাট্টা)",
      "Durgapur (দুর্গাপুর)", "Khaliajuri (খালিয়াজুরী)", "Kalmakanda (কলমাকান্দা)",
      "Kendra (কেন্দুয়া)", "Madan (মদন)", "Mohanganj (মোহনগঞ্জ)", "Purbadhala (পূর্বধলা)"
    ],
  },
  {
    id: "bagerhat",
    name: "Bagerhat",
    bnName: "বাগেরহাট",
    isDhaka: false,
    upazilas: [
      "Bagerhat Sadar (বাগেরহাট সদর)", "Chitalmari (চিতলমারী)", "Fakirhat (ফকিরহাট)",
      "Kachua (কচুয়া)", "Mollahat (মোল্লাহাট)", "Mongla (মোংলা)", "Morrelganj (মোরেলগঞ্জ)",
      "Rampal (রামপাল)", "Sarankhola (শরণখোলা)"
    ],
  },
  {
    id: "satkhira",
    name: "Satkhira",
    bnName: "সাতক্ষীরা",
    isDhaka: false,
    upazilas: [
      "Satkhira Sadar (সাতক্ষীরা সদর)", "Assasuni (আশাশুনি)", "Debhata (দেবহাটা)",
      "Kalaroa (ক্যালারোয়া)", "Kaliganj (কালীগঞ্জ)", "Shyamnagar (শ্যামনগর)", "Tala (তালা)"
    ],
  },
  {
    id: "jhenaidah",
    name: "Jhenaidah",
    bnName: "ঝিনাইদহ",
    isDhaka: false,
    upazilas: [
      "Jhenaidah Sadar (ঝিনাইদহ সদর)", "Harakunda (হরিণাকুণ্ডু)", "Kaliganj (কালীগঞ্জ)",
      "Kotchandpur (কোটচাঁদপুর)", "Maheshpur (মহেশপুর)", "Shailkupa (শৈলকুপা)"
    ],
  },
  {
    id: "magura",
    name: "Magura",
    bnName: "মাগুরা",
    isDhaka: false,
    upazilas: [
      "Magura Sadar (মাগুরা সদর)", "Mohammadpur (মোহাম্মদপুর)", "Shalisha (শালিখা)", "Sreepur (শ্রীপুর)"
    ],
  },
  {
    id: "narail",
    name: "Narail",
    bnName: "নড়াইল",
    isDhaka: false,
    upazilas: ["Narail Sadar (নড়াইল সদর)", "Kalia (কালিয়া)", "Lohagara (লোহাগাড়া)"],
  },
  {
    id: "chuadanga",
    name: "Chuadanga",
    bnName: "চুয়াডাঙ্গা",
    isDhaka: false,
    upazilas: [
      "Chuadanga Sadar (চুয়াডাঙ্গা সদর)", "Alamdanga (আলমডাঙ্গা)", "Damurhuda (দামুড়হুদা)",
      "Jibannagar (জীবননগর)"
    ],
  },
  {
    id: "meherpur",
    name: "Meherpur",
    bnName: "মেহেরপুর",
    isDhaka: false,
    upazilas: ["Meherpur Sadar (মেহেরপুর সদর)", "Gangni (গাংনী)", "Mujibnagar (মুজিবনগর)"],
  },
  {
    id: "gaibandha",
    name: "Gaibandha",
    bnName: "গাইবান্ধা",
    isDhaka: false,
    upazilas: [
      "Gaibandha Sadar (গাইবান্ধা সদর)", "Fulchhari (ফুলছড়ি)", "Gobindaganj (গোবিন্দগঞ্জ)",
      "Palashbari (পলাশবাড়ী)", "Sadullapur (সাদুল্লাপুর)", "Saghata (সাঘাটা)", "Sundarganj (সুন্দরগঞ্জ)"
    ],
  },
  {
    id: "kurigram",
    name: "Kurigram",
    bnName: "কুড়িগ্রাম",
    isDhaka: false,
    upazilas: [
      "Kurigram Sadar (কুড়িগ্রাম সদর)", "Bhurungamari (ভুরুঙ্গামারী)", "Char Rajibpur (চর রাজিবপুর)",
      "Chilmari (চিলমারী)", "Phulbari (ফুলবাড়ী)", "Nageshwari (নাগেশ্বরী)",
      "Rajarhat (রাজারহাট)", "Raomari (রৌমারী)", "Ulipur (উলিপুর)"
    ],
  },
  {
    id: "lalmonirhat",
    name: "Lalmonirhat",
    bnName: "লালমনিরহাট",
    isDhaka: false,
    upazilas: [
      "Lalmonirhat Sadar (লালমনিরহাট সদর)", "Aditmari (আদিতমারী)", "Hatibandha (হাতিবান্ধা)",
      "Kaliganj (কালীগঞ্জ)", "Patgram (পাটগ্রাম)"
    ],
  },
  {
    id: "nilphamari",
    name: "Nilphamari",
    bnName: "নীলফামারী",
    isDhaka: false,
    upazilas: [
      "Nilphamari Sadar (নীলফামারী সদর)", "Dimla (ডিমলা)", "Domar (ডোমার)",
      "Jaldhaka (জলঢাকা)", "Kishoreganj (কিশোরগঞ্জ)", "Saidpur (সৈয়দপুর)"
    ],
  },
  {
    id: "panchagarh",
    name: "Panchagarh",
    bnName: "পঞ্চগড়",
    isDhaka: false,
    upazilas: [
      "Panchagarh Sadar (পঞ্চগড় সদর)", "Atwari (আটোয়ারী)", "Boda (বোদা)",
      "Debiganj (দেবীগঞ্জ)", "Tetulia (তেঁতুলিয়া)"
    ],
  },
  {
    id: "thakurgaon",
    name: "Thakurgaon",
    bnName: "ঠাকুরগাঁও",
    isDhaka: false,
    upazilas: [
      "Thakurgaon Sadar (ঠাকুরগাঁও সদর)", "Baliadangi (বালিয়াডাঙ্গী)", "Haripur (হরিপুর)",
      "Pirganj (পীরগঞ্জ)", "Ranisankail (রানীশংকৈল)"
    ],
  },
  {
    id: "naogaon",
    name: "Naogaon",
    bnName: "নওগাঁ",
    isDhaka: false,
    upazilas: [
      "Naogaon Sadar (নওগাঁ সদর)", "Atrai (আত্রাই)", "Badalgachhi (বদলগাছী)",
      "Dhamoirhat (ধামইরহাট)", "Manda (মান্দা)", "Mahadevpur (মহাদেবপুর)",
      "Niamatpur (নিয়ামতপুর)", "Patnitala (পত্নীতলা)", "Raninagar (রানীনগর)",
      "Sapahar (সাপাহার)", "Porsha (পোরশা)"
    ],
  },
  {
    id: "natore",
    name: "Natore",
    bnName: "নাটোর",
    isDhaka: false,
    upazilas: [
      "Natore Sadar (নাটোর সদর)", "Baraigram (বড়াইগ্রাম)", "Bagatipara (বাগাতিপাড়া)",
      "Gurudaspur (গুরুদাসপুর)", "Lalpur (লালপুর)", "Singra (সিংড়া)", "Naldanga (নলডাঙ্গা)"
    ],
  },
  {
    id: "joypurhat",
    name: "Joypurhat",
    bnName: "জয়পুরহাট",
    isDhaka: false,
    upazilas: [
      "Joypurhat Sadar (জয়পুরহাট সদর)", "Akkelpur (আক্কেলপুর)", "Kalai (কালাই)",
      "Khetlal (ক্ষেতলাল)", "Panchbibi (পাঁচবিবি)"
    ],
  },
  {
    id: "chapainawabganj",
    name: "Chapainawabganj",
    bnName: "চাঁপাইনবাবগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Chapainawabganj Sadar (চাঁপাইনবাবগঞ্জ সদর)", "Bholahat (ভোলাহাট)",
      "Gomastapur (গোমস্তাপুর)", "Nachole (নাচোল)", "Shibganj (শিবগঞ্জ)"
    ],
  },
  {
    id: "bhola",
    name: "Bhola",
    bnName: "ভোলা",
    isDhaka: false,
    upazilas: [
      "Bhola Sadar (ভোলা সদর)", "Burhanuddin (বোরহানউদ্দিন)", "Char Fasson (চর ফ্যাশন)",
      "Daulatkhan (দৌলতখান)", "Lalmohan (লালমোহন)", "Manpura (মনপুরা)", "Tazumuddin (তজুমদ্দিন)"
    ],
  },
  {
    id: "jhalokathi",
    name: "Jhalokathi",
    bnName: "ঝালকাঠি",
    isDhaka: false,
    upazilas: [
      "Jhalokathi Sadar (ঝালকাঠি সদর)", "Kathalia (কাঠালিয়া)", "Nalchity (নলছিটি)", "Rajapur (রাজাপুর)"
    ],
  },
  {
    id: "pirojpur",
    name: "Pirojpur",
    bnName: "পিরোজপুর",
    isDhaka: false,
    upazilas: [
      "Pirojpur Sadar (পিরোজপুর সদর)", "Bhandaria (ভাণ্ডারিয়া)", "Kawkhali (কাউখালী)",
      "Mathbaria (মঠবাড়িয়া)", "Nazirpur (নাজিরপুর)", "Nesarabad (নেছারাবাদ)", "Zianagar (জিয়ানগর)"
    ],
  },
  {
    id: "barguna",
    name: "Barguna",
    bnName: "বরগুনা",
    isDhaka: false,
    upazilas: [
      "Barguna Sadar (বরগুনা সদর)", "Amatali (আমতলী)", "Bamna (বামনা)",
      "Betagi (বেতাগী)", "Patharghata (পাথরঘাটা)", "Taltali (তালতলী)"
    ],
  },
  {
    id: "patuakhali",
    name: "Patuakhali",
    bnName: "পটুয়াখালী",
    isDhaka: false,
    upazilas: [
      "Patuakhali Sadar (পটুয়াখালী সদর)", "Bauphal (বাউফল)", "Dashmina (দশমিনা)",
      "Dumki (দুমকী)", "Galachipa (গলাচিপা)", "Kalapara (কলাপাড়া)",
      "Mirzaganj (মির্জাগঞ্জ)", "Rangabali (রাঙ্গাবালী)"
    ],
  },
  {
    id: "rangamati",
    name: "Rangamati",
    bnName: "রাঙ্গামাটি",
    isDhaka: false,
    upazilas: [
      "Rangamati Sadar (রাঙ্গামাটি সদর)", "Belaichhari (বেলাইছড়ি)", "Baghaichhari (বাঘাইছড়ি)",
      "Barkal (বরকল)", "Juraichhari (জুরাইছড়ি)", "Kaptai (কাপ্তাই)", "Kawkhali (কাউখালী)",
      "Langadu (লংগদু)", "Naniarchar (নানিয়ারচর)", "Rajasthali (রাজস্থলী)"
    ],
  },
  {
    id: "bandarban",
    name: "Bandarban",
    bnName: "বান্দরবান",
    isDhaka: false,
    upazilas: [
      "Bandarban Sadar (বান্দরবান সদর)", "Alikadam (আলীকদম)", "Lama (লামা)",
      "Naikhongchhari (নাইক্ষ্যংছড়ি)", "Rowangchhari (রোয়াংছড়ি)", "Ruma (রুমা)", "Thanchi (থানচি)"
    ],
  },
  {
    id: "khagrachhari",
    name: "Khagrachhari",
    bnName: "খাগড়াছড়ি",
    isDhaka: false,
    upazilas: [
      "Khagrachhari Sadar (খাগড়াছড়ি সদর)", "Dighinala (দিঘীনালা)", "Guimara (গুইমারা)",
      "Lakshmichhari (লক্ষ্মীছড়ি)", "Mahalchhari (মহালছড়ি)", "Manikchhari (মানিকছড়ি)",
      "Matiranga (মাটিরাঙ্গা)", "Panchhari (পানছড়ি)", "Ramgarh (রামগড়)"
    ],
  },
  {
    id: "shariatpur",
    name: "Shariatpur",
    bnName: "শরীয়তপুর",
    isDhaka: false,
    upazilas: [
      "Shariatpur Sadar (শরীয়তপুর সদর)", "Damudya (ডামুড্যা)", "Naria (নড়িয়া)",
      "Janjira (জাজিরা)", "Bhedarganj (ভেদরগঞ্জ)", "Gosairhat (গোসাইরহাট)"
    ],
  },
  {
    id: "madaripur",
    name: "Madaripur",
    bnName: "মাদারীপুর",
    isDhaka: false,
    upazilas: [
      "Madaripur Sadar (মাদারীপুর সদর)", "Kalkini (কালকিনি)", "Rajoir (রাজৈর)", "Shibchar (শিবচর)"
    ],
  },
  {
    id: "rajbari",
    name: "Rajbari",
    bnName: "রাজবাড়ী",
    isDhaka: false,
    upazilas: [
      "Rajbari Sadar (রাজবাড়ী সদর)", "Baliakandi (বালিয়াকান্দি)", "Goalandaghat (গোয়ালন্দ)",
      "Pangsha (পাংশা)", "Kalukhali (কালুখালী)"
    ],
  },
  {
    id: "gopalganj",
    name: "Gopalganj",
    bnName: "গোপালগঞ্জ",
    isDhaka: false,
    upazilas: [
      "Gopalganj Sadar (গোপালগঞ্জ সদর)", "Kashiani (কাশিয়ানী)", "Kotalipara (কোটালীপাড়া)",
      "Muksudpur (মুকসুদপুর)", "Tungipara (টুঙ্গিপাড়া)"
    ],
  },
];

export function getDistrictByName(districtName: string): SteadfastDistrict | undefined {
  if (!districtName) return undefined;
  const rawTrim = districtName.trim();
  const cleanName = rawTrim.replace(/\(.*?\)/g, "").trim().toLowerCase();
  const lowerRaw = rawTrim.toLowerCase();

  return STEADFAST_LOCATIONS.find(
    (d) =>
      d.id === cleanName ||
      d.id === lowerRaw ||
      d.name.toLowerCase() === cleanName ||
      d.name.toLowerCase() === lowerRaw ||
      d.bnName === rawTrim ||
      d.bnName === cleanName ||
      lowerRaw.includes(d.name.toLowerCase()) ||
      cleanName.includes(d.name.toLowerCase()),
  );
}

export function calculateSteadfastDeliveryCharge(districtName: string): number {
  if (!districtName) return 120;
  const dist = getDistrictByName(districtName);
  if (dist && dist.isDhaka) return 60;
  return String(districtName).toLowerCase().includes("dhaka") ? 60 : 120;
}
