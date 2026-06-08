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

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  compatibilityJSON: "v3",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

AsyncStorage.getItem("language").then((lng) => {
  if (lng && ["en", "ps", "dr"].includes(lng)) {
    i18n.changeLanguage(lng);
  }
});

export default i18n;