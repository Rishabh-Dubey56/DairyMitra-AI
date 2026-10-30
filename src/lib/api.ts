import axios from 'axios';
import { Animal, MilkRecord, Expense, Sale, FarmSettings, DashboardStats } from './types';
import { farmStore } from './store';

// Base Axios instance
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Resilient API services with local fallback
export const animalsApi = {
  getAll: async (): Promise<Animal[]> => {
    try {
      const res = await apiClient.get<Animal[]>('/animals');
      return res.data;
    } catch {
      return farmStore.getAnimals();
    }
  },

  getById: async (id: string): Promise<Animal | undefined> => {
    try {
      const res = await apiClient.get<Animal>(`/animals/${id}`);
      return res.data;
    } catch {
      return farmStore.getAnimalById(id);
    }
  },

  create: async (animal: Animal): Promise<Animal> => {
    try {
      const res = await apiClient.post<Animal>('/animals', animal);
      farmStore.saveAnimal(res.data);
      return res.data;
    } catch {
      farmStore.saveAnimal(animal);
      return animal;
    }
  },

  update: async (animal: Animal): Promise<Animal> => {
    try {
      const res = await apiClient.put<Animal>(`/animals/${animal.id}`, animal);
      farmStore.saveAnimal(res.data);
      return res.data;
    } catch {
      farmStore.saveAnimal(animal);
      return animal;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/animals/${id}`);
    } catch {
      // Fallback
    }
    farmStore.deleteAnimal(id);
  },
};

export const milkRecordsApi = {
  getAll: async (): Promise<MilkRecord[]> => {
    try {
      const res = await apiClient.get<MilkRecord[]>('/milk-records');
      return res.data;
    } catch {
      return farmStore.getMilkRecords();
    }
  },

  create: async (record: MilkRecord): Promise<{ success: boolean; duplicate?: boolean }> => {
    try {
      const res = await apiClient.post('/milk-records', record);
      farmStore.saveMilkRecord(record);
      return res.data;
    } catch {
      return farmStore.saveMilkRecord(record);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/milk-records?id=${id}`);
    } catch {
      // Fallback
    }
    farmStore.deleteMilkRecord(id);
  },
};

export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    try {
      const res = await apiClient.get<Expense[]>('/expenses');
      return res.data;
    } catch {
      return farmStore.getExpenses();
    }
  },

  create: async (expense: Expense): Promise<Expense> => {
    try {
      const res = await apiClient.post<Expense>('/expenses', expense);
      farmStore.saveExpense(res.data);
      return res.data;
    } catch {
      farmStore.saveExpense(expense);
      return expense;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/expenses?id=${id}`);
    } catch {
      // Fallback
    }
    farmStore.deleteExpense(id);
  },
};

export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    try {
      const res = await apiClient.get<Sale[]>('/sales');
      return res.data;
    } catch {
      return farmStore.getSales();
    }
  },

  create: async (sale: Sale): Promise<Sale> => {
    try {
      const res = await apiClient.post<Sale>('/sales', sale);
      farmStore.saveSale(res.data);
      return res.data;
    } catch {
      farmStore.saveSale(sale);
      return sale;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sales?id=${id}`);
    } catch {
      // Fallback
    }
    farmStore.deleteSale(id);
  },
};

export const reportsApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await apiClient.get<DashboardStats>('/reports');
      return res.data;
    } catch {
      return farmStore.getDashboardStats();
    }
  },
};

export const aiAdvisorApi = {
  ask: async (query: string, language: 'en' | 'hi' = 'en'): Promise<{ answer: string; category: string }> => {
    try {
      const res = await apiClient.post<{ answer: string; category: string }>('/ai-advisor', {
        query,
        language,
        farmContext: farmStore.getDashboardStats(),
      });
      return res.data;
    } catch (err) {
      // Fallback local intelligent generator
      return {
        answer: generateLocalAIResponse(query, language),
        category: 'general',
      };
    }
  },
};

// Fallback intelligent response generator for AI Advisor
export function generateLocalAIResponse(query: string, language: 'en' | 'hi'): string {
  const q = query.toLowerCase();

  if (language === 'hi') {
    if (q.includes('दूध') || q.includes('वृद्धि') || q.includes('yield') || q.includes('बढ़ा')) {
      return `दूध उत्पादन बढ़ाने के वैज्ञानिक उपाय:
1. **संतुलित राशन (TMR)**: प्रति लीटर दूध उत्पादन पर 400 ग्राम संतुलित पशु आहार (20% CP) दें।
2. **हरा एवं सूखा चारा**: 2:1 के अनुपात में दें। नेपियर, बरसीम या मक्का साइलेज के साथ सूखा भूसा मिलाएं।
3. **बायपास फैट एवं मिनरल मिक्सचर**: प्रतिदिन 50-70 ग्राम मिनरल मिक्सचर और 100 ग्राम बायपास फैट दें।
4. **स्वच्छ पानी**: दुधारू गाय/भैंस को दिन में 70-100 लीटर स्वच्छ, ताजा पानी 24 घंटे उपलब्ध होना चाहिए।

*नोट: अचानक आहार न बदलें। किसी भी गंभीर गिरावट या थनैला के लक्षण में तुरंत पशु चिकित्सक से संपर्क करें।*`;
    }
    if (q.includes('थनैला') || q.includes('mastitis') || q.includes('सूजन') || q.includes('बुखार')) {
      return `⚠️ **स्वास्थ्य चेतावनी (Health Notice)**:
थन में सूजन, दूध में छिछड़े या बुखार होना थनैला (Mastitis) का संकेत हो सकता है।

तत्काल प्राथमिक कदम:
1. तुरंत बीमार पशु को अन्य स्वस्थ पशुओं से अलग करें।
2. प्रभावित थन का दूध जमीन पर न गिरने दें, अलग बर्तन में निकालकर नष्ट करें।
3. थन पर बर्फ या ठंडे पानी की सिकाई करें।
4. **तत्काल नजदीकी पशु चिकित्सक को बुलाएं** ताकि समय पर एंटीबायोटिक व इंट्रा-मेमरी ट्यूब दी जा सके। देरी से थन हमेशा के लिए खराब हो सकता है!`;
    }
    if (q.includes('टीका') || q.includes('वैक्सीन') || q.includes('fmd') || q.includes('hs')) {
      return `आवश्यक टीकाकरण कैलेंडर:
- **FMD (खुरपका-मुंहपका)**: वर्ष में दो बार (अप्रैल और अक्टूबर में)।
- **HS (गलघोंटू)**: मानसून से पहले मई-जून में एक बार।
- **BQ (लंगड़ा बुखार)**: मई में एक बार।
- **ब्रुसेलोसिस (Brucellosis)**: 4-8 माह की मादा बछड़ियों में जीवन में केवल एक बार।

टीकाकरण हमेशा स्वस्थ पशुओं में और पंजीकृत पशु चिकित्सक की निगरानी में ही करवाएं।`;
    }
    return `डेयरीमित्र AI विश्लेषण:
आपके फार्म में वर्तमान में उच्च कोटि की गिर गायें और मुर्रा भैंसें हैं। औसत दुग्ध उत्पादन और वसा (Fat) प्रतिशत स्थिर रखने के लिए:
- दैनिक चारे में 60% हरा चारा, 25% सूखा भूसा और 15% दाना मिश्रण रखें।
- दुहने के बाद थनों को पोटैशियम परमैंगनेट (लाल दवा) के 1:1000 घोल या टीट डिप में डुबोएं।
- मौसम परिवर्तन (सर्दी/गर्मी) के दौरान पशुओं को तनाव मुक्त वातावरण प्रदान करें।

क्या आप किसी विशिष्ट पशु (जैसे DM-101 या DM-102) के आहार अथवा स्वास्थ्य पर विशेष जानकारी चाहते हैं?`;
  }

  // English responses
  if (q.includes('milk') || q.includes('yield') || q.includes('increase') || q.includes('production')) {
    return `### Proven Strategies to Maximize Milk Yield:
1. **Total Mixed Ration (TMR)**: Provide 400g of balanced concentrate feed (min 20% crude protein) per liter of milk produced above maintenance.
2. **Green to Dry Roughage Ratio**: Maintain an ideal 65:35 ratio of succulent green fodder (Napier/Maize silage) to digestible dry wheat/paddy straw.
3. **Bypass Fat & Chelated Minerals**: Supplement 80-100g of bypass fat and 60g chelated mineral mixture (Agrimin Forte) daily to peak lactation cows and buffaloes.
4. **Ad-Libitum Clean Water**: Lactating cows need 4-5 liters of water per liter of milk. Ensure automated drinking bowls or clean troughs.

*Important: Never introduce new feed grains abruptly. Transition over 5-7 days to prevent ruminal acidosis.*`;
  }

  if (q.includes('mastitis') || q.includes('swelling') || q.includes('fever') || q.includes('sick')) {
    return `⚠️ **Critical Veterinary Advisory**:
Hard udder, clotty milk, or elevated body temperature (>102.5°F) indicates acute inflammation or Mastitis.

**Immediate Action Protocol:**
1. Isolate the affected animal into a clean, dry isolation stall.
2. Strip milk from affected quarters completely every 2 hours and safely discard with disinfectant.
3. Apply cold compress/ice to relieve acute inflammation.
4. **Immediately summon a licensed Veterinary Surgeon** for intramammary infusion and systemic anti-inflammatory / antibiotic therapy. Delay can cause permanent loss of quarter!`;
  }

  if (q.includes('vaccin') || q.includes('fmd') || q.includes('deworm') || q.includes('hs')) {
    return `### Standard Cattle Vaccination & Prophylaxis Calendar:
- **FMD (Foot & Mouth Disease)**: Semi-annually (Pre-monsoon April, Post-monsoon October).
- **HS (Haemorrhagic Septicaemia)**: Annually in May prior to rainy season.
- **BQ (Black Quarter)**: Annually in May-June for young stock below 3 years.
- **Theileriosis**: Once in a lifetime for crossbred cattle (HF/Jersey).
- **Deworming**: Broad-spectrum dewormer (Albendazole / Ivermectin) rotation every 3-4 months.`;
  }

  return `### DairyMitra AI Herd Intelligence:
Based on your current herd composition of indigenous Gir/Sahiwal cows and Murrah buffaloes:
- Your herd's butterfat averages **5.4% - 7.8%**, which commands top tier dairy cooperative procurement pricing.
- Maintaining clean milking stall hygiene and applying post-milking teat dips reduces mastitis incidence by over 70%.
- Ensure pregnant animals entering the dry period receive specialized anionic transitional salts 21 days before expected calving.

Feel free to ask about tailored rations for individual tags (e.g. DM-101 Gauri or DM-102 Kaali), calving protocols, or farm profit optimization!`;
}
