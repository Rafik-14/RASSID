export type Store = {
  id: string;
  initials: string;
  name: string;
  area: string;
  manager: string;
  phone: string;
  debt: number;
  totalDelivered: number;
  totalCollected: number;
  daysSincePayment: number;
  lastDelivery: string;
  lastPayment: string;
};

export const REP_NAME = "Amine Mansouri";
export const PENDING_SYNC = 3;

export const STORES: Store[] = [
  {
    id: "s1",
    initials: "ÉB",
    name: "Épicerie Ben Ali",
    area: "El Biar",
    manager: "Karim Ben Ali",
    phone: "0555 12 34 56",
    debt: 45600,
    totalDelivered: 284500,
    totalCollected: 238900,
    daysSincePayment: 15,
    lastDelivery: "1 juin 2026",
    lastPayment: "17 mai 2026",
  },
  {
    id: "s2",
    initials: "SK",
    name: "Supérette Khaled",
    area: "Hydra",
    manager: "Khaled Mansouri",
    phone: "0661 22 11 09",
    debt: 28200,
    totalDelivered: 142000,
    totalCollected: 113800,
    daysSincePayment: 12,
    lastDelivery: "28 mai 2026",
    lastPayment: "20 mai 2026",
  },
  {
    id: "s3",
    initials: "AM",
    name: "Alimentation Médina",
    area: "Bab Ezzouar",
    manager: "Mounir Hadj",
    phone: "0555 12 34 00",
    debt: 12400,
    totalDelivered: 98000,
    totalCollected: 85600,
    daysSincePayment: 6,
    lastDelivery: "30 mai 2026",
    lastPayment: "26 mai 2026",
  },
  {
    id: "s4",
    initials: "MR",
    name: "Marché Riad",
    area: "Kouba",
    manager: "Riad Bouzid",
    phone: "0770 45 22 18",
    debt: 8750,
    totalDelivered: 72000,
    totalCollected: 63250,
    daysSincePayment: 4,
    lastDelivery: "29 mai 2026",
    lastPayment: "28 mai 2026",
  },
  {
    id: "s5",
    initials: "BC",
    name: "Boutique Centrale",
    area: "Alger Centre",
    manager: "Samir Ait",
    phone: "0661 88 11 00",
    debt: 3200,
    totalDelivered: 54000,
    totalCollected: 50800,
    daysSincePayment: 2,
    lastDelivery: "31 mai 2026",
    lastPayment: "30 mai 2026",
  },
  {
    id: "s6",
    initials: "MC",
    name: "Marché Central",
    area: "Bab Ezzouar",
    manager: "Yacine Bel",
    phone: "0661 88 11 11",
    debt: 0,
    totalDelivered: 124000,
    totalCollected: 124000,
    daysSincePayment: 0,
    lastDelivery: "29 mai 2026",
    lastPayment: "29 mai 2026",
  },
  {
    id: "s7",
    initials: "ÉD",
    name: "Épicerie Djamel",
    area: "Birkhadem",
    manager: "Djamel Saidi",
    phone: "0555 99 00 12",
    debt: 0,
    totalDelivered: 88000,
    totalCollected: 88000,
    daysSincePayment: 0,
    lastDelivery: "27 mai 2026",
    lastPayment: "27 mai 2026",
  },
];

export const findStore = (id?: string) => STORES.find((s) => s.id === id) || STORES[0];

export const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/,/g, " ");
