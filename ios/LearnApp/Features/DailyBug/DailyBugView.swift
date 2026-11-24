import Brand
import DesignSystem
import SwiftUI

/// Daily tab: Daily Bug (M10), leagues and friends (V1.1). Placeholder for now.
struct DailyBugView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                PlaceholderContent(
                    systemImage: "ladybug",
                    title: Text("Daily Bug"),
                    message: Text("\(Brand.mascotName) is picking today's bug. Check back soon.")
                )
                .padding(.horizontal, Spacing.screen)
                .padding(.vertical, Spacing.sm)
            }
            .background(LearnColor.background)
            .navigationTitle("Daily")
        }
    }
}

#Preview("Light") { DailyBugView() }

#Preview("Dark") { DailyBugView().preferredColorScheme(.dark) }

#Preview("Largest Dynamic Type") { DailyBugView().dynamicTypeSize(.accessibility5) }
