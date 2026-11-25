import Brand
import DesignSystem
import SwiftUI

/// Learn tab: the learning path. Placeholder until M3.
struct HomeView: View {
    // Placeholder values until ProgressStore and SparkService exist.
    private let streak = 0
    private let sparks = 0
    private let hearts = 5

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Spacing.md) {
                    stats
                    PlaceholderContent(
                        systemImage: "point.topleft.down.to.point.bottomright.curvepath",
                        title: Text("Your path"),
                        message: Text("Your learning path will appear here soon.")
                    )
                }
                .padding(.horizontal, Spacing.screen)
                .padding(.vertical, Spacing.sm)
            }
            .background(LearnColor.background)
            .navigationTitle("Learn")
        }
    }

    private var stats: some View {
        // Wraps to a column at large Dynamic Type sizes.
        ViewThatFits(in: .horizontal) {
            HStack(spacing: Spacing.xs) { pills }
            VStack(alignment: .leading, spacing: Spacing.xs) { pills }
        }
    }

    @ViewBuilder
    private var pills: some View {
        StatPill(.streak, value: streak, accessibilityLabel: Text("\(streak) day streak"))
        StatPill(
            .sparks,
            value: sparks,
            accessibilityLabel: Text("\(sparks) \(Brand.currencyName(for: sparks))")
        )
        StatPill(.hearts, value: hearts, accessibilityLabel: Text("\(hearts) hearts"))
    }
}

#Preview("Light") { HomeView() }

#Preview("Dark") { HomeView().preferredColorScheme(.dark) }

#Preview("Largest Dynamic Type") { HomeView().dynamicTypeSize(.accessibility5) }
