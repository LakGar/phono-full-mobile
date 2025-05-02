declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "(auth)": undefined;
      "(tabs)": undefined;
      "(onboarding)": {
        screen: "avatar" | "genres" | "artists" | "records";
      };
      "/(onboarding)/avatar": undefined;
      "/(onboarding)/genres": undefined;
      "/(onboarding)/artists": undefined;
      "/(onboarding)/records": undefined;
    }
  }
}

export {};
