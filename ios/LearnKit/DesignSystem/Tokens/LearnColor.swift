import SwiftUI

/// Semantic color tokens (docs/11-design.md). Light and dark values live in
/// `Resources/Colors.xcassets`. Values are placeholders until the final palette is set.
///
/// Views must use these tokens. Never use raw hex or system colors for brand surfaces.
public enum LearnColor {
    // Neutrals
    public static let background = token("background")
    public static let surface = token("surface")
    public static let surfaceElevated = token("surfaceElevated")
    public static let border = token("border")

    // Text (each meets 4.5:1 on background, surface, and surfaceElevated)
    public static let textPrimary = token("textPrimary")
    public static let textSecondary = token("textSecondary")
    public static let textTertiary = token("textTertiary")

    // Accent (one only) and content on top of it
    public static let accent = token("accent")
    public static let textOnAccent = token("textOnAccent")

    /// The mascot's color. Mascot, streak flame, celebrations. Not for UI controls.
    public static let mascot = token("mascot")

    // Feedback. Always pair with an icon and text, never color alone.
    public static let success = token("success")
    public static let error = token("error")
    public static let warning = token("warning")

    // Code theme
    public static let codeBackground = token("codeBackground")
    public static let codeKeyword = token("codeKeyword")
    public static let codeString = token("codeString")
    public static let codeNumber = token("codeNumber")
    public static let codeComment = token("codeComment")
    public static let codeFunction = token("codeFunction")
    public static let codePunctuation = token("codePunctuation")

    private static func token(_ name: String) -> Color {
        Color(name, bundle: .module)
    }
}
