import DesignSystem
import SwiftUI

@main
struct LearnApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .tint(LearnColor.accent)
        }
    }
}
