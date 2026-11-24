// swift-tools-version: 6.2
import PackageDescription

// Shared code for the app and the widget extension.
// Folder layout follows docs/10-ios-app.md (one folder per module).
let package = Package(
    name: "LearnKit",
    defaultLocalization: "en",
    platforms: [.iOS(.v26)],
    products: [
        .library(name: "Brand", targets: ["Brand"]),
        .library(name: "DesignSystem", targets: ["DesignSystem"]),
        .library(name: "Models", targets: ["Models"]),
        .library(name: "Grading", targets: ["Grading"]),
    ],
    targets: [
        .target(name: "Brand", path: "Brand"),
        .target(
            name: "DesignSystem",
            path: "DesignSystem",
            resources: [.process("Resources")]
        ),
        .target(name: "Models", path: "Models"),
        .target(name: "Grading", dependencies: ["Models"], path: "Grading"),
    ]
)
