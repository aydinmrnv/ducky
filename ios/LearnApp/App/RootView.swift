import DesignSystem
import SwiftUI

/// The three top-level tabs (docs/10-ios-app.md, Navigation).
enum AppTab: Hashable {
    case learn, daily, profile
}

struct RootView: View {
    @State private var selection: AppTab = .learn

    var body: some View {
        TabView(selection: $selection) {
            Tab("Learn", systemImage: "point.topleft.down.to.point.bottomright.curvepath.fill", value: .learn) {
                HomeView()
            }
            Tab("Daily", systemImage: "ladybug.fill", value: .daily) {
                DailyBugView()
            }
            Tab("Profile", systemImage: "person.crop.circle.fill", value: .profile) {
                ProfileView()
            }
        }
    }
}

#Preview("Light") {
    RootView().tint(LearnColor.accent)
}

#Preview("Dark") {
    RootView().tint(LearnColor.accent).preferredColorScheme(.dark)
}

#Preview("Largest Dynamic Type") {
    RootView().tint(LearnColor.accent).dynamicTypeSize(.accessibility5)
}
