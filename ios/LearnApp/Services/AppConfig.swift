import Foundation

/// Build-time configuration injected from the xcconfig files through Info.plist.
/// Values come from `ios/Config/{Debug,Release}.xcconfig` (placeholders) and the
/// gitignored `Secrets.*.xcconfig` overrides.
nonisolated struct AppConfig: Equatable, Sendable {
    let apiBaseURL: URL
    let supabaseAnonKey: String

    enum Key {
        static let apiBaseURL = "APIBaseURL"
        static let supabaseAnonKey = "SupabaseAnonKey"
    }

    /// Returns nil if the base URL is missing or invalid.
    init?(infoDictionary: [String: Any]) {
        guard
            let urlString = infoDictionary[Key.apiBaseURL] as? String,
            let url = URL(string: urlString),
            url.scheme != nil,
            url.host() != nil
        else { return nil }
        apiBaseURL = url
        supabaseAnonKey = infoDictionary[Key.supabaseAnonKey] as? String ?? ""
    }

    static func load(from bundle: Bundle = .main) -> AppConfig? {
        AppConfig(infoDictionary: bundle.infoDictionary ?? [:])
    }
}
