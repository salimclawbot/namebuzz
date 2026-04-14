export interface ExpiredDomain {
  domain: string;
  status: "expired" | "pending-delete" | "available";
  expiredDaysAgo: number;
  registeredYearsAgo: number;
  characters: number;
  isWord: boolean;
  isDictionaryWord: boolean;
  type: "word" | "acronym" | "brandable" | "numeric";
}

export const expiredDomains: ExpiredDomain[] = [
  // Expired (15)
  { domain: "relay.ai", status: "expired", expiredDaysAgo: 2, registeredYearsAgo: 4, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "cipher.ai", status: "expired", expiredDaysAgo: 3, registeredYearsAgo: 5, characters: 6, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "pivot.ai", status: "expired", expiredDaysAgo: 5, registeredYearsAgo: 3, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "beacon.ai", status: "expired", expiredDaysAgo: 6, registeredYearsAgo: 4, characters: 6, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "grove.ai", status: "expired", expiredDaysAgo: 7, registeredYearsAgo: 2, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "kex.ai", status: "expired", expiredDaysAgo: 8, registeredYearsAgo: 1, characters: 3, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "flo.ai", status: "expired", expiredDaysAgo: 10, registeredYearsAgo: 3, characters: 3, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "nyx.ai", status: "expired", expiredDaysAgo: 12, registeredYearsAgo: 2, characters: 3, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "vex.ai", status: "expired", expiredDaysAgo: 14, registeredYearsAgo: 4, characters: 3, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "mlr.ai", status: "expired", expiredDaysAgo: 16, registeredYearsAgo: 1, characters: 3, isWord: false, isDictionaryWord: false, type: "acronym" },
  { domain: "sora.ai", status: "expired", expiredDaysAgo: 18, registeredYearsAgo: 5, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "tidal.ai", status: "expired", expiredDaysAgo: 20, registeredYearsAgo: 6, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "forge.ai", status: "expired", expiredDaysAgo: 22, registeredYearsAgo: 3, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "nexo.ai", status: "expired", expiredDaysAgo: 25, registeredYearsAgo: 2, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "drift.ai", status: "expired", expiredDaysAgo: 28, registeredYearsAgo: 5, characters: 5, isWord: true, isDictionaryWord: true, type: "word" },

  // Pending Delete (10)
  { domain: "apex2.ai", status: "pending-delete", expiredDaysAgo: 1, registeredYearsAgo: 2, characters: 5, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "civi.ai", status: "pending-delete", expiredDaysAgo: 3, registeredYearsAgo: 3, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "lyra.ai", status: "pending-delete", expiredDaysAgo: 5, registeredYearsAgo: 4, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "meld.ai", status: "pending-delete", expiredDaysAgo: 7, registeredYearsAgo: 2, characters: 4, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "orb.ai", status: "pending-delete", expiredDaysAgo: 9, registeredYearsAgo: 5, characters: 3, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "prex.ai", status: "pending-delete", expiredDaysAgo: 11, registeredYearsAgo: 1, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "riva.ai", status: "pending-delete", expiredDaysAgo: 14, registeredYearsAgo: 3, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "silo.ai", status: "pending-delete", expiredDaysAgo: 17, registeredYearsAgo: 6, characters: 4, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "tork.ai", status: "pending-delete", expiredDaysAgo: 20, registeredYearsAgo: 2, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "vela.ai", status: "pending-delete", expiredDaysAgo: 24, registeredYearsAgo: 4, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },

  // Available (5)
  { domain: "zeno.ai", status: "available", expiredDaysAgo: 2, registeredYearsAgo: 3, characters: 4, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "yore.ai", status: "available", expiredDaysAgo: 5, registeredYearsAgo: 2, characters: 4, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "wren.ai", status: "available", expiredDaysAgo: 8, registeredYearsAgo: 4, characters: 4, isWord: true, isDictionaryWord: true, type: "word" },
  { domain: "vera2.ai", status: "available", expiredDaysAgo: 12, registeredYearsAgo: 1, characters: 5, isWord: false, isDictionaryWord: false, type: "brandable" },
  { domain: "uxo.ai", status: "available", expiredDaysAgo: 18, registeredYearsAgo: 5, characters: 3, isWord: false, isDictionaryWord: false, type: "acronym" },
];
