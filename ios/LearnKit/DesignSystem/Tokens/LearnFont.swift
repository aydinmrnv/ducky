import SwiftUI

/// Typography tokens (docs/11-design.md). All built on system text styles so
/// Dynamic Type works everywhere. Code uses SF Mono scaled relative to `.body`.
public enum LearnFont {
    public static let largeTitle = Font.largeTitle.weight(.bold)
    public static let title = Font.title2.weight(.bold)
    /// Lesson prompts.
    public static let prompt = Font.title3.weight(.semibold)
    public static let headline = Font.headline
    /// Explanations and general copy.
    public static let body = Font.body
    public static let callout = Font.callout
    public static let footnote = Font.footnote
    public static let caption = Font.caption

    /// Button labels.
    public static let button = Font.headline

    /// Code (SF Mono), scales with Dynamic Type.
    public static let code = Font.system(.body, design: .monospaced)
    /// Code line numbers (SF Mono, one step smaller).
    public static let codeLineNumber = Font.system(.footnote, design: .monospaced)
}
