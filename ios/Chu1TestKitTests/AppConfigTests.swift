import XCTest
@testable import Chu1TestKit

final class AppConfigTests: XCTestCase {
    func testProductionConfigMatchesWebIAPSettings() throws {
        let config = AppConfig.production
        XCTAssertEqual(config.appURL.absoluteString, "https://chu1-testkit.t-nakaima.workers.dev")
        XCTAssertEqual(config.bundleID, "jp.taka.chu1testkit")
        XCTAssertEqual(config.productID, "chu1_testkit_lifetime")
        XCTAssertEqual(config.iosUserAgentToken, "Chu1TestKitIOS/1")
        XCTAssertNil(config.localTestLoginEmail)
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

    func testEnablesLocalTestLoginOnlyForLocalhostAppURL() throws {
        let config = AppConfig.current(environment: [
            "CHU1_APP_URL": "http://localhost:8787",
            "CHU1_TEST_LOGIN_EMAIL": "T.Nakaima@Gmail.com"
        ])

        XCTAssertEqual(config.localTestLoginEmail, "t.nakaima@gmail.com")
        XCTAssertEqual(config.localTestLoginURL?.absoluteString, "http://localhost:8787/api/auth/send")
    }

    func testIgnoresLocalTestLoginForProductionAppURL() throws {
        let config = AppConfig.current(environment: [
            "CHU1_TEST_LOGIN_EMAIL": "t.nakaima@gmail.com"
        ])

        XCTAssertNil(config.localTestLoginEmail)
        XCTAssertNil(config.localTestLoginURL)
    }

    func testBuildsLocalTestLoginRequest() throws {
        let config = AppConfig.current(environment: [
            "CHU1_APP_URL": "http://localhost:8787",
            "CHU1_TEST_LOGIN_EMAIL": "t.nakaima@gmail.com"
        ])

        let request = try XCTUnwrap(try LocalTestLoginRequest.make(config: config))
        XCTAssertEqual(request.url?.absoluteString, "http://localhost:8787/api/auth/send")
        XCTAssertEqual(request.httpMethod, "POST")
        XCTAssertEqual(request.value(forHTTPHeaderField: "Content-Type"), "application/json")

        let bodyData = try XCTUnwrap(request.httpBody)
        let body = try XCTUnwrap(JSONSerialization.jsonObject(with: bodyData) as? [String: String])
        XCTAssertEqual(body["email"], "t.nakaima@gmail.com")
    }

    func testIgnoresInvalidLaunchEnvironmentURL() throws {
        let config = AppConfig.current(environment: [
            "CHU1_APP_URL": "not a url"
        ])

        XCTAssertEqual(config, .production)
    }
}
