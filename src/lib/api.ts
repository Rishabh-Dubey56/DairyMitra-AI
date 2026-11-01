import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Animal, MilkRecord, Expense, Sale, FarmSettings, DashboardStats } from './types';
import { farmStore } from './store';

// Storage keys
const TOKEN_KEY = 'dairymitra_access_token';
const REFRESH_TOKEN_KEY = 'dairymitra_refresh_token';
const USER_KEY = 'dairymitra_auth_user';

// Generate lightweight cryptographically random UUID v4 for Request ID and Idempotency
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Token helper methods
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
};

// Base Production-Grade Axios Client
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF guard
  },
  timeout: 15000,
  withCredentials: true,
});

// Request Interceptor: Attach JWT Token, Request-ID & Idempotency Key
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach trace Request ID
    config.headers['X-Request-Id'] = generateUUID();

    // Attach JWT Access Token if present
    const token = tokenStorage.getAccessToken();
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach Idempotency Key for mutating requests
    const method = (config.method || '').toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      if (!config.headers['Idempotency-Key']) {
        config.headers['Idempotency-Key'] = generateUUID();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency lock and queue for transparent 401 token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Double-Token Rotation on 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken();

      // If no refresh token is available, clear session
      if (!refreshToken || originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token')) {
        tokenStorage.clearTokens();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post('/api/v1/auth/refresh-token', {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        if (newAccessToken) {
          tokenStorage.setTokens(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          tokenStorage.clearTokens();
          processQueue(new Error('Refresh token invalid'));
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        tokenStorage.clearTokens();
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ----------------------------------------------------
// Authentication API
// ----------------------------------------------------
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const payload = res.data?.data || res.data;
    if (payload?.accessToken) {
      tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
      if (payload.user) {
        tokenStorage.setUser(payload.user);
      }
    }
    return payload;
  },

  signup: async (data: { name: string; email: string; password: string; farmName?: string; phone?: string }) => {
    const res = await apiClient.post('/auth/signup', data);
    return res.data?.data || res.data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otp });
    const payload = res.data?.data || res.data;
    if (payload?.accessToken) {
      tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
      if (payload.user) {
        tokenStorage.setUser(payload.user);
      }
    }
    return payload;
  },

  me: async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const user = res.data?.data || res.data;
      tokenStorage.setUser(user);
      return user;
    } catch {
      return tokenStorage.getUser();
    }
  },

  logout: () => {
    tokenStorage.clearTokens();
  },
};

// ----------------------------------------------------
// Image & Receipt Upload API
// ----------------------------------------------------
export const uploadApi = {
  /**
   * Upload an image file or base64 data string to /api/uploads/image
   */
  uploadImage: async (fileOrBase64: File | string, category: 'cattle' | 'receipt' | 'profile' = 'cattle'): Promise<{ url: string; filename: string }> => {
    let base64String = '';

    if (typeof fileOrBase64 === 'string') {
      base64String = fileOrBase64;
    } else {
      base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(fileOrBase64);
      });
    }

    const res = await apiClient.post('/uploads/image', {
      image: base64String,
      category,
    });

    const data = res.data?.data || res.data;
    return {
      url: data.url,
      filename: data.filename,
    };
  },
};

// ----------------------------------------------------
// Animals / Livestock API
// ----------------------------------------------------
export const animalsApi = {
  getAll: async (): Promise<Animal[]> => {
    try {
      const res = await apiClient.get('/animals?limit=100');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return farmStore.getAnimals();
    } catch {
      return farmStore.getAnimals();
    }
  },

  getById: async (id: string): Promise<Animal | undefined> => {
    try {
      const res = await apiClient.get(`/animals/${id}`);
      return (res.data?.data || res.data) as Animal;
    } catch {
      return farmStore.getAnimalById(id);
    }
  },

  create: async (animal: Animal): Promise<Animal> => {
    try {
      const res = await apiClient.post('/animals', animal);
      const created = (res.data?.data || res.data) as Animal;
      farmStore.saveAnimal(created);
      return created;
    } catch {
      farmStore.saveAnimal(animal);
      return animal;
    }
  },

  update: async (animal: Animal): Promise<Animal> => {
    try {
      const res = await apiClient.put(`/animals/${animal.id}`, animal);
      const updated = (res.data?.data || res.data) as Animal;
      farmStore.saveAnimal(updated);
      return updated;
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

// ----------------------------------------------------
// Milk Records API
// ----------------------------------------------------
export const milkRecordsApi = {
  getAll: async (): Promise<MilkRecord[]> => {
    try {
      const res = await apiClient.get('/milk-records?limit=100');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return farmStore.getMilkRecords();
    } catch {
      return farmStore.getMilkRecords();
    }
  },

  create: async (record: MilkRecord): Promise<{ success: boolean; duplicate?: boolean }> => {
    try {
      const res = await apiClient.post('/milk-records', record);
      farmStore.saveMilkRecord(record);
      return { success: true };
    } catch (err: any) {
      if (err.response?.status === 409) {
        return { success: false, duplicate: true };
      }
      farmStore.saveMilkRecord(record);
      return { success: true };
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

// ----------------------------------------------------
// Expenses API
// ----------------------------------------------------
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    try {
      const res = await apiClient.get('/expenses?limit=100');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return farmStore.getExpenses();
    } catch {
      return farmStore.getExpenses();
    }
  },

  create: async (expense: Expense): Promise<Expense> => {
    try {
      const res = await apiClient.post('/expenses', expense);
      const created = (res.data?.data || res.data) as Expense;
      farmStore.saveExpense(created);
      return created;
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

// ----------------------------------------------------
// Sales API
// ----------------------------------------------------
export const salesApi = {
  getAll: async (): Promise<Sale[]> => {
    try {
      const res = await apiClient.get('/sales?limit=100');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return farmStore.getSales();
    } catch {
      return farmStore.getSales();
    }
  },

  create: async (sale: Sale): Promise<Sale> => {
    try {
      const res = await apiClient.post('/sales', sale);
      const created = (res.data?.data || res.data) as Sale;
      farmStore.saveSale(created);
      return created;
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

// ----------------------------------------------------
// Reports & Analytics API
// ----------------------------------------------------
export const reportsApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await apiClient.get('/reports');
      const data = res.data?.data || res.data;
      return (data as DashboardStats) || farmStore.getDashboardStats();
    } catch {
      return farmStore.getDashboardStats();
    }
  },
};

// ----------------------------------------------------
// Bilingual AI Advisor API
// ----------------------------------------------------
export const aiAdvisorApi = {
  ask: async (query: string, language: 'en' | 'hi' = 'en'): Promise<{ answer: string; category: string }> => {
    try {
      const res = await apiClient.post('/ai-advisor', {
        query,
        language,
        farmContext: farmStore.getDashboardStats(),
      });
      const data = res.data?.data || res.data;
      return {
        answer: data.answer,
        category: data.category || 'general',
      };
    } catch {
      return {
        answer: generateLocalAIResponse(query, language),
        category: 'general',
      };
    }
  },
};

// ----------------------------------------------------
// Fallback intelligent response generator for AI Advisor
// ----------------------------------------------------
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
