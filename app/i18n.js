import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import dr from "../translations/dr.json";
import en from "../translations/en.json";
import ps from "../translations/ps.json";

const resources = {
  en: { translation: en },
  ps: { translation: ps },
  dr: { translation: dr },
};

const supportedLanguages = ["en", "ps", "dr"];

const languageDetector = {
  type: "languageDetector",
  async: true,

  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");

      if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
        callback(savedLanguage);
      } else {
        callback("en");
      }
    } catch (error) {
      callback("en");
    }
  },

  init: () => {},

  cacheUserLanguage: async (lng) => {
    try {
      if (supportedLanguages.includes(lng)) {
        await AsyncStorage.setItem("language", lng);
      }
    } catch (error) {
      console.log("Language save error:", error);
    }
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      supportedLngs: supportedLanguages,

      compatibilityJSON: "v3",

      returnNull: false,
      returnEmptyString: false,

      interpolation: {
        escapeValue: false,
      },

      react: {
        useSuspense: false,
      },
    });
}

export default i18n;