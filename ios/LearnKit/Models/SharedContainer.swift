import Foundation

/// Identifiers shared by the app and the widget extension.
///
/// The App Group value comes from the `APP_GROUP_IDENTIFIER` build setting
/// (ios/Config/Base.xcconfig) via each target's Info.plist, so it is defined in one place.
public enum SharedContainer {
    public static let appGroupInfoKey = "AppGroupIdentifier"

    /// The App Group identifier of the running target, if its Info.plist provides one.
    public static func appGroupIdentifier(in bundle: Bundle = .main) -> String? {
        bundle.object(forInfoDictionaryKey: appGroupInfoKey) as? String
    }

    /// `UserDefaults` shared between the app and widgets.
    public static func sharedDefaults(in bundle: Bundle = .main) -> UserDefaults? {
        appGroupIdentifier(in: bundle).flatMap(UserDefaults.init(suiteName:))
    }
}
