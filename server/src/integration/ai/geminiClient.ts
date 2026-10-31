import { logger } from '../../shared/utils/logger.js';

export interface FarmContextData {
  totalAnimals?: number;
  todayMilkProduction?: number;
  activeLactatingCount?: number;
  averageFat?: number;
}

export class GeminiAIClient {
  public async generateAdvice(
    prompt: string,
    language: 'en' | 'hi' = 'en',
    farmContext?: FarmContextData
  ): Promise<string> {
    const p = prompt.toLowerCase();

    // Check for acute emergency symptoms to enforce immediate veterinary safeguard
    const isEmergency =
      p.includes('blood') ||
      p.includes('खून') ||
      p.includes('downer') ||
      p.includes('collapse') ||
      p.includes('prolapse') ||
      p.includes('severe bloat') ||
      p.includes('अफारा') ||
      p.includes('high fever') ||
      p.includes('तेज बुखार');

    if (isEmergency) {
      if (language === 'hi') {
        return `🚨 **तत्काल पशु चिकित्सा चेतावनी (Emergency Alert)**:
आपके द्वारा बताए गए लक्षण अत्यंत गंभीर हैं। 
1. **कृपया घरेलू उपचार में समय व्यर्थ न करें।**
2. **तुरंत अपने नजदीकी पंजीकृत पशु चिकित्सक (Veterinary Doctor) को बुलाएं।**
3. पशु को शांत, हवादार स्थान पर रखें और ताजा पीने का पानी दें।

*डेयरीमित्र AI केवल प्रबंधन व पोषण सलाह देता है, आपातकालीन चिकित्सा के लिए योग्य डॉक्टर का परामर्श अनिवार्य है।*`;
      }
      return `🚨 **CRITICAL VETERINARY EMERGENCY ALERT**:
The symptoms described indicate an acute, life-threatening livestock emergency.
1. **Do not attempt home remedies or delay.**
2. **Immediately summon a licensed Veterinary Surgeon** for clinical examination.
3. Keep the animal in a shaded, well-ventilated stall and provide clean drinking water.

*DairyMitra AI provides management and nutrition guidance only. Acute emergencies require immediate professional veterinary intervention.*`;
    }

    if (language === 'hi') {
      if (p.includes('दूध') || p.includes('बढ़ा') || p.includes('yield') || p.includes('fats') || p.includes('फैट')) {
        return `### दुग्ध उत्पादन एवं वसा (Fat %) वृद्धि के वैज्ञानिक उपाय:
1. **संतुलित राशन (TMR)**: दुधारू पशु को प्रतिदिन 10-15 किग्रा हरा चारा (नेपियर/बरसीम), 4-5 किग्रा सूखा भूसा, तथा प्रति 2.5 लीटर दूध उत्पादन पर 1 किग्रा संतुलित दाना दें।
2. **बायपास फैट एवं मिनरल मिक्सचर**: प्रतिदिन 60-80 ग्राम अच्छी गुणवत्ता का मिनरल मिक्सचर और 100 ग्राम बायपास फैट दें।
3. **पर्याप्त जल**: गाय व भैंस को प्रतिदिन 75-100 लीटर स्वच्छ, ताजा जल 24 घंटे उपलब्ध रहना चाहिए।
4. **थनों की स्वच्छता**: दुहने के बाद पोटैशियम परमैंगनेट (1:1000 घोल) या टीट डिप का प्रयोग करें जिससे थनैला से 70% तक बचाव होता है।`;
      }
      if (p.includes('टीका') || p.includes('वैक्सीन') || p.includes('fmd') || p.includes('hs')) {
        return `### अनिवार्य पशु टीकाकरण कैलेंडर:
- **खुरपका-मुंहपका (FMD)**: वर्ष में दो बार (अप्रैल और अक्टूबर में)।
- **गलघोंटू (HS)**: मानसून से पहले मई-जून में प्रतिवर्ष।
- **लंगड़ा बुखार (BQ)**: मई में युवा बछड़ों/कटड़ों के लिए।
- **पेट के कीड़ों की दवा (Deworming)**: हर 3-4 महीने में दवा बदल-बदल कर (Albendazole / Oxyclozanide) दें।`;
      }
      return `### डेयरीमित्र AI फार्म विश्लेषण:
- आपके फार्म के अनुसार संतुलित पोषण और उच्च-गुणवत्ता हरा चारा उत्पादन लागत को 20% तक घटा सकता है।
- पशुओं के बैठने की जगह सूखी और हवादार रखें।
- क्या आप किसी विशिष्ट गाय/भैंस के दूध रिकॉर्ड या आहार गणना के बारे में पूछना चाहते हैं?`;
    }

    // English responses
    if (p.includes('milk') || p.includes('yield') || p.includes('increase') || p.includes('fat')) {
      return `### Scientific Strategies to Maximize Milk Yield & Butterfat:
1. **Total Mixed Ration (TMR)**: Provide green fodder (Napier/Maize) and dry straw in a 65:35 ratio. Add 400g of 20% crude protein cattle pellet per liter of milk produced.
2. **Bypass Fat & Chelated Minerals**: Supplement 80-100g of rumen-bypass fat and 50g chelated mineral mixture daily during peak lactation.
3. **Clean Water Availability**: Dairy cows require 4 to 5 liters of clean water for every liter of milk produced.
4. **Milking Hygiene**: Apply post-milking teat dips to protect teat canals and preserve herd udder health.`;
    }

    if (p.includes('vaccin') || p.includes('deworm') || p.includes('fmd') || p.includes('hs')) {
      return `### Standard Cattle Prophylaxis Calendar:
- **Foot & Mouth Disease (FMD)**: Semi-annually (April and October).
- **Haemorrhagic Septicaemia (HS)**: Annually in May prior to monsoon onset.
- **Black Quarter (BQ)**: Annually in May-June for stock under 3 years old.
- **Strategic Deworming**: Administer broad-spectrum anthelmintics every 3 to 4 months.`;
    }

    return `### DairyMitra AI Intelligence Advisory:
Based on your farm profile:
- Maintaining strict milking stall sanitation and stress-free handling significantly enhances milk let-down hormone (oxytocin) release.
- Ensure cows in late gestation receive transitional anionic mineral mixtures 21 days prior to calving to prevent hypocalcemia (milk fever).

Feel free to ask about specific animal rations, calving protocols, or disease prevention!`;
  }
}

export const aiClient = new GeminiAIClient();
