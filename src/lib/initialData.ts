import { Animal, MilkRecord, Expense, Sale, FarmSettings } from './types';

export const initialFarmSettings: FarmSettings = {
  farmName: "Gokul Dairy Farm",
  ownerName: "Rajesh Patel",
  phone: "+91 98765 43210",
  email: "contact@gokuldairy.in",
  address: "Village Rampur, GT Road, Karnal",
  state: "Haryana",
  registrationNumber: "HR-DAIRY-2024-8841",
  currency: "₹",
  language: "en",
  lowYieldAlertThreshold: 8, // litres
  vaccinationAlertDays: 14,
  dailyMilkTarget: 180, // litres
  theme: "light",
};

export const initialAnimals: Animal[] = [
  {
    id: "a-101",
    tagNumber: "DM-101",
    name: "Gauri",
    type: "Cow",
    breed: "Gir",
    dob: "2021-03-15",
    purchasePrice: 65000,
    weight: 420,
    healthStatus: "Lactating",
    milkCapacity: 16,
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 3,
    calvingDate: "2024-08-12",
    feeding: {
      feedType: "Green Napier Fodder + Wheat Straw + 4kg Cattle Pellet",
      morningQtyKg: 12,
      eveningQtyKg: 12,
      supplements: "Mineral Mixture 60g, Chelated Calcium 100ml"
    },
    vaccinations: [
      { id: "v1", vaccineName: "FMD (Foot and Mouth)", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed", veterinarian: "Dr. R. K. Sharma" },
      { id: "v2", vaccineName: "HS (Haemorrhagic Septicaemia)", dateGiven: "2024-05-15", dueDate: "2025-05-15", status: "Completed", veterinarian: "Dr. R. K. Sharma" },
      { id: "v3", vaccineName: "BQ (Black Quarter)", dateGiven: "2024-05-15", dueDate: "2025-05-15", status: "Completed", veterinarian: "Dr. R. K. Sharma" },
      { id: "v4", vaccineName: "Brucellosis Booster", dateGiven: "2023-11-20", dueDate: "2024-11-20", status: "Due", veterinarian: "Dr. R. K. Sharma" }
    ],
    vetVisits: [
      { id: "vv1", date: "2024-08-14", doctorName: "Dr. R. K. Sharma", reason: "Post-calving health check", diagnosis: "Healthy recovery, no retained placenta", prescriptions: "Uterine tonic 100ml for 3 days", cost: 600 },
      { id: "vv2", date: "2024-09-20", doctorName: "Dr. R. K. Sharma", reason: "Routine Deworming", diagnosis: "Good rumen motility", prescriptions: "Albendazole bolus 3g", cost: 350 }
    ],
    notes: "High milk yielding Gir cow. Gentle temperament, consistent lactation peak.",
    createdAt: "2023-01-10"
  },
  {
    id: "a-102",
    tagNumber: "DM-102",
    name: "Kaali",
    type: "Buffalo",
    breed: "Murrah",
    dob: "2020-07-22",
    purchasePrice: 95000,
    weight: 560,
    healthStatus: "Lactating",
    milkCapacity: 18,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 2,
    calvingDate: "2024-07-05",
    feeding: {
      feedType: "Green Sorghum + Mustard Cake + Wheat Bran",
      morningQtyKg: 15,
      eveningQtyKg: 15,
      supplements: "Bypass Fat 100g, Mineral Mix 75g"
    },
    vaccinations: [
      { id: "v5", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed", veterinarian: "Dr. R. K. Sharma" },
      { id: "v6", vaccineName: "HS", dateGiven: "2024-05-15", dueDate: "2025-05-15", status: "Completed", veterinarian: "Dr. R. K. Sharma" }
    ],
    vetVisits: [
      { id: "vv3", date: "2024-07-06", doctorName: "Dr. R. K. Sharma", reason: "Post-partum inspection", diagnosis: "Normal lactation start", prescriptions: "Calcium gel", cost: 750 }
    ],
    notes: "Champion Murrah buffalo, milk fat reaches 8.2%. Top producer in herd.",
    createdAt: "2023-02-15"
  },
  {
    id: "a-103",
    tagNumber: "DM-103",
    name: "Lakshmi",
    type: "Cow",
    breed: "Sahiwal",
    dob: "2021-11-04",
    purchasePrice: 58000,
    weight: 390,
    healthStatus: "Lactating",
    milkCapacity: 14,
    imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 2,
    calvingDate: "2024-09-01",
    feeding: {
      feedType: "Barseem Fodder + Maize Crushed Feed",
      morningQtyKg: 11,
      eveningQtyKg: 11,
      supplements: "Trace minerals 50g"
    },
    vaccinations: [
      { id: "v7", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" },
      { id: "v8", vaccineName: "Theileriosis", dateGiven: "2024-03-01", dueDate: "2025-03-01", status: "Completed" }
    ],
    vetVisits: [],
    notes: "Pure Sahiwal, very disease resistant, good fat percentage (4.6%).",
    createdAt: "2023-03-20"
  },
  {
    id: "a-104",
    tagNumber: "DM-104",
    name: "Sundari",
    type: "Buffalo",
    breed: "Murrah",
    dob: "2019-05-19",
    purchasePrice: 88000,
    weight: 540,
    healthStatus: "Lactating",
    milkCapacity: 16,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 4,
    calvingDate: "2024-06-18",
    feeding: {
      feedType: "Dry Paddy Straw + Napier Grass + Cottonseed Cake",
      morningQtyKg: 14,
      eveningQtyKg: 14,
      supplements: "Agrimin Forte 50g"
    },
    vaccinations: [
      { id: "v9", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" }
    ],
    vetVisits: [
      { id: "vv4", date: "2024-08-02", doctorName: "Dr. R. K. Sharma", reason: "Mild teat swelling", diagnosis: "Early subclinical mastitis", prescriptions: "Intramammary tube + Anti-inflammatory", cost: 1200 }
    ],
    notes: "Recovered fully from mild teat infection. Produces ~15L daily.",
    createdAt: "2023-04-05"
  },
  {
    id: "a-105",
    tagNumber: "DM-105",
    name: "Radha",
    type: "Cow",
    breed: "HF Cross",
    dob: "2022-01-14",
    purchasePrice: 72000,
    weight: 480,
    healthStatus: "Lactating",
    milkCapacity: 22,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 1,
    calvingDate: "2024-09-15",
    feeding: {
      feedType: "Silage + Concentrated Balanced Cattle Feed 6kg",
      morningQtyKg: 16,
      eveningQtyKg: 16,
      supplements: "Buffer (Sodium Bicarbonate) 80g, Toxin Binder"
    },
    vaccinations: [
      { id: "v10", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" },
      { id: "v11", vaccineName: "Theileriosis", dateGiven: "2024-04-12", dueDate: "2025-04-12", status: "Completed" }
    ],
    vetVisits: [],
    notes: "High volume producer. Requires cool shed and adequate fan ventilation in summer.",
    createdAt: "2023-05-12"
  },
  {
    id: "a-106",
    tagNumber: "DM-106",
    name: "Shyamali",
    type: "Buffalo",
    breed: "Jaffarabadi",
    dob: "2021-08-30",
    purchasePrice: 92000,
    weight: 610,
    healthStatus: "Pregnant",
    milkCapacity: 15,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 2,
    calvingDate: "2023-10-10",
    feeding: {
      feedType: "Dry Straw + Green Fodder + Gestation ration 2.5kg",
      morningQtyKg: 12,
      eveningQtyKg: 12,
      supplements: "Anionic Mineral Mix, Vitamin E & Selenium"
    },
    vaccinations: [
      { id: "v12", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" },
      { id: "v13", vaccineName: "HS", dateGiven: "2024-05-15", dueDate: "2025-05-15", status: "Completed" }
    ],
    vetVisits: [
      { id: "vv5", date: "2024-07-20", doctorName: "Dr. R. K. Sharma", reason: "Pregnancy Diagnosis (PD)", diagnosis: "Confirmed 4 months pregnant via rectal palpation", prescriptions: "Mineral supplements", cost: 400 }
    ],
    notes: "Currently dry period, expected calving in December 2024.",
    createdAt: "2023-06-01"
  },
  {
    id: "a-107",
    tagNumber: "DM-107",
    name: "Kamdhenu",
    type: "Cow",
    breed: "Gir",
    dob: "2022-04-10",
    purchasePrice: 62000,
    weight: 410,
    healthStatus: "Lactating",
    milkCapacity: 15,
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 1,
    calvingDate: "2024-08-28",
    feeding: {
      feedType: "Napier Grass + Mustard Cake + Chana Churi",
      morningQtyKg: 11,
      eveningQtyKg: 11,
      supplements: "Bio-choline 30g, Calcium Liquid"
    },
    vaccinations: [
      { id: "v14", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" }
    ],
    vetVisits: [],
    notes: "First lactation heifer. High A2 protein milk quality, peaceful behavior.",
    createdAt: "2023-07-15"
  },
  {
    id: "a-108",
    tagNumber: "DM-108",
    name: "Bhavani",
    type: "Buffalo",
    breed: "Murrah",
    dob: "2021-02-18",
    purchasePrice: 85000,
    weight: 530,
    healthStatus: "Lactating",
    milkCapacity: 15,
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 2,
    calvingDate: "2024-06-25",
    feeding: {
      feedType: "Green Bajra Fodder + Crushed Wheat + Urea Molasses Block",
      morningQtyKg: 13,
      eveningQtyKg: 13,
      supplements: "Minerals 50g"
    },
    vaccinations: [
      { id: "v15", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" },
      { id: "v16", vaccineName: "HS", dateGiven: "2024-05-15", dueDate: "2025-05-15", status: "Completed" }
    ],
    vetVisits: [],
    notes: "Steady 14.5L daily yield, very high butterfat test.",
    createdAt: "2023-08-10"
  },
  {
    id: "a-109",
    tagNumber: "DM-109",
    name: "Nandi",
    type: "Cow",
    breed: "Tharparkar",
    dob: "2022-06-01",
    purchasePrice: 52000,
    weight: 380,
    healthStatus: "Healthy",
    milkCapacity: 12,
    imageUrl: "https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 1,
    calvingDate: "2024-05-10",
    feeding: {
      feedType: "Dry Hay + Green Napier + 3kg Balanced Mash",
      morningQtyKg: 10,
      eveningQtyKg: 10,
      supplements: "Salt lick + Mineral mix"
    },
    vaccinations: [
      { id: "v17", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" }
    ],
    vetVisits: [
      { id: "vv6", date: "2024-09-12", doctorName: "Dr. R. K. Sharma", reason: "Hoof trimming", diagnosis: "Minor overgrowth, no lameness", prescriptions: "Copper sulfate footbath", cost: 300 }
    ],
    notes: "Hardy desert breed, very low veterinary requirement.",
    createdAt: "2023-09-01"
  },
  {
    id: "a-110",
    tagNumber: "DM-110",
    name: "Pari",
    type: "Cow",
    breed: "Jersey Cross",
    dob: "2022-09-14",
    purchasePrice: 68000,
    weight: 430,
    healthStatus: "Sick",
    milkCapacity: 18,
    imageUrl: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80",
    lactationNumber: 1,
    calvingDate: "2024-08-01",
    feeding: {
      feedType: "Soft Green Lucerne + Electrolyte Water + Light Mash",
      morningQtyKg: 8,
      eveningQtyKg: 8,
      supplements: "Liver tonic, probiotic bolus"
    },
    vaccinations: [
      { id: "v18", vaccineName: "FMD", dateGiven: "2024-04-10", dueDate: "2024-10-10", status: "Completed" }
    ],
    vetVisits: [
      { id: "vv7", date: "2024-10-28", doctorName: "Dr. R. K. Sharma", reason: "Reduced appetite and mild fever (103°F)", diagnosis: "Simple Indigestion / Ruminal Acidosis", prescriptions: "Rumenotorics, Belamyl liver extract, B-complex", cost: 950, followUpDate: "2024-11-01" }
    ],
    notes: "Under medical recovery. Kept in separate recovery pen, milk yield temporarily down.",
    createdAt: "2023-10-18"
  }
];

// Generate past 14 days of realistic milk records
export const generateInitialMilkRecords = (): MilkRecord[] => {
  const records: MilkRecord[] = [];
  const today = new Date();
  
  // Active lactating animals
  const lactatingAnimals = [
    { id: "a-101", tag: "DM-101", name: "Gauri", morning: 7.8, evening: 7.2, fat: 4.4, snf: 8.6, rate: 44 },
    { id: "a-102", tag: "DM-102", name: "Kaali", morning: 8.8, evening: 8.2, fat: 8.0, snf: 9.1, rate: 66 },
    { id: "a-103", tag: "DM-103", name: "Lakshmi", morning: 6.8, evening: 6.2, fat: 4.5, snf: 8.5, rate: 45 },
    { id: "a-104", tag: "DM-104", name: "Sundari", morning: 7.6, evening: 7.0, fat: 7.6, snf: 8.9, rate: 64 },
    { id: "a-105", tag: "DM-105", name: "Radha", morning: 10.5, evening: 9.8, fat: 3.9, snf: 8.4, rate: 42 },
    { id: "a-107", tag: "DM-107", name: "Kamdhenu", morning: 7.1, evening: 6.8, fat: 4.5, snf: 8.6, rate: 45 },
    { id: "a-108", tag: "DM-108", name: "Bhavani", morning: 7.4, evening: 6.8, fat: 7.7, snf: 9.0, rate: 65 },
    { id: "a-109", tag: "DM-109", name: "Nandi", morning: 5.5, evening: 5.0, fat: 4.3, snf: 8.5, rate: 43 },
    { id: "a-110", tag: "DM-110", name: "Pari", morning: 4.0, evening: 3.8, fat: 4.0, snf: 8.4, rate: 42 }, // sick, lower
  ];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    lactatingAnimals.forEach((animal, idx) => {
      // slight daily variation +/- 0.4L
      const variation = Math.sin(i * 1.5 + idx) * 0.35;
      const mQty = Math.round((animal.morning + variation) * 10) / 10;
      const eQty = Math.round((animal.evening + variation * 0.8) * 10) / 10;
      const total = Math.round((mQty + eQty) * 10) / 10;
      const amount = Math.round(total * animal.rate);

      records.push({
        id: `mr-${dateStr}-${animal.id}`,
        animalId: animal.id,
        animalTag: animal.tag,
        animalName: animal.name,
        date: dateStr,
        morningQuantity: mQty,
        eveningQuantity: eQty,
        totalQuantity: total,
        fatPercentage: animal.fat,
        snfPercentage: animal.snf,
        ratePerLitre: animal.rate,
        totalAmount: amount,
        notes: i === 0 ? "Normal morning & evening milking." : undefined
      });
    });
  }

  return records;
};

export const initialMilkRecords = generateInitialMilkRecords();

export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    title: "Cattle Feed Pellets (50 Bags x 50kg)",
    category: "Animal Feed",
    amount: 55000,
    date: "2024-10-05",
    paidTo: "Kisan Pashu Aahar Kendra, Karnal",
    paymentMethod: "Bank Transfer",
    notes: "Fortified with 20% crude protein, mineral mix and bypass fat."
  },
  {
    id: "exp-2",
    title: "Fresh Green Barseem & Napier Grass (3 Trollies)",
    category: "Animal Feed",
    amount: 18500,
    date: "2024-10-12",
    paidTo: "Chaudhary Fodder Farm",
    paymentMethod: "UPI",
    notes: "High moisture sweet green forage for morning milking herds."
  },
  {
    id: "exp-3",
    title: "Monthly Labour Wages (2 Milkers + 1 Cleaner)",
    category: "Labour",
    amount: 36000,
    date: "2024-10-01",
    paidTo: "Ramesh, Mohan & Suresh",
    paymentMethod: "Bank Transfer",
    notes: "Full month wages including morning/evening shifts."
  },
  {
    id: "exp-4",
    title: "Veterinary Deworming & Health Diagnostics",
    category: "Veterinary & Medicine",
    amount: 4800,
    date: "2024-10-16",
    paidTo: "Dr. R. K. Sharma (Vet Clinic)",
    paymentMethod: "UPI",
    notes: "Annual herd deworming boluses, mineral mixture buckets, and syringes."
  },
  {
    id: "exp-5",
    title: "Dairy Farm Electricity & Water Pump Bill",
    category: "Electricity & Water",
    amount: 7850,
    date: "2024-10-10",
    paidTo: "UHBVN Electricity Board",
    paymentMethod: "Bank Transfer",
    notes: "Bulk chilling unit, water pump, and fan mist cooling system."
  },
  {
    id: "exp-6",
    title: "Bulk Milk Chiller & Milking Machine Servicing",
    category: "Equipment & Maintenance",
    amount: 6200,
    date: "2024-10-18",
    paidTo: "DeLaval Service Partner",
    paymentMethod: "UPI",
    notes: "Pulsator maintenance, teat cup liner replacements, milk pipeline sanitization."
  },
  {
    id: "exp-7",
    title: "Milk Van Diesel & Can Transportation",
    category: "Transportation",
    amount: 5400,
    date: "2024-10-24",
    paidTo: "Indian Oil Petrol Pump",
    paymentMethod: "UPI",
    notes: "Daily morning transit to Karnal Milk Chilling Plant."
  },
  {
    id: "exp-8",
    title: "Treatment & Meds for DM-110 Indigestion",
    category: "Veterinary & Medicine",
    amount: 1550,
    date: "2024-10-28",
    paidTo: "Govt Veterinary Hospital Chemist",
    paymentMethod: "Cash",
    notes: "Rumenotorics, electrolytes and B-complex injection."
  }
];

export const initialSales: Sale[] = [
  {
    id: "sale-1",
    buyerName: "Amul Dairy Cooperative Society",
    contact: "+91 94160 11223",
    quantityLiters: 1650,
    ratePerLitre: 56,
    totalAmount: 92400,
    date: "2024-10-10",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Bi-weekly settlement cycle (Oct 1 to Oct 10). Average Fat 6.2%, SNF 8.8%."
  },
  {
    id: "sale-2",
    buyerName: "Amul Dairy Cooperative Society",
    contact: "+91 94160 11223",
    quantityLiters: 1720,
    ratePerLitre: 57,
    totalAmount: 98040,
    date: "2024-10-20",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Bi-weekly settlement cycle (Oct 11 to Oct 20)."
  },
  {
    id: "sale-3",
    buyerName: "Mother Dairy Chilling Centre",
    contact: "+91 98120 44556",
    quantityLiters: 850,
    ratePerLitre: 58,
    totalAmount: 49300,
    date: "2024-10-25",
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    notes: "Premium Buffalo milk dispatch."
  },
  {
    id: "sale-4",
    buyerName: "Shree Krishna Sweets & Mawa House",
    contact: "+91 98960 77889",
    quantityLiters: 480,
    ratePerLitre: 68,
    totalAmount: 32640,
    date: "2024-10-27",
    paymentStatus: "Paid",
    paymentMethod: "UPI",
    notes: "High fat Murrah buffalo milk supplied for festival sweets."
  },
  {
    id: "sale-5",
    buyerName: "Village Direct Doorstep Delivery",
    contact: "Direct Customers (45 households)",
    quantityLiters: 520,
    ratePerLitre: 62,
    totalAmount: 32240,
    date: "2024-10-29",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    notes: "Daily fresh A2 Cow and pure Buffalo milk delivered in glass bottles."
  },
  {
    id: "sale-6",
    buyerName: "Amul Dairy Cooperative Society",
    contact: "+91 94160 11223",
    quantityLiters: 1450,
    ratePerLitre: 56.5,
    totalAmount: 81925,
    date: "2024-10-30",
    paymentStatus: "Pending",
    paymentMethod: "Bank Transfer",
    notes: "Current cycle pending payment due on 5th Nov."
  }
];
