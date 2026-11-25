import Brand
import DesignSystem
import Foundation
import Testing
@testable import LearnApp

struct BrandTests {
    @Test func displayNameComesFromBuildSettingAndMatchesBrand() {
        // CFBundleDisplayName is driven by APP_DISPLAY_NAME in Base.xcconfig.
        // If the app is renamed, Brand.appName and the xcconfig must change together.
        let displayName = Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String
        #expect(displayName == Brand.appName)
    }

    @Test func bundleIdentifierIsNeutral() throws {
        let bundleID = try #require(Bundle.main.bundleIdentifier)
        #expect(bundleID == "one.nullstack.learn")
        #expect(!bundleID.lowercased().contains(Brand.appName.lowercased()))
    }

    @Test func currencyNamePluralizes() {
        #expect(Brand.currencyName(for: 0) == Brand.currencyName)
        #expect(Brand.currencyName(for: 1) == Brand.currencyNameSingular)
        #expect(Brand.currencyName(for: 2) == Brand.currencyName)
    }
}

struct DesignTokenTests {
    @Test func spacingSitsOnTheEightPointGrid() {
        for value in [Spacing.xs, Spacing.sm, Spacing.md, Spacing.lg, Spacing.xl, Spacing.card] {
            #expect(value.truncatingRemainder(dividingBy: Spacing.grid) == 0)
        }
    }

    @Test func touchTargetMeetsMinimum() {
        #expect(Size.minTouchTarget >= 44)
    }
}

struct AppConfigTests {
    @Test func readsValuesFromInfoDictionary() throws {
        let config = try #require(AppConfig(infoDictionary: [
            AppConfig.Key.apiBaseURL: "https://api.example.invalid",
            AppConfig.Key.supabaseAnonKey: "anon",
        ]))
        #expect(config.apiBaseURL.absoluteString == "https://api.example.invalid")
        #expect(config.supabaseAnonKey == "anon")
    }

    @Test(arguments: ["", "not a url", "$(API_BASE_URL)"])
    func rejectsMissingOrUnexpandedURL(value: String) {
        #expect(AppConfig(infoDictionary: [AppConfig.Key.apiBaseURL: value]) == nil)
    }

    @Test func bundledConfigIsValid() {
        #expect(AppConfig.load() != nil)
    }
}
