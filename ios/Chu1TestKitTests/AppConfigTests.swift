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

    func testBuildsConfigFromLaunchEnvironmentOverrides() throws {
        let config = AppConfig.current(environment: [
            "CHU1_APP_URL": "http://localhost:3000",
            "CHU1_IAP_PRODUCT_ID": "chu1_testkit_lifetime"
        ])

        XCTAssertEqual(config.appURL.absoluteString, "http://localhost:3000")
        XCTAssertEqual(config.bundleID, "jp.taka.chu1testkit")
        XCTAssertEqual(config.productID, "chu1_testkit_lifetime")
        XCTAssertEqual(config.appleVerifyURL.absoluteString, "http://localhost:3000/api/apple/iap/verify")
    }

    func testIgnoresInvalidLaunchEnvironmentURL() throws {
        let config = AppConfig.current(environment: [
            "CHU1_APP_URL": "not a url"
        ])

        XCTAssertEqual(config, .production)
    }
}
