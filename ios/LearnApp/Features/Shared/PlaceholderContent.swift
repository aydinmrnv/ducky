import DesignSystem
import SwiftUI

/// Temporary content for screens that are not built yet.
struct PlaceholderContent: View {
    let systemImage: String
    let title: Text
    let message: Text

    var body: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: systemImage)
                .font(LearnFont.largeTitle)
                .foregroundStyle(LearnColor.textTertiary)
                .accessibilityHidden(true)
            title
                .font(LearnFont.title)
                .foregroundStyle(LearnColor.textPrimary)
            message
                .font(LearnFont.body)
                .foregroundStyle(LearnColor.textSecondary)
        }
        .multilineTextAlignment(.center)
        .frame(maxWidth: .infinity)
        .padding(Spacing.card)
        .background(LearnColor.surface, in: RoundedRectangle(cornerRadius: Radius.large, style: .continuous))
        .accessibilityElement(children: .combine)
    }
}

#Preview {
    PlaceholderContent(
        systemImage: "sparkles",
        title: Text("Your path"),
        message: Text("Your learning path will appear here soon.")
    )
    .padding(Spacing.screen)
    .background(LearnColor.background)
}
