import Foundation

struct AppConfig: Equatable {
    let appURL: URL
    let bundleID: String
    let productID: String
    let iosUserAgentToken: String

    static let production = AppConfig(
        appURL: URL(string: "https://chu1-testkit.t-nakaima.workers.dev")!,
        bundleID: "jp.taka.chu1testkit",
        productID: "chu1_testkit_lifetime",
        iosUserAgentToken: "Chu1TestKitIOS/1"
    )

    static func current(environment: [String: String] = ProcessInfo.processInfo.environment) -> AppConfig {
        let appURL = environment["CHU1_APP_URL"].flatMap(validAbsoluteURL) ?? production.appURL
        let productID = environment["CHU1_IAP_PRODUCT_ID"].flatMap(nonEmptyString) ?? production.productID

        return AppConfig(
            appURL: appURL,
            bundleID: production.bundleID,
            productID: productID,
            iosUserAgentToken: production.iosUserAgentToken
        )
    }

    var appleVerifyURL: URL {
        appURL.appending(path: "api/apple/iap/verify")
    }

    private static func validAbsoluteURL(_ value: String) -> URL? {
        guard let url = URL(string: value), url.scheme != nil, url.host != nil else {
            return nil
        }
        return url
    }

    private static func nonEmptyString(_ value: String) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
