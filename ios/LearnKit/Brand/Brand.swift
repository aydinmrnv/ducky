/// Every user-facing brand word lives here (see docs/02-brand.md).
///
/// Never hardcode these words in views or strings. Interpolate them instead,
/// for example `Text("\(Brand.mascotName) found a bug")`, which resolves to the
/// String Catalog key `"%@ found a bug"`.
///
/// Renaming the product = edit this enum + `APP_DISPLAY_NAME` in
/// `ios/Config/Base.xcconfig` + App Store metadata + icon.
public enum Brand {
    public static let appName = "Ducky"
    public static let mascotName = "Ducky"
    public static let mascotSound = "Quack"
    public static let currencyName = "Sparks"
    public static let currencyNameSingular = "Spark"
    public static let tagline = "Learn to code with AI"

    /// The currency word for a given amount ("1 Spark", "3 Sparks").
    public static func currencyName(for amount: Int) -> String {
        amount == 1 ? currencyNameSingular : currencyName
    }
}
