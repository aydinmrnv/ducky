import SwiftUI

/// The one primary action on a screen (Check, Continue). Full width, accent filled.
public struct PrimaryButton: View {
    private let title: LocalizedStringKey
    private let action: () -> Void

    /// - Parameter title: A key in the app's String Catalog.
    public init(_ title: LocalizedStringKey, action: @escaping () -> Void) {
        self.title = title
        self.action = action
    }

    public var body: some View {
        Button(action: action) { Text(title) }
            .buttonStyle(.learnPrimary)
    }
}

#Preview("Light") {
    VStack(spacing: Spacing.sm) {
        PrimaryButton("Check") {}
        PrimaryButton("Continue") {}.disabled(true)
    }
    .padding(Spacing.screen)
    .background(LearnColor.background)
}

#Preview("Dark") {
    VStack(spacing: Spacing.sm) {
        PrimaryButton("Check") {}
        PrimaryButton("Continue") {}.disabled(true)
    }
    .padding(Spacing.screen)
    .background(LearnColor.background)
    .preferredColorScheme(.dark)
}

#Preview("Largest Dynamic Type") {
    PrimaryButton("Continue") {}
        .padding(Spacing.screen)
        .background(LearnColor.background)
        .dynamicTypeSize(.accessibility5)
}
