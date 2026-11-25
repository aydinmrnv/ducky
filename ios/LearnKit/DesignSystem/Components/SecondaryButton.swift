import SwiftUI

/// A secondary action. Outlined, full width.
public struct SecondaryButton: View {
    private let title: LocalizedStringKey
    private let action: () -> Void

    /// - Parameter title: A key in the app's String Catalog.
    public init(_ title: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = title
        self.action = action
    }

    public var body: some View {
        Button(action: action) { Text(title) }
            .buttonStyle(.learnSecondary)
    }
}

#Preview("Light") {
    VStack(spacing: Spacing.sm) {
        SecondaryButton("Explain differently") {}
        SecondaryButton("Skip") {}.disabled(true)
    }
    .padding(Spacing.screen)
    .background(LearnColor.background)
}

#Preview("Dark") {
    VStack(spacing: Spacing.sm) {
        SecondaryButton("Explain differently") {}
        SecondaryButton("Skip") {}.disabled(true)
    }
    .padding(Spacing.screen)
    .background(LearnColor.background)
    .preferredColorScheme(.dark)
}

#Preview("Largest Dynamic Type") {
    SecondaryButton("Explain differently") {}
        .padding(Spacing.screen)
        .background(LearnColor.background)
        .dynamicTypeSize(.accessibility5)
}
