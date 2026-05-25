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

    var appleVerifyURL: URL {
        appURL.appending(path: "api/apple/iap/verify")
    }
}
