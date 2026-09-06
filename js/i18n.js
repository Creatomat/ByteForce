/**
 * Recollect Northeast India Regional Language & Voice System (PRD FR-9.6, FR-9.8)
 * Supports: English, Assamese, Bengali, Khasi, Hindi
 * Strict compliance with design.md Section 2.1: Never use all-caps for patient-facing labels.
 */

const RECOLLECT_I18N = {
  en: {
    brand_title: 'Recollect',
    greeting_morning: 'Good Morning, Eleanor!',
    weather_info: 'Morning Sunshine • 72° Mild',
    date_display: 'Thursday, October 24',
    listen_day: 'Tap to listen to your day',
    current_routine: 'Right now • 9:00 AM routine',
    routine_name: 'Morning Medicine',
    routine_sub: 'Take 1 pill with a full glass of cool water',
    take_med_btn: 'I took my medicine',
    med_taken_confirm: 'Completed at 9:02 AM • Wonderful job, Eleanor!',
    btn_done: 'Done',
    btn_snooze: 'Remind me in 10 minutes',
    btn_need_help: 'Need help from Sarah',
    voice_listening: "Listening for 'Done'...",
    your_day_today: 'Your day today',
    breakfast_label: 'Warm Breakfast',
    breakfast_sub: 'Oatmeal & berry tea enjoyed',
    breakfast_status: 'Finished 8:15 AM',
    walk_label: '11:30 AM Garden Walk',
    walk_sub: 'Rose garden & fresh air',
    walk_status: 'Up next',
    call_family: 'Call Sarah (Daughter)',
    family_status: 'Always here for you • Available to chat',
    action_play_game: 'Play a Game',
    action_how_feeling: 'How I am Feeling Today',
    game_title: 'Family Photo Memory Game',
    game_subtitle: 'Touch cards gently to find happy family memories',
    play_game_btn: 'Play Memory Game',
    game_hub_title: 'Brain & Memory Games',
    game_hub_subtitle: 'Gentle activities at your own pace with no timers',
    game_category_memory: 'Memory',
    game_category_memory_sub: 'Family Photo Match',
    game_category_attention: 'Attention',
    game_category_attention_sub: 'Garden Flower Focus',
    game_category_language: 'Language',
    game_category_language_sub: 'Word & Object Recall',
    game_category_problem: 'Problem Solving',
    game_category_problem_sub: 'Daily Routine Steps',
    pack_family: 'Family Photos Mode',
    pack_cultural: 'Northeast India Cultural Pack',
    game_peace_tag: 'No timers, ever • Take all your time, Eleanor',
    game_hint_btn: 'Give me a gentle hint',
    game_pause_btn: 'Pause and rest anytime',
    game_completion_title: 'Great job today, Eleanor!',
    game_completion_msg: 'Your garden memories bloomed beautifully. Have a peaceful rest of your morning.',
    mood_title: 'How are you feeling right now?',
    mood_joyful: 'Sunny & Joyful',
    mood_calm: 'Calm & Peaceful',
    mood_tired: 'A Bit Tired',
    mood_confused: 'Need Gentle Support',
    reassurance: 'You are doing wonderfully today! Everything is right on track.',
    disclaimer_patient: 'Supportive engagement tool, not a clinical treatment or diagnostic device.',
    disclaimer_standard: 'This score reflects engagement and activity trends. It is not a medical diagnosis. Please consult your doctor about any concerns.',
    observation_disclaimer: 'This is an observation, not a diagnosis.',
    caregiver_settings: 'Caregiver Settings & Profile Switch',
    high_contrast: 'High-contrast theme (Black & White)',
    font_size_label: 'Patient app text size',
    voice_mode_label: 'Voice narration & listening mode',
    low_power_label: 'Low-power mode (Reduced animation)',
    narration_text: 'Good morning Eleanor! Today is Thursday, October 24. It is a peaceful sunny morning. Right now, it is time for your morning medicine with a glass of cool water. Later at 11:30, Sarah will join you for a gentle walk in the rose garden. You are doing wonderfully today!'
  },
  as: { // Assamese
    brand_title: 'ৰিকলেক্‌ট',
    greeting_morning: 'সুপ্ৰভাত, এলিনৰ!',
    weather_info: 'ৰাতিপুৱাৰ ৰ’দালি • শান্ত বতৰ',
    date_display: 'বৃহস্পতিবাৰ, ২৪ অক্টোবৰ',
    listen_day: 'আজিৰ দিনটোৰ কথা শুনিবলৈ স্পৰ্শ কৰক',
    current_routine: 'এইমাত্ৰ • ৯:০০ বজাৰ কাম',
    routine_name: 'ৰাতিপুৱাৰ ঔষধ',
    routine_sub: 'এক গিলাচ বিশুদ্ধ পানীৰে ঔষধটো সেৱন কৰক',
    take_med_btn: 'মই ঔষধ খালোঁ',
    med_taken_confirm: 'সম্পূৰ্ণ হ’ল • বহুত ভাল কাম কৰিলে, এলিনৰ!',
    btn_done: 'হৈ গ’ল',
    btn_snooze: '১০ মিনিট পিছত মনত পেলাওক',
    btn_need_help: 'চাৰাৰ পৰা সহায় লাগে',
    voice_listening: "শুনি আছো...",
    your_day_today: 'আজি আপোনাৰ দিনটো',
    breakfast_label: 'ৰাতিপুৱাৰ জলপান',
    breakfast_sub: 'গৰম চাহ আৰু আহাৰ গ্ৰহণ কৰা হ’ল',
    breakfast_status: 'সম্পূৰ্ণ ৮:১৫ বজাত',
    walk_label: '১১:৩০ বজাত ফুলনিৰ খোজ',
    walk_status: 'পৰৱৰ্তী কাম',
    call_family: 'চাৰাক ফোন কৰক (কন্যা)',
    family_status: 'সদায় আপোনাৰ কাষত আছে',
    action_play_game: 'এটা খেল খেলক',
    action_how_feeling: 'আজি মোৰ মন কেনে লাগিছে',
    game_title: 'পৰিয়ালৰ স্মৃতিৰ ফটো খেল',
    game_subtitle: 'লাহে লাহে স্পৰ্শ কৰি স্মৃতি বিচাৰক',
    play_game_btn: 'খেল আৰম্ভ কৰক',
    game_hub_title: 'স্মৃতি আৰু মগজুৰ খেল',
    game_hub_subtitle: 'সময়ৰ কোনো চাপ নাই, শান্তভাৱে খেলক',
    game_category_memory: 'স্মৃতি',
    game_category_memory_sub: 'পৰিয়ালৰ ফটো মিলাওক',
    game_category_attention: 'মনোযোগ',
    game_category_attention_sub: 'ফুলনিৰ ফুলত লক্ষ্য',
    game_category_language: 'ভাষা',
    game_category_language_sub: 'শব্দ সোঁৱৰণ',
    game_category_problem: 'সমস্যা সমাধান',
    game_category_problem_sub: 'দৈনন্দিন কামৰ ক্ৰম',
    pack_family: 'পৰিয়ালৰ ফটো পেক',
    pack_cultural: 'উত্তৰ-পূব ভাৰত সাংস্কৃতিক পেক',
    game_peace_tag: 'সময়ৰ সীমা নাই • নিজৰ সুবিধামতে খেলক',
    game_hint_btn: 'অলপ সহায় কৰক',
    game_pause_btn: 'যিকোনো সময়ত বিশ্ৰাম লওক',
    game_completion_title: 'বহুত ভাল কাম কৰিলে, এলিনৰ!',
    game_completion_msg: 'আপোনাৰ স্মৃতিৰ ফুলবোৰ ধুনীয়াকৈ ফুলি উঠিল। শান্তভাৱে দিনটো উপভোগ কৰক।',
    mood_title: 'আজি আপোনাৰ মন কেনে লাগিছে?',
    mood_joyful: 'আনন্দময়',
    mood_calm: 'শান্ত',
    mood_tired: 'অলপ ভাগৰুৱা',
    mood_confused: 'সহায় বিচাৰো',
    reassurance: 'আপুনি আজি অতি সুন্দৰভাৱে কাম কৰিছে! সকলো ঠিকেই চলি আছে।',
    disclaimer_patient: 'সহায়ক সঁজুলি, চিকিৎসা বা ৰোগ নিৰ্ণয়ৰ বাবে নহয়।',
    disclaimer_standard: 'এই স্ক’ৰে কাৰ্য্যকলাপৰ ধাৰা বুজায়, কোনো চিকিৎসা নিদান নহয়। যিকোনো বিষয়ত চিকিৎসকৰ পৰামৰ্শ লওক।',
    observation_not_diagnosis: 'ই এটা পৰ্যবেক্ষণহে, কোনো ৰোগ নিৰ্ণয় নহয়।',
    caregiver_settings: 'অভিভাৱক সংহতি আৰু প্ৰফাইল সলনি',
    high_contrast: 'উচ্চ বৈপৰীত্য থিম (বগা-ক’লা)',
    font_size_label: 'আখৰৰ আকাৰ',
    voice_mode_label: 'মাতৰ সুবিধা আৰু শুনাৰ ব্যৱস্থা',
    low_power_label: 'কম বিদ্যুৎ মোড',
    narration_text: 'সুপ্ৰভাত এলিনৰ! আজি বৃহস্পতিবাৰ, ২৪ অক্টোবৰ। ৰাতিপুৱাৰ ঔষধ খোৱাৰ সময় হৈছে। আপুনি আজি অতি সুন্দৰভাৱে আগবাঢ়িছে।'
  },
  bn: { // Bengali
    brand_title: 'রিকলেক্ট',
    greeting_morning: 'সুপ্রভাত, এলিনর!',
    weather_info: 'সকালের মিষ্টি রোদ • মনোরম আবহাওয়া',
    date_display: 'বৃহস্পতিবার, ২৪ অক্টোবর',
    listen_day: 'দিনের সূচি শুনতে আলতো চাপ দিন',
    current_routine: 'এখনই • সকাল ৯:০০ টার ওষুধ',
    routine_name: 'সকালের ওষুধ',
    routine_sub: 'এক গ্লাস ঠাণ্ডা জল দিয়ে ওষুধটি খান',
    take_med_btn: 'আমি ওষুধ খেয়েছি',
    med_taken_confirm: 'সম্পন্ন হয়েছে • খুব সুন্দর এলিনর!',
    btn_done: 'হয়ে গেছে',
    btn_snooze: '১০ মিনিট পরে মনে করিয়ে দিন',
    btn_need_help: 'সারার সাহায্য প্রয়োজন',
    voice_listening: "শুনছি...",
    your_day_today: 'আজকের সারাদিন',
    breakfast_label: 'সকালের নাস্তা',
    breakfast_sub: 'ওটমিল এবং ভেষজ চা',
    breakfast_status: 'সম্পন্ন ৮:১৫ মিনিটে',
    walk_label: '১১:৩০ বাগানে সান্ধ্য পায়চারি',
    walk_status: 'পরবর্তী',
    call_family: 'সারাকে ফোন করুন (মেয়ে)',
    family_status: 'সবসময় আপনার পাশে আছে',
    action_play_game: 'একটি খেলা খেলুন',
    action_how_feeling: 'আজ আমার মন কেমন আছে',
    game_title: 'পারিবারিক ছবির স্মৃতি খেলা',
    game_subtitle: 'আলতো ছুঁয়ে স্মৃতি মিলিয়ে নিন',
    play_game_btn: 'খেলা শুরু করুন',
    game_hub_title: 'স্মৃতি ও বুদ্ধির খেলা',
    game_hub_subtitle: 'সময়ের কোন তাড়াহুড়ো নেই, নিজের মতো খেলুন',
    game_category_memory: 'স্মৃতি',
    game_category_memory_sub: 'পারিবারিক ছবি মিল',
    game_category_attention: 'মনোযোগ',
    game_category_attention_sub: 'বাগানের ফুলে নজর',
    game_category_language: 'ভাষা',
    game_category_language_sub: 'শব্দ স্মরণ',
    game_category_problem: 'সমস্যা সমাধান',
    game_category_problem_sub: 'দৈনন্দিন কাজের ধাপ',
    pack_family: 'পারিবারিক ছবি মোড',
    pack_cultural: 'উত্তর-পূর্ব ভারত সংস্কৃতি মোড',
    game_peace_tag: 'কোন ঘড়ির তাড়া নেই • সময় নিয়ে খেলুন',
    game_hint_btn: 'আমাকে একটু সাহায্য করুন',
    game_pause_btn: 'বিশ্রাম নিন',
    game_completion_title: 'দারুণ খেলেছেন এলিনর!',
    game_completion_msg: 'আপনার স্মৃতিগুলো খুব সুন্দরভাবে ফুটে উঠেছে। দিনটি আনন্দে কাটুক।',
    mood_title: 'আপনার মন কেমন আছে?',
    mood_joyful: 'খুশি',
    mood_calm: 'শান্ত',
    mood_tired: 'ক্লান্ত',
    mood_confused: 'সাহায্য প্রয়োজন',
    reassurance: 'আপনি আজ খুব ভালো আছেন! সবকিছু একদম ঠিকঠাক চলছে।',
    disclaimer_patient: 'সহায়ক মাধ্যম, এটি কোনো রোগ নির্ণয়কারী যন্ত্র নয়।',
    disclaimer_standard: 'এই স্কোর সক্রিয়তার মাত্রা প্রকাশ করে, কোনো চিকিৎসা নিদান নয়। প্রয়োজনে চিকিৎসকের পরামর্শ নিন।',
    observation_not_diagnosis: 'এটি একটি পর্যবেক্ষণ, কোনো রোগ নির্ণয় নয়।',
    caregiver_settings: 'কেয়ারগিভার সেটিংস ও প্রোফাইল বদল',
    high_contrast: 'হাই-কন্ট্রাস্ট মোড (সাদা-কালো)',
    font_size_label: 'অক্ষরের মাপ',
    voice_mode_label: 'ভয়েস ও শ্রবণ মোড',
    low_power_label: 'কম ব্যাটারি মোড',
    narration_text: 'সুপ্রভাত এলিনর! আজ বৃহস্পতিবার, ২৪ অক্টোবর। এখন সকালের ওষুধ খাওয়ার সময়। আপনি চমৎকারভাবে দিনটি কাটাচ্ছেন।'
  },
  kha: { // Khasi (Meghalaya)
    brand_title: 'Recollect',
    greeting_morning: 'Khublei step, Eleanor!',
    weather_info: 'Ka sngi kaba shai • Ka suinbneng kaba thiang',
    date_display: 'Sngi Palei, 24 Risaw',
    listen_day: 'Khyndiat ban sngap ia ka sngi jong phi',
    current_routine: 'Mynta • 9:00 AM Dawai',
    routine_name: 'Dawai Step',
    routine_sub: 'Dih 1 tylli u dawai bad shi klat ka um',
    take_med_btn: 'Nga la dih dawai',
    med_taken_confirm: 'La dep • Khublei shibun, Eleanor!',
    btn_done: 'La dep',
    btn_snooze: 'Kynmaw biang hadien 10 minit',
    btn_need_help: 'Donkam jingiarap na ka Sarah',
    voice_listening: "Sngap...",
    your_day_today: 'Ka sngi jong phi mynta',
    breakfast_label: 'Ja step',
    breakfast_status: 'La dep 8:15 AM',
    walk_label: '11:30 AM Leit shang ha kper',
    walk_status: 'Kaban bud',
    call_family: 'Phone ia ka Sarah (Khun kynthei)',
    family_status: 'Don ryngkat bad phi man ka por',
    action_play_game: 'Lehkai ialehkai',
    action_how_feeling: 'Kumno nga sngew mynta ka sngi',
    game_title: 'Gialehkai dur kynmaw',
    play_game_btn: 'Fleh Gialehkai',
    game_hub_title: 'Gialehkai Jingkynmaw',
    game_hub_subtitle: 'Ym don por ban pyndep, lehkai suk suk',
    game_category_memory: 'Jingkynmaw',
    game_category_memory_sub: 'Dur jong ka longïing',
    game_category_attention: 'Jingpyrkhat',
    game_category_attention_sub: 'Tiewkulab ha kper',
    game_category_language: 'Ktien',
    game_category_language_sub: 'Kynmaw ktien',
    game_category_problem: 'Wad lynti',
    game_category_problem_sub: 'Ki kam man ka sngi',
    pack_family: 'Dur longïing',
    pack_cultural: 'Dur Northeast India',
    game_peace_tag: 'Ym don jingpynduh por, shim la ka por',
    game_hint_btn: 'Aiu ban leh',
    game_pause_btn: 'Shongthait shiphang',
    game_completion_title: 'Phi la leh bha shibun, Eleanor!',
    game_completion_msg: 'Ki dur jingkynmaw ki la phuh bha. Leh kmen mynta ka sngi.',
    mood_title: 'Kumno phi sngew mynta ka sngi?',
    mood_joyful: 'Kmen',
    mood_calm: 'Jai jai',
    mood_tired: 'Thait',
    mood_confused: 'Donkam jingiarap',
    reassurance: 'Phi leh bha bha mynta ka sngi! Baroh kiei kiei ki iaid beit.',
    disclaimer_patient: 'Ka tiar jingiarap, kam dei ka dawai ne jingpynkhiah.',
    disclaimer_standard: 'Ine i score i pyni ia ka rukom trei kam, ym dei ka jingujor doktor. Pyrkhat bha bad u doktor.',
    observation_not_diagnosis: 'Kane ka dei ka jingpeit, ym dei ka jingpynshisha pang.',
    caregiver_settings: 'Caregiver Settings & Kylla Profile',
    high_contrast: 'High Contrast Mode',
    font_size_label: 'Ka jingheh ki dak',
    voice_mode_label: 'Ktien bad jingsngap',
    low_power_label: 'Pynsah bor battery',
    narration_text: 'Khublei step Eleanor! Mynta ka sngi Palei, 24 Risaw. Ka por ban dih dawai step bad shi klat ka um. Baroh ki iaid beit!'
  },
  hi: { // Hindi (Bridge Language)
    brand_title: 'रीकलेक्ट',
    greeting_morning: 'शुभ प्रभात, एलिनॉर!',
    weather_info: 'सुबह की खिली धूप • 72° सुहावना',
    date_display: 'गुरुवार, 24 अक्टूबर',
    listen_day: 'आज की दिनचर्या सुनने के लिए स्पर्श करें',
    current_routine: 'अभी • सुबह 9:00 बजे का समय',
    routine_name: 'सुबह की दवा',
    routine_sub: 'एक गिलास ताजे पानी के साथ 1 गोली लें',
    take_med_btn: 'मैंने दवा ले ली है',
    med_taken_confirm: 'दवा ली गई • बहुत बढ़िया, एलिनॉर!',
    btn_done: 'हो गया',
    btn_snooze: '10 मिनट बाद याद दिलाएं',
    btn_need_help: 'सारा से मदद चाहिए',
    voice_listening: "सुन रहे हैं...",
    your_day_today: 'आपकी आज की दिनचर्या',
    breakfast_label: 'सुबह का नाश्ता',
    breakfast_sub: 'दलिया और गर्म चाय',
    breakfast_status: 'पूर्ण 8:15 बजे',
    walk_label: '11:30 बजे बगीचे में टहलना',
    walk_status: 'अगला कार्य',
    call_family: 'सारा को कॉल करें (बेटी)',
    family_status: 'हमेशा आपके साथ • बात करने के लिए उपलब्ध',
    action_play_game: 'एक खेल खेलें',
    action_how_feeling: 'आज मैं कैसा महसूस कर रही हूँ',
    game_title: 'पारिवारिक फोटो याददाश्त खेल',
    game_subtitle: 'आराम से स्पर्श करके सुखद यादें खोजें',
    play_game_btn: 'खेल शुरू करें',
    game_hub_title: 'स्मृति और दिमागी खेल',
    game_hub_subtitle: 'अपनी गति से खेलें, कोई समय सीमा या जल्दबाजी नहीं',
    game_category_memory: 'स्मृति',
    game_category_memory_sub: 'पारिवारिक फोटो मिलान',
    game_category_attention: 'ध्यान',
    game_category_attention_sub: 'बगीचे के फूलों पर ध्यान',
    game_category_language: 'भाषा',
    game_category_language_sub: 'शब्द और वस्तु स्मरण',
    game_category_problem: 'समस्या समाधान',
    game_category_problem_sub: 'दैनिक कार्यों का क्रम',
    pack_family: 'पारिवारिक फोटो मोड',
    pack_cultural: 'पूर्वोत्तर भारत सांस्कृतिक पैक',
    game_peace_tag: 'कोई टाइमर नहीं • पूरा समय लें, एलिनॉर',
    game_hint_btn: 'मुझे थोड़ा संकेत दें',
    game_pause_btn: 'विश्राम लें',
    game_completion_title: 'बहुत बढ़िया किया, एलिनॉर!',
    game_completion_msg: 'आपकी बगीचे की यादें बहुत सुंदरता से खिल उठीं। आपका दिन शुभ और सुखद रहे।',
    mood_title: 'आज आप कैसा महसूस कर रही हैं?',
    mood_joyful: 'खुश और प्रफुल्लित',
    mood_calm: 'शांत और सुकून भरा',
    mood_tired: 'थोड़ी थकान',
    mood_confused: 'सहारे की ज़रूरत',
    reassurance: 'आज आप बहुत अच्छा कर रही हैं! सब कुछ एकदम सही चल रहा है।',
    disclaimer_patient: 'सहायक साधन, यह कोई चिकित्सीय निदान या उपचार उपकरण नहीं है।',
    disclaimer_standard: 'यह स्कोर केवल जुड़ाव और गतिविधि के रुझान को दर्शाता है, यह कोई चिकित्सीय निदान नहीं है। किसी भी चिंता के लिए अपने डॉक्टर से परामर्श लें।',
    observation_not_diagnosis: 'यह एक अवलोकन है, निदान नहीं।',
    caregiver_settings: 'देखभालकर्ता सेटिंग्स और प्रोफ़ाइल बदलें',
    high_contrast: 'हाई-कंट्रास्ट मोड (सफ़ेद और काला)',
    font_size_label: 'अक्षरों का आकार',
    voice_mode_label: 'आवाज़ सुनाना और सुनना',
    low_power_label: 'कम ऊर्जा मोड (एनिमेशन बंद)',
    narration_text: 'शुभ प्रभात एलिनॉर! आज गुरुवार, 24 अक्टूबर है। अभी सुबह की दवा एक गिलास पानी के साथ लेने का समय है। आप बहुत अच्छा कर रही हैं!'
  }
};

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('recollect_lang') || 'en';
    this.isSpeaking = false;
  }

  setLanguage(lang) {
    if (RECOLLECT_I18N[lang]) {
      this.currentLang = lang;
      localStorage.setItem('recollect_lang', lang);
      this.updateDOM();
    }
  }

  getText(key) {
    const langDict = RECOLLECT_I18N[this.currentLang] || RECOLLECT_I18N.en;
    return langDict[key] || RECOLLECT_I18N.en[key] || key;
  }

  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.getText(key);
      if (val) {
        if (el.tagName === 'INPUT' && el.getAttribute('type') === 'text') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });
  }

  /**
   * Human-pacing voice narration using Web Speech API (PRD FR-9.8)
   */
  speakText(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser/hardware.');
      if (onComplete) onComplete();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text || this.getText('narration_text'));
    utterance.rate = 0.85; // Calming, slow pace for seniors (PRD FR-8.4)
    utterance.pitch = 1.05; // Gentle, warm tone

    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.startsWith(this.currentLang) || v.name.includes('Natural') || v.name.includes('Google'));
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }

    this.isSpeaking = true;
    utterance.onend = () => {
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onComplete) onComplete();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

window.i18n = new I18nManager();
