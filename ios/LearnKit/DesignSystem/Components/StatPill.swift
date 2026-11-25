import SwiftUI

/// A compact stat: streak, Sparks, or hearts (docs/11-design.md).
///
/// The caller supplies the spoken label so the words (including brand words like
/// the currency name) stay in the app's String Catalog.
public struct StatPill: View {
    public enum Kind: Sendable, CaseIterable {
        case streak, sparks, hearts

        var systemImage: String {
            switch self {
            case .streak: "flame.fill"
            case .sparks: "bolt.fill"
            case .hearts: "heart.fill"
            }
        }

        var tint: Color {
            switch self {
            case .streak: LearnColor.mascot
            case .sparks: LearnColor.accent
            case .hearts: LearnColor.error
            }
        }
    }

    private let kind: Kind
    private let value: Int
    private let accessibilityLabel: Text

    public init(_ kind: Kind, value: Int, accessibilityLabel: Text) {
        self.kind = kind
        self.value = value
        self.accessibilityLabel = accessibilityLabel
    }

    public var body: some View {
        HStack(spacing: Spacing.xxs) {
            Image(systemName: kind.systemImage)
                .foregroundStyle(kind.tint)
            Text(value, format: .number)
                .foregroundStyle(LearnColor.textPrimary)
                .monospacedDigit()
        }
        .font(LearnFont.headline)
        .padding(.horizontal, Spacing.sm)
        .frame(minHeight: Size.minTouchTarget)
        .background(LearnColor.surface, in: Capsule())
        .overlay(Capsule().strokeBorder(LearnColor.border, lineWidth: Size.borderWidth))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityLabel)
    }
}

private struct StatPillPreviewRow: View {
    var body: some View {
        HStack(spacing: Spacing.xs) {
            StatPill(.streak, value: 12, accessibilityLabel: Text(verbatim: "12 day streak"))
            StatPill(.sparks, value: 30, accessibilityLabel: Text(verbatim: "30 sparks"))
            StatPill(.hearts, value: 5, accessibilityLabel: Text(verbatim: "5 hearts"))
        }
        .padding(Spacing.screen)
        .background(LearnColor.background)
    }
}

#Preview("Light") { StatPillPreviewRow() }

#Preview("Dark") { StatPillPreviewRow().preferredColorScheme(.dark) }

#Preview("Largest Dynamic Type") {
    StatPill(.streak, value: 365, accessibilityLabel: Text(verbatim: "365 day streak"))
        .padding(Spacing.screen)
        .background(LearnColor.background)
        .dynamicTypeSize(.accessibility5)
}
