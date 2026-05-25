import XCTest
@testable import Chu1TestKit

final class AppConfigTests: XCTestCase {
    func testProductionConfigMatchesWebIAPSettings() throws {
        let config = AppConfig.production
        XCTAssertEqual(config.appURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev")
        XCTAssertEqual(config.bundleID, "jp.taka.chu1testkit")
        XCTAssertEqual(config.productID, "chu1_testkit_lifetime")
        XCTAssertEqual(config.iosUserAgentToken, "Chu1TestKitIOS/1")
    }

    func testBuildsServerEndpoint() throws {
        let endpoint = AppConfig.production.appleVerifyURL
        XCTAssertEqual(endpoint.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev/api/apple/iap/verify")
    }
}
